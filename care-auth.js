/* care-auth.js v1 — Google 帳號閘門 / Gerbang akun Google
 *
 * 目的：後端 Apps Script Web App 必須維持「Anyone」部署（改成「需登入」會回 302
 * 導向 accounts.google.com，跨網域 fetch 追不到、CORS 也會失敗，整個 App 會死）。
 * 所以身分驗證改由「前端拿 Google ID token → 後端驗 token + 比對 email 白名單」完成。
 *
 * ⚠️ 開關：CARE_AUTH_CLIENT_ID 留空 = 這支檔案完全不動作，行為與沒有它一模一樣。
 *
 * CARE_AUTH_SOFT = true（過渡期，預設）：有 token 就帶上，沒有就照樣送出，
 * 永遠不擋畫面。只有當後端回 {error:'auth'}（＝AUTH_ENFORCE 已開）才會升級成
 * 硬性登入閘門。這樣「要不要真的擋人」只由後端那一個開關決定，
 * 前端就算 OAuth 設定還沒弄好（例如 JavaScript 來源還沒登記），
 * 照顧者也不會因此記不了帳。
 *
 * OAuth Client ID 不是密鑰，公開在前端是 Google 官方設計（靠授權來源網域保護），
 * 放進公開 repo 沒有問題。⚠️ 這組 client 必須在 Google Cloud Console 的
 * 「已授權的 JavaScript 來源」加入 https://anwer3712.github.io ，否則登入按鈕不會出現。
 */

/* eslint-disable no-var */
var CARE_AUTH_CLIENT_ID = '591777420446-hl5hpvd79nna9klklbrpi2lma29skq3s.apps.googleusercontent.com';
var CARE_AUTH_SOFT = true;      // 過渡期：不擋人，等後端 AUTH_ENFORCE 開了才擋

(function () {
    'use strict';

    var CID = (typeof CARE_AUTH_CLIENT_ID === 'string') ? CARE_AUTH_CLIENT_ID.trim() : '';
    if (!CID) { return; }                       // 未設定 → 完全不掛載，維持現狀

    var TOKEN_KEY = 'care_idt';
    var SAFETY_MS = 120000;                     // 距到期 2 分鐘就當作過期，避免寫到一半失效
    var GIS_SRC = 'https://accounts.google.com/gsi/client';
    var waiters = [];                           // 等 token 的 resolver
    var gisLoading = false;
    var escalated = false;                      // 後端已開始強制驗證

    /* ---------- token ---------- */

    function jwtExpMs(tok) {
        try {
            var b64 = tok.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
            while (b64.length % 4) { b64 += '='; }
            return (JSON.parse(atob(b64)).exp || 0) * 1000;
        } catch (err) { return 0; }
    }

    function storedToken() {
        var t = '';
        try { t = sessionStorage.getItem(TOKEN_KEY) || ''; } catch (err) { t = ''; }
        if (!t) { return ''; }
        if (jwtExpMs(t) - Date.now() <= SAFETY_MS) { return ''; }   // 過期或快過期 → 重新登入
        return t;
    }

    function acceptToken(tok) {
        try { sessionStorage.setItem(TOKEN_KEY, tok); } catch (err) { /* 私密瀏覽 → 只存記憶體 */ }
        hideGate();
        var pending = waiters;
        waiters = [];
        pending.forEach(function (resolve) { resolve(tok); });
    }

    /**
     * 過渡期（soft）＝有 token 就帶、沒有就照送，永遠不擋畫面；
     * 後端真的回 {error:'auth'} 才升級成硬性閘門（escalated）。
     * 所以「要不要真的擋人」只由後端那一個開關 AUTH_ENFORCE 決定，
     * 前端不必再切一次，也不會因為 OAuth 設定沒弄好就讓照顧者記不了帳。
     */
    function softNow() { return CARE_AUTH_SOFT && !escalated; }

    function getToken() {
        var t = storedToken();
        if (t) { return Promise.resolve(t); }
        loadGis();                                  // 背景嘗試登入（One Tap）
        if (softNow()) { return Promise.resolve(''); }   // 過渡期：不擋，先照送
        return new Promise(function (resolve) {
            waiters.push(resolve);
            showGate();
        });
    }

    /** 後端開始強制驗證了 → 這一刻起改成硬性閘門。 */
    function escalate(reason) {
        escalated = true;
        try { sessionStorage.removeItem(TOKEN_KEY); } catch (err) { /* ignore */ }
        showGate();
        gateMessage(reason === 'not_allowed'
            ? '這個帳號沒有被授權 / Akun ini tidak diizinkan'
            : '請登入後繼續 / Silakan masuk untuk melanjutkan');
        loadGis();
    }

    /* ---------- Google Identity Services ---------- */

    function loadGis() {
        if (gisLoading) { return; }
        gisLoading = true;
        var s = document.createElement('script');
        s.src = GIS_SRC;
        s.async = true;
        s.defer = true;
        s.onload = initGis;
        s.onerror = function () { gateMessage('無法載入 Google 登入 / Gagal memuat login Google'); };
        document.head.appendChild(s);
    }

    function initGis() {
        if (!window.google || !google.accounts || !google.accounts.id) {
            gateMessage('無法載入 Google 登入 / Gagal memuat login Google');
            return;
        }
        google.accounts.id.initialize({
            client_id: CID,
            auto_select: true,                  // 已授權過的裝置盡量免點
            callback: function (res) {
                if (res && res.credential) { acceptToken(res.credential); }
            }
        });
        var slot = document.getElementById('care-auth-btn');
        if (slot) {
            google.accounts.id.renderButton(slot, { theme: 'outline', size: 'large', width: 260 });
        }
        google.accounts.id.prompt();            // 靜默續期；失敗就留按鈕給使用者點
    }

    /* ---------- 閘門畫面 ---------- */

    function gateEl() {
        var el = document.getElementById('care-auth-gate');
        if (el) { return el; }
        el = document.createElement('div');
        el.id = 'care-auth-gate';
        el.setAttribute('style', [
            'position:fixed', 'inset:0', 'z-index:99999',
            'background:rgba(255,255,255,.97)', 'display:flex',
            'flex-direction:column', 'align-items:center', 'justify-content:center',
            'gap:14px', 'padding:24px', 'text-align:center',
            'font-family:system-ui,-apple-system,sans-serif'
        ].join(';'));
        el.innerHTML =
            '<div style="font-size:34px">☀️💗</div>' +
            '<div style="font-size:17px;font-weight:700;color:#be123c">請用 Google 帳號登入</div>' +
            '<div style="font-size:15px;font-weight:600;color:#be123c">Silakan masuk dengan akun Google</div>' +
            '<div style="font-size:12px;color:#57534e;max-width:300px;line-height:1.6">' +
            '只有被授權的照顧者才能看到與記錄資料。<br>' +
            'Hanya pengasuh yang diizinkan dapat melihat dan mencatat data.</div>' +
            '<div id="care-auth-btn" style="margin-top:6px"></div>' +
            '<div id="care-auth-msg" style="font-size:12px;color:#b91c1c;min-height:18px"></div>';
        document.body.appendChild(el);
        return el;
    }

    function showGate() { if (document.body) { gateEl().style.display = 'flex'; } }
    function hideGate() {
        var el = document.getElementById('care-auth-gate');
        if (el) { el.style.display = 'none'; }
    }
    function gateMessage(text) {
        var m = document.getElementById('care-auth-msg');
        if (m) { m.textContent = text; }
    }

    /* ---------- 攔截送往 Apps Script 的 fetch ---------- */

    var nativeFetch = window.fetch.bind(window);

    function withToken(url, init, tok) {
        var opts = init ? Object.assign({}, init) : {};
        if (!tok) { return { url: url, init: opts }; }   // 過渡期還沒拿到 token → 原樣送
        var method = (opts.method || 'GET').toUpperCase();

        if (method === 'POST' && typeof opts.body === 'string') {
            var payload;
            try { payload = JSON.parse(opts.body); } catch (err) { payload = null; }
            if (payload && typeof payload === 'object') {
                payload.idt = tok;
                opts.body = JSON.stringify(payload);
                return { url: url, init: opts };
            }
        }
        // GET，或 body 不是 JSON → 掛在查詢字串
        var sep = url.indexOf('?') === -1 ? '?' : '&';
        return { url: url + sep + 'idt=' + encodeURIComponent(tok), init: opts };
    }

    window.fetch = function (input, init) {
        var url = (typeof input === 'string') ? input : (input && input.url) || '';
        if (url.indexOf('script.google.com') === -1) {
            return nativeFetch(input, init);        // 其他請求原樣放行
        }
        return getToken().then(function (tok) {
            var signed = withToken(url, init, tok);
            var req = (typeof input === 'string')
                ? nativeFetch(signed.url, signed.init)
                : nativeFetch(new Request(signed.url, input));
            return req.then(function (res) {
                // 後端拒絕（白名單沒有這個 email / token 無效）要看得見，不能靜默失敗
                return res.clone().json().then(function (data) {
                    if (data && data.error === 'auth') { escalate(data.reason); }
                    return res;
                }, function () { return res; });     // 不是 JSON 就原樣回傳
            });
        });
    };

    /* ---------- 除錯用 ---------- */

    window.careAuthState = function () {
        var t = storedToken();
        return {
            enabled: true,
            mode: softNow() ? 'soft（過渡期：不擋）' : 'enforced（後端已要求登入）',
            signedIn: !!t,
            expiresAt: t ? new Date(jwtExpMs(t)).toISOString() : null
        };
    };
    window.careAuthSignOut = function () {
        try { sessionStorage.removeItem(TOKEN_KEY); } catch (err) { /* ignore */ }
        if (window.google && google.accounts && google.accounts.id) {
            google.accounts.id.disableAutoSelect();
        }
        location.reload();
    };
}());
