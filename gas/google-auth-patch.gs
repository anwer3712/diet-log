/*******************************************************************
 * diet-log 後端補丁：Google 帳號驗證（2026-08-13）
 *
 * 為什麼不是直接把部署改成「僅限已登入使用者」：
 *   Apps Script 對需登入的 Web App 會回 302 導向 accounts.google.com。
 *   前端是 github.io 的靜態站，跨網域 fetch 追不到登入頁、也拿不到 CORS 標頭
 *   → 整個 App 會死。所以「部署權限維持 Anyone」，改由這段程式自己驗身分。
 *
 * 貼法：整段貼到 GAS 專案的最上面（或另開一個 .gs 檔），
 *       然後在既有 doGet / doPost 的第一行各加一句：
 *
 *   function doGet(e) {
 *     var auth = careAuthCheck_(e); if (!auth.ok) { return auth.response; }   // ← 加這行
 *     ...原本的程式...
 *   }
 *
 *   function doPost(e) {
 *     var auth = careAuthCheck_(e); if (!auth.ok) { return auth.response; }   // ← 加這行
 *     ...原本的程式...
 *   }
 *
 * 開關（指令碼屬性 Script Properties，改完不必重新部署，立即生效）：
 *   AUTH_ENFORCE   'false' = 只驗證並記錄不擋（觀察模式）；'true' = 真的擋
 *   AUTH_CLIENT_ID OAuth 用戶端 ID（要與前端 care-auth.js 那個一模一樣）
 *   AUTH_ALLOWLIST 允許的 email，逗號分隔，例如 a@gmail.com,b@gmail.com
 *   AUTH_DEVICE_TOKENS  給沒有 Google 帳號的裝置用，格式 `標籤:長亂數`，逗號分隔，
 *                       例如 `U4手機:3f9a...`。**這個值不要進 repo、不要貼進聊天室**；
 *                       要換人或外流就改這裡（即時生效），舊金鑰立刻失效。
 *
 * 回滾：把 AUTH_ENFORCE 改回 'false' 即可，不必改碼、不必重新部署。
 *******************************************************************/

/**
 * 驗證這次請求帶的 Google ID token。
 * @return {{ok: boolean, email: string, response: (GoogleAppsScript.Content.TextOutput|null)}}
 */
function careAuthCheck_(e) {
  var props = PropertiesService.getScriptProperties();
  var enforce = String(props.getProperty('AUTH_ENFORCE') || '').toLowerCase() === 'true';

  var result = careAuthVerify_(e, props);

  // 觀察模式：照樣驗證、照樣寫 log，但一律放行。
  if (!enforce) {
    Logger.log('[auth:observe] ok=%s email=%s reason=%s',
      result.ok, result.email || '-', result.reason || '-');
    return { ok: true, email: result.email, response: null };
  }

  if (result.ok) {
    Logger.log('[auth:allow] %s', result.email);
    return { ok: true, email: result.email, response: null };
  }

  Logger.log('[auth:deny] reason=%s email=%s', result.reason, result.email || '-');
  return {
    ok: false,
    email: result.email,
    response: ContentService
      .createTextOutput(JSON.stringify({ error: 'auth', reason: result.reason }))
      .setMimeType(ContentService.MimeType.JSON)
  };
}

/** 實際驗證邏輯（不管 enforce 開關）。 */
function careAuthVerify_(e, props) {
  var cred = careAuthExtractToken_(e);

  // 裝置金鑰：給沒有 Google 帳號的照顧者（例如 U4 那支手機）
  if (cred.dt) { return careAuthCheckDevice_(cred.dt, props); }

  var clientId = String(props.getProperty('AUTH_CLIENT_ID') || '').trim();
  if (!clientId) { return { ok: false, email: '', reason: 'no_client_id' }; }

  var token = cred.idt;
  if (!token) { return { ok: false, email: '', reason: 'no_token' }; }

  // 同一個 token 5 分鐘內只跟 Google 對一次，省掉每次請求的 UrlFetch 往返。
  var cache = CacheService.getScriptCache();
  var cacheKey = 'auth_' + Utilities.base64EncodeWebSafe(
    Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, token));
  var cached = cache.get(cacheKey);
  if (cached) {
    var hit = JSON.parse(cached);
    return careAuthCheckEmail_(hit.email, props);
  }

  var info;
  try {
    var res = UrlFetchApp.fetch(
      'https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(token),
      { muteHttpExceptions: true });
    if (res.getResponseCode() !== 200) { return { ok: false, email: '', reason: 'bad_token' }; }
    info = JSON.parse(res.getContentText());
  } catch (err) {
    return { ok: false, email: '', reason: 'verify_failed' };
  }

  if (info.aud !== clientId) { return { ok: false, email: '', reason: 'wrong_audience' }; }

  var iss = String(info.iss || '');
  if (iss !== 'accounts.google.com' && iss !== 'https://accounts.google.com') {
    return { ok: false, email: '', reason: 'wrong_issuer' };
  }

  if (Number(info.exp || 0) * 1000 <= Date.now()) {
    return { ok: false, email: info.email || '', reason: 'expired' };
  }

  if (String(info.email_verified) !== 'true') {
    return { ok: false, email: info.email || '', reason: 'email_unverified' };
  }

  var email = String(info.email || '').toLowerCase();
  cache.put(cacheKey, JSON.stringify({ email: email }), 300);
  return careAuthCheckEmail_(email, props);
}

/** email 是否在白名單。 */
function careAuthCheckEmail_(email, props) {
  var raw = String(props.getProperty('AUTH_ALLOWLIST') || '');
  var allow = raw.split(',').map(function (s) { return s.trim().toLowerCase(); })
    .filter(function (s) { return s.length > 0; });

  if (allow.length === 0) { return { ok: false, email: email, reason: 'empty_allowlist' }; }
  if (allow.indexOf(email) === -1) { return { ok: false, email: email, reason: 'not_allowed' }; }
  return { ok: true, email: email, reason: '' };
}

/**
 * 比對裝置金鑰。AUTH_DEVICE_TOKENS 格式：`標籤:金鑰,標籤:金鑰`。
 * log 只寫標籤不寫金鑰。
 */
function careAuthCheckDevice_(supplied, props) {
  var raw = String(props.getProperty('AUTH_DEVICE_TOKENS') || '');
  var entries = raw.split(',').map(function (s) { return s.trim(); })
    .filter(function (s) { return s.length > 0; });

  for (var i = 0; i < entries.length; i++) {
    var sep = entries[i].indexOf(':');
    var label = sep === -1 ? ('device' + (i + 1)) : entries[i].slice(0, sep).trim();
    var secret = sep === -1 ? entries[i] : entries[i].slice(sep + 1).trim();
    // 太短的金鑰視同沒設定，避免有人填 '1234' 就以為擋得住
    if (secret.length >= 16 && secret === supplied) {
      return { ok: true, email: 'device:' + label, reason: '' };
    }
  }
  return { ok: false, email: 'device:?', reason: 'bad_device_key' };
}

/** 從查詢字串（GET）或 JSON body（POST）取出憑證：idt＝Google ID token，dt＝裝置金鑰。 */
function careAuthExtractToken_(e) {
  var out = { idt: '', dt: '' };
  if (e && e.parameter) {
    if (e.parameter.idt) { out.idt = String(e.parameter.idt); }
    if (e.parameter.dt) { out.dt = String(e.parameter.dt); }
  }
  if (!out.idt && !out.dt && e && e.postData && e.postData.contents) {
    try {
      var body = JSON.parse(e.postData.contents);
      if (body && body.idt) { out.idt = String(body.idt); }
      if (body && body.dt) { out.dt = String(body.dt); }
    } catch (err) { /* 不是 JSON → 當作沒帶憑證 */ }
  }
  return out;
}

/**
 * 一次性設定小幫手：在編輯器選這個函式按執行，把三個屬性寫好。
 * 執行前先把下面兩行換成你自己的值。
 */
function careAuthSetup_ONCE() {
  var CLIENT_ID = '換成你的.apps.googleusercontent.com';
  var ALLOWLIST = 'your@gmail.com,caregiver@gmail.com';

  PropertiesService.getScriptProperties().setProperties({
    AUTH_CLIENT_ID: CLIENT_ID,
    AUTH_ALLOWLIST: ALLOWLIST,
    AUTH_ENFORCE: 'false'          // 先觀察，確認 log 有看到 email 再改 'true'
  });
  Logger.log('已寫入。目前 AUTH_ENFORCE=false（觀察模式，還沒開始擋）。');
}

/** 檢查目前設定狀態（不外洩完整白名單，只印數量）。 */
function careAuthStatus() {
  var p = PropertiesService.getScriptProperties();
  Logger.log('AUTH_ENFORCE=%s  CLIENT_ID=%s  白名單筆數=%s  裝置金鑰數=%s',
    p.getProperty('AUTH_ENFORCE'),
    p.getProperty('AUTH_CLIENT_ID') ? '已設定' : '未設定',
    String(p.getProperty('AUTH_ALLOWLIST') || '').split(',').filter(function (s) { return s.trim(); }).length,
    String(p.getProperty('AUTH_DEVICE_TOKENS') || '').split(',').filter(function (s) { return s.trim(); }).length);
}
