import Dexie, { type Table } from 'dexie';
import { CareLogRecord, CareSettings } from '../types';

export class CareLogDatabase extends Dexie {
  logs!: Table<CareLogRecord, string>;
  settings!: Table<{ key: string; value: any }, string>;

  constructor() {
    super('CareLogDatabase');
    this.version(1).stores({
      logs: 'id, date, timestamp, type, category, syncStatus, caregiver',
      settings: 'key'
    });
  }
}

export const db = new CareLogDatabase();

// 預設設定
export const DEFAULT_SETTINGS: CareSettings = {
  targetWater: 1500,
  diureticUsed: false,
  laxativeUsed: false,
  gasUrl: 'https://script.google.com/macros/s/AKfycbz_G1L-yXqV2tJ26pGZ27M082c5bBw6YwK69K2Gz0vX/exec', // 默認原GAS URL
  spreadsheetUrl: '',
  selectedDiseases: ['htn', 'ckd', 'constip'],
  language: 'zh',
  caregiver: '照顧者1'
};

// 設定讀寫 Helper
export async function getSetting<T>(key: string, defaultValue: T): Promise<T> {
  const record = await db.settings.get(key);
  if (!record) return defaultValue;
  return record.value as T;
}

export async function setSetting<T>(key: string, value: T): Promise<void> {
  await db.settings.put({ key, value });
}
