/* ============================================================
 * care-tasks.js — index.html / report.html / admin.html 共用
 * 時段定義、任務判定（準時/補齊/XX/未到期）、進度格渲染、
 * 使用者身分（U1/U2/U3/管理者）、語言（zh/id）、備註單語化
 * ============================================================ */

/* 管理者密碼：改這裡（僅家庭內部防誤觸用，非高強度保密） */
const CARE_PIN = '3712';

const CARE_SLOTS = [
    { key:'dawn',    start:'00:00', end:'07:00', zh:'凌晨', id:'Dini hari' },
    { key:'morning', start:'07:00', end:'10:30', zh:'早上', id:'Pagi' },
    { key:'midday',  start:'10:30', end:'16:30', zh:'中午', id:'Siang' },
    { key:'evening', start:'16:30', end:'19:00', zh:'下午', id:'Sore' },
    { key:'night',   start:'19:00', end:'22:00', zh:'睡前', id:'Sblm tidur' },
    { key:'late',    start:'22:00', end:'24:00', zh:'深夜', id:'Larut' }
];

const CARE_EX_TYPES = ['雙手舉水瓶','腳底板抬壓','膝蓋彎伸','站立'];
const CARE_EX_SHORT = { '雙手舉水瓶':['舉瓶','Botol'], '腳底板抬壓':['抬壓','Kaki'], '膝蓋彎伸':['膝彎','Lutut'], '站立':['站立','Berdiri'] };
const careIsBP = r => r.category && r.category.includes('血壓/心跳');

/* 應完成任務：
 * - 四項復健（舉瓶/抬壓/膝彎/站立）早上、中午、下午、睡前 各一次
 *   → 第 k 個運動時段截止前，該項累計次數需 ≥ k（晚做會自動遞補＝補齊）
 * - 血壓：早上一次、睡前累計兩次
 * - 尿液：22:00 後量測今日最後一次 */
function careTaskDefs(){
    const nth = (records, filter, n) => {
        const s = records.filter(filter).sort((a,b)=>a.time.localeCompare(b.time));
        return s.length >= n ? s[n-1] : null;
    };
    const defs = [];
    const exSlots = [ ['morning','10:30',1], ['midday','16:30',2], ['evening','19:00',3], ['night','22:00',4] ];

    defs.push({ slot:'morning', deadline:'10:30', order:0, zh:'早壓', id:'Tensi', full_zh:'起床後測量血壓', full_id:'Ukur tensi pagi',
        need:(rs,t)=> rs.filter(r=>careIsBP(r)&&r.time<t).length>=1, rec:rs=>nth(rs,careIsBP,1) });

    exSlots.forEach(([slot, dl, k], si) => {
        CARE_EX_TYPES.forEach((ex, ti) => {
            const sh = CARE_EX_SHORT[ex];
            const slotDef = CARE_SLOTS.find(s=>s.key===slot);
            defs.push({ slot:slot, deadline:dl, order:ti+1, zh:sh[0], id:sh[1],
                full_zh:`${slotDef.zh}${ex}`, full_id:`${sh[1]} (${slotDef.id})`,
                need:(rs,t)=> rs.filter(r=>r.category===ex && r.time<t).length>=k,
                rec:rs=>nth(rs, r=>r.category===ex, k) });
        });
    });

    defs.push({ slot:'night', deadline:'22:00', order:0, zh:'晚壓', id:'Tensi', full_zh:'睡前測量血壓', full_id:'Ukur tensi sebelum tidur',
        need:(rs,t)=> rs.filter(r=>careIsBP(r)&&r.time<t).length>=2, rec:rs=>nth(rs,careIsBP,2) });

    defs.push({ slot:'late', deadline:'24:00', order:0, zh:'尿量', id:'Urine', full_zh:'睡前量測今日最後一次尿液', full_id:'Ukur urine terakhir',
        need:(rs)=> rs.some(r=>r.category==='尿液' && r.time>='22:00'), rec:()=>null });

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
function careComputeTasks(records, dateStr){
    const valid = records.filter(r => r.status !== '無效');
    const isToday = dateStr === careTodayStr();
    const isFuture = dateStr > careTodayStr();
    const hm = new Date().toTimeString().substring(0,5);
    const lateRecIds = new Set();
    const tasks = careTaskDefs().map(def => {
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

/* ===== 使用者身分：'1'/'2'/'3'/'A'(管理者)。換身分需管理者密碼 ===== */
function careGetUser(){
    const p = new URLSearchParams(location.search).get('user');
    if (p && ['1','2','3'].includes(p)) { localStorage.setItem('care_user', p); return p; }
    const s = localStorage.getItem('care_user');
    return ['1','2','3','A'].includes(s) ? s : '1';
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
    const m = /^([123])\.([a-z0-9]+)$/.exec(j);
    if (m && m[2] === careSig(m[1])) {
        localStorage.setItem('care_user', m[1]);
        history.replaceState(null, '', location.pathname);
        return m[1];
    }
    return null;
}

/* 記錄者標記 👤U1/U2/U3/UA */
function careUserOfNote(note){
    const m = /👤U([123A])/.exec(note || '');
    return m ? m[1] : null;
}
function careStripUserTag(note){ return (note || '').replace(/\s*👤U[123A]/g, '').trim(); }

/* 備註單語化：把「中文 / 外文」對與已知標籤依語言取單側 */
function careNoteDisplay(note, lang){
    let t = careStripUserTag(note);
    t = t.replace(/\[當日附加:\s*利尿藥物\]/g, lang==='id' ? '[Diuretik]' : '[利尿藥物]');
    t = t.replace(/\[當日附加:\s*利便藥物\]/g, lang==='id' ? '[Obat pencahar]' : '[利便藥物]');
    t = t.replace(/\[浣腸\s*\/\s*Supositoria gliserin\]/g, lang==='id' ? '[Supositoria gliserin]' : '[浣腸]');
    t = t.replace(/([一-鿿][^\/\[\]]*?)\s*\/\s*([A-Za-z][^\/\[\]]*)/g, (m,zh,id)=> (lang==='id' ? id : zh).trim());
    return t.trim();
}
