/* ============================================================
 * care-clinical.js — 疾病×變數×焦距圖 三軸交叉推論（臨床封聖層）
 * ------------------------------------------------------------
 * 設計原則（醫療安全鐵律）：
 *  1) 執行期＝純確定性規則引擎，無 LLM、無網路、無金鑰（GitHub Pages 安全）。
 *  2) 每條規則機制皆為真實流病關聯，附 evidence 出處；不確定者 needsVerify:true → 文末標「[需獨立驗證]」。
 *  3) 建議層只給「非處方照護行動」；任何劑量／藥物調整一律導向醫師。
 *  4) 疾病＝效應修飾子（comorbidity effect modification）：同一(圖,變數)在不同共病下嚴重度不同。
 *     「1+1+1=4」＝convergence escalation：多規則命中同一系統升一級；共病命中 modBy 拉高該規則基線。
 * 產出：clinicalIntegrate() 回四段 {①變動 ②為什麼 ③影響總結 ④建議}（中/印雙語 HTML 片段）。
 * 與 trends.html 分工：①變動的「實證數字」由 trends 端 computeEmpirical 算好傳入（它有 DAYS/chartMetric）；
 *     本檔負責規則比對、嚴重度整合、四段文字組裝（可 node 測）。
 * ============================================================ */

/* ---- 嚴重度階：index 越大越重 ---- */
const SEV = ['info', 'warn', 'serious', 'crit'];
const SEV_TAG = { info: '🟢', warn: '🟡', serious: '🟠', crit: '🔴' };
function sevMax(a, b){ return SEV[Math.max(SEV.indexOf(a), SEV.indexOf(b))]; }
function sevBump(s){ return SEV[Math.min(SEV.indexOf(s) + 1, SEV.length - 1)]; }

/* ============================================================
 * 疾病目錄（軸3）——取自參考報告七系統。
 * 照顧者於 admin-settings 複選病患實際診斷；引擎只點燃選中疾病相關規則（降噪）。
 * pathwayKeys：此病影響的生理路徑鍵（供 N:M 影響圖 P4 用；目前規則以 id 對 modBy）。
 * ============================================================ */
const DISEASES = [
  // 1 三高與代謝
  { id: 'htn',   zh: '高血壓',            idn: 'Hipertensi',            system: '三高代謝', pathwayKeys: ['bp', 'vascular'] },
  { id: 'dm',    zh: '糖尿病',            idn: 'Diabetes',              system: '三高代謝', pathwayKeys: ['glucose', 'microvascular', 'neuro'] },
  { id: 'dlp',   zh: '高血脂',            idn: 'Dislipidemia',          system: '三高代謝', pathwayKeys: ['vascular'] },
  // 2 心腦血管
  { id: 'chf',   zh: '心臟衰竭/心室肥大',  idn: 'Gagal jantung',         system: '心腦血管', pathwayKeys: ['volume', 'cardiac', 'perfusion'] },
  { id: 'as',    zh: '動脈硬化(高PWV)',   idn: 'Aterosklerosis',        system: '心腦血管', pathwayKeys: ['vascular', 'pulse'] },
  { id: 'cad',   zh: '冠心病/心肌梗塞史',  idn: 'Penyakit jantung koroner', system: '心腦血管', pathwayKeys: ['cardiac', 'ischemia'] },
  { id: 'cva',   zh: '中風史',            idn: 'Riwayat stroke',        system: '心腦血管', pathwayKeys: ['bp', 'perfusion'] },
  // 3 感覺器官
  { id: 'dr',    zh: '糖尿病視網膜病變',   idn: 'Retinopati diabetik',   system: '感覺器官', pathwayKeys: ['microvascular'] },
  { id: 'vert',  zh: '耳鳴/眩暈',         idn: 'Tinnitus/vertigo',      system: '感覺器官', pathwayKeys: ['microvascular', 'fluid'] },
  // 4 骨關節
  { id: 'oa',    zh: '骨關節炎',          idn: 'Osteoartritis',         system: '骨關節',   pathwayKeys: ['joint'] },
  { id: 'ra',    zh: '類風濕關節炎',       idn: 'Artritis reumatoid',    system: '骨關節',   pathwayKeys: ['joint', 'inflam'] },
  { id: 'gout',  zh: '痛風',              idn: 'Asam urat/gout',        system: '骨關節',   pathwayKeys: ['urate', 'joint'] },
  // 5 消化
  { id: 'ibs',   zh: '腸躁/腸漏',         idn: 'IBS/usus bocor',        system: '消化',     pathwayKeys: ['gut'] },
  // 6 泌尿腎臟
  { id: 'ckd',   zh: '慢性腎病/腎功能不全', idn: 'Penyakit ginjal kronis', system: '泌尿腎臟', pathwayKeys: ['volume', 'renal', 'electrolyte'] },
  { id: 'stone', zh: '尿酸鹽/腎結石',      idn: 'Batu ginjal',           system: '泌尿腎臟', pathwayKeys: ['urate', 'renal'] },
  // 7 呼吸與神經
  { id: 'dem',   zh: '失智症',            idn: 'Demensia',              system: '呼吸神經', pathwayKeys: ['neuro', 'fluid'] },
  { id: 'deli',  zh: '譫妄傾向',          idn: 'Delirium',              system: '呼吸神經', pathwayKeys: ['neuro', 'fluid'] },
  { id: 'cramp', zh: '神經肌肉痙攣',       idn: 'Kram otot',             system: '呼吸神經', pathwayKeys: ['neuro', 'electrolyte'] },
  { id: 'copd',  zh: '氣喘/COPD',         idn: 'Asma/COPD',             system: '呼吸神經', pathwayKeys: ['resp'] }
];
const DX_BY_ID = {};
DISEASES.forEach(d => { DX_BY_ID[d.id] = d; });
function dxName(id, lang){ const d = DX_BY_ID[id]; return d ? (lang === 'id' ? d.idn : d.zh) : id; }

/* ============================================================
 * 臨床規則表（首批）——Fable-5 親撰。
 * when: { charts:[焦距圖id], tvs:[必要第三變數，全需成立；空=僅疾病脈絡], diseases:[一般適用病，空=通用] }
 * base: 基線嚴重度；modBy: { 疾病id: 升級後嚴重度 }（共病命中則拉高本規則）
 * system: 標的器官系統（同系統多規則命中 → convergence 升級）
 * why/impact/advice: [zh, id] 三段文字素材；evidence 出處或 needsVerify
 * ============================================================ */
const CLINICAL_RULES = [
  {
    id: 'vol_overload', tier: 'N:1', system: '心腎循環容積',
    when: { charts: ['c1', 'c6', 'c10'], tvs: ['diur'], diseases: [] },
    base: 'warn', modBy: { chf: 'crit', ckd: 'serious', htn: 'serious' },
    why: ['利尿藥當日若淨滯留仍偏高、尿量沒相應增加，代表水分排不掉、可能積在循環裡（容積過載的早期訊號，常早於腳腫等外顯徵象）。',
          'Bila hari pakai diuretik retensi tetap tinggi & urine tak bertambah, cairan menumpuk di sirkulasi (tanda dini kelebihan volume, sebelum kaki bengkak).'],
    impact: ['心臟與腎臟前負荷加重；有心衰或腎病時更容易失代償。',
             'Beban jantung & ginjal naik; pada gagal jantung/ginjal lebih mudah dekompensasi.'],
    advice: ['每天照實勾利尿藥、記體重與尿量趨勢；回診把「有藥卻仍滯留」這幾天的 I/O 圖帶給醫師。利尿藥劑量由醫師決定，勿自行加減。',
             'Catat diuretik, berat badan & urine tiap hari; bawa grafik I/O hari "sudah minum obat tapi tetap retensi" ke dokter. Dosis diuretik oleh dokter.'],
    evidence: 'AHA/Mayo：心衰容積過載以每日 I/O、體重監測；血流動力學充血早於臨床充血', needsVerify: false
  },
  {
    id: 'hidden_water', tier: '1:N', system: '水分帳目',
    when: { charts: ['c1', 'c10', 'c15'], tvs: ['foodw'], diseases: [] },
    base: 'info', modBy: { chf: 'warn', ckd: 'warn' },
    why: ['湯湯水水（含水食物）占比高的日子，若沒把食物裡的水算進總攝入，帳面會少算——這是「看起來喝不多、其實不少」的混淆型偏差。',
          'Hari makanan berair tinggi: bila air dari makanan tak dihitung, total asupan tampak lebih kecil dari sebenarnya (bias perancu).'],
    impact: ['限水病人可能在不知情下超出當日水分上限，影響 I/O 判讀。',
             'Pasien batas cairan bisa melebihi batas tanpa sadar; mengaburkan penilaian I/O.'],
    advice: ['含水食物的水分要一起計入總攝入再對照上限；記錄時把湯/粥/水果的液體量估進去。',
             'Hitung air dari makanan ke total asupan sebelum bandingkan dengan batas; estimasikan cairan sup/bubur/buah.'],
    evidence: '水分平衡帳：食物含水占每日總攝入可觀比例（一般營養學）', needsVerify: false
  },
  {
    id: 'occult_dehydration', tier: 'N:1', system: '脫水-神經肌肉',
    when: { charts: ['c1', 'c9', 'c13'], tvs: ['eat'], diseases: [] },
    base: 'warn', modBy: { dem: 'serious', deli: 'serious', cramp: 'serious', ckd: 'serious', vert: 'warn' },
    why: ['進食少的日子通常水分也一起少；當攝入貼近下限又出現末梢肌力下滑，可能是「帳面喝夠、身體偏乾」的隱性脫水。僅 1–2% 體液流失即可影響認知與神經肌肉功能。',
          'Hari makan sedikit, cairan ikut kurang; asupan mendekati batas bawah + otot distal melemah → mungkin dehidrasi tersembunyi. Kehilangan 1–2% cairan tubuh sudah pengaruhi kognisi & otot.'],
    impact: ['失智/譫妄病人脫水會急遽惡化意識與認知；痙攣體質易誘發夜間抽筋；電解質可能同時失衡。',
             'Pada demensia/delirium, dehidrasi memperburuk kesadaran; pada kram, memicu kram malam; elektrolit bisa ikut terganggu.'],
    advice: ['進食少的日子先補進食與水分，再觀察末梢力氣與精神有無回來；留意夜間抽筋、意識變化。電解質/輸液由醫師評估。',
             'Hari makan sedikit: tambah makan & minum dulu, pantau tenaga & kesadaran; waspadai kram malam & perubahan kesadaran. Elektrolit/infus oleh dokter.'],
    evidence: '低攝入脫水與老年認知下降關聯（PMC 綜述）；脫水性譫妄機制', needsVerify: false
  },
  {
    id: 'wide_pp_stiffness', tier: 'N:1', system: '血管硬化',
    when: { charts: ['c6', 'c11'], tvs: [], diseases: [] },
    base: 'warn', modBy: { as: 'serious', htn: 'serious', cad: 'serious', dm: 'warn' },
    why: ['脈壓差（收縮壓−舒張壓）持續偏寬，常反映大動脈變硬、緩衝能力下降。',
          'Tekanan nadi (sistolik−diastolik) yang terus melebar sering menandakan arteri besar mengeras.'],
    impact: ['動脈硬化或高血壓病人，寬脈壓與心血管事件風險升高相關；冷天血管收縮時風險再疊加。',
             'Pada aterosklerosis/hipertensi, tekanan nadi lebar terkait risiko kejadian kardiovaskular; cuaca dingin menambah risiko.'],
    advice: ['血壓固定晨起、睡前量並記錄脈壓差趨勢；天冷注意保暖、避免清晨劇烈活動。用藥調整回診由醫師決定。',
             'Ukur tensi pagi & malam, catat tren tekanan nadi; jaga hangat saat dingin, hindari aktivitas berat pagi. Penyesuaian obat oleh dokter.'],
    evidence: '動脈僵硬 cfPWV 與心血管風險（臨床共識）', needsVerify: false
  },
  {
    id: 'diur_constipation', tier: 'N:1', system: '腸道水分',
    when: { charts: ['c5', 'c15'], tvs: ['diur'], diseases: [] },
    base: 'warn', modBy: { ibs: 'warn' },
    why: ['利尿藥在排水同時可能把腸道需要的水分一起帶走，有利尿藥的日子容易大便乾硬。',
          'Diuretik dapat ikut menarik air usus; hari pakai diuretik feses cenderung keras.'],
    impact: ['乾硬便與便秘連續天數增加，可能惡化腸道不適。',
             'Feses keras & hari sembelit bertambah, bisa memperburuk ketaknyamanan usus.'],
    advice: ['乾硬便持續時先檢查攝入是否貼近下限、適度補水與纖維；利尿藥與軟便劑比例回診跟醫師討論，勿自行加藥。',
             'Bila feses keras: cek asupan & tambah air/serat; rasio diuretik & pencahar dibahas dengan dokter, jangan tambah obat sendiri.'],
    evidence: '利尿劑相關便秘/脫水機制（藥理常識）', needsVerify: false
  },
  {
    id: 'rpp_ischemia', tier: 'N:1', system: '心肌耗氧',
    when: { charts: ['c7', 'c14'], tvs: ['exvol'], diseases: [] },
    base: 'warn', modBy: { cad: 'crit', chf: 'serious', htn: 'serious' },
    why: ['心率×收縮壓（RPP）反映心肌耗氧；運動量大的日子 RPP 升高屬運動當下生理性，靜息日仍高才需警覺。',
          'RPP (detak×sistolik) mencerminkan konsumsi oksigen jantung; naik di hari beban tinggi itu fisiologis, yang perlu diwaspadai bila tetap tinggi saat istirahat.'],
    impact: ['冠心病/心衰病人心肌供需易失衡，高 RPP 疊加運動負荷有缺血風險。',
             'Pada PJK/gagal jantung, suplai-kebutuhan mudah timpang; RPP tinggi + beban → risiko iskemia.'],
    advice: ['運動量大的隔天看晚間心跳有無降回來，降不回來就把當日復健調輕並記錄；胸悶/喘立即休息並回報。運動處方由醫師/治療師定。',
             'Setelah hari beban besar cek detak malam; bila tak turun, ringankan latihan & catat; bila sesak/nyeri dada segera istirahat & lapor. Program latihan oleh dokter/terapis.'],
    evidence: 'RPP 為心肌耗氧指標（運動生理學）', needsVerify: false
  },
  {
    id: 'nondipping_bp', tier: 'N:1', system: '晝夜血壓節律',
    when: { charts: ['c2', 'c10'], tvs: ['slot'], diseases: [] },
    base: 'warn', modBy: { htn: 'serious', cva: 'serious', ckd: 'serious', chf: 'serious' },
    why: ['正常夜間血壓應下降（dipping）；若晚間血壓沒有比晨間低，屬非勺型（non-dipping）節律。時段要早晚分開看，混在一起平均會蓋掉問題。',
          'Normalnya tensi malam turun (dipping); bila tensi malam tak lebih rendah dari pagi = pola non-dipping. Lihat pagi & malam terpisah.'],
    impact: ['高血壓/中風史/腎病病人，非勺型與夜間心腦血管事件風險升高相關。',
             'Pada hipertensi/riwayat stroke/ginjal, non-dipping terkait risiko kejadian kardio-serebral malam.'],
    advice: ['固定晨起後與睡前量血壓，其他時段數字不要互相比較；持續非勺型回診提供這份晨昏對照。用藥時間由醫師調。',
             'Ukur tensi pagi bangun & sebelum tidur; jangan bandingkan waktu lain; bila terus non-dipping bawa data ini ke dokter. Waktu obat diatur dokter.'],
    evidence: '非勺型血壓與心血管風險（ABPM 文獻）', needsVerify: false
  },
  {
    id: 'drug_overtreat', tier: 'N:1', system: '藥物過強',
    when: { charts: ['c12', 'c3'], tvs: [], diseases: [] },
    base: 'serious', modBy: { chf: 'serious', cad: 'serious' },
    why: ['血壓連續偏低又合併心跳偏慢（<55），可能是降壓藥或心律藥的劑量相對偏強。',
          'Tensi rendah terus + detak lambat (<55) mungkin dosis obat tensi/aritmia relatif terlalu kuat.'],
    impact: ['起身時頭暈、跌倒風險升高，尤其老年人。',
             'Risiko pusing saat berdiri & jatuh naik, terutama lansia.'],
    advice: ['特別注意起身緩慢、防跌（扶手/夜燈）；把連續低血壓+慢心跳的日子回診請醫師評估是否減量。切勿自行停藥或改量。',
             'Hati-hati bangun perlahan & cegah jatuh (pegangan/lampu malam); bawa data ke dokter untuk evaluasi dosis. Jangan ubah/stop obat sendiri.'],
    evidence: '過度治療致低血壓/心動過緩與跌倒（老年醫學）', needsVerify: false
  }
];

/* ---- 規則比對：回傳與(圖,變數,疾病)相關的規則＋逐條算好嚴重度 ---- */
function matchClinicalRules(cardId, tvIds, dxIds){
  tvIds = tvIds || []; dxIds = dxIds || [];
  const out = [];
  for (const r of CLINICAL_RULES){
    if (!r.when.charts.includes(cardId)) continue;
    const tvsOK = !r.when.tvs || r.when.tvs.length === 0 || r.when.tvs.every(t => tvIds.includes(t));
    if (!tvsOK) continue;
    let sev = r.base;
    const escalatedBy = [];
    if (r.modBy) for (const dx of dxIds){
      if (r.modBy[dx]){ sev = sevMax(sev, r.modBy[dx]); escalatedBy.push(dx); }
    }
    // 相關性：需有實際脈絡才顯示——(有必要變數且全成立) 或 (被某共病放大)
    const hasTvContext = r.when.tvs && r.when.tvs.length > 0;
    const relevant = hasTvContext || escalatedBy.length > 0;
    if (!relevant) continue;
    out.push({ rule: r, sev, escalatedBy });
  }
  return out;
}

/* ---- 整合嚴重度（1+1+1=4 的核心）：
 *   起點＝各命中規則升級後最高；同一 system ≥2 規則命中 → 升一級（收斂放大）；
 *   有共病放大且另有其他規則命中 → 再確認一次疊加。cap crit。 ---- */
function integrateSeverity(matched){
  if (!matched.length) return { level: 'info', converged: false, comorbid: false };
  let level = 'info';
  const bySystem = {};
  let comorbid = false;
  matched.forEach(m => {
    level = sevMax(level, m.sev);
    bySystem[m.rule.system] = (bySystem[m.rule.system] || 0) + 1;
    if (m.escalatedBy.length) comorbid = true;
  });
  const converged = Object.values(bySystem).some(n => n >= 2);
  if (converged) level = sevBump(level);
  if (comorbid && matched.length >= 2) level = sevBump(level);
  return { level, converged, comorbid };
}

/* ---- 四段文字組裝 ---- */
function fmtEmpirical(empirical, tvIds, lang){
  // empirical（trends 端算好）：{ metricLabel:[zh,unit,id], joint:{n,A,B,diff}|null, marginals:[{tvZh,tvIdn,n,A,B,diff}] }
  const L = (zh, id) => lang === 'id' ? id : zh;
  if (!empirical || !empirical.metricLabel){
    return L('（尚無足夠數值可比較，以下為機制推論）', '(Belum cukup data; berikut penalaran mekanistik)');
  }
  const ml = empirical.metricLabel;
  const unit = ml[1] || '';
  if (empirical.joint && empirical.joint.n >= 2){
    const j = empirical.joint;
    const d = Math.round(j.diff * 10) / 10;
    return L(`同時滿足所選變數的 ${j.n} 天，「${ml[0]}」平均 ${j.A}${unit}，其餘日子 ${j.B}${unit}（差 ${d > 0 ? '+' : ''}${d}${unit}）。`,
             `${j.n} hari dengan semua variabel terpilih: "${ml[2]}" rata-rata ${j.A}${unit}, hari lain ${j.B}${unit} (selisih ${d > 0 ? '+' : ''}${d}${unit}).`);
  }
  // 聯合資料不足 → 邊際 fallback
  const lines = (empirical.marginals || []).filter(m => m && m.n >= 2).map(m => {
    const d = Math.round(m.diff * 10) / 10;
    return L(`${m.tvZh}：有無兩組差 ${d > 0 ? '+' : ''}${d}${unit}`, `${m.tvIdn}: Δ ${d > 0 ? '+' : ''}${d}${unit}`);
  });
  const head = L('多變數同時成立的日子不足（<2 天），改看各別變數；整合影響以機制推論為主：',
                 'Hari dengan semua variabel bersamaan kurang (<2); tampil per variabel; dampak gabungan berbasis mekanisme:');
  return head + (lines.length ? ' ' + lines.join('；') : '');
}

/* 主入口：回 { level, zh, id, flag }（HTML 片段，trends 直接塞進 fp-x 卡） */
function clinicalIntegrate(opts){
  opts = opts || {};
  const cardId = opts.cardId, tvIds = opts.tvIds || [], dxIds = opts.dxIds || [];
  const lang = opts.lang || 'zh', empirical = opts.empirical || null;
  const L = (zh, id) => lang === 'id' ? id : zh;
  const matched = matchClinicalRules(cardId, tvIds, dxIds);
  if (!matched.length && !tvIds.length) return null;  // 無脈絡（無變數且無相關疾病）不顯示

  // ① 變動：有變數→實證數值；純疾病背景→機制推論
  const sec1 = tvIds.length ? fmtEmpirical(empirical, tvIds, lang)
    : L('疾病背景研判（未疊加變數）；以下為機制推論。', 'Analisis berbasis penyakit (tanpa variabel); penalaran mekanistik.');

  // 有變數但本圖此組合暫無內建機制規則 → 只顯示數值變動（保留舊的實證資訊，honest）
  if (!matched.length){
    const b0 = `🟢 <b>${L('數值變動（此圖此組合暫無內建機制規則）', 'Perubahan nilai (belum ada aturan)')}</b><br>①${L('變動', 'Perubahan')}：${sec1}`;
    return { level: 'info', flag: false, zh: b0, id: b0 };
  }

  const integ = integrateSeverity(matched);
  const tag = SEV_TAG[integ.level] || '🟢';

  // ② 為什麼（命中規則機制，去重、標未驗證）
  const whys = matched.map(m => {
    const w = lang === 'id' ? m.rule.why[1] : m.rule.why[0];
    return w + (m.rule.needsVerify ? ' [需獨立驗證]' : '');
  });
  const sec2 = whys.length ? whys.join(' ') : L('目前所選組合無對應機制規則。', 'Tak ada aturan mekanisme untuk kombinasi ini.');

  // ③ 影響總結（整合＋疾病放大＋收斂說明）
  const impacts = matched.map(m => lang === 'id' ? m.rule.impact[1] : m.rule.impact[0]);
  let sec3 = impacts.join(' ');
  const dxHit = Array.from(new Set(matched.flatMap(m => m.escalatedBy)));
  if (dxHit.length){
    const names = dxHit.map(id => dxName(id, lang)).join('、');
    sec3 += ' ' + L(`因病患有「${names}」，上述影響被放大——同樣的數字，在這些共病下嚴重度要往上看一級。`,
                    `Karena pasien memiliki "${names}", dampak di atas diperbesar — angka yang sama lebih serius pada kondisi ini.`);
  }
  if (integ.converged){
    sec3 += ' ' + L('多個變數同時指向同一系統，合起來的風險大於各自單獨相加（非 1+1，可能更高）。',
                    'Beberapa variabel menuju sistem yang sama; risiko gabungan lebih besar dari jumlah masing-masing.');
  }

  // ④ 建議（去重照護行動 + 固定回診句）
  const advSet = [];
  matched.forEach(m => { const a = lang === 'id' ? m.rule.advice[1] : m.rule.advice[0]; if (!advSet.includes(a)) advSet.push(a); });
  const tell = L('回診時把本圖與所選變數/疾病的組合一起給醫師看。', 'Saat kontrol, tunjukkan grafik ini beserta kombinasi variabel/penyakit ke dokter.');
  const sec4 = (advSet.length ? advSet.join(' ') + ' ' : '') + tell;

  const dxLabel = dxIds.length ? '＋' + dxIds.map(id => dxName(id, lang)).join('/') : '';
  const title = L(`🧩 整合研判（變數${dxLabel ? ' ' + dxLabel : ''}）`, `🧩 Analisis Terpadu${dxLabel ? ' (' + dxIds.map(id => dxName(id, 'id')).join('/') + ')' : ''}`);
  const body = `${tag} <b>${title}</b>` +
    `<br>①${L('變動', 'Perubahan')}：${sec1}` +
    `<br>②${L('為什麼', 'Sebab')}：${sec2}` +
    `<br>③${L('影響總結', 'Dampak')}：${sec3}` +
    `<br>④${L('建議', 'Saran')}：${sec4}`;
  const flag = integ.level === 'serious' || integ.level === 'crit';
  return { level: integ.level, flag: flag, zh: body, id: body };  // body 已依 lang 生成
}

/* ============================================================
 * P4 — 定性因果影響圖（跨圖 N:M）。⚠️誠實聲明：知識型定性網絡，非資料擬合機率貝氏網
 *   （N-of-1 每日資料量無法擬真 BN；此處為報告記載路徑的旗標傳播）。
 * 節點：driver（數據/氣象旗標）｜dx（疾病）｜endpoint（器官系統終點）。邊＝報告病理路徑。
 * propagate：某終點被 active driver 命中，且有相關疾病敏化 → 點亮（疾病感知的 N:M 加層；
 *   純 driver 匯聚由 trends 既有 hidden 規則覆蓋，此層只加「疾病使某系統更脆弱」的跨系統研判）。
 * ============================================================ */
const ENDPOINTS = {
  cardio:  { zh: '心腦血管', idn: 'Kardio-serebral', advice: ['天冷保暖、避免清晨劇烈活動、按時量血壓並記錄；胸悶或喘立即休息並回報。', 'Jaga hangat, hindari aktivitas berat pagi, ukur tensi rutin; bila sesak/nyeri dada segera istirahat & lapor.'] },
  renal:   { zh: '泌尿腎臟', idn: 'Ginjal', advice: ['依天氣/流汗調整補水（限水者向醫師確認下限）、留意尿量與尿色變化。', 'Sesuaikan minum dengan cuaca/keringat (batas bawah tanya dokter), pantau jumlah & warna urine.'] },
  neuro:   { zh: '神經/認知', idn: 'Neuro/kognisi', advice: ['顧好補水與進食、留意意識或精神變化與夜間抽筋，異常即回報。', 'Jaga cairan & makan, pantau perubahan kesadaran & kram malam; bila tak wajar lapor.'] },
  bp:      { zh: '血壓節律', idn: 'Ritme tensi', advice: ['固定晨昏量血壓、低鈉飲食、天氣劇變時多量幾次並記錄。', 'Ukur tensi pagi-malam tetap, diet rendah garam, ukur lebih sering saat cuaca berubah.'] },
  joint:   { zh: '骨關節', idn: 'Sendi', advice: ['濕冷低壓日保暖護關節、適度活動避免僵硬。', 'Hari lembap-dingin-tekanan rendah: hangatkan & lindungi sendi, gerak ringan.'] },
  resp:    { zh: '呼吸道', idn: 'Pernapasan', advice: ['空污日減少外出、必要時戴口罩、備用藥依醫囑準備。', 'Hari polusi: kurangi keluar, pakai masker, siapkan obat sesuai anjuran dokter.'] },
  urate:   { zh: '尿酸(痛風/結石)', idn: 'Asam urat', advice: ['顧補水稀釋尿酸、避免高普林加酒精、天冷護關節。', 'Cukupkan cairan, hindari tinggi purin + alkohol, hangatkan sendi saat dingin.'] },
  gut:     { zh: '消化', idn: 'Pencernaan', advice: ['熱天顧補水與電解質、維持纖維與規律進食。', 'Saat panas jaga cairan & elektrolit, cukupkan serat & makan teratur.'] },
  sensory: { zh: '感覺器官', idn: 'Indra', advice: ['保暖穩定微循環、顧補水、姿勢改變放慢以防眩暈。', 'Jaga hangat & cairan, ubah posisi perlahan cegah pusing.'] }
};
const DRIVER_EDGES = [
  { d: 'retain',           e: 'cardio', note: ['容積過載加重心臟前負荷', 'beban volume menekan jantung'] },
  { d: 'widePP',           e: 'cardio', note: ['脈壓變寬反映血管硬化', 'tekanan nadi lebar = arteri kaku'] },
  { d: 'highRPP',          e: 'cardio', note: ['心肌耗氧偏高', 'konsumsi oksigen jantung tinggi'] },
  { d: 'lowBP',            e: 'cardio', note: ['低血壓影響冠脈灌注', 'tensi rendah kurangi perfusi koroner'] },
  { d: 'coldSnap',         e: 'cardio', note: ['低溫誘發血管收縮、增後負荷', 'dingin picu vasokonstriksi'] },
  { d: 'nearLowIntake',    e: 'renal',  note: ['攝入貼近下限、腎前灌注降', 'asupan mendekati batas bawah'] },
  { d: 'dehydrationSign',  e: 'renal',  note: ['脫水使尿濃縮、腎負荷升', 'dehidrasi memekatkan urine'] },
  { d: 'highWBGT',         e: 'renal',  note: ['高熱壓力大量流汗、血容積降', 'panas ekstrem → keringat & hipovolemia'] },
  { d: 'retain',           e: 'renal',  note: ['容積過載腎絲球高壓', 'kelebihan volume → tekanan glomerulus'] },
  { d: 'dehydrationSign',  e: 'neuro',  note: ['脫水影響認知、誘發譫妄/抽筋', 'dehidrasi ganggu kognisi & picu kram'] },
  { d: 'nearLowIntake',    e: 'neuro',  note: ['長期攝入不足、神經退化前置', 'asupan kurang jangka panjang'] },
  { d: 'highPM25',         e: 'neuro',  note: ['空污發炎介質過血腦屏障', 'polusi → inflamasi otak'] },
  { d: 'nonDip',           e: 'bp',     note: ['夜間血壓未下降（非勺型）', 'tensi malam tak turun (non-dipping)'] },
  { d: 'highIntake',       e: 'bp',     note: ['攝入偏高（含鈉負荷）', 'asupan tinggi (beban natrium)'] },
  { d: 'coldSnap',         e: 'bp',     note: ['冷誘發血壓上升', 'dingin naikkan tensi'] },
  { d: 'humidLowPressure', e: 'joint',  note: ['低氣壓高濕使關節腔壓升、滑膜脹', 'tekanan rendah + lembap → sendi'] },
  { d: 'coldSnap',         e: 'joint',  note: ['低溫使關節液黏稠、僵硬', 'dingin → cairan sendi kental'] },
  { d: 'highPM25',         e: 'resp',   note: ['懸浮微粒刺激呼吸道', 'partikel iritasi saluran napas'] },
  { d: 'humidLowPressure', e: 'resp',   note: ['高濕利過敏原/黴菌', 'lembap → alergen/jamur'] },
  { d: 'highWBGT',         e: 'urate',  note: ['高溫脫水使尿酸析出結晶', 'panas → asam urat mengkristal'] },
  { d: 'dehydrationSign',  e: 'urate',  note: ['脫水濃縮尿酸', 'dehidrasi pekatkan asam urat'] },
  { d: 'coldSnap',         e: 'urate',  note: ['關節局部低溫促結晶', 'sendi dingin → kristal'] },
  { d: 'hardStool',        e: 'gut',    note: ['乾硬便、腸道水分不足', 'feses keras, air usus kurang'] },
  { d: 'highWBGT',         e: 'gut',    note: ['熱壓力使腸道低灌注、腸漏', 'panas → hipoperfusi usus'] },
  { d: 'coldSnap',         e: 'sensory',note: ['低溫使末梢微血管收縮', 'dingin → vasokonstriksi perifer'] },
  { d: 'dehydrationSign',  e: 'sensory',note: ['脫水擾內耳/眼房水平衡', 'dehidrasi ganggu telinga dalam/mata'] }
];
const DX_EDGES = [
  ['chf','cardio'],['as','cardio'],['cad','cardio'],['cva','cardio'],['htn','cardio'],['dlp','cardio'],
  ['ckd','renal'],['stone','renal'],['gout','renal'],
  ['dem','neuro'],['deli','neuro'],['cramp','neuro'],['dm','neuro'],
  ['htn','bp'],['cva','bp'],['ckd','bp'],['chf','bp'],
  ['oa','joint'],['ra','joint'],['gout','joint'],
  ['copd','resp'],
  ['gout','urate'],['stone','urate'],
  ['ibs','gut'],
  ['dr','sensory'],['vert','sensory'],['dm','sensory']
];

/* 旗標傳播：flags＝{driverKey:bool}，dxIds＝選中疾病。回跨系統網絡研判（僅疾病敏化者輸出）。
 * 回傳 item 帶 zh+id 雙語（trends 依 LANG 挑），本函式不依賴 lang。 */
function propagate(flags, dxIds){
  flags = flags || {}; dxIds = dxIds || [];
  const byEp = {};
  DRIVER_EDGES.forEach(edge => {
    if (!flags[edge.d]) return;
    (byEp[edge.e] = byEp[edge.e] || { drivers: [], dx: [] }).drivers.push(edge);
  });
  DX_EDGES.forEach(([dx, e]) => {
    if (dxIds.indexOf(dx) === -1) return;
    if (byEp[e]) byEp[e].dx.push(dx);   // 只在該終點已有 driver 命中時才敏化
  });
  const out = [];
  Object.keys(byEp).forEach(eid => {
    const g = byEp[eid];
    if (!g.dx.length) return;                        // 疾病感知加層：無疾病敏化不輸出
    const nD = g.drivers.length;
    const level = nD >= 2 ? 'crit' : 'serious';
    const ep = ENDPOINTS[eid];
    const pathsZh = g.drivers.map(x => x.note[0]).join('；');
    const pathsId = g.drivers.map(x => x.note[1]).join('; ');
    const dxZh = g.dx.map(id => dxName(id, 'zh')).join('、');
    const dxId = g.dx.map(id => dxName(id, 'id')).join(', ');
    const zh = `🕸️ <b>跨系統網絡 → ${ep.zh}</b>：${nD} 項狀況匯聚（${pathsZh}），病患有「${dxZh}」使此系統更脆弱。屬多因子交互（N:M），單看任一張圖看不出來。👉 ${ep.advice[0]}〔定性研判，非機率預測；需醫師判讀〕`;
    const id = `🕸️ <b>Jaringan lintas-sistem → ${ep.idn}</b>: ${nD} faktor menyatu (${pathsId}); pasien "${dxId}" membuat sistem ini lebih rentan (interaksi N:M). 👉 ${ep.advice[1]}〔analisis kualitatif, bukan prediksi probabilistik〕`;
    out.push({ level: level, endpoint: eid, zh: zh, id: id });
  });
  const rank = { crit: 0, serious: 1, warn: 2 };
  out.sort((a, b) => rank[a.level] - rank[b.level]);
  return out;
}

/* WBGT 估算（遮蔭/無直射日射近似，BoM 式）。ta=乾球℃、rh=相對濕度%。
 * ⚠️估算值非黑球儀測；用於熱壓力旗標(highWBGT)參考，UI 須標「估算」。 */
function estimateWBGT(ta, rh){
  if (ta == null || rh == null || isNaN(ta) || isNaN(rh)) return null;
  const e = (rh / 100) * 6.105 * Math.exp(17.27 * ta / (237.7 + ta));  // 水氣壓 hPa
  return Math.round((0.567 * ta + 0.393 * e + 3.94) * 10) / 10;
}

/* ---- 純函式自我檢查（node 手動跑；不自動執行） ---- */
function clinicalSelfTest(){
  const assert = (c, m) => { if (!c) throw new Error('FAIL: ' + m); };

  // 1) 無疾病 vs 選中共病：同(圖,變數) severity 應升高
  const noDx = matchClinicalRules('c1', ['diur'], []);
  const chf  = matchClinicalRules('c1', ['diur'], ['chf']);
  assert(noDx.length >= 1, 'c1+diur 應命中容積規則');
  const sNo = integrateSeverity(noDx).level, sChf = integrateSeverity(chf).level;
  assert(SEV.indexOf(sChf) > SEV.indexOf(sNo), `共病應升級 (${sNo}→${sChf})`);

  // 2) 收斂：c6 同時命中血管規則 + 共病 → serious 以上
  const c6as = integrateSeverity(matchClinicalRules('c6', [], ['as'])).level;
  assert(SEV.indexOf(c6as) >= SEV.indexOf('serious'), 'c6+動脈硬化應 serious+');

  // 3) 無脈絡（無變數無相關病）不顯示
  const none = clinicalIntegrate({ cardId: 'c1', tvIds: [], dxIds: [] });
  assert(none === null, '無脈絡應回 null');

  // 4) joint 不足 → fallback 文案含「不足」
  const fb = clinicalIntegrate({ cardId: 'c1', tvIds: ['diur'], dxIds: ['chf'],
    empirical: { metricLabel: ['淨滯留', 'cc', 'retensi'], joint: null, marginals: [{ tvZh: '利尿藥', tvIdn: 'Diuretik', n: 3, A: 200, B: 100, diff: 100 }] }, lang: 'zh' });
  assert(fb && /不足/.test(fb.zh), 'joint 不足應走 fallback');

  // 5) joint 足夠 → 含平均字樣 + 四段齊
  const jt = clinicalIntegrate({ cardId: 'c1', tvIds: ['diur'], dxIds: ['chf'],
    empirical: { metricLabel: ['淨滯留', 'cc', 'retensi'], joint: { n: 4, A: 260, B: 90, diff: 170 }, marginals: [] }, lang: 'zh' });
  assert(jt && /①變動/.test(jt.zh) && /②為什麼/.test(jt.zh) && /③影響/.test(jt.zh) && /④建議/.test(jt.zh), '四段須齊');
  assert(/心臟衰竭/.test(jt.zh), 'dx 全名應出現在整合卡');
  assert(jt.level === 'crit', 'c1+diur+chf 應 crit');

  // 6) 印尼語切換
  const idc = clinicalIntegrate({ cardId: 'c1', tvIds: ['diur'], dxIds: ['chf'],
    empirical: { metricLabel: ['淨滯留', 'cc', 'retensi'], joint: { n: 4, A: 260, B: 90, diff: 170 }, marginals: [] }, lang: 'id' });
  assert(idc && /Perubahan/.test(idc.id) && /Saran/.test(idc.id), '印尼四段');

  // 7) 建議恆含回診導向句
  assert(/回診/.test(jt.zh), '建議應含回診');

  // 8) 有變數但該圖無規則(c4) → info 卡、標「暫無內建機制規則」、仍顯示①
  const nr = clinicalIntegrate({ cardId: 'c4', tvIds: ['exvol'], dxIds: [], lang: 'zh' });
  assert(nr && nr.level === 'info' && /暫無內建機制規則/.test(nr.zh) && /①變動/.test(nr.zh), '無規則+變數應回數值-only卡');

  // 9) 純疾病背景(無變數) c6+as → 顯示、①為機制推論措辭、四段齊
  const dxonly = clinicalIntegrate({ cardId: 'c6', tvIds: [], dxIds: ['as'], lang: 'zh' });
  assert(dxonly && /疾病背景研判（未疊加變數）/.test(dxonly.zh) && /④建議/.test(dxonly.zh), '純疾病背景應四段+機制推論措辭');
  assert(SEV.indexOf(dxonly.level) >= SEV.indexOf('serious'), 'c6+動脈硬化 severity serious+');

  // 10) 影響圖 N:M：2 driver 匯聚 cardio + 疾病敏化(chf) → crit；雙語不互污染
  const net = propagate({ retain: true, widePP: true }, ['chf']);
  const cardio = net.find(x => x.endpoint === 'cardio');
  assert(cardio && cardio.level === 'crit', 'retain+widePP+chf → cardio crit');
  assert(/跨系統網絡/.test(cardio.zh) && /定性研判/.test(cardio.zh), 'N:M 卡含定性聲明');
  assert(/Jaringan/.test(cardio.id) && !/容積/.test(cardio.id), 'id 卡純印尼、無中文洩漏');

  // 11) 無疾病敏化 → 不輸出（純 driver 匯聚由既有 hidden 覆蓋）
  assert(propagate({ retain: true, widePP: true }, []).length === 0, '無疾病→N:M 空');

  // 12) 單 driver + 疾病敏化 → serious
  const neuro = propagate({ dehydrationSign: true }, ['dem']).find(x => x.endpoint === 'neuro');
  assert(neuro && neuro.level === 'serious', 'dehydration+dem → neuro serious');

  // 13) 有疾病但無 driver 命中 → 空
  assert(propagate({}, ['chf']).length === 0, '無 driver→N:M 空');

  // 14) WBGT 估算：30℃/70% → ~32.6；缺值回 null
  const w = estimateWBGT(30, 70);
  assert(w > 30 && w < 35, 'WBGT(30,70) 應 30–35, got ' + w);
  assert(estimateWBGT(null, 70) === null && estimateWBGT(25, null) === null, 'WBGT 缺值回 null');

  return 'clinical self-test PASS (' + CLINICAL_RULES.length + ' rules, ' + DISEASES.length + ' diseases, ' + DRIVER_EDGES.length + ' edges)';
}

/* ---- 雙環境匯出（browser global + node） ---- */
if (typeof module !== 'undefined' && module.exports){
  module.exports = { SEV, DISEASES, DX_BY_ID, dxName, CLINICAL_RULES,
    matchClinicalRules, integrateSeverity, clinicalIntegrate,
    ENDPOINTS, DRIVER_EDGES, DX_EDGES, propagate, estimateWBGT, clinicalSelfTest };
}
