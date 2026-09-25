import React, { useEffect, useState } from 'react';
import { CareLogRecord, Language } from '../types';
import { db } from '../db';
import { Printer, FileText } from 'lucide-react';

interface ReportViewProps {
  lang: Language;
}

interface ReportRow {
  date: string;
  intakeWater: number;
  intakeOther: number;
  intakeTotal: number;
  urineTotal: number;
  netRetention: number;
  bpMorning?: string;
  bpEvening?: string;
  stoolNotes: string;
}

export const ReportView: React.FC<ReportViewProps> = ({ lang }) => {
  const [rows, setRows] = useState<ReportRow[]>([]);

  useEffect(() => {
    generateReport();
  }, []);

  const generateReport = async () => {
    const logs = await db.logs.toArray();
    const groups: Record<string, CareLogRecord[]> = {};

    logs.forEach((log) => {
      if (!groups[log.date]) groups[log.date] = [];
      groups[log.date].push(log);
    });

    const dates = Object.keys(groups).sort().slice(-7); // 近7天

    const reportData: ReportRow[] = dates.map((d) => {
      const dayLogs = groups[d];
      
      const water = dayLogs
        .filter((l) => l.type === '攝入' && l.category === '飲水')
        .reduce((sum, l) => sum + (l.amount || 0), 0);

      const other = dayLogs
        .filter((l) => l.type === '攝入' && l.category !== '飲水')
        .reduce((sum, l) => sum + (l.amount || 0), 0);

      const urine = dayLogs
        .filter((l) => l.type === '排出' && l.category === '尿液')
        .reduce((sum, l) => sum + (l.amount || 0), 0);

      const bpList = dayLogs.filter((l) => l.type === '血壓' && l.bpSys);
      const morningBp = bpList.find((b) => parseInt(b.time.split(':')[0], 10) < 12);
      const eveningBp = bpList.find((b) => parseInt(b.time.split(':')[0], 10) >= 17);

      const stools = dayLogs
        .filter((l) => l.type === '排出' && l.category === '排便')
        .map((l) => l.stoolStatus || '排便1次');

      return {
        date: d,
        intakeWater: water,
        intakeOther: other,
        intakeTotal: water + other,
        urineTotal: urine,
        netRetention: water + other - urine,
        bpMorning: morningBp ? `${morningBp.bpSys}/${morningBp.bpDia} (${morningBp.bpHr})` : '-',
        bpEvening: eveningBp ? `${eveningBp.bpSys}/${eveningBp.bpDia} (${eveningBp.bpHr})` : '-',
        stoolNotes: stools.length > 0 ? stools.join(', ') : '無排便'
      };
    });

    setRows(reportData);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* 頂部操作按鈕 */}
      <div className="flex justify-between items-center bg-white p-4 rounded-3xl border-2 border-stone-200 shadow-sm print:hidden">
        <div>
          <h3 className="font-black text-gray-800 flex items-center gap-1.5 text-base">
            <FileText className="w-5 h-5 text-[#FB8B7A]" />
            <span>{lang === 'zh' ? '醫師回診一頁紙報告' : 'Laporan Kunjungan Dokter'}</span>
          </h3>
          <p className="text-xs text-gray-500 font-bold mt-0.5">
            提供腎臟科/心臟科醫師 5 秒內閱覽 24 小時出入量與血壓
          </p>
        </div>
        <button
          onClick={handlePrint}
          className="bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-2xl text-xs font-black flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
        >
          <Printer className="w-4 h-4" />
          <span>列印 / 匯出 PDF</span>
        </button>
      </div>

      {/* 列印內容區塊 */}
      <div className="bg-white p-5 rounded-3xl border-2 border-stone-200 shadow-sm print:border-none print:shadow-none print:p-0">
        <div className="text-center pb-3 border-b-2 border-gray-800 mb-4">
          <h2 className="text-xl font-black text-gray-900">
            陽光照護日誌 — 長者臨床日常數據匯總表
          </h2>
          <p className="text-xs text-gray-600 font-bold mt-1">
            記錄區間：近 7 天健康日誌 | 報表生成時間: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* 核心表格 */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-800 font-black border-y-2 border-gray-300">
                <th className="p-2">日期</th>
                <th className="p-2">飲水 (cc)</th>
                <th className="p-2">其他攝入 (cc)</th>
                <th className="p-2 text-sky-800">總攝入 (cc)</th>
                <th className="p-2 text-amber-800">尿量 (cc)</th>
                <th className="p-2">淨差額 (cc)</th>
                <th className="p-2 text-rose-800">晨間血壓</th>
                <th className="p-2 text-rose-800">睡前血壓</th>
                <th className="p-2">排便狀態</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 font-bold text-gray-700">
              {rows.map((r) => (
                <tr key={r.date} className="hover:bg-gray-50">
                  <td className="p-2 font-mono font-black">{r.date}</td>
                  <td className="p-2">{r.intakeWater}</td>
                  <td className="p-2">{r.intakeOther}</td>
                  <td className="p-2 font-black text-sky-700">{r.intakeTotal}</td>
                  <td className="p-2 font-black text-amber-700">{r.urineTotal}</td>
                  <td className={`p-2 font-black ${r.netRetention > 800 ? 'text-red-600' : 'text-gray-900'}`}>
                    {r.netRetention}
                  </td>
                  <td className="p-2 font-mono">{r.bpMorning}</td>
                  <td className="p-2 font-mono">{r.bpEvening}</td>
                  <td className="p-2">{r.stoolNotes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 醫師備註簽章區 (列印友善) */}
        <div className="mt-8 pt-4 border-t-2 border-dashed border-gray-300 grid grid-cols-2 gap-4 text-xs font-bold text-gray-700">
          <div>
            <p className="font-black text-gray-900 mb-2">📌 照顧者說明：</p>
            <p className="text-gray-500">所有數據由家庭照顧者與長輩日常定時秤重測量記錄。</p>
          </div>
          <div>
            <p className="font-black text-gray-900 mb-2">🩺 醫師醫囑與診斷備忘：</p>
            <div className="h-14 border border-gray-300 rounded-xl bg-gray-50" />
          </div>
        </div>
      </div>
    </div>
  );
};
