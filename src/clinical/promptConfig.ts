// 自訂照護提示與自訂鏡像設定儲存
export interface CareCustomPromptConfig {
  bedrailZh: string;
  bedrailId: string;
  catheterZh: string;
  catheterId: string;
  bpGuideZh: string;
  bpGuideId: string;
  bowelAlertHours: number;
}

export const DEFAULT_PROMPT_CONFIG: CareCustomPromptConfig = {
  bedrailZh: '床圍欄放下時，照顧者不得離開病患 1 公尺。',
  bedrailId: 'Saat pagar tempat tidur diturunkan, perawat tidak boleh meninggalkan pasien lebih dari 1 meter.',
  catheterZh: '🚽 早上、下午各一次訓練尿感：關閉導尿管，每次最多 3 小時。',
  catheterId: 'Latihan sensasi kencing sekali di pagi hari dan sekali di sore hari: tutup kateter, maksimal 3 jam setiap kali.',
  bpGuideZh: '早起與睡前 1 小時內測量，量前保持靜止 15 分鐘。',
  bpGuideId: 'Ukur dalam 1 jam setelah bangun & sebelum tidur, istirahat 15 menit sebelumnya.',
  bowelAlertHours: 48
};

const PROMPT_CONFIG_KEY = 'care_custom_prompts_config';

export function getPromptConfig(): CareCustomPromptConfig {
  try {
    const raw = localStorage.getItem(PROMPT_CONFIG_KEY);
    if (raw) {
      return { ...DEFAULT_PROMPT_CONFIG, ...JSON.parse(raw) };
    }
  } catch {
    // ignore
  }
  return DEFAULT_PROMPT_CONFIG;
}

export function savePromptConfig(cfg: Partial<CareCustomPromptConfig>): CareCustomPromptConfig {
  const current = getPromptConfig();
  const updated = { ...current, ...cfg };
  try {
    localStorage.setItem(PROMPT_CONFIG_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
  return updated;
}
