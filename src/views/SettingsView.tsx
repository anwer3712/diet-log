import React, { useState, useEffect } from 'react';
import { CareSettings, Language } from '../types';
import { getSetting, setSetting, DEFAULT_SETTINGS, db } from '../db';
import { DISEASES } from '../clinical/rules';
import { syncLogsToCloud } from '../db/sync';
import { Settings, Save, RefreshCw, Download, Database, Check } from 'lucide-react';

interface SettingsViewProps {
  lang: Language;
  onSettingsChanged: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ lang, onSettingsChanged }) => {
  const [settings, setSettings] = useState<CareSettings>(DEFAULT_SETTINGS);
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
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await setSetting('targetWater', settings.targetWater);
    await setSetting('diureticUsed', settings.diureticUsed);
    await setSetting('laxativeUsed', settings.laxativeUsed);
    await setSetting('gasUrl', settings.gasUrl);
    await setSetting('selectedDiseases', settings.selectedDiseases);

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
    onSettingsChanged();
  };

  const handleToggleDisease = (diseaseId: string) => {
    const list = [...settings.selectedDiseases];
    const index = list.indexOf(diseaseId);
    if (index >= 0) {
      list.splice(index, 1);
    } else {
      list.push(diseaseId);
    }
    setSettings({ ...settings, selectedDiseases: list });
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

  return (
    <div className="space-y-4">
      <form onSubmit={handleSave} className="bg-white rounded-3xl p-5 shadow-sm border-2 border-stone-200 space-y-4">
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
            onChange={(e) => setSettings({ ...settings, targetWater: parseInt(e.target.value, 10) || 0 })}
            className="w-full bg-gray-50 border-2 border-gray-300 rounded-2xl py-2.5 px-3 text-lg font-black text-gray-900 focus:outline-none focus:border-[#FB8B7A]"
            required
          />
          <p className="text-[11px] text-gray-400 font-bold mt-1">
            依醫師處方設定（一般心臟衰竭/洗腎限制在 1200 ~ 1500 c.c.）
          </p>
        </div>

        {/* 用藥狀態勾選 */}
        <div className="space-y-2 pt-2 border-t">
          <label className="block text-xs font-bold text-gray-700">💊 用藥標記（影響臨床警示與目標演算法）</label>
          <label className="flex items-center gap-2 text-xs font-bold text-gray-800 p-2.5 bg-gray-50 rounded-2xl border border-gray-200 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.diureticUsed}
              onChange={(e) => setSettings({ ...settings, diureticUsed: e.target.checked })}
              className="w-4 h-4 text-[#FB8B7A] rounded"
            />
            <span>目前有服用「利尿劑」（預期尿量將提高至目標的 1.1 ~ 1.5 倍）</span>
          </label>
          <label className="flex items-center gap-2 text-xs font-bold text-gray-800 p-2.5 bg-gray-50 rounded-2xl border border-gray-200 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.laxativeUsed}
              onChange={(e) => setSettings({ ...settings, laxativeUsed: e.target.checked })}
              className="w-4 h-4 text-[#FB8B7A] rounded"
            />
            <span>目前有服用「軟便劑 / 緩瀉劑」</span>
          </label>
        </div>

        {/* 慢性病診斷勾選 */}
        <div className="space-y-2 pt-2 border-t">
          <label className="block text-xs font-bold text-gray-700">🏥 臨床共病診斷勾選（啟用專屬警示規則）</label>
          <div className="grid grid-cols-2 gap-1.5">
            {DISEASES.map((d) => {
              const isChecked = settings.selectedDiseases.includes(d.id);
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => handleToggleDisease(d.id)}
                  className={`p-2 rounded-xl border text-xs font-bold text-left flex items-center justify-between transition-all ${
                    isChecked
                      ? 'border-[#FB8B7A] bg-rose-50 text-[#FB8B7A] font-black'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span>{d.zh}</span>
                  {isChecked && <Check className="w-3.5 h-3.5" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* 雲端同步 GAS URL */}
        <div className="pt-2 border-t">
          <label className="block text-xs font-bold text-gray-700 mb-1">
            ☁️ Google Apps Script (GAS) 部署網址
          </label>
          <input
            type="text"
            value={settings.gasUrl}
            onChange={(e) => setSettings({ ...settings, gasUrl: e.target.value })}
            placeholder="https://script.google.com/macros/s/.../exec"
            className="w-full bg-gray-50 border-2 border-gray-300 rounded-2xl py-2 px-3 text-xs font-mono text-gray-800 focus:outline-none focus:border-[#FB8B7A]"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-[#FB8B7A] hover:bg-[#F4726B] text-white py-3 rounded-2xl font-black text-sm shadow-md active:scale-98 transition-all flex items-center justify-center gap-1.5"
        >
          <Save className="w-4 h-4" />
          <span>{isSaved ? '設定已儲存！' : '儲存所有設定'}</span>
        </button>
      </form>

      {/* 資料備份與手動同步區塊 */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border-2 border-stone-200 space-y-3">
        <h4 className="font-black text-gray-800 flex items-center gap-1.5 text-sm">
          <Database className="w-4 h-4 text-gray-500" />
          <span>本地資料庫與雲端同步</span>
        </h4>

        {syncMsg && (
          <p className="text-xs font-bold text-sky-700 bg-sky-50 p-2 rounded-xl border border-sky-200">
            {syncMsg}
          </p>
        )}

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleManualSync}
            className="p-3 bg-sky-50 hover:bg-sky-100 border-2 border-sky-300 text-sky-800 rounded-2xl font-black text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>立即同步雲端</span>
          </button>

          <button
            type="button"
            onClick={handleExportJSON}
            className="p-3 bg-gray-50 hover:bg-gray-100 border-2 border-gray-300 text-gray-800 rounded-2xl font-black text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>匯出備份 JSON</span>
          </button>
        </div>
      </div>
    </div>
  );
};
