/* ============================================================
 * care-tasks.js — index.html / report.html / admin.html 共用
 * 時段定義、任務判定（準時/補齊/XX/未到期）、進度格渲染、使用者/語言
 * 時段與任務規則沿用 index.html checkReminders 的提醒排程
 * ============================================================ */

const CARE_SLOTS = [
    { key:'dawn',    start:'00:00', end:'07:00', zh:'凌晨', id:'Dini hari' },
    { key:'morning', start:'07:00', end:'10:30', zh:'早晨', id:'Pagi' },
    { key:'midday',  start:'10:30', end:'16:30', zh:'中午', id:'Siang' },
    { key:'evening', start:'16:30', end:'19:00', zh:'傍晚', id:'Sore' },
    { key:'night',   start:'19:00', end:'22:00', zh:'晚間', id:'Malam' },
    { key:'late',    start:'22:00', end:'24:00', zh:'深夜', id:'Larut' }
];

const CARE_EX_TYPES = ['雙手舉水瓶','腳底板抬壓','膝蓋彎伸','站立'];
const careIsBP = r => r.category && r.category.includes('血壓/心跳');
const careIsEX = r => r.type === '運動';

/* 應完成任務：slot=歸屬時段, deadline=截止, need(records,cutoff)=cutoff 前是否達標,
 * rec(records)=滿足任務的那筆紀錄（逾期補齊時要標色）; rec=null 表示無補齊概念 */
function careTaskDefs(){
    const nth = (records, filter, n) => {
        const s = records.filter(filter).sort((a,b)=>a.time.localeCompare(b.time));
        return s.length >= n ? s[n-1] : null;
    };
    const defs = [
        { slot:'morning', deadline:'10:30', zh:'早壓', id:'Tensi pagi',   full_zh:'起床後測量血壓', full_id:'Ukur tensi pagi',
          need:(rs,t)=> rs.filter(r=>careIsBP(r)&&r.time<t).length>=1, rec:rs=>nth(rs,careIsBP,1) },
        { slot:'morning', deadline:'10:30', zh:'早運', id:'Latihan 1',   full_zh:'早餐前運動', full_id:'Latihan sebelum sarapan',
          need:(rs,t)=> rs.filter(r=>careIsEX(r)&&r.time<t).length>=1, rec:rs=>nth(rs,careIsEX,1) },
        { slot:'midday',  deadline:'16:30', zh:'午運', id:'Latihan 2',   full_zh:'午餐前運動（全日第2次）', full_id:'Latihan sebelum makan siang',
          need:(rs,t)=> rs.filter(r=>careIsEX(r)&&r.time<t).length>=2, rec:rs=>nth(rs,careIsEX,2) },
        { slot:'evening', deadline:'19:00', zh:'晚運', id:'Latihan 3',   full_zh:'晚餐前運動（全日第3次）', full_id:'Latihan sebelum makan malam',
          need:(rs,t)=> rs.filter(r=>careIsEX(r)&&r.time<t).length>=3, rec:rs=>nth(rs,careIsEX,3) },
        { slot:'night',   deadline:'22:00', zh:'晚壓', id:'Tensi malam', full_zh:'睡前測量血壓', full_id:'Ukur tensi sebelum tidur',
          need:(rs,t)=> rs.filter(r=>careIsBP(r)&&r.time<t).length>=2, rec:rs=>nth(rs,careIsBP,2) }
    ];
    const exShort = { '雙手舉水瓶':['舉瓶','Botol'], '腳底板抬壓':['抬壓','Kaki'], '膝蓋彎伸':['膝彎','Lutut'], '站立':['站立','Berdiri'] };
    CARE_EX_TYPES.forEach(ex => defs.push({
        slot:'night', deadline:'22:00', zh:exShort[ex][0], id:exShort[ex][1], full_zh:ex+'（今日至少一次）', full_id:'Latihan '+exShort[ex][1],
        need:(rs,t)=> rs.some(r=>r.category===ex && r.time<t), rec:rs=>nth(rs, r=>r.category===ex, 1)
    }));
    defs.push({
        slot:'late', deadline:'24:00', zh:'尿量', id:'Urine', full_zh:'睡前量測今日最後一次尿液', full_id:'Ukur urine terakhir',
        need:(rs)=> rs.some(r=>r.category==='尿液' && r.time>='22:00'), rec:()=>null
    });
    return defs;
}

function careTodayStr(){
    const now = new Date();
    return new Date(now.getTime() - now.getTimezoneOffset()*60000).toISOString().split('T')[0];
}

/* 計算任務狀態：done準時 / late補齊 / missed未完成XX / pending未到期
 * 回傳 { tasks:[{...def,state}], lateRecIds:Set } */
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

/* 三行進度格：第一行時段、第二行項目、第三行方格
 * lang: 'zh' | 'id' | 'both' */
function careRenderGrid(el, tasks, lang){
    lang = lang || 'zh';
    const L = (zh,id) => lang==='id' ? id : (lang==='both' ? zh+'/'+id : zh);
    const slotsWithTasks = CARE_SLOTS.filter(s => tasks.some(t=>t.slot===s.key));
    const sq = {
        done:    '<div class="w-6 h-6 rounded-md bg-green-500 flex items-center justify-center text-white text-[11px] font-black">✓</div>',
        late:    '<div class="w-6 h-6 rounded-md bg-amber-400 flex items-center justify-center text-white text-[11px] font-black">補</div>',
        missed:  '<div class="w-6 h-6 rounded-md bg-red-500 flex items-center justify-center text-white text-[11px] font-black">✕</div>',
        pending: '<div class="w-6 h-6 rounded-md border-2 border-gray-200 bg-gray-50"></div>'
    };
    if (lang==='id') sq.late = sq.late.replace('>補<','>+<');
    let row1='', row2='', row3='';
    slotsWithTasks.forEach((s,i) => {
        const st = tasks.filter(t=>t.slot===s.key);
        const bd = i>0 ? 'border-l border-gray-200' : '';
        row1 += `<td colspan="${st.length}" class="text-center text-[10px] font-black text-gray-500 pb-1 px-1 ${bd}">${L(s.zh,s.id)}<div class="text-[8px] text-gray-300 font-bold">${s.start}-${s.end==='24:00'?'24:00':s.end}</div></td>`;
        st.forEach((t,j) => {
            const bd2 = (i>0 && j===0) ? 'border-l border-gray-200' : '';
            row2 += `<td class="text-center text-[9px] font-bold text-gray-400 px-0.5 pb-1 leading-tight ${bd2}" title="${t.full_zh}">${L(t.zh,t.id)}</td>`;
            row3 += `<td class="px-0.5 ${bd2}"><div class="flex justify-center" title="${t.full_zh}">${sq[t.state]}</div></td>`;
        });
    });
    el.innerHTML = `<table class="mx-auto border-collapse"><tr>${row1}</tr><tr>${row2}</tr><tr>${row3}</tr></table>
    <div class="flex justify-center gap-3 mt-2 text-[9px] font-bold text-gray-400">
        <span class="flex items-center gap-1"><span class="inline-block w-2.5 h-2.5 rounded-sm bg-green-500"></span>${L('準時','Tepat')}</span>
        <span class="flex items-center gap-1"><span class="inline-block w-2.5 h-2.5 rounded-sm bg-amber-400"></span>${L('補齊','Terlambat')}</span>
        <span class="flex items-center gap-1"><span class="inline-block w-2.5 h-2.5 rounded-sm bg-red-500"></span>${L('未做','Belum')}</span>
        <span class="flex items-center gap-1"><span class="inline-block w-2.5 h-2.5 rounded-sm border border-gray-300 bg-gray-50"></span>${L('未到','Nanti')}</span>
    </div>`;
}

/* ===== 使用者身分（U1/U2/U3）與語言模式（zh/id/both） ===== */
function careGetUser(){
    const p = new URLSearchParams(location.search).get('user');
    if (p && ['1','2','3'].includes(p)) { localStorage.setItem('care_user', p); return p; }
    return localStorage.getItem('care_user') || '1';
}
function careSetUser(u){ localStorage.setItem('care_user', String(u)); }
function careGetLang(){
    const p = new URLSearchParams(location.search).get('lang');
    if (p && ['zh','id','both'].includes(p)) { localStorage.setItem('care_lang', p); return p; }
    return localStorage.getItem('care_lang') || 'both';
}
function careSetLang(m){ localStorage.setItem('care_lang', m); }
/* 從備註解析記錄者 👤U1 */
function careUserOfNote(note){
    const m = /👤U([123])/.exec(note || '');
    return m ? m[1] : null;
}
function careStripUserTag(note){ return (note || '').replace(/\s*👤U[123]/g, '').trim(); }
