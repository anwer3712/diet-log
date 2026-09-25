import React from 'react';
import { Language, CareLogRecord } from '../types';
import { t } from '../i18n';
import { Target, CheckCircle2, AlertOctagon, Info } from 'lucide-react';

interface TargetDashboardProps {
  lang: Language;
  targetWater: number;
  todayLogs: CareLogRecord[];
  diureticUsed: boolean;
  onEditTarget: () => void;
  lastStoolTimestamp?: number;
}

export const TargetDashboard: React.FC<TargetDashboardProps> = ({
  lang,
  targetWater,
  todayLogs,
  diureticUsed,
  onEditTarget,
  lastStoolTimestamp
}) => {
  // 今日總攝入量
  const todayIntake = todayLogs
    .filter((log) => log.type === '攝入')
    .reduce((sum, log) => sum + (log.amount || 0), 0);

  // 今日總排出尿量
  const todayUrine = todayLogs
    .filter((log) => log.type === '排出' && log.category === '尿液')
    .reduce((sum, log) => sum + (log.amount || 0), 0);

  const percent = Math.min(Math.round((todayIntake / (targetWater || 1)) * 100), 100);
  const isOverload = todayIntake > targetWater;

  // 臨床預期尿量演算法
  const urineMin = Math.round(targetWater * (diureticUsed ? 1.1 : 0.4));
  const urineMax = Math.round(targetWater * (diureticUsed ? 1.5 : 0.6));

  // 便秘時限判定（超過 60 小時無排便記錄）
  const hoursSinceStool = lastStoolTimestamp
    ? Math.floor((Date.now() - lastStoolTimestamp) / (1000 * 60 * 60))
    : 0;
  const isConstipated = hoursSinceStool >= 60;

  return (
    <div className="bg-white rounded-3xl p-4 shadow-sm border-2 border-stone-200 mb-4 transition-all">
      {/* 標題與百分比 */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-black text-gray-800 flex items-center gap-1.5 text-base">
          🎯 {t('todayTarget', lang)}
        </h3>
        <span
          className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
            isOverload ? 'bg-red-100 text-red-700' : 'bg-rose-50 text-[#F4726B]'
          }`}
        >
          {percent}%
        </span>
      </div>

      {/* 雙欄卡片：目標 vs 已達 */}
      <div className="grid grid-cols-2 gap-2.5 mb-3 text-center">
        {/* 今日目標 */}
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-2.5 flex flex-col justify-center">
          <p className="text-[11px] text-amber-800 font-black flex items-center justify-center gap-1">
            <Target className="w-3.5 h-3.5" />
            <span>{t('todayTarget', lang)}</span>
          </p>
          <div className="flex items-baseline justify-center gap-1 mt-1">
            <span className="text-3xl font-black text-amber-950">{targetWater}</span>
            <span className="text-xs font-bold text-amber-700">c.c.</span>
            <button
              onClick={onEditTarget}
              className="ml-1 text-amber-600 hover:text-amber-800 text-xs active:scale-90"
              title="修改目標"
            >
              ✏️
            </button>
          </div>
        </div>

        {/* 目前已達 */}
        <div className="bg-teal-50 border-2 border-teal-300 rounded-2xl p-2.5 flex flex-col justify-center">
          <p className="text-[11px] text-teal-800 font-black flex items-center justify-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{t('currentAchieved', lang)}</span>
          </p>
          <div className="flex items-baseline justify-center gap-1 mt-1">
            <span
              className={`text-3xl font-black ${
                isOverload ? 'text-red-600' : 'text-teal-900'
              }`}
            >
              {todayIntake}
            </span>
            <span className="text-xs font-bold text-teal-700">c.c.</span>
          </div>
        </div>
      </div>

      {/* 進度條 */}
      <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden mb-2.5">
        <div
          className={`h-full transition-all duration-500 rounded-full ${
            isOverload ? 'bg-red-500' : 'bg-[#FB8B7A]'
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* 淨平衡指示 (I/O Balance) */}
      <div className="flex justify-between items-center text-xs font-bold text-gray-500 px-1 mb-2">
        <span>💧 今日排尿: {todayUrine} c.c.</span>
        <span>⚖️ 淨差額: {todayIntake - todayUrine} c.c.</span>
      </div>

      {/* 超過目標值警示 */}
      {isOverload && (
        <div className="bg-red-100 border border-red-300 text-red-800 p-2.5 rounded-2xl text-xs font-black mb-2 animate-pulse flex items-center gap-2">
          <AlertOctagon className="w-5 h-5 shrink-0 text-red-600" />
          <span>{t('fluidOverloadWarning', lang)}</span>
        </div>
      )}

      {/* 便秘預警 */}
      {isConstipated && (
        <div className="bg-amber-100 border border-amber-300 text-amber-900 p-2.5 rounded-2xl text-xs font-black mb-2 flex items-center gap-2">
          <AlertOctagon className="w-5 h-5 shrink-0 text-amber-700" />
          <span>{t('constipationWarning', lang)}</span>
        </div>
      )}

      {/* 臨床預期尿量範圍提示 */}
      <div className="bg-blue-50 border border-blue-200 text-blue-800 p-2 rounded-2xl text-[11px] font-bold flex items-center gap-1.5">
        <Info className="w-4 h-4 shrink-0 text-blue-600" />
        <span>
          {lang === 'zh'
            ? `💡 今日預期排尿範圍: ${urineMin} ~ ${urineMax} c.c. (${diureticUsed ? '已啟用利尿劑調整' : '未用利尿劑'})`
            : `💡 Estimasi urine hari ini: ${urineMin} ~ ${urineMax} c.c. (${diureticUsed ? 'Dengan diuretik' : 'Tanpa diuretik'})`}
        </span>
      </div>
    </div>
  );
};
