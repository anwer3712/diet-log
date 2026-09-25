import React, { useEffect, useState } from 'react';
import { CareLogRecord, Language } from '../types';
import { db } from '../db';
import { Calendar, TrendingUp } from 'lucide-react';

interface TrendsViewProps {
  lang: Language;
}

interface DayStat {
  date: string;
  intake: number;
  urine: number;
  net: number;
  bpLogs: { sys: number; dia: number; hr: number; time: string }[];
  stoolCount: number;
}

export const TrendsView: React.FC<TrendsViewProps> = ({ lang }) => {
  const [stats, setStats] = useState<DayStat[]>([]);

  useEffect(() => {
    loadTrends();
  }, []);

  const loadTrends = async () => {
    // 獲取最近 7 天日誌
    const allLogs = await db.logs.toArray();
    
    // 按日期分組
    const groups: Record<string, CareLogRecord[]> = {};
    allLogs.forEach((log) => {
      if (!groups[log.date]) groups[log.date] = [];
      groups[log.date].push(log);
    });

    const dates = Object.keys(groups).sort().slice(-7); // 取最近7天

    const days: DayStat[] = dates.map((d) => {
      const logs = groups[d];
      const intake = logs
        .filter((l) => l.type === '攝入')
        .reduce((sum, l) => sum + (l.amount || 0), 0);
      const urine = logs
        .filter((l) => l.type === '排出' && l.category === '尿液')
        .reduce((sum, l) => sum + (l.amount || 0), 0);
      const stoolCount = logs.filter(
        (l) => l.type === '排出' && l.category === '排便'
      ).length;
      const bpLogs = logs
        .filter((l) => l.type === '血壓' && l.bpSys && l.bpDia)
        .map((l) => ({
          sys: l.bpSys!,
          dia: l.bpDia!,
          hr: l.bpHr || 0,
          time: l.time
        }));

      return {
        date: d,
        intake,
        urine,
        net: intake - urine,
        bpLogs,
        stoolCount
      };
    });

    setStats(days);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-3xl p-4 shadow-sm border-2 border-stone-200">
        <h3 className="font-black text-gray-800 flex items-center gap-2 mb-3 text-base">
          <TrendingUp className="w-5 h-5 text-[#FB8B7A]" />
          <span>{lang === 'zh' ? '近 7 天健康趨勢總覽' : 'Ringkasan Tren 7 Hari'}</span>
        </h3>

        {stats.length === 0 ? (
          <p className="text-center text-xs font-bold text-gray-400 py-6">
            尚無足夠趨勢數據，請多填報幾天日誌 📊
          </p>
        ) : (
          <div className="space-y-4">
            {/* 7日出入量對比卡片 */}
            <div className="space-y-2">
              {stats.map((day) => (
                <div
                  key={day.date}
                  className="p-3 bg-gray-50 rounded-2xl border border-gray-200 text-xs font-bold space-y-1.5"
                >
                  <div className="flex justify-between items-center text-gray-700">
                    <span className="font-black flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      {day.date}
                    </span>
                    <span
                      className={`font-black px-2 py-0.5 rounded-lg ${
                        day.net > 800
                          ? 'bg-red-100 text-red-700'
                          : 'bg-teal-100 text-teal-800'
                      }`}
                    >
                      淨滯留: {day.net} c.c.
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-1 text-[11px] text-gray-600">
                    <div>💧 攝入: <span className="font-black text-sky-700">{day.intake}</span> cc</div>
                    <div>🚽 排尿: <span className="font-black text-amber-700">{day.urine}</span> cc</div>
                    <div>💩 排便: <span className="font-black text-stone-700">{day.stoolCount}</span> 次</div>
                  </div>

                  {/* 當日血壓清單 */}
                  {day.bpLogs.length > 0 && (
                    <div className="text-[11px] text-rose-700 pt-1 border-t border-gray-200">
                      ❤️ 血壓紀錄: {day.bpLogs.map((b) => `${b.time}(${b.sys}/${b.dia})`).join('、 ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
