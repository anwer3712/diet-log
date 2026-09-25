import { useState, useEffect, useCallback } from 'react';
import { Language, CareLogRecord } from './types';
import { db, getSetting, setSetting, DEFAULT_SETTINGS } from './db';
import { syncLogsToCloud } from './db/sync';
import { Header } from './components/Header';
import { TargetDashboard } from './components/TargetDashboard';
import { DailyLogView } from './views/DailyLogView';
import { TrendsView } from './views/TrendsView';
import { ReportView } from './views/ReportView';
import { SettingsView } from './views/SettingsView';
import { tabLabels } from './i18n';
import { ClipboardList, TrendingUp, FileText, Settings as SettingsIcon } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<'log' | 'trends' | 'report' | 'settings'>('log');
  const [lang, setLang] = useState<Language>('zh');
  const [caregiver, setCaregiver] = useState<string>('照顧者1');
  const [targetWater, setTargetWater] = useState<number>(DEFAULT_SETTINGS.targetWater);
  const [diureticUsed, setDiureticUsed] = useState<boolean>(DEFAULT_SETTINGS.diureticUsed);
  const [todayLogs, setTodayLogs] = useState<CareLogRecord[]>([]);
  const [lastStoolTimestamp, setLastStoolTimestamp] = useState<number | undefined>(undefined);

  // 載入設定與日誌
  const refreshData = useCallback(async () => {
    // 讀取設定
    const savedLang = await getSetting('language', DEFAULT_SETTINGS.language);
    const savedCaregiver = await getSetting('caregiver', DEFAULT_SETTINGS.caregiver);
    const savedTarget = await getSetting('targetWater', DEFAULT_SETTINGS.targetWater);
    const savedDiuretic = await getSetting('diureticUsed', DEFAULT_SETTINGS.diureticUsed);

    setLang(savedLang);
    setCaregiver(savedCaregiver);
    setTargetWater(savedTarget);
    setDiureticUsed(savedDiuretic);

    // 今日日期字串
    const todayStr = new Date().toISOString().split('T')[0];
    const logs = await db.logs.where('date').equals(todayStr).toArray();
    // 依時間倒序
    logs.sort((a, b) => b.timestamp - a.timestamp);
    setTodayLogs(logs);

    // 尋找最後一次排便記錄
    const stoolLogs = await db.logs
      .filter((l) => l.type === '排出' && l.category === '排便')
      .toArray();
    if (stoolLogs.length > 0) {
      stoolLogs.sort((a, b) => b.timestamp - a.timestamp);
      setLastStoolTimestamp(stoolLogs[0].timestamp);
    }
  }, []);

  useEffect(() => {
    refreshData();
    // 進入時嘗試同步離線隊列
    syncLogsToCloud().then(() => refreshData());
  }, [refreshData]);

  const handleLangChange = async (newLang: Language) => {
    setLang(newLang);
    await setSetting('language', newLang);
  };

  const handleCaregiverChange = async (newCaregiver: string) => {
    setCaregiver(newCaregiver);
    await setSetting('caregiver', newCaregiver);
  };

  const handleEditTarget = async () => {
    const val = prompt('請輸入新的每日水分目標 (c.c.):', targetWater.toString());
    if (val) {
      const num = parseInt(val, 10);
      if (!isNaN(num) && num > 0) {
        setTargetWater(num);
        await setSetting('targetWater', num);
      }
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 pt-5 pb-24 min-h-screen">
      {/* 頂部 Header */}
      <Header
        lang={lang}
        onLangChange={handleLangChange}
        caregiver={caregiver}
        onCaregiverChange={handleCaregiverChange}
      />

      {/* 今日目標追蹤儀表板 (僅在日誌頁呈現) */}
      {activeTab === 'log' && (
        <TargetDashboard
          lang={lang}
          targetWater={targetWater}
          todayLogs={todayLogs}
          diureticUsed={diureticUsed}
          onEditTarget={handleEditTarget}
          lastStoolTimestamp={lastStoolTimestamp}
        />
      )}

      {/* 視圖切換 */}
      <main>
        {activeTab === 'log' && (
          <DailyLogView
            lang={lang}
            caregiver={caregiver}
            todayLogs={todayLogs}
            onRefresh={refreshData}
          />
        )}
        {activeTab === 'trends' && <TrendsView lang={lang} />}
        {activeTab === 'report' && <ReportView lang={lang} />}
        {activeTab === 'settings' && (
          <SettingsView lang={lang} onSettingsChanged={refreshData} />
        )}
      </main>

      {/* 底部導覽列 */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t-2 border-stone-200 py-2 px-6 shadow-lg z-50">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <button
            onClick={() => setActiveTab('log')}
            className={`flex flex-col items-center gap-1 font-black text-xs transition-all ${
              activeTab === 'log' ? 'text-[#FB8B7A] scale-105' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <ClipboardList className="w-5 h-5" />
            <span>{tabLabels.log[lang]}</span>
          </button>

          <button
            onClick={() => setActiveTab('trends')}
            className={`flex flex-col items-center gap-1 font-black text-xs transition-all ${
              activeTab === 'trends' ? 'text-[#FB8B7A] scale-105' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <TrendingUp className="w-5 h-5" />
            <span>{tabLabels.trends[lang]}</span>
          </button>

          <button
            onClick={() => setActiveTab('report')}
            className={`flex flex-col items-center gap-1 font-black text-xs transition-all ${
              activeTab === 'report' ? 'text-[#FB8B7A] scale-105' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <FileText className="w-5 h-5" />
            <span>{tabLabels.report[lang]}</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center gap-1 font-black text-xs transition-all ${
              activeTab === 'settings' ? 'text-[#FB8B7A] scale-105' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <SettingsIcon className="w-5 h-5" />
            <span>{tabLabels.settings[lang]}</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

export default App;
