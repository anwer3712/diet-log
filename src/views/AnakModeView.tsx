import React, { useState } from 'react';
import { CareLogRecord } from '../types';
import { db } from '../db';
import confetti from 'canvas-confetti';
import { Sparkles, ArrowLeft, Droplets, Dumbbell, Activity, Check } from 'lucide-react';

interface AnakModeViewProps {
  onBack: () => void;
  caregiver: string;
}

export const AnakModeView: React.FC<AnakModeViewProps> = ({ onBack, caregiver }) => {
  const [selectedAction, setSelectedAction] = useState<'water' | 'rehab' | 'pee'>('water');
  const [waterAmount, setWaterAmount] = useState<number>(100);
  const [rehabTimes, setRehabTimes] = useState<number>(10);
  const [isDone, setIsDone] = useState<boolean>(false);

  const handleLog = async () => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0].substring(0, 5);

    let newRecord: CareLogRecord;

    if (selectedAction === 'water') {
      newRecord = {
        id: crypto.randomUUID(),
        date: dateStr,
        time: timeStr,
        timestamp: now.getTime(),
        type: '攝入',
        category: '飲水',
        amount: waterAmount,
        note: '兒童大字版填報',
        caregiver,
        syncStatus: 'pending',
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
    } else if (selectedAction === 'pee') {
      newRecord = {
        id: crypto.randomUUID(),
        date: dateStr,
        time: timeStr,
        timestamp: now.getTime(),
        type: '排出',
        category: '尿液',
        amount: 150,
        note: '兒童大字版填報',
        caregiver,
        syncStatus: 'pending',
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
    } else {
      newRecord = {
        id: crypto.randomUUID(),
        date: dateStr,
        time: timeStr,
        timestamp: now.getTime(),
        type: '運動',
        category: '雙手舉水瓶',
        amount: rehabTimes,
        note: '兒童大字版填報',
        caregiver,
        syncStatus: 'pending',
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
    }

    await db.logs.add(newRecord);
    confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
    setIsDone(true);
    setTimeout(() => setIsDone(false), 2500);
  };

  return (
    <div className="bg-white min-h-[85vh] rounded-3xl p-5 border-4 border-teal-600 shadow-xl space-y-6">
      {/* 頂部切換回一般版 */}
      <div className="flex items-center justify-between border-b-4 border-gray-200 pb-3">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-black text-sm px-4 py-2 rounded-2xl active:scale-95 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>返回常規版 / Kembali</span>
        </button>
        <span className="bg-teal-100 text-teal-800 font-black text-xs px-3 py-1.5 rounded-full border border-teal-300 flex items-center gap-1">
          <Sparkles className="w-4 h-4 text-teal-600" />
          <span>👶 遠視大字兒童版</span>
        </span>
      </div>

      {/* 步驟 1：選擇項目 */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-full bg-stone-900 text-white font-black text-xl flex items-center justify-center shadow-md">
            1
          </span>
          <h2 className="text-xl font-black text-gray-900">
            要記哪一項？ / Pilih apa?
          </h2>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setSelectedAction('water')}
            className={`p-4 rounded-3xl border-4 font-black flex flex-col items-center gap-2 transition-all ${
              selectedAction === 'water'
                ? 'border-teal-600 bg-teal-50 text-teal-900 shadow-md scale-102'
                : 'border-gray-300 text-gray-600 bg-gray-50'
            }`}
          >
            <Droplets className="w-10 h-10 text-sky-500" />
            <span className="text-base">喝水 / Air</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedAction('rehab')}
            className={`p-4 rounded-3xl border-4 font-black flex flex-col items-center gap-2 transition-all ${
              selectedAction === 'rehab'
                ? 'border-teal-600 bg-teal-50 text-teal-900 shadow-md scale-102'
                : 'border-gray-300 text-gray-600 bg-gray-50'
            }`}
          >
            <Dumbbell className="w-10 h-10 text-emerald-500" />
            <span className="text-base">復健 / Gerak</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedAction('pee')}
            className={`p-4 rounded-3xl border-4 font-black flex flex-col items-center gap-2 transition-all ${
              selectedAction === 'pee'
                ? 'border-teal-600 bg-teal-50 text-teal-900 shadow-md scale-102'
                : 'border-gray-300 text-gray-600 bg-gray-50'
            }`}
          >
            <Activity className="w-10 h-10 text-amber-500" />
            <span className="text-base">尿尿 / Pipis</span>
          </button>
        </div>
      </div>

      {/* 步驟 2：數值選擇 */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-full bg-stone-900 text-white font-black text-xl flex items-center justify-center shadow-md">
            2
          </span>
          <h2 className="text-xl font-black text-gray-900">
            {selectedAction === 'water'
              ? '喝了多少？ / Berapa banyak?'
              : selectedAction === 'rehab'
              ? '做了幾次？ / Berapa kali?'
              : '尿尿完成！ / Sudah Pipis!'}
          </h2>
        </div>

        {selectedAction === 'water' && (
          <div className="grid grid-cols-3 gap-2">
            {[100, 150, 200, 250, 300, 350].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setWaterAmount(amt)}
                className={`py-3.5 rounded-2xl border-4 text-xl font-black transition-all ${
                  waterAmount === amt
                    ? 'border-teal-600 bg-teal-500 text-white shadow-lg'
                    : 'border-gray-300 bg-white text-gray-800'
                }`}
              >
                {amt} cc
              </button>
            ))}
          </div>
        )}

        {selectedAction === 'rehab' && (
          <div className="grid grid-cols-3 gap-2">
            {[5, 10, 15, 20, 25, 30].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setRehabTimes(num)}
                className={`py-3.5 rounded-2xl border-4 text-xl font-black transition-all ${
                  rehabTimes === num
                    ? 'border-emerald-600 bg-emerald-500 text-white shadow-lg'
                    : 'border-gray-300 bg-white text-gray-800'
                }`}
              >
                {num} 次
              </button>
            ))}
          </div>
        )}

        {selectedAction === 'pee' && (
          <div className="p-4 bg-amber-50 rounded-2xl border-4 border-amber-300 text-center font-black text-base text-amber-900">
            💧 點擊下方大按鈕即可送出尿液記錄！
          </div>
        )}
      </div>

      {/* 步驟 3：大確認送出按鈕 */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleLog}
          className="w-full bg-teal-600 hover:bg-teal-700 active:scale-95 text-white rounded-3xl py-5 font-black text-2xl shadow-xl flex items-center justify-center gap-3 transition-all border-4 border-teal-800"
        >
          {isDone ? (
            <>
              <Check className="w-8 h-8 text-yellow-300" />
              <span>記好囉！ / Selesai! 🎉</span>
            </>
          ) : (
            <>
              <Sparkles className="w-7 h-7 text-yellow-300" />
              <span>確認送出 / Simpan Sekarang</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
