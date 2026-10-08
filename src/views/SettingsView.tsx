import React, { useState, useEffect } from 'react';
import { CareSettings, Language } from '../types';
import { getSetting, setSetting, DEFAULT_SETTINGS, db } from '../db';
import { syncLogsToCloud } from '../db/sync';
import {
  getPromptConfig,
  savePromptConfig,
  CareCustomPromptConfig,
  DEFAULT_PROMPT_CONFIG
} from '../clinical/promptConfig';
import {
  isAuthEnforced,
  setAuthEnforced,
  getStoredToken,
  getDeviceKey,
  saveDeviceKey,
  clearAuth,
  parseJwt
} from '../auth/careAuth';
import {
  Settings,
  Save,
  RefreshCw,
  Download,
  Database,
  Check,
  Shield,
  MessageSquare,
  Key,
  RotateCcw,
  Sparkles
} from 'lucide-react';

interface SettingsViewProps {
  lang: Language;
  onSettingsChanged: () => void;
  onOpenAnakMode?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  lang,
  onSettingsChanged,
  onOpenAnakMode
}) => {
  const [settings, setSettings] = useState<CareSettings>(DEFAULT_SETTINGS);
  const [prompts, setPrompts] = useState<CareCustomPromptConfig>(DEFAULT_PROMPT_CONFIG);
  const [authEnforced, setAuthStateEnforced] = useState<boolean>(true);
  const [deviceKeyVal, setDeviceKeyVal] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [isSaved, setIsSaved] = useState(false);
  const [syncMsg, setSyncMsg] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const targetWater = await getSetting('targetWater', DEFAULT_SETTINGS.targetWater);
    const diureticUsed = await getSetting('diureticUsed', DEFAULT_SETTINGS.diureticUsed);
    const laxativeUsed = await getSetting('laxativeUsed', DEFAULT_SETTINGS.laxativeUsed);
    const gasUrl = await getSetting('gasUrl', DEFAULT_SETTINGS.gasUrl);
    const selectedDiseases = await getSetting('selectedDiseases', DEFAULT_SETTINGS.selectedDiseases);

    setSettings({
      ...DEFAULT_SETTINGS,
      targetWater,
      diureticUsed,
      laxativeUsed,
      gasUrl,
      selectedDiseases
    });

    setPrompts(getPromptConfig());
    setAuthStateEnforced(isAuthEnforced());
    setDeviceKeyVal(getDeviceKey());

    const token = getStoredToken();
    if (token) {
      const u = parseJwt(token);
      if (u.email) setUserEmail(u.email);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await setSetting('targetWater', settings.targetWater);
    await setSetting('diureticUsed', settings.diureticUsed);
    await setSetting('laxativeUsed', settings.laxativeUsed);
    await setSetting('gasUrl', settings.gasUrl);
    await setSetting('selectedDiseases', settings.selectedDiseases);

    // 儲存鏡像提示自訂內容
    savePromptConfig(prompts);

    // 儲存安全身分閘門設定
    setAuthEnforced(authEnforced);
    if (deviceKeyVal.trim()) {
      saveDeviceKey(deviceKeyVal.trim());
    }

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
    onSettingsChanged();
  };



  const handleManualSync = async () => {
    setSyncMsg('同步中...');
    const res = await syncLogsToCloud();
    if (res.success) {
      setSyncMsg(`同步完成！共上傳 ${res.syncedCount} 筆記錄。`);
    } else {
      setSyncMsg(`同步失敗: ${res.error}`);
    }
    setTimeout(() => setSyncMsg(''), 4000);
  };

  const handleExportJSON = async () => {
    const logs = await db.logs.toArray();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `diet-log-backup-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleResetPrompts = () => {
    if (confirm(lang === 'zh' ? '確定還原提示文字為原廠預設值？' : 'Kembalikan teks prompt ke default?')) {
      setPrompts(DEFAULT_PROMPT_CONFIG);
      savePromptConfig(DEFAULT_PROMPT_CONFIG);
    }
  };

  const handleLogout = () => {
    clearAuth();
    window.location.reload();
  };

  return (
    <div className="space-y-4">
      {/* 👶 兒童大字版入口快捷卡 */}
      {onOpenAnakMode && (
        <div className="bg-gradient-to-r from-teal-500 to-emerald-600 rounded-3xl p-4 text-white shadow-md flex items-center justify-between">
          <div className="space-y-0.5">
            <h4 className="font-black text-sm flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span>{lang === 'zh' ? '陽光日誌 · 兒童大字版' : 'Catatan Mentari — Anak'}</span>
            </h4>
            <p className="text-[11px] text-teal-100 font-medium">
              超大對比按鈕、遠視友善，簡化 3 步驟床邊快速記錄
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenAnakMode}
            className="bg-white text-teal-800 hover:bg-teal-50 px-3.5 py-2 rounded-2xl font-black text-xs shadow-md shrink-0 active:scale-95 transition-all"
          >
            開啟模式
          </button>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white rounded-3xl p-5 shadow-sm border-2 border-stone-200 space-y-5">
        <h3 className="font-black text-gray-800 flex items-center gap-2 text-base pb-2 border-b">
          <Settings className="w-5 h-5 text-[#FB8B7A]" />
          <span>{lang === 'zh' ? '照護目標與臨床參數設定' : 'Pengaturan Parameter Klinis'}</span>
        </h3>

        {/* 每日液體目標 */}
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">
            🎯 每日水分攝入總目標 (c.c.)
          </label>
          <input
            type="number"
            value={settings.targetWater}
            onChange={(e) =>
              setSettings({ ...settings, targetWater: parseInt(e.target.value, 10) || 0 })
            }
            className="w-full bg-gray-50 border-2 border-gray-300 rounded-2xl py-2 px-3 text-lg font-black text-gray-900 focus:outline-none focus:border-[#FB8B7A]"
          />
        </div>

        {/* 藥物狀態 */}
        <div className="grid grid-cols-2 gap-3">
          <label className="flex items-center gap-2 bg-gray-50 p-3 rounded-2xl border-2 border-gray-200 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.diureticUsed}
              onChange={(e) => setSettings({ ...settings, diureticUsed: e.target.checked })}
              className="w-5 h-5 rounded text-[#FB8B7A] focus:ring-[#FB8B7A]"
            />
            <span className="text-xs font-bold text-gray-800">💊 使用利尿劑</span>
          </label>
          <label className="flex items-center gap-2 bg-gray-50 p-3 rounded-2xl border-2 border-gray-200 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.laxativeUsed}
              onChange={(e) => setSettings({ ...settings, laxativeUsed: e.target.checked })}
              className="w-5 h-5 rounded text-[#FB8B7A] focus:ring-[#FB8B7A]"
            />
            <span className="text-xs font-bold text-gray-800">🚽 使用軟便劑</span>
          </label>
        </div>

        {/* 🔒 Google 登入閘門與裝置金鑰權限設定 (還原 care-auth 核心功能) */}
        <div className="border-t pt-4 space-y-3">
          <h4 className="text-xs font-black text-gray-800 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-amber-800">
              <Shield className="w-4 h-4 text-amber-600" />
              <span>🔐 Google 帳號身分閘門與可視範圍安全鎖</span>
            </span>
            {userEmail && (
              <span className="text-[10px] bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-black">
                {userEmail}
              </span>
            )}
          </h4>

          <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-3.5 space-y-2.5">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={authEnforced}
                onChange={(e) => setAuthStateEnforced(e.target.checked)}
                className="w-4 h-4 text-amber-600 rounded"
              />
              <span className="text-xs font-black text-amber-950">
                啟用強制驗證（未登入 Google 帳號或無金鑰者鎖住資料庫）
              </span>
            </label>

            <div>
              <label className="block text-[11px] font-bold text-amber-900 mb-1 flex items-center gap-1">
                <Key className="w-3.5 h-3.5" />
                <span>專屬裝置金鑰 (Device Key，提供給無法登入 Google 的手機)</span>
              </label>
              <input
                type="text"
                placeholder="例如 devkey_u4_mobile_token"
                value={deviceKeyVal}
                onChange={(e) => setDeviceKeyVal(e.target.value)}
                className="w-full bg-white border border-amber-300 rounded-xl py-1.5 px-2.5 text-xs font-bold text-gray-800 focus:outline-none"
              />
            </div>

            {(userEmail || deviceKeyVal) && (
              <div className="pt-1 flex justify-end">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-[11px] font-black text-rose-600 hover:text-rose-800 flex items-center gap-1"
                >
                  登出 / 清除本機授權
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 🪞 鏡像 U1/U2 自訂提示內容設定 (還原鏡像編輯器核心功能) */}
        <div className="border-t pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black text-purple-900 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-purple-600" />
              <span>🪞 自訂照護引導與警示文字 (鏡像自訂系統)</span>
            </h4>
            <button
              type="button"
              onClick={handleResetPrompts}
              className="text-[11px] text-gray-400 hover:text-purple-600 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>還原預設</span>
            </button>
          </div>

          <div className="space-y-3 bg-purple-50/40 border border-purple-200 rounded-2xl p-3 text-xs">
            {/* 床圍欄警戒 */}
            <div className="space-y-1">
              <label className="block font-bold text-purple-950">🚨 床圍欄安全守則文字 (中 / 印)</label>
              <input
                type="text"
                value={prompts.bedrailZh}
                onChange={(e) => setPrompts({ ...prompts, bedrailZh: e.target.value })}
                className="w-full bg-white border border-purple-200 rounded-xl py-1.5 px-2.5 text-xs font-bold text-gray-800"
              />
              <input
                type="text"
                value={prompts.bedrailId}
                onChange={(e) => setPrompts({ ...prompts, bedrailId: e.target.value })}
                className="w-full bg-white border border-purple-200 rounded-xl py-1.5 px-2.5 text-xs font-bold text-gray-600"
              />
            </div>

            {/* 導尿管訓練提示 */}
            <div className="space-y-1">
              <label className="block font-bold text-purple-950">🚽 導尿管膀胱訓練提示 (中 / 印)</label>
              <input
                type="text"
                value={prompts.catheterZh}
                onChange={(e) => setPrompts({ ...prompts, catheterZh: e.target.value })}
                className="w-full bg-white border border-purple-200 rounded-xl py-1.5 px-2.5 text-xs font-bold text-gray-800"
              />
              <input
                type="text"
                value={prompts.catheterId}
                onChange={(e) => setPrompts({ ...prompts, catheterId: e.target.value })}
                className="w-full bg-white border border-purple-200 rounded-xl py-1.5 px-2.5 text-xs font-bold text-gray-600"
              />
            </div>

            {/* 血壓測量指引 */}
            <div className="space-y-1">
              <label className="block font-bold text-purple-950">💡 量血壓黃金法則 (中 / 印)</label>
              <input
                type="text"
                value={prompts.bpGuideZh}
                onChange={(e) => setPrompts({ ...prompts, bpGuideZh: e.target.value })}
                className="w-full bg-white border border-purple-200 rounded-xl py-1.5 px-2.5 text-xs font-bold text-gray-800"
              />
              <input
                type="text"
                value={prompts.bpGuideId}
                onChange={(e) => setPrompts({ ...prompts, bpGuideId: e.target.value })}
                className="w-full bg-white border border-purple-200 rounded-xl py-1.5 px-2.5 text-xs font-bold text-gray-600"
              />
            </div>
          </div>
        </div>

        {/* 雲端試算表設定 */}
        <div className="border-t pt-4 space-y-3">
          <label className="block text-xs font-bold text-gray-700">
            ☁️ Google Apps Script Web App 部署網址 (GAS URL)
          </label>
          <input
            type="url"
            value={settings.gasUrl}
            onChange={(e) => setSettings({ ...settings, gasUrl: e.target.value })}
            placeholder="https://script.google.com/macros/s/.../exec"
            className="w-full bg-gray-50 border-2 border-gray-300 rounded-2xl py-2 px-3 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#FB8B7A]"
          />
        </div>

        {/* 儲存按鈕 */}
        <button
          type="submit"
          className="w-full bg-[#FB8B7A] hover:bg-[#F4726B] active:scale-98 text-white rounded-2xl py-3 font-black text-sm shadow-md transition-all flex items-center justify-center gap-2"
        >
          {isSaved ? <Check className="w-5 h-5 text-white" /> : <Save className="w-5 h-5" />}
          <span>{isSaved ? '設定已儲存！' : '儲存全部設定'}</span>
        </button>
      </form>

      {/* 雲端資料同步與備份 */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border-2 border-stone-200 space-y-3">
        <h3 className="font-black text-gray-800 flex items-center gap-2 text-sm border-b pb-2">
          <Database className="w-4 h-4 text-sky-600" />
          <span>離線資料庫管理與手動同步</span>
        </h3>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleManualSync}
            className="flex-1 bg-sky-500 hover:bg-sky-600 active:scale-95 text-white font-black text-xs py-2.5 rounded-2xl flex items-center justify-center gap-1.5 shadow-sm transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>立即手動上傳雲端</span>
          </button>

          <button
            type="button"
            onClick={handleExportJSON}
            className="flex-1 bg-stone-700 hover:bg-stone-800 active:scale-95 text-white font-black text-xs py-2.5 rounded-2xl flex items-center justify-center gap-1.5 shadow-sm transition-all"
          >
            <Download className="w-4 h-4" />
            <span>匯出本機 JSON 備份</span>
          </button>
        </div>

        {syncMsg && (
          <p className="text-xs font-bold text-center text-sky-700 bg-sky-50 p-2 rounded-xl">
            {syncMsg}
          </p>
        )}
      </div>
    </div>
  );
};
