/* ============================================================
 * care-tasks.js — index.html / report.html / admin.html 共用
 * 時段定義、任務判定（準時/補齊/XX/未到期）、進度格渲染、
 * 使用者身分（U1–U5/管理者，U5=anak.html 兒童頁）、語言（zh/id）、備註單語化
 * ============================================================ */

/* 管理者密碼：改這裡（僅家庭內部防誤觸用，非高強度保密） */
const CARE_PIN = '3712';

/* 2026-07-14 時段調整：早上 05:00-10:00、中午 10:01-15:00、晚上 15:01-17:00、睡前 17:01-21:00
 * start/end 皆為「含」（inclusive），各頁一律用 careInSlot() 判斷紀錄歸屬時段 */
const CARE_SLOTS = [
    { key:'dawn',    start:'00:00', end:'04:59', zh:'凌晨', id:'Dini hari' },
    { key:'morning', start:'05:00', end:'10:00', zh:'早上', id:'Pagi' },
    { key:'midday',  start:'10:01', end:'15:00', zh:'中午', id:'Siang' },
    { key:'evening', start:'15:01', end:'17:00', zh:'晚上', id:'Sore' },
    { key:'night',   start:'17:01', end:'21:00', zh:'睡前', id:'Sblm tidur' },
    { key:'late',    start:'21:01', end:'23:59', zh:'深夜', id:'Larut' }
];
function careInSlot(time, slot){ return time >= slot.start && time <= slot.end; }

/* 2026-07-05 復健項目換新（舊資料保留顯示：雙手舉水瓶/腳底板抬壓/膝蓋彎伸 仍認得，只是不再列入任務） */
const CARE_EX_TYPES = ['仰臥抬腿','大腿內收','橋式抬臀','站立'];
const CARE_EX_SHORT = { '仰臥抬腿':['抬腿','Angkat'], '大腿內收':['內收','Adduksi'], '橋式抬臀':['橋式','Pinggul'], '站立':['站立','Berdiri'] };
const careIsBP = r => r.category && r.category.includes('血壓/心跳');

/* 應完成任務：
 * - 四項復健（抬腿/內收/橋式/站立）每天各完成一次
 *   → 19:00 前完成為準時，19:00 後未做顯示為「未做」
 * - 血壓：早上一次、睡前（21:00 前）累計兩次
 * - 尿液：21:01 後（深夜時段）量測今日最後一次 */
function careTaskDefs(goals){
    const nth = (records, filter, n) => {
        const s = records.filter(filter).sort((a,b)=>a.time.localeCompare(b.time));
        return s.length >= n ? s[n-1] : null;
    };
    const defs = [];
    const ui = careUI(goals);   // 期限（早壓/復健/晚壓）改讀管理設定，與提醒時段一致

    defs.push({ slot:'morning', deadline:ui.time.bpMorning, order:0, zh:'早壓', id:'Tensi', full_zh:'起床後測量血壓', full_id:'Ukur tensi pagi',
        need:(rs,t)=> rs.filter(r=>careIsBP(r)&&r.time<t).length>=1, rec:rs=>nth(rs,careIsBP,1) });

    /* 2026-07-14 復健判定改為「累計次數」：睡前若未達今日目標次數→視為未完成(missed)。
     * 目標取 goals['goal_<項目>']；未設定目標時退回舊規則「有做即算」。 */
    CARE_EX_TYPES.forEach((ex, ti) => {
        const sh = CARE_EX_SHORT[ex];
        const goalN = goals ? (parseFloat(goals['goal_' + ex]) || 0) : 0;
        const sumEx = (rs, before) => rs
            .filter(r => r.category === ex && (!before || r.time < before))
            .reduce((s, r) => s + (parseFloat(r.amount) || 0), 0);
        defs.push({ slot:'night', deadline:ui.time.rehabDeadline, order:ti+1, zh:sh[0], id:sh[1],
            full_zh:`睡前${ex}`, full_id:`${sh[1]} (Sblm tidur)`,
            need:(rs,t)=> goalN > 0 ? sumEx(rs, t) >= goalN : rs.some(r=>r.category===ex && r.time<t),
            rec:rs=>{
                const met = goalN > 0 ? sumEx(rs, null) >= goalN : rs.some(r=>r.category===ex);
                if (!met) return null;   // 未達目標→不算補齊，讓狀態落到 missed
                const s = rs.filter(r=>r.category===ex).sort((a,b)=>a.time.localeCompare(b.time));
                return s.length>0 ? s[s.length-1] : null;
            } });
    });

        defs.push({ slot:'night', deadline:ui.time.bpNight, order:0, zh:'晚壓', id:'Tensi', full_zh:'睡前測量血壓', full_id:'Ukur tensi sebelum tidur',
        need:(rs,t)=> rs.filter(r=>careIsBP(r)&&r.time<t).length>=2, rec:rs=>nth(rs,careIsBP,2) });

    defs.push({ slot:'late', deadline:'23:59', order:0, zh:'尿量', id:'Urine', full_zh:'睡前量測今日最後一次尿液', full_id:'Ukur urine terakhir',
        need:(rs)=> rs.some(r=>r.category==='尿液' && r.time>='21:01'), rec:()=>null });

    // 時段內排序：血壓在前、四項運動照序
    defs.sort((a,b)=>{
        const sa = CARE_SLOTS.findIndex(s=>s.key===a.slot), sb = CARE_SLOTS.findIndex(s=>s.key===b.slot);
        return sa !== sb ? sa - sb : a.order - b.order;
    });
    return defs;
}

function careTodayStr(){
    const now = new Date();
    return new Date(now.getTime() - now.getTimezoneOffset()*60000).toISOString().split('T')[0];
}

/* 任務狀態：done準時 / late補齊 / missed未完成XX / pending未到期 */
function careComputeTasks(records, dateStr, goals){
    const valid = records.filter(r => r.status !== '無效');
    const isToday = dateStr === careTodayStr();
    const isFuture = dateStr > careTodayStr();
    const hm = new Date().toTimeString().substring(0,5);
    const lateRecIds = new Set();
    const tasks = careTaskDefs(goals).map(def => {
        const deadlinePassed = !isFuture && (!isToday || hm >= def.deadline);
        const onTime = def.need(valid, def.deadline);
        const fulfillRec = def.rec ? def.rec(valid) : null;
        let state;
        if (onTime) state = 'done';
        else if (fulfillRec) { state = 'late'; lateRecIds.add(fulfillRec.recordId); }
        else if (deadlinePassed) state = 'missed';
        else state = 'pending';
        return Object.assign({}, def, { state });
    });
    return { tasks, lateRecIds };
}

/* 三行進度格：第一行時段、第二行項目、第三行方格。lang: 'zh' | 'id' */
function careRenderGrid(el, tasks, lang){
    lang = lang || 'zh';
    const L = (zh,id) => lang==='id' ? id : zh;
    const slotsWithTasks = CARE_SLOTS.filter(s => tasks.some(t=>t.slot===s.key));
    const sq = {
        done:    '<div class="w-7 h-7 rounded-lg bg-green-400 shadow-sm flex items-center justify-center text-white text-[12px] font-black">✓</div>',
        late:    `<div class="w-7 h-7 rounded-lg bg-amber-300 shadow-sm flex items-center justify-center text-amber-800 text-[11px] font-black">${lang==='id'?'+':'補'}</div>`,
        missed:  '<div class="w-7 h-7 rounded-lg bg-red-400 shadow-sm flex items-center justify-center text-white text-[12px] font-black">✕</div>',
        pending: '<div class="w-7 h-7 rounded-lg border-2 border-dashed border-gray-200 bg-white"></div>'
    };
    let row1='', row2='', row3='';
    slotsWithTasks.forEach((s,i) => {
        const st = tasks.filter(t=>t.slot===s.key);
        const bd = i>0 ? 'border-l border-gray-200' : '';
        row1 += `<td colspan="${st.length}" class="text-center text-[10px] font-black text-gray-500 pb-1 px-1 ${bd}">${L(s.zh,s.id)}<div class="text-[8px] text-gray-300 font-bold">${s.start}-${s.end}</div></td>`;
        st.forEach((t,j) => {
            const bd2 = (i>0 && j===0) ? 'border-l border-gray-200' : '';
            row2 += `<td class="text-center text-[9px] font-bold text-gray-400 px-0.5 pb-1 leading-tight ${bd2}" title="${t.full_zh}">${L(t.zh,t.id)}</td>`;
            row3 += `<td class="px-0.5 ${bd2}"><div class="flex justify-center" title="${t.full_zh}">${sq[t.state]}</div></td>`;
        });
    });
    el.innerHTML = `<table class="mx-auto border-collapse"><tr>${row1}</tr><tr>${row2}</tr><tr>${row3}</tr></table>
    <div class="flex justify-center gap-3 mt-2 text-[9px] font-bold text-gray-400">
        <span class="flex items-center gap-1"><span class="inline-block w-2.5 h-2.5 rounded-sm bg-green-400"></span>${L('準時','Tepat')}</span>
        <span class="flex items-center gap-1"><span class="inline-block w-2.5 h-2.5 rounded-sm bg-amber-300"></span>${L('補齊','Terlambat')}</span>
        <span class="flex items-center gap-1"><span class="inline-block w-2.5 h-2.5 rounded-sm bg-red-400"></span>${L('未做','Belum')}</span>
        <span class="flex items-center gap-1"><span class="inline-block w-2.5 h-2.5 rounded-sm border border-dashed border-gray-300 bg-white"></span>${L('未到','Nanti')}</span>
    </div>`;
}

/* ===== 使用者身分：'1'/'2'/'3'/'4'(開放，免密碼)/'A'(管理者)。換到 1/2/3/A 需管理者密碼 ===== */
function careGetUser(){
    const p = new URLSearchParams(location.search).get('user');
    if (p && ['1','2','3','4'].includes(p)) { localStorage.setItem('care_user', p); return p; }
    const s = localStorage.getItem('care_user');
    return ['1','2','3','4','A'].includes(s) ? s : '4';
}
function careSetUser(u){ localStorage.setItem('care_user', String(u)); }
function careAskPin(msg){
    let v = null;
    try { v = prompt(msg || '請輸入管理者密碼 / Masukkan PIN admin'); } catch(e) { return false; }
    return v === CARE_PIN;
}
/* ===== 語言：'zh' 全繁中 或 'id' 全印尼文（不再有混合模式） ===== */
function careGetLang(){
    const p = new URLSearchParams(location.search).get('lang');
    if (p && ['zh','id'].includes(p)) { localStorage.setItem('care_lang', p); return p; }
    const s = localStorage.getItem('care_lang');
    return s === 'id' ? 'id' : 'zh';
}
function careSetLang(m){ localStorage.setItem('care_lang', m); }

/* ===== 共用設定 blob：存在後端 last_med property（原樣 JSON 進出，全裝置同步）
 * 內容：{ diuretic, laxative, names:{1:'',2:'',3:''} }
 * 注意：寫回時必須先讀最新值合併，不可整包覆蓋（否則會洗掉別的欄位） ===== */
function careConfig(goals){
    try { return JSON.parse((goals && goals['last_med']) || '{}'); } catch(e) { return {}; }
}
function careUserName(goals, u){
    const c = careConfig(goals);
    const n = c.names && c.names[u];
    return (n && String(n).trim()) ? String(n).trim() : 'U' + u;
}

/* ===== 每日藥物預設（管理者鎖定）=====
 * 填寫頁（index/anak）的利尿/利便藥物預設鎖定唯讀，須管理者 PIN 才能改；
 * 值存在 last_med blob 的 dailyMed，全裝置同步、跨日沿用「前一次的選擇」。
 * 利尿：''=無 | 'aux'=利尿藥物（輔助）| 'full'=利尿藥物（單選）
 * 利便：顆數，預設 2 顆（無/1顆/2顆） */
function careDailyMed(goals){
    const d = (careConfig(goals).dailyMed) || {};
    return {
        diuretic: ('diuretic' in d) ? d.diuretic : '',            // legacy 單選類別（''/aux/full），沿用於目標演算
        diureticNames: Array.isArray(d.diureticNames) ? d.diureticNames : [],   // 複選具名藥（新）
        laxPills: ('laxPills' in d) ? d.laxPills : 2
    };
}
/* 存回每日藥物預設（merge-safe，不可整包覆蓋 last_med）。就地更新 goals['last_med']
 * 並回傳新的 JSON 字串，呼叫端再 POST setMed 上雲。 */
function careSaveDailyMed(goals, patch){
    const c = careConfig(goals);
    c.dailyMed = Object.assign(careDailyMed(goals), patch || {});
    const json = JSON.stringify(c);
    if (goals) goals['last_med'] = json;
    return json;
}

/* ============================================================
 * 管理設定（顯示/彈窗/時段/數字/血壓區間/記錄模式），全部存在 last_med blob 的 cfg.ui，
 * 走現成 setMed 全裝置同步——不需改後端。讀取一律 careUI(goals)＝預設 deep-merge 已存值。
 * 加/改「數字或文字」只要在管理設定頁改存即可，不必動程式碼。
 * ============================================================ */
const CARE_UI_DEFAULTS = {
    urineMode: 'cc',            // 'cc'＝容量CC（現狀）｜'count'＝次數制（比照排便，只記顏色+利尿藥，關閉CC目標/超標）
    stoolMode: 'status',        // 'status'＝狀態+利便藥（現狀）｜'weight'＝記重量
    stoolWeightUnit: 'g',
    diuretics: [                // 利尿藥複選清單；aux:true＝輔助(×uFactorAux) / false＝完整(×uFactorFull)
        { name: '利尿藥物（輔助）', aux: true },
        { name: '利尿藥物', aux: false }
    ],
    diseases: [],               // 病患疾病 id 清單（軸3，選自 care-clinical.js DISEASES）；admin-settings 複選存入，trends 研判建構器讀取
    subject: { zh: '案主', id: 'Klien' },   // 內文對照顧對象的稱呼（雙語）；admin-settings 可改，全頁警語/提示文字套用

    show: {                     // 提示卡/警語 顯示開關（true＝顯示）
        bedRail: true, catheter: false, bpGuide: true, rehabNote: true,
        standWarn: true, enemaWarn: true, urineRangeInfo: true
    },
    popup: {                    // 彈窗/提醒 開關（true＝會跳）
        reminder: true, intake21: true, rehabRemind: true, urineRemind: true,
        gridRemind: true, bowelAlert: true, bpAlert: true, fluidOver: true, urineOver: true
    },
    text: {                     // 可編提示文字（雙語）；空字串＝用頁面內建文字
        bedRail: { zh: '', id: '' }, catheter: { zh: '', id: '' },
        bpGuide: { zh: '', id: '' }, rehabNote: { zh: '', id: '' },
        standWarn: { zh: '', id: '' }, enemaWarn: { zh: '', id: '' }
    },
    notices: [],                // 自訂公告槽：{ on:true, zh:'', id:'', pos:'top'|'output' }
    reminders: [],              // 自訂時間提醒：{ on:true, time:'HH:MM', zh:'', id:'' }，index 到時彈窗（每日一次）
    time: {
        intakeCheck: '21:00', rehabFrom: '16:00', rehabDeadline: '19:00',
        gridFrom: '20:00', urineFrom: '21:01', bpMorning: '10:00', bpNight: '21:00'
    },
    num: {
        fluidMin: 1100, fluidMax: 1500,
        uFactorNone: 0.9, uFactorAux: 1.1, uFactorFull: 1.3,
        catheterHours: 3, catheterTimes: 2,
        bowelMinH: 60, bowelMaxH: 72
    },
    bp: {
        early: { sys: [130,150], dia: [70,90], hr: [65,85] },
        late:  { sys: [120,140], dia: [70,85], hr: [65,80] }
    }
};

/* deep-merge：物件遞迴合併；陣列與純值直接取覆蓋值（利尿清單/公告/血壓區間對＝整組取代） */
function careUiMerge(base, over){
    if (over === undefined) return base;
    if (Array.isArray(base) || Array.isArray(over)) return over;
    if (typeof base !== 'object' || base === null || typeof over !== 'object' || over === null) return over;
    const out = {};
    Object.keys(base).forEach(k => { out[k] = careUiMerge(base[k], over[k]); });
    Object.keys(over).forEach(k => { if (!(k in out)) out[k] = over[k]; });   // 保留使用者新增鍵（如公告）
    return out;
}
function careUI(goals){ return careUiMerge(CARE_UI_DEFAULTS, (careConfig(goals).ui) || {}); }
/* 內文稱呼（雙語）：管理設定可改，缺值退回內建「案主/Klien」 */
function careSubj(goals, lang){
    const s = careUI(goals).subject || CARE_UI_DEFAULTS.subject;
    return (s && s[lang]) || CARE_UI_DEFAULTS.subject[lang];
}
/* 存回 cfg.ui（merge-safe，不覆蓋 last_med 其他欄位）；就地更新 goals 並回傳新 JSON，呼叫端 POST setMed */
function careSaveUI(goals, uiPatch){
    const c = careConfig(goals);
    c.ui = careUiMerge(careUI(goals), uiPatch || {});
    const json = JSON.stringify(c);
    if (goals) goals['last_med'] = json;
    return json;
}
/* 利尿藥複選 → 換算類別（倍率取最高）：任一「完整」→'full'；否則任一「輔助」→'aux'；皆無→'' */
function careDiureticCat(selectedNames, ui){
    const list = (ui && ui.diuretics) || CARE_UI_DEFAULTS.diuretics;
    const sel = (selectedNames || []).map(String);
    let hasAux = false;
    for (const d of list){
        if (sel.indexOf(String(d.name)) === -1) continue;
        if (!d.aux) return 'full';
        hasAux = true;
    }
    return hasAux ? 'aux' : '';
}

/* 純函式自我檢查（node 手動跑；不自動執行）：合併/倍率取最高/尿量目標/血壓區間覆蓋 */
function careUiSelfTest(){
    const A = (c, m) => { if (!c) throw new Error('careUiSelfTest FAIL: ' + m); };
    const ui1 = careUiMerge(CARE_UI_DEFAULTS, { num: { fluidMax: 1400 } });
    A(ui1.num.fluidMax === 1400, 'partial num override');
    A(ui1.num.fluidMin === 1100, 'sibling default kept');
    A(ui1.num.uFactorFull === 1.3 && ui1.urineMode === 'cc', 'unrelated defaults kept');
    A(careUrineFactor('full', ui1) === 1.3, 'factor full default');
    const ui2 = careUiMerge(CARE_UI_DEFAULTS, { num: { uFactorFull: 1.5 } });
    A(careUrineFactor('full', ui2) === 1.5, 'factor full overridden');
    A(careUrineGoal(1000, 'aux', ui2) === 1100, 'urine goal aux x1.1');
    A(careDiureticCat(['利尿藥物（輔助）'], CARE_UI_DEFAULTS) === 'aux', 'aux only');
    A(careDiureticCat(['利尿藥物（輔助）','利尿藥物'], CARE_UI_DEFAULTS) === 'full', 'max to full');
    A(careDiureticCat([], CARE_UI_DEFAULTS) === '', 'none selected');
    const ui3 = careUiMerge(CARE_UI_DEFAULTS, { bp: { early: { sys:[120,140] } } });
    A(ui3.bp.early.dia[1] === 90, 'bp partial keeps sibling');
    A(careBpViolations('血壓/心跳(早)', 135, 80, 75, ui3).violations.length === 0, 'bp in range');
    A(careBpViolations('血壓/心跳(早)', 145, 80, 75, ui3).violations.length === 1, 'bp sys over');
    A(careSubj({}, 'zh') === '案主' && careSubj({}, 'id') === 'Klien', 'subject default');
    const ui4 = careUiMerge(CARE_UI_DEFAULTS, { subject: { zh: '爺爺', id: 'Kakek' } });
    A(ui4.subject.zh === '爺爺' && careUrineFactor('full', ui4) === 1.3, 'subject override keeps sibling defaults');
    return 'careUiSelfTest PASS';
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { careUiMerge, careUI, careSubj, careSaveUI, careDiureticCat, careUrineFactor, careUrineGoal, careBpViolations, careUiSelfTest, CARE_UI_DEFAULTS };
}

/* ===== 授權連結：admin 產生、照顧者點開即綁定該裝置身分（免密碼）
 * token = 簡易簽章(身分+CARE_PIN)，防亂猜網址；家庭級防護 ===== */
function careSig(u){
    let h = 0; const s = 'CARE' + u + CARE_PIN;
    for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
    return Math.abs(h).toString(36);
}
function careJoinLink(u){
    const base = location.href.split(/[?#]/)[0].replace(/admin\.html$/, 'index.html');
    return base + '?join=' + u + '.' + careSig(u);
}
/* index.html 開頁呼叫：網址帶 ?join=U.sig 就綁定身分並清掉 token */
function careApplyJoin(){
    const j = new URLSearchParams(location.search).get('join');
    if (!j) return null;
    const m = /^([1234])\.([a-z0-9]+)$/.exec(j);
    if (m && m[2] === careSig(m[1])) {
        localStorage.setItem('care_user', m[1]);
        history.replaceState(null, '', location.pathname);
        return m[1];
    }
    return null;
}

/* 記錄者標記 👤U1/U2/U3/U4/U5/UA（U5＝兒童頁 anak.html） */
function careUserOfNote(note){
    const m = /👤U([12345A])/.exec(note || '');
    return m ? m[1] : null;
}
function careStripUserTag(note){ return (note || '').replace(/\s*👤U[12345A]/g, '').trim(); }

/* ===== 2026-07-14 尿液/排便每日目標演算法（index/anak/admin/trends 共用） =====
 * 尿液目標 = 今日已達飲水量 ×0.9；當日有利尿藥物（輔助）×1.1；有利尿藥物 ×1.3
 * 排便目標 = 1 次；當日利便藥物達 2 顆（含）以上 → 目標 = 顆數
 * 藥物由「當天紀錄備註」判讀：[當日附加: 利尿藥物(輔助)] / [當日附加: 利尿藥物] / [當日附加: 利便藥物N顆]
 * （舊資料 [當日附加: 利便藥物] 無顆數視為 1 顆；[當日附加: 利尿藥物] 視為利尿藥物） */
function careMedFromRecords(records){
    let diuretic = null;   // null=無 | 'aux'=利尿藥物（輔助） | 'full'=利尿藥物
    let laxPills = 0;      // 利便藥物顆數
    (records || []).forEach(r => {
        const n = r.note || '';
        if (!n) return;
        if (/利尿藥物\s*[（(]輔助[）)]/.test(n)) { if (diuretic !== 'full') diuretic = 'aux'; }
        else if (n.includes('利尿藥物')) diuretic = 'full';
        const m = /利便藥物\s*(\d+)\s*顆/.exec(n);
        if (m) laxPills = Math.max(laxPills, parseInt(m[1], 10));
        else if (n.includes('利便藥物')) laxPills = Math.max(laxPills, 1);
    });
    return { diuretic, laxPills };
}
/* 倍率／區間預設值可被管理設定（careUI().num）覆蓋；不傳 ui 時退回內建預設，向後相容 */
function careUrineFactor(diuretic, ui){
    const n = (ui && ui.num) || {};
    const full = ('uFactorFull' in n) ? parseFloat(n.uFactorFull) : 1.3;
    const aux  = ('uFactorAux'  in n) ? parseFloat(n.uFactorAux)  : 1.1;
    const none = ('uFactorNone' in n) ? parseFloat(n.uFactorNone) : 0.9;
    return diuretic === 'full' ? full : (diuretic === 'aux' ? aux : none);
}
function careUrineGoal(intake, diuretic, ui){ return Math.round((parseFloat(intake) || 0) * careUrineFactor(diuretic, ui)); }
function careStoolGoal(laxPills){ return Math.max(1, parseInt(laxPills, 10) || 0); }

/* ===== 血壓/心跳合理控制區間（index.html／anak.html 共用；超出→彈窗提醒，不擋存檔） ===== */
const CARE_BP_RANGES = {
    '早': { sys:[130,150], dia:[70,90], hr:[65,85] },   // 晨間（服藥前）
    '晚': { sys:[120,140], dia:[70,85], hr:[65,80] }    // 晚間（睡前）
};
/* category 含 (早)/(晚)；回傳 { slot, violations:[{zh,id,val,lo,hi,unit}] }，空陣列＝全部合理 */
function careBpViolations(category, sys, dia, hr, ui){
    const slot = (category || '').includes('(早)') ? '早' : '晚';
    const R = (ui && ui.bp && ui.bp.early && ui.bp.late) ? (slot === '早' ? ui.bp.early : ui.bp.late) : CARE_BP_RANGES[slot];
    const out = [];
    const chk = (zh, id, v, lo, hi, unit) => {
        const n = Number(v);
        if (!isFinite(n) || n < lo || n > hi) out.push({ zh, id, val: v, lo, hi, unit });
    };
    chk('收縮壓', 'Tekanan atas',   sys, R.sys[0], R.sys[1], 'mmHg');
    chk('舒張壓', 'Tekanan bawah',  dia, R.dia[0], R.dia[1], 'mmHg');
    chk('心跳',   'Detak jantung',  hr,  R.hr[0],  R.hr[1],  '次/分');
    return { slot, violations: out };
}

/* 備註單語化：把「中文 / 外文」對與已知標籤依語言取單側 */
function careNoteDisplay(note, lang){
    let t = careStripUserTag(note);
    t = t.replace(/\[當日附加:\s*利尿藥物\s*[（(]輔助[）)]\]/g, lang==='id' ? '[Diuretik (bantu)]' : '[利尿藥物（輔助）]');
    t = t.replace(/\[當日附加:\s*利尿藥物\]/g, lang==='id' ? '[Diuretik]' : '[利尿藥物]');
    t = t.replace(/\[當日附加:\s*利便藥物\s*(\d+)\s*顆\]/g, (m,n)=> lang==='id' ? `[Obat pencahar ${n} butir]` : `[利便藥物${n}顆]`);
    t = t.replace(/\[當日附加:\s*利便藥物\]/g, lang==='id' ? '[Obat pencahar]' : '[利便藥物]');
    t = t.replace(/\[胃口:\s*好\]/g,   lang==='id' ? '[Nafsu makan: Baik]'   : '[胃口好]');
    t = t.replace(/\[胃口:\s*普通\]/g, lang==='id' ? '[Nafsu makan: Biasa]'  : '[胃口普通]');
    t = t.replace(/\[胃口:\s*差\]/g,   lang==='id' ? '[Nafsu makan: Kurang]' : '[胃口差]');
    t = t.replace(/\[浣腸\s*\/\s*Supositoria gliserin\]/g, lang==='id' ? '[Supositoria gliserin]' : '[浣腸]');
    t = t.replace(/([一-鿿][^\/\[\]]*?)\s*\/\s*([A-Za-z][^\/\[\]]*)/g, (m,zh,id)=> (lang==='id' ? id : zh).trim());
    return t.trim();
}


/* ===== HTML 逃逸：所有來自後端試算表／使用者輸入的文字，插入 innerHTML 前必須先跳脫 HTML 元字元，防止 DOM XSS ===== */
function careEscapeHtml(str){
    return String(str === null || str === undefined ? '' : str).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
