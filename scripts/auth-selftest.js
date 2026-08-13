/* diet-log Google 驗證：離線 harness（前端 care-auth.js + 後端 .gs 純函式） */
const fs = require('fs');
const assert = require('assert');
let pass = 0;
const ok = (name) => { pass++; console.log('  PASS', name); };

/* ---------- 前端 care-auth.js ---------- */
const path = require('path');
const ROOT = path.join(__dirname, '..');
const FE = path.join(ROOT, 'care-auth.js');

function b64url(obj) {
  return Buffer.from(JSON.stringify(obj)).toString('base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
const liveJwt = 'h.' + b64url({ exp: Math.floor(Date.now() / 1000) + 3600, email: 'a@x.com' }) + '.s';
const deadJwt = 'h.' + b64url({ exp: Math.floor(Date.now() / 1000) - 10, email: 'a@x.com' }) + '.s';

const CID_LINE = /var CARE_AUTH_CLIENT_ID = '[^']*';/;
const SOFT_LINE = /var CARE_AUTH_SOFT = true;/;

function loadFrontend(seedToken, opts) {
  opts = opts || {};
  const store = seedToken ? { care_idt: seedToken } : {};
  const local = opts.devkey ? { care_devkey: opts.devkey } : {};
  const replaced = [];
  const alerts = [];
  const calls = [];
  const bodyAppends = [];
  const el = () => ({
    style: {}, textContent: '', value: '',
    setAttribute() {}, appendChild() {}, addEventListener() {},
    querySelector() { return el(); },
    set innerHTML(v) {}
  });
  const sandbox = {
    console,
    Promise, JSON, Date, Object, encodeURIComponent, Request: function (u) { return { url: u }; },
    atob: (s) => Buffer.from(s, 'base64').toString('binary'),
    sessionStorage: {
      getItem: (k) => (k in store ? store[k] : null),
      setItem: (k, v) => { store[k] = v; },
      removeItem: (k) => { delete store[k]; }
    },
    localStorage: {
      getItem: (k) => (k in local ? local[k] : null),
      setItem: (k, v) => { local[k] = v; },
      removeItem: (k) => { delete local[k]; }
    },
    history: { replaceState(a, b, url) { replaced.push(url); } },
    alert(msg) { alerts.push(msg); },
    setTimeout: (fn) => fn(),
    document: {
      head: { appendChild() {} },
      body: { appendChild(node) { bodyAppends.push(node); } },
      getElementById: () => null,
      createElement: () => el()
    },
    location: { reload() {}, pathname: '/diet-log/index.html', search: opts.search || '', hash: '' }
  };
  sandbox.window = sandbox;
  sandbox.fetch = function (input, init) {
    calls.push({ url: typeof input === 'string' ? input : input.url, init });
    const json = () => (opts.serverSays
      ? Promise.resolve(opts.serverSays)
      : Promise.reject(new Error('not json')));
    return Promise.resolve({ clone: () => ({ json }) });
  };
  let src = fs.readFileSync(FE, 'utf8')
    .replace(CID_LINE, "var CARE_AUTH_CLIENT_ID = 'test.apps.googleusercontent.com';");
  if (opts.soft === false) { src = src.replace(SOFT_LINE, 'var CARE_AUTH_SOFT = false;'); }
  const vm = require('vm');
  vm.createContext(sandbox);
  vm.runInContext(src, sandbox);
  return { sandbox, calls, store, local, replaced, alerts, bodyAppends };
}

async function frontendTests() {
  console.log('前端 care-auth.js');

  // 1. 未設定 client id → 完全不掛載（fetch 不被換掉）
  {
    const vm = require('vm');
    const sb = { console, Promise, JSON, Date, Object, document: { head: {}, body: {} } };
    sb.window = sb;
    const original = function () {};
    sb.fetch = original;
    vm.createContext(sb);
    vm.runInContext(fs.readFileSync(FE, 'utf8').replace(CID_LINE, "var CARE_AUTH_CLIENT_ID = '';"), sb);
    assert.strictEqual(sb.fetch, original, '未設定時不該包裝 fetch');
    ok('client id 留空 → 完全不動作（inert）');
  }

  // 1b. 線上檔案真的帶著 client id（避免改壞了還以為有開）
  {
    const live = fs.readFileSync(FE, 'utf8').match(CID_LINE)[0];
    assert.ok(/apps\.googleusercontent\.com/.test(live), '線上檔應已填入 client id：' + live);
    ok('repo 內的 care-auth.js 已填 client id');
  }

  // 2. GET 掛 idt 在查詢字串
  {
    const { sandbox, calls } = loadFrontend(liveJwt);
    await sandbox.fetch('https://script.google.com/macros/s/X/exec?date=2026-08-13');
    assert.ok(calls[0].url.includes('&idt='), 'GET 應以 & 接 idt：' + calls[0].url);
    ok('GET 已有 query → 用 & 接 idt');
  }
  {
    const { sandbox, calls } = loadFrontend(liveJwt);
    await sandbox.fetch('https://script.google.com/macros/s/X/exec');
    assert.ok(calls[0].url.includes('?idt='), 'GET 無 query 應以 ? 接');
    ok('GET 無 query → 用 ? 接 idt');
  }

  // 3. POST 的 JSON body 注入 idt，其餘欄位不動
  {
    const { sandbox, calls } = loadFrontend(liveJwt);
    await sandbox.fetch('https://script.google.com/macros/s/X/exec', {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'insert', amount: 250 })
    });
    const body = JSON.parse(calls[0].init.body);
    assert.strictEqual(body.idt, liveJwt);
    assert.strictEqual(body.action, 'insert');
    assert.strictEqual(body.amount, 250);
    assert.ok(!calls[0].url.includes('idt='), 'POST 不該同時掛在 URL');
    ok('POST JSON body 注入 idt，原欄位保留');
  }

  // 4. 非 Apps Script 的請求原封不動
  {
    const { sandbox, calls } = loadFrontend(liveJwt);
    await sandbox.fetch('https://opendata.cwa.gov.tw/api/x?y=1');
    assert.strictEqual(calls[0].url, 'https://opendata.cwa.gov.tw/api/x?y=1');
    ok('非 script.google.com → 不加 token');
  }

  // 5. 過渡期（soft）沒 token → 照樣送出，不掛 idt、不擋畫面
  {
    const { sandbox, calls, bodyAppends } = loadFrontend(null);
    await sandbox.fetch('https://script.google.com/macros/s/X/exec?date=2026-08-13');
    assert.strictEqual(calls.length, 1, 'soft 模式不該擋住請求');
    assert.ok(!calls[0].url.includes('idt='), 'soft 模式沒 token 就不該掛 idt');
    assert.strictEqual(bodyAppends.length, 0, 'soft 模式不該長出登入遮罩');
    ok('soft：沒 token → 照送不擋（OAuth 還沒設好也不會讓照顧者記不了帳）');
  }

  // 6. 過期 token 在 soft 模式 → 不硬送舊 token，改成無 token 照送
  {
    const { sandbox, calls } = loadFrontend(deadJwt);
    await sandbox.fetch('https://script.google.com/macros/s/X/exec');
    assert.strictEqual(calls.length, 1);
    assert.ok(!calls[0].url.includes('idt='), '過期 token 不該被送出');
    ok('soft：token 過期 → 不送過期 token，照樣放行');
  }

  // 7. 關掉 soft（等同後端已強制）→ 沒 token 就擋住
  {
    const { sandbox, calls } = loadFrontend(null, { soft: false });
    let settled = false;
    sandbox.fetch('https://script.google.com/macros/s/X/exec').then(() => { settled = true; });
    await new Promise((r) => setTimeout(r, 30));
    assert.strictEqual(calls.length, 0, '硬性模式沒 token 不該送出');
    assert.strictEqual(settled, false);
    ok('soft=false：沒 token → 擋住請求等登入');
  }

  // 7b. 這支裝置有裝置金鑰 → 不需要 Google 帳號，請求帶 dt 而不是 idt
  {
    const { sandbox, calls } = loadFrontend(null, { soft: false, devkey: 'k7Qm2vXp9LrT4wZa8NcB1dEf' });
    await sandbox.fetch('https://script.google.com/macros/s/X/exec?date=2026-08-13');
    assert.strictEqual(calls.length, 1, '有裝置金鑰就不該被擋');
    assert.ok(calls[0].url.includes('&dt='), '應帶 dt：' + calls[0].url);
    assert.ok(!calls[0].url.includes('idt='), '不該同時帶 idt');
    ok('裝置金鑰：沒有 Google 帳號也能用（帶 dt 不帶 idt）');
  }

  // 7c. ?devkey= 只用一次：存進 localStorage 後從網址擦掉
  {
    const { sandbox, local, replaced, alerts } = loadFrontend(null, { search: '?devkey=k7Qm2vXp9LrT4wZa8NcB1dEf&x=1' });
    assert.strictEqual(local.care_devkey, 'k7Qm2vXp9LrT4wZa8NcB1dEf');
    assert.ok(replaced.length === 1 && replaced[0].indexOf('devkey') === -1,
      '網址應已擦掉金鑰：' + replaced[0]);
    assert.ok(replaced[0].indexOf('x=1') !== -1, '其他查詢參數要保留');
    assert.strictEqual(alerts.length, 1, '手機上要看得到安裝成功的確認');
    ok('?devkey= 一次性：存起來、從網址擦掉、並在手機上顯示安裝成功');
    void sandbox;
  }

  // 7d. POST 也走裝置金鑰
  {
    const { sandbox, calls } = loadFrontend(null, { soft: false, devkey: 'k7Qm2vXp9LrT4wZa8NcB1dEf' });
    await sandbox.fetch('https://script.google.com/macros/s/X/exec', {
      method: 'POST', body: JSON.stringify({ action: 'insert', amount: 250 })
    });
    const body = JSON.parse(calls[0].init.body);
    assert.strictEqual(body.dt, 'k7Qm2vXp9LrT4wZa8NcB1dEf');
    assert.strictEqual(body.amount, 250);
    assert.strictEqual(body.idt, undefined);
    ok('裝置金鑰：POST body 帶 dt，原欄位保留');
  }

  // 8. 後端回 {error:'auth'} → 自動升級成硬性閘門，下一次請求被擋
  {
    const { sandbox, calls } = loadFrontend(null, { serverSays: { error: 'auth', reason: 'not_allowed' } });
    await sandbox.fetch('https://script.google.com/macros/s/X/exec');   // 第一次：soft 放行
    assert.strictEqual(calls.length, 1);
    let settled = false;
    sandbox.fetch('https://script.google.com/macros/s/X/exec').then(() => { settled = true; });
    await new Promise((r) => setTimeout(r, 30));
    assert.strictEqual(calls.length, 1, '升級後不該再放行');
    assert.strictEqual(settled, false);
    ok('後端回 error:auth → 自動升級硬性閘門（AUTH_ENFORCE 一開，前端不必另外改）');
  }
}

/* ---------- 後端 .gs 純函式 ---------- */
const BE = path.join(ROOT, 'gas', 'google-auth-patch.gs');

function loadBackend(props) {
  const vm = require('vm');
  const sandbox = {
    console, JSON, Date, String, Number, Utilities: {}, Logger: { log() {} },
    PropertiesService: { getScriptProperties: () => ({ getProperty: (k) => (k in props ? props[k] : null) }) },
    CacheService: { getScriptCache: () => ({ get: () => null, put() {} }) },
    ContentService: {
      MimeType: { JSON: 'json' },
      createTextOutput: (t) => ({ body: t, setMimeType() { return this; } })
    },
    UrlFetchApp: { fetch: () => { throw new Error('不該在這些測試裡連外'); } }
  };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(BE, 'utf8'), sandbox);
  return sandbox;
}

function backendTests() {
  console.log('後端 20260813-diet-log-gas-google-auth.gs');

  const sb = loadBackend({ AUTH_ALLOWLIST: 'Owner@Gmail.com, care1@gmail.com' });

  assert.strictEqual(sb.careAuthCheckEmail_('owner@gmail.com', sb.PropertiesService.getScriptProperties()).ok, true);
  ok('白名單比對忽略大小寫與空白');

  assert.strictEqual(sb.careAuthCheckEmail_('stranger@gmail.com', sb.PropertiesService.getScriptProperties()).reason, 'not_allowed');
  ok('不在白名單 → not_allowed');

  const empty = loadBackend({ AUTH_ALLOWLIST: '' });
  assert.strictEqual(empty.careAuthCheckEmail_('owner@gmail.com', empty.PropertiesService.getScriptProperties()).reason, 'empty_allowlist');
  ok('白名單空 → 拒絕（不是放行）');

  assert.strictEqual(sb.careAuthExtractToken_({ parameter: { idt: 'T1' } }).idt, 'T1');
  ok('GET 取得 idt');
  assert.strictEqual(sb.careAuthExtractToken_({ postData: { contents: JSON.stringify({ action: 'insert', idt: 'T2' }) } }).idt, 'T2');
  ok('POST body 取得 idt');
  assert.strictEqual(sb.careAuthExtractToken_({ postData: { contents: 'not json' } }).idt, '');
  ok('body 不是 JSON → 視為沒帶憑證（不炸）');
  assert.strictEqual(sb.careAuthExtractToken_({}).idt, '');
  ok('完全沒帶 → 空字串');
  assert.strictEqual(sb.careAuthExtractToken_({ parameter: { dt: 'D1' } }).dt, 'D1');
  ok('GET 取得裝置金鑰 dt');
  assert.strictEqual(sb.careAuthExtractToken_({ postData: { contents: JSON.stringify({ action: 'insert', dt: 'D2' }) } }).dt, 'D2');
  ok('POST body 取得裝置金鑰 dt');

  /* --- 裝置金鑰（沒有 Google 帳號的照顧者） --- */
  const SECRET = 'k7Qm2vXp9LrT4wZa8NcB1dEf';
  const dev = loadBackend({
    AUTH_ENFORCE: 'true', AUTH_CLIENT_ID: 'cid', AUTH_ALLOWLIST: 'a@b.c',
    AUTH_DEVICE_TOKENS: 'U4手機:' + SECRET + ', 平板:' + SECRET.split('').reverse().join('')
  });
  const devProps = dev.PropertiesService.getScriptProperties();

  const hit = dev.careAuthCheckDevice_(SECRET, devProps);
  assert.strictEqual(hit.ok, true);
  assert.strictEqual(hit.email, 'device:U4手機');
  ok('正確裝置金鑰 → 放行，log 記標籤不記金鑰');

  assert.strictEqual(dev.careAuthCheckDevice_('wrong-but-long-enough-key', devProps).reason, 'bad_device_key');
  ok('錯誤裝置金鑰 → bad_device_key');

  const shortKey = loadBackend({ AUTH_DEVICE_TOKENS: 'x:1234' });
  assert.strictEqual(
    shortKey.careAuthCheckDevice_('1234', shortKey.PropertiesService.getScriptProperties()).ok, false);
  ok('金鑰短於 16 字 → 一律不收（防止填 1234 就以為擋得住）');

  assert.strictEqual(dev.careAuthCheck_({ parameter: { dt: SECRET } }).ok, true);
  ok('強制模式下帶裝置金鑰 → 放行（且完全不呼叫 UrlFetchApp，沙箱會炸）');

  assert.strictEqual(dev.careAuthCheck_({ parameter: { dt: 'nope-nope-nope-nope' } }).ok, false);
  ok('強制模式下錯誤裝置金鑰 → 擋下');

  const noDev = loadBackend({ AUTH_ENFORCE: 'true', AUTH_CLIENT_ID: 'cid', AUTH_ALLOWLIST: 'a@b.c' });
  assert.strictEqual(
    noDev.careAuthCheckDevice_('anything-long-enough-here', noDev.PropertiesService.getScriptProperties()).ok, false);
  ok('沒設 AUTH_DEVICE_TOKENS → 任何裝置金鑰都不收（fail closed）');

  // 觀察模式：驗證失敗也放行
  const observe = loadBackend({ AUTH_ENFORCE: 'false', AUTH_CLIENT_ID: 'cid', AUTH_ALLOWLIST: 'a@b.c' });
  assert.strictEqual(observe.careAuthCheck_({}).ok, true);
  ok('AUTH_ENFORCE=false → 驗不過也放行（觀察模式不會停機）');

  // 強制模式：沒帶 token → 擋
  const enforce = loadBackend({ AUTH_ENFORCE: 'true', AUTH_CLIENT_ID: 'cid', AUTH_ALLOWLIST: 'a@b.c' });
  const denied = enforce.careAuthCheck_({});
  assert.strictEqual(denied.ok, false);
  assert.deepStrictEqual(JSON.parse(denied.response.body), { error: 'auth', reason: 'no_token' });
  ok('AUTH_ENFORCE=true 且無 token → 回 {error:"auth"}');

  // 沒設 client id → 擋（不會因為漏設就變成全開）
  const noCid = loadBackend({ AUTH_ENFORCE: 'true', AUTH_ALLOWLIST: 'a@b.c' });
  assert.strictEqual(noCid.careAuthCheck_({ parameter: { idt: 'x' } }).ok, false);
  ok('強制模式但漏設 CLIENT_ID → 拒絕（fail closed）');
}

(async () => {
  await frontendTests();
  backendTests();
  console.log('\n' + pass + ' 項全過');
})().catch((e) => { console.error('FAIL:', e.message); process.exit(1); });
