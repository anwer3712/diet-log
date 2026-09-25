export type CareType = '攝入' | '排出' | '運動' | '血壓';

export type IntakeCategory = '飲水' | '服藥飲水' | '營養飲品' | '進食';
export type OutputCategory = '尿液' | '排便';
export type ExerciseCategory = 
  | '寶特瓶舉起' 
  | '腳踩腳踝幫浦' 
  | '躺姿膝蓋彎曲' 
  | '平躺直腿抬高' 
  | '雙膝內收夾枕' 
  | '橋式抬臀' 
  | '坐姿提盒' 
  | '坐姿抬腿伸膝' 
  | '站立深呼吸' 
  | '站立平衡重心' 
  | '站立後抬腿';

export type BpCategory = '早起血壓' | '睡前血壓' | '一般血壓';

export type CareCategory = IntakeCategory | OutputCategory | ExerciseCategory | BpCategory;

export type Language = 'zh' | 'id';

export interface CareLogRecord {
  id: string; // UUID
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  timestamp: number; // Unix timestamp ms
  type: CareType;
  category: string;
  amount?: number; // cc / ml
  note?: string;
  caregiver: string; // '照顧者1' | '照顧者2' | '家屬'
  
  // Blood pressure
  bpSys?: number;
  bpDia?: number;
  bpHr?: number;

  // Stool / Urine specific
  stoolStatus?: string; // 正常 / 軟便 / 硬便 / 腹瀉
  urineColor?: string; // 淡黃 / 深黃 / 濃茶色 / 血尿

  // Exercise count/duration
  exerciseReps?: number;

  // Sync state
  syncStatus: 'pending' | 'synced' | 'failed';
  syncedAt?: number;
  syncError?: string;
  
  createdAt: number;
  updatedAt: number;
}

export interface CareSettings {
  targetWater: number; // 預設 1500 c.c.
  diureticUsed: boolean; // 是否有利尿劑
  laxativeUsed: boolean; // 是否有軟便劑
  gasUrl: string; // Google Apps Script Web App URL
  spreadsheetUrl: string;
  selectedDiseases: string[]; // 慢性病診斷勾選
  language: Language;
  caregiver: string;
  bedrailAlertDismissedUntil?: number;
}
