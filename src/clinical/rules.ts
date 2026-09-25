export type Severity = 'info' | 'warn' | 'serious' | 'crit';

export interface Disease {
  id: string;
  zh: string;
  idn: string;
  system: string;
  pathwayKeys: string[];
}

export interface ClinicalRule {
  id: string;
  tier: string;
  system: string;
  when: {
    charts?: string[];
    tvs?: string[];
    diseases?: string[];
  };
  base: Severity;
  modBy: Partial<Record<string, Severity>>;
  why: [string, string]; // [zh, id]
  impact: [string, string]; // [zh, id]
  advice: [string, string]; // [zh, id]
  evidence: string;
  needsVerify: boolean;
}

export const SEV_TAG: Record<Severity, string> = {
  info: '🟢',
  warn: '🟡',
  serious: '🟠',
  crit: '🔴'
};

export const DISEASES: Disease[] = [
  // 1 心腦血管
  { id: 'htn', zh: '高血壓', idn: 'Hipertensi', system: '心腦血管', pathwayKeys: ['bp', 'vascular', 'volume'] },
  { id: 'chf', zh: '心臟衰竭/心室肥大', idn: 'Gagal jantung', system: '心腦血管', pathwayKeys: ['volume', 'cardiac', 'perfusion'] },
  { id: 'cad', zh: '冠心病/心肌缺血史', idn: 'Penyakit jantung koroner', system: '心腦血管', pathwayKeys: ['cardiac', 'ischemia', 'rpp'] },
  { id: 'as', zh: '動脈硬化(高脈壓)', idn: 'Aterosklerosis', system: '心腦血管', pathwayKeys: ['vascular', 'pulse'] },
  { id: 'af', zh: '心律不整/心房顫動', idn: 'Aritmia/AF', system: '心腦血管', pathwayKeys: ['cardiac', 'hr', 'electrolyte'] },
  { id: 'cva', zh: '腦中風史', idn: 'Riwayat stroke', system: '心腦血管', pathwayKeys: ['bp', 'perfusion', 'neuro'] },

  // 2 泌尿腎臟與代謝
  { id: 'ckd', zh: '慢性腎病/腎功能不全', idn: 'Penyakit ginjal kronis', system: '泌尿腎臟', pathwayKeys: ['volume', 'renal', 'electrolyte'] },
  { id: 'gout', zh: '痛風與尿酸結石', idn: 'Asam urat & batu ginjal', system: '泌尿腎臟', pathwayKeys: ['urate', 'renal', 'fluid'] },
  { id: 'dm', zh: '糖尿病/自主神經病變', idn: 'Diabetes mellitus', system: '代謝內分泌', pathwayKeys: ['glucose', 'microvascular', 'neuro'] },

  // 3 消化腸道
  { id: 'constip', zh: '慢性便秘/腸道障礙', idn: 'Konstipasi kronis', system: '消化系統', pathwayKeys: ['gut', 'fluid'] },

  // 4 神經與老年衰弱
  { id: 'dem_deli', zh: '失智與譫妄傾向', idn: 'Demensia & delirium', system: '神經精神', pathwayKeys: ['neuro', 'fluid', 'electrolyte'] },
  { id: 'sarco_fall', zh: '肌少症與跌倒高風險', idn: 'Sarkopenia & risiko jatuh', system: '骨骼肌肉', pathwayKeys: ['muscle', 'balance', 'joint'] },

  // 5 呼吸胸腔
  { id: 'copd_asthma', zh: '氣喘/COPD', idn: 'Asma / COPD', system: '呼吸胸腔', pathwayKeys: ['resp', 'airway'] }
];

export const CLINICAL_RULES: ClinicalRule[] = [
  {
    id: 'vol_overload',
    tier: 'N:1',
    system: '心腎循環容積',
    when: { tvs: ['diur'] },
    base: 'warn',
    modBy: { chf: 'crit', ckd: 'serious', htn: 'serious' },
    why: [
      '利尿藥當日若淨滯留仍偏高、尿量沒相應增加，代表水分排不掉、可能積在循環裡（容積過載的早期訊號）。',
      'Bila hari pakai diuretik retensi tetap tinggi & urine tak bertambah, cairan menumpuk di sirkulasi (tanda dini kelebihan volume).'
    ],
    impact: [
      '心臟與腎臟前負荷加重；有心衰或腎病時更容易失代償。',
      'Beban jantung & ginjal naik; pada gagal jantung/ginjal lebih mudah dekompensasi.'
    ],
    advice: [
      '每天照實勾利尿藥、記體重與尿量趨勢；回診把「有藥卻仍滯留」的數據帶給醫師。利尿藥劑量由醫師決定，勿自行加減。',
      'Catat diuretik, berat badan & urine tiap hari; bawa data hari retensi ke dokter. Dosis diuretik diputuskan oleh dokter.'
    ],
    evidence: 'AHA/ACC 2022 Heart Failure Guidelines (Circulation 2022;145:e895–e1032)',
    needsVerify: false
  },
  {
    id: 'vol_overload_net',
    tier: 'N:1',
    system: '心腎循環容積',
    when: { tvs: ['net_ret'] },
    base: 'warn',
    modBy: { chf: 'crit', ckd: 'serious', htn: 'serious' },
    why: [
      '連續淨滯留（總攝入水量−尿量）偏高，水分累積於循環系統中，為容量過載之實證表現。',
      'Retensi cairan bersih (asupan total − urine) tinggi terus-menerus, bukti objektif kelebihan volume sirkulasi.'
    ],
    impact: [
      '直接推升心室充盈壓與肺毛細血管壓，促發心臟衰竭惡化或加劇腎絲球高壓。',
      'Menaikkan tekanan pengisian ventrikel & kapiler paru; memperburuk gagal jantung.'
    ],
    advice: [
      '限水每日核對攝入與排出總量；水腫加劇或平躺呼吸困難即刻就醫。',
      'Periksa ketat asupan vs pengeluaran harian; segera periksa bila sesak saat berbaring.'
    ],
    evidence: 'KDIGO 2024 Clinical Practice Guideline for CKD & AHA Heart Failure Guidelines',
    needsVerify: false
  },
  {
    id: 'wide_pp_stiffness',
    tier: 'N:1',
    system: '血管硬化',
    when: { tvs: ['pp'] },
    base: 'warn',
    modBy: { as: 'serious', htn: 'serious', cad: 'serious', cva: 'serious' },
    why: [
      '脈壓差（收縮壓−舒張壓）持續 >60 mmHg，反映主動脈壁僵硬、彈性緩衝能力退化。',
      'Tekanan nadi (sistolik−diastolik) >60 mmHg mencerminkan kekakuan arteri aorta besar.'
    ],
    impact: [
      '動脈硬化、高血壓或中風史患者，寬脈壓顯著提高心血管事件與缺血性中風復發機率。',
      'Pada aterosklerosis/hipertensi/stroke, tekanan nadi lebar meningkatkan risiko kejadian kardiovaskular.'
    ],
    advice: [
      '晨起與睡前各測一次血壓並記錄脈壓差；避免清晨低溫劇烈起身與活動，注意保暖。',
      'Ukur tensi pagi & malam, catat tren tekanan nadi; jaga hangat saat dingin, jangan bangun tiba-tiba.'
    ],
    evidence: '2023 ESH Guidelines for the management of arterial hypertension (J Hypertens 2023;41:1874–2071)',
    needsVerify: false
  },
  {
    id: 'diur_constipation',
    tier: 'N:1',
    system: '腸道水分',
    when: { tvs: ['constip_diur'] },
    base: 'warn',
    modBy: { constip: 'serious', chf: 'warn' },
    why: [
      '利尿劑強效排水時腸道會吸收更多水分，若水分補充不均，糞便易乾硬造成排便中斷。',
      'Diuretik menarik cairan tubuh sehingga usus menyerap lebih banyak air feses; feses menjadi kering keras.'
    ],
    impact: [
      '乾硬便增加排便用力（Valsalva 效應），易誘發老年人血壓瞬間飆高；超過 3 天無排便有糞石嵌塞危險。',
      'Mengejan keras meningkatkan risiko lonjakan tensi; >3 hari tanpa BAB berisiko impaksi feses.'
    ],
    advice: [
      '乾硬便持續時檢視當日總攝入水量；軟便劑與利尿劑配比由醫師評估，切勿擅自停藥。',
      'Bila feses keras: cukupkan serat & cairan dalam batas aman; konsultasikan dengan dokter.'
    ],
    evidence: 'American Gastroenterological Association (AGA) Guidelines on Constipation',
    needsVerify: false
  }
];
