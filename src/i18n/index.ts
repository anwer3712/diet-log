import { Language } from '../types';

export const i18n = {
  appTitle: {
    zh: '☀️💗 陽光照護日誌',
    id: '☀️💗 Buku Harian Perawatan Mentari'
  },
  appSub: {
    zh: '銀髮居家照護追蹤工具',
    id: 'Buku Harian Perawatan Mentari'
  },
  todayProgress: {
    zh: '今日進度',
    id: 'Progres Hari Ini'
  },
  bedrailBanner: {
    zh: '床圍欄放下時，照顧者不得離開病患 1 公尺。',
    id: 'Saat pagar tempat tidur diturunkan, perawat tidak boleh meninggalkan pasien lebih dari 1 meter.'
  },
  todayTarget: {
    zh: '今日目標',
    id: 'Gol hari ini'
  },
  currentAchieved: {
    zh: '目前已達',
    id: 'Kemajuan'
  },
  quickAdd: {
    zh: '快速加水',
    id: 'Tambah Cepat'
  },
  amount: {
    zh: '量 / 毫升',
    id: 'Jumlah (c.c.)'
  },
  note: {
    zh: '備註說明 (選填)',
    id: 'Catatan (Opsional)'
  },
  save: {
    zh: '儲存記錄',
    id: 'Simpan Catatan'
  },
  saving: {
    zh: '儲存中...',
    id: 'Menyimpan...'
  },
  synced: {
    zh: '已同步雲端',
    id: 'Tersinkron'
  },
  pendingSync: {
    zh: '本地已存 (待同步)',
    id: 'Disimpan Lokal (Menunggu)'
  },
  fluidOverloadWarning: {
    zh: '🚨 總液體量已超過目標值！注意心肺負擔！',
    id: '🚨 Volume cairan melebihi target! Waspada beban jantung/paru-paru!'
  },
  constipationWarning: {
    zh: '⚠️ 已超過 60 小時未排便！請遵從指示照護，未經醫囑切勿擅用浣腸！',
    id: '⚠️ Lebih dari 60 jam belum buang air besar! Ikuti instruksi, jangan gunakan enema tanpa izin dokter!'
  }
};

export const typeLabels = {
  intake: { zh: '攝入', id: 'Asupan' },
  output: { zh: '排出', id: 'Ekskresi' },
  exercise: { zh: '運動', id: 'Latihan' },
  bp: { zh: '血壓', id: 'Tekanan Darah' }
};

export const intakeLabels = {
  water: { zh: '飲水', id: 'Air Minum' },
  medicine: { zh: '服藥', id: 'Minum Obat' },
  nutrition: { zh: '營養', id: 'Susu Nutrisi' },
  food: { zh: '進食', id: 'Makanan' }
};

export const outputLabels = {
  urine: { zh: '尿液', id: 'Air Kencing' },
  stool: { zh: '排便', id: 'Buang Air Besar' }
};

export const tabLabels = {
  log: { zh: '今日填報', id: 'Catat Hari Ini' },
  trends: { zh: '趨勢圖表', id: 'Grafik Tren' },
  report: { zh: '就醫匯出', id: 'Laporan Dokter' },
  settings: { zh: '照護設定', id: 'Pengaturan' }
};

export function t(key: keyof typeof i18n, lang: Language): string {
  return i18n[key][lang] || i18n[key]['zh'];
}
