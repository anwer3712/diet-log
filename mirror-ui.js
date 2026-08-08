/* ============================================================
 * mirror-ui.js — 鏡像介面 U1 / U2 專用（不被 index/admin/trends/anak 載入，改這裡不影響正式頁）
 *
 * 職責：
 *   1. 讀寫 cfg.ui（沿用 care-tasks.js 的 careUI / careSaveUI → GAS setMed，全裝置同步）
 *   2. 三種框的鎖定／樣式規則：🟣顯示文字判斷｜🟠計算(PIN 鎖)｜🔴彈窗提醒/藥物/模式
 *   3. 復健分級 LEVEL1–4 預設目錄（cfg.ui.exLevels 只存「與預設不同」的差異，省 property 空間）
 *   4. last_med property 容量守門（GAS ScriptProperties 單值上限 9KB，超過會整包存不進去）
 * ============================================================ */

const MIRROR_GAS_URL = "https://script.google.com/macros/s/AKfycby-3Q--z4t03yOtgtMpkbhYccmxD9dqvmrqQdX4sg4vZNBfjgyuKYuL6HZuHkro7p0o/exec";

/* GAS ScriptProperties 單一 property 上限 9,216 bytes；留 700 bytes 安全邊界 */
const MIRROR_BLOB_LIMIT = 8500;

const mfEsc = (typeof careEscapeHtml === 'function') ? careEscapeHtml
    : s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function mfBytes(str){ return new TextEncoder().encode(String(str || '')).length; }

/* ===== 🟠 計算欄位鎖：與 index.html / admin.html 共用同一個 session PIN 授權 ===== */
function mfUnlocked(){ return sessionStorage.getItem('care_admin_ok') === '1'; }
function mfEnsureUnlocked(){
    if (mfUnlocked()) return true;
    if (typeof careAskPin === 'function' && careAskPin('修改計算參數需要管理者密碼 / Ubah parameter perhitungan perlu PIN admin：')) {
        sessionStorage.setItem('care_admin_ok', '1');
        mfPaintLocks();
        return true;
    }
    mfToast('密碼錯誤，計算欄位維持鎖定', true);
    return false;
}
/* 橘框內所有 input/select 依鎖定狀態切換 readonly；🔒/🔓 徽章同步 */
function mfPaintLocks(){
    const locked = !mfUnlocked();
    document.querySelectorAll('.mf-orange').forEach(box => {
        box.classList.toggle('mf-locked', locked);
        box.querySelectorAll('input,select,textarea').forEach(el => {
            if (el.type === 'checkbox' || el.type === 'radio' || el.tagName === 'SELECT') el.disabled = locked;
            else el.readOnly = locked;
        });
    });
    document.querySelectorAll('.mf-lock-badge').forEach(b => { b.textContent = locked ? '🔒' : '🔓'; b.title = locked ? '點我輸入密碼解鎖' : '已解鎖（本次瀏覽有效）'; });
}
window.mfRequestUnlock = function(){ mfEnsureUnlocked(); };

/* ===== 提示條 ===== */
function mfToast(msg, isError){
    const t = document.getElementById('mf-toast');
    if (!t) { console.log(msg); return; }
    t.textContent = msg;
    t.classList.toggle('bg-red-600', !!isError);
    t.classList.toggle('bg-gray-900', !isError);
    t.classList.remove('opacity-0');
    clearTimeout(mfToast._t);
    mfToast._t = setTimeout(() => t.classList.add('opacity-0'), 3200);
}

/* ===== 雲端讀寫 =====
 * GAS 回應實測 ~3.6 秒。開頁時先用本機快取把整頁畫出來（可讀可改），背景再抓權威值覆蓋；
 * 但「儲存」在權威值回來前一律停用——否則會拿舊 blob 蓋掉別人剛存的設定。 */
const MF_GOALS_CACHE = 'mf_goals_cache';
function mfReadCachedGoals(){
    try {
        const o = JSON.parse(localStorage.getItem(MF_GOALS_CACHE) || 'null');
        return (o && o.goals && (Date.now() - o.ts) < 7 * 864e5) ? o.goals : null;
    } catch (e) { return null; }
}
function mfWriteCachedGoals(goals){
    try { localStorage.setItem(MF_GOALS_CACHE, JSON.stringify({ goals: goals, ts: Date.now() })); } catch (e) {}
}
function mfFetchGoals(){
    const url = `${MIRROR_GAS_URL}?date=${careTodayStr()}&t=${Date.now()}`;
    return fetch(url, { cache: 'no-store' }).then(r => r.json()).then(d => {
        const g = d.goals || {};
        mfWriteCachedGoals(g);
        return g;
    });
}
/* 存檔閘門：權威值到手前，按鈕停用並說明原因 */
function mfSetSaveReady(ready, reason){
    const btn = document.getElementById('btn-save');
    if (!btn) return;
    btn.disabled = !ready;
    btn.dataset.blocked = ready ? '' : (reason || '');
    btn.classList.toggle('opacity-50', !ready);
    btn.classList.toggle('cursor-not-allowed', !ready);
    if (!ready && reason) btn.textContent = reason;
}
/* 存檔前先量 blob 大小；超過上限直接擋下並指出該刪哪裡，避免整包被 GAS 丟掉 */
function mfPostUi(goals, patch){
    const json = careSaveUI(goals, patch || {});
    const size = mfBytes(json);
    if (size > MIRROR_BLOB_LIMIT) {
        return Promise.reject(new Error(`設定資料 ${size} bytes 超過雲端單筆上限 ${MIRROR_BLOB_LIMIT} bytes，請縮短介紹文字或減少圖片網址後再存。`));
    }
    return fetch(MIRROR_GAS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'setMed', val: json })
    }).then(r => r.json()).then(() => size);
}

/* ===== 復健分級目錄（U2）=====
 * 使用者指定：LEVEL1 三項、LEVEL2 三項、LEVEL3 四項、LEVEL4 三項。
 * 「站立」同時出現在 LEVEL3 / LEVEL4，故用獨立 key（l3-stand / l4-stand）分開存，可各自編輯。
 * ref 對得上舊 REHAB_GUIDE 的項目 → 預設帶入現成圖片與步驟；其餘留空給使用者填。 */
const MIRROR_EX_LEVELS = [
    { key: 'L1', zh: 'LEVEL 1', id: 'LEVEL 1', hint: '床上被動／暖身', items: [
        { key: 'l1-bottle', zh: '雙手舉水瓶', id: 'Angkat Botol Dua Tangan' },
        { key: 'l1-sole',   zh: '腳底板抬壓', id: 'Tekan Telapak Kaki' },
        { key: 'l1-knee',   zh: '膝蓋彎伸',   id: 'Tekuk & Luruskan Lutut' }
    ]},
    { key: 'L2', zh: 'LEVEL 2', id: 'LEVEL 2', hint: '仰臥主動肌力', items: [
        { key: 'l2-legraise',  zh: '仰臥抬腿',         id: 'Angkat Kaki Telentang', ref: '仰臥抬腿' },
        { key: 'l2-adduction', zh: '仰躺大腿內收訓練', id: 'Adduksi Paha Telentang', ref: '大腿內收' },
        { key: 'l2-bridge',    zh: '橋式',             id: 'Jembatan (Angkat Pinggul)', ref: '橋式抬臀' }
    ]},
    { key: 'L3', zh: 'LEVEL 3', id: 'LEVEL 3', hint: '坐姿轉位', items: [
        { key: 'l3-lift',      zh: '舉物練習',     id: 'Latihan Angkat Benda' },
        { key: 'l3-sitleg',    zh: '坐式抬腿',     id: 'Angkat Kaki Duduk' },
        { key: 'l3-sitadduct', zh: '坐式大腿內收', id: 'Adduksi Paha Duduk' },
        { key: 'l3-stand',     zh: '站立',         id: 'Berdiri', ref: '站立' }
    ]},
    { key: 'L4', zh: 'LEVEL 4', id: 'LEVEL 4', hint: '站姿平衡', items: [
        { key: 'l4-stand',      zh: '站立',     id: 'Berdiri', ref: '站立' },
        { key: 'l4-standsway',  zh: '站立搖擺', id: 'Berdiri Bergoyang' },
        { key: 'l4-standleg',   zh: '站立抬腿', id: 'Berdiri Angkat Kaki' }
    ]}
];

/* 舊有四項的圖片／步驟（與 index.html REHAB_GUIDE 同源），供 ref 帶入預設值 */
const MIRROR_EX_REF = {
    '仰臥抬腿': {
        images: ['rehab-img/legraise-1.jpg', 'rehab-img/legraise-2.jpg'],
        zh: '1. 平躺準備：病患平躺床上，雙腿伸直。\n2. 單腳抬起：彎曲單一膝蓋向上抬，使小腿與床面平行。\n3. 注意：若病肢無力，照顧者輕托「腳踝」與「膝窩」稍微輔助，避免拉傷。\n4. 計時十秒：維持姿勢，照顧者倒數 10 秒。\n5. 換腳交替：緩慢放下，換另一隻腳重覆相同動作。\n6. 建議訓練量：左右各做完 1 次為 1 回，每次進行 10～15 回。',
        id: '1. Pasien berbaring telentang dengan kedua kaki lurus.\n2. Tekuk satu lutut dan angkat hingga betis sejajar permukaan tempat tidur.\n3. Jika lemah, pengasuh menopang pergelangan kaki dan belakang lutut.\n4. Pertahankan 10 detik.\n5. Turunkan perlahan, ulangi dengan kaki lainnya.\n6. 1 repetisi tiap sisi = 1 set, lakukan 10-15 set.'
    },
    '大腿內收': {
        images: ['rehab-img/adduction-1.jpg', 'rehab-img/adduction-2.jpg'],
        zh: '1. 平躺準備：病患平躺床上，雙腿伸直放鬆。\n2. 單腳屈膝：彎曲單一膝蓋向上立起，使腳掌穩定平貼於床面。\n3. 膝蓋內夾：令病患主動使用大腿肌群，將屈起的膝蓋往內側夾緊。\n4. 注意：若大腿乏力，照顧者一手置於膝蓋外側輕壓引導，以無痛為原則。\n5. 計時十秒：維持向內夾緊的姿勢。\n6. 換腳交替；左右各 1 次為 1 回，每次 10～15 回。',
        id: '1. Berbaring telentang, kedua kaki lurus dan rileks.\n2. Tekuk satu lutut, telapak kaki rata di tempat tidur.\n3. Remas lutut ke dalam dengan otot paha.\n4. Jika lemah, pengasuh menekan lembut sisi luar lutut, jangan sampai sakit.\n5. Tahan 10 detik.\n6. Ganti kaki; 1 repetisi tiap sisi = 1 set, 10-15 set.'
    },
    '橋式抬臀': {
        images: ['rehab-img/bridge-1.jpg', 'rehab-img/bridge-2.jpg'],
        zh: '1. 平躺準備：病患平躺在床上，上半身自然放鬆。\n2. 雙腳立起：兩腳膝蓋彎曲向上立起，腳掌平貼床面。\n3. 臀部抬起：用臀部與大腿後側的力量把臀部抬離床面。\n4. 計時十秒：維持抬臀姿勢穩定。\n5. 緩慢放下休息。\n6. 建議訓練量：做完 1 次為 1 回，每次 10～15 回。',
        id: '1. Berbaring telentang, tubuh atas rileks.\n2. Tekuk kedua lutut, telapak kaki rata di tempat tidur.\n3. Angkat pinggul memakai otot bokong dan belakang paha.\n4. Tahan 10 detik.\n5. Turunkan perlahan untuk istirahat.\n6. 1 repetisi = 1 set, 10-15 set tiap kali.'
    },
    '站立': {
        images: ['rehab-img/stand-1.jpg', 'rehab-img/stand-2.jpg', 'rehab-img/stand-3.jpg', 'rehab-img/stand-4.jpg', 'rehab-img/stand-5.jpg'],
        zh: '1. 降床準備：電動床降到最低，放下一邊床欄，協助病患坐至床沿，雙腳平穩踩地。\n2. 注意：全程留意導尿管位置，避免壓迫、牽拉或高於膀胱水平。\n3. 膝蓋頂防：照顧者站正前方，以膝蓋抵住病患膝蓋防止滑跪。\n4. 抱頸站起：病患雙手環抱照顧者頸部（或抓穩助行器）自行發力站起。\n5. 姿勢維持：抬頭挺胸、眼睛直視前方，照顧者持續戒護。\n6. 坐下休息：體力耗盡即協助緩慢坐回床沿。',
        id: '1. Turunkan tempat tidur ke posisi terendah, turunkan satu rel, bantu pasien duduk di tepi dengan kaki menapak lantai.\n2. Perhatikan kateter: hindari tertekan, tertarik, atau lebih tinggi dari kandung kemih.\n3. Pengasuh berdiri di depan, lutut menopang lutut pasien.\n4. Pasien memeluk leher pengasuh (atau pegang walker) lalu berdiri sendiri.\n5. Kepala tegak, dada membusung, mata lurus ke depan; pengasuh mengawasi.\n6. Bila lelah, bantu duduk kembali perlahan.'
    }
};

/* 預設卡：ref 有對應就帶圖片＋步驟，否則空白 */
function mfExDefault(item){
    const r = item.ref ? MIRROR_EX_REF[item.ref] : null;
    return {
        zh: item.zh, id: item.id,
        imgs: r ? r.images.slice() : [],
        dzh: r ? r.zh : '',
        did: r ? r.id : ''
    };
}
/* 合併雲端差異：cfg.ui.exLevels = { '<itemKey>': {zh,id,imgs,dzh,did} }，只存被改過的欄位 */
function mfExMerge(ui){
    const saved = (ui && ui.exLevels) || {};
    return MIRROR_EX_LEVELS.map(lv => ({
        key: lv.key, zh: lv.zh, id: lv.id, hint: lv.hint,
        items: lv.items.map(it => Object.assign(mfExDefault(it), saved[it.key] || {}, { key: it.key, ref: it.ref }))
    }));
}
/* 反向：與預設相同的欄位不寫入，blob 才不會爆 */
function mfExDiff(levels){
    const out = {};
    const byKey = {};
    MIRROR_EX_LEVELS.forEach(lv => lv.items.forEach(it => byKey[it.key] = it));
    levels.forEach(lv => lv.items.forEach(it => {
        const d = mfExDefault(byKey[it.key] || it);
        const rec = {};
        if (it.zh !== d.zh) rec.zh = it.zh;
        if (it.id !== d.id) rec.id = it.id;
        if (JSON.stringify(it.imgs) !== JSON.stringify(d.imgs)) rec.imgs = it.imgs;
        if (it.dzh !== d.dzh) rec.dzh = it.dzh;
        if (it.did !== d.did) rec.did = it.did;
        if (Object.keys(rec).length) out[it.key] = rec;
    }));
    return out;
}

/* ===== 本機圖庫：上傳的照片轉 dataURL 存 localStorage（雲端 property 只有 9KB，塞不下圖檔）=====
 * 存進去的是縮到 800px 寬的 JPEG；圖片本身不跨裝置同步，網址欄才會同步。 */
const MF_IMG_PREFIX = 'mf_img_';
function mfLocalImgKey(itemKey, i){ return MF_IMG_PREFIX + itemKey + '_' + i; }
function mfLocalImgList(itemKey){
    const out = [];
    for (let i = 0; i < 6; i++) {
        const v = localStorage.getItem(mfLocalImgKey(itemKey, i));
        if (v) out.push({ i, src: v });
    }
    return out;
}
function mfLocalImgClear(itemKey){
    for (let i = 0; i < 6; i++) localStorage.removeItem(mfLocalImgKey(itemKey, i));
}
/* File → 縮圖 dataURL（限制長邊 800px、JPEG 0.72），避免 localStorage 5MB 很快被吃光 */
function mfShrinkImage(file, maxSide, quality){
    maxSide = maxSide || 800; quality = quality || 0.72;
    return new Promise((resolve, reject) => {
        const fr = new FileReader();
        fr.onerror = () => reject(new Error('讀取檔案失敗'));
        fr.onload = () => {
            const img = new Image();
            img.onerror = () => reject(new Error('圖片格式無法解析'));
            img.onload = () => {
                const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
                const w = Math.round(img.width * scale), h = Math.round(img.height * scale);
                const cv = document.createElement('canvas');
                cv.width = w; cv.height = h;
                cv.getContext('2d').drawImage(img, 0, 0, w, h);
                resolve(cv.toDataURL('image/jpeg', quality));
            };
            img.src = fr.result;
        };
        fr.readAsDataURL(file);
    });
}
function mfSaveLocalImg(itemKey, dataUrl){
    for (let i = 0; i < 6; i++) {
        const k = mfLocalImgKey(itemKey, i);
        if (!localStorage.getItem(k)) {
            try { localStorage.setItem(k, dataUrl); return i; }
            catch (e) { throw new Error('本機儲存空間不足，請先刪除舊照片'); }
        }
    }
    throw new Error('每個項目最多 6 張本機照片');
}

/* ===== 小工具 ===== */
/* 節流：連打輸入時運算式只重算一次，避免每個 keystroke 觸發整頁重排。
 * 刻意不用 requestAnimationFrame——分頁切到背景（document.hidden）時 rAF 會停擺，
 * 回到前景才補跳，畫面會停在舊值。index.html 的 i18n observer 也是為此改用 setTimeout。 */
function mfRaf(fn){
    let timer = null;
    return function(){
        if (timer) return;
        timer = setTimeout(() => { timer = null; fn(); }, 16);
    };
}
function mfNum(id, fallback){
    const el = document.getElementById(id);
    const v = el ? parseFloat(el.value) : NaN;
    return isFinite(v) ? v : fallback;
}
function mfVal(id){ const el = document.getElementById(id); return el ? el.value : ''; }
function mfChk(id){ const el = document.getElementById(id); return el ? el.checked : false; }
