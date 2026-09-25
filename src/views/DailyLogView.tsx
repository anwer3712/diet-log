import React, { useState } from 'react';
import { CareType, Language, CareLogRecord } from '../types';
import { t, typeLabels, intakeLabels, outputLabels } from '../i18n';
import { db } from '../db';
import { syncLogsToCloud } from '../db/sync';
import confetti from 'canvas-confetti';
import { Clock, Plus, Trash2, Check, RefreshCw, Activity, Droplets, Heart, Dumbbell } from 'lucide-react';

interface DailyLogViewProps {
  lang: Language;
  caregiver: string;
  todayLogs: CareLogRecord[];
  onRefresh: () => void;
}

export const DailyLogView: React.FC<DailyLogViewProps> = ({
  lang,
  caregiver,
  todayLogs,
  onRefresh
}) => {
  const [selectedType, setSelectedType] = useState<CareType>('攝入');
  const [category, setCategory] = useState<string>('飲水');
  const [amount, setAmount] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState<string>(
    new Date().toTimeString().split(' ')[0].substring(0, 5)
  );

  // 血壓專用狀態
  const [bpSys, setBpSys] = useState<string>('120');
  const [bpDia, setBpDia] = useState<string>('80');
  const [bpHr, setBpHr] = useState<string>('72');

  // 排出專用狀態
  const [stoolStatus, setStoolStatus] = useState<string>('正常');
  const [urineColor, setUrineColor] = useState<string>('正常淡黃');

  const [isSubmitting, setIsSubmitting] = useState(false);

  // 設置時間為現在
  const handleSetNow = () => {
    const now = new Date();
    setDate(now.toISOString().split('T')[0]);
    setTime(now.toTimeString().split(' ')[0].substring(0, 5));
  };

  // 快捷加水按鈕
  const handleQuickAdd = async (quickAmount: number, quickCategory: string = '飲水') => {
    const now = new Date();
    const newLog: CareLogRecord = {
      id: crypto.randomUUID(),
      date: now.toISOString().split('T')[0],
      time: now.toTimeString().split(' ')[0].substring(0, 5),
      timestamp: now.getTime(),
      type: '攝入',
      category: quickCategory,
      amount: quickAmount,
      note: '快捷鍵填報',
      caregiver,
      syncStatus: 'pending',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    await db.logs.add(newLog);
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
    onRefresh();
    syncLogsToCloud().then(() => onRefresh());
  };

  // 表單送出
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const now = Date.now();
      const parsedAmount = amount ? parseInt(amount, 10) : undefined;

      const newLog: CareLogRecord = {
        id: crypto.randomUUID(),
        date,
        time,
        timestamp: new Date(`${date}T${time}`).getTime() || now,
        type: selectedType,
        category,
        amount: parsedAmount,
        note,
        caregiver,
        bpSys: selectedType === '血壓' ? parseInt(bpSys, 10) : undefined,
        bpDia: selectedType === '血壓' ? parseInt(bpDia, 10) : undefined,
        bpHr: selectedType === '血壓' ? parseInt(bpHr, 10) : undefined,
        stoolStatus: selectedType === '排出' && category === '排便' ? stoolStatus : undefined,
        urineColor: selectedType === '排出' && category === '尿液' ? urineColor : undefined,
        syncStatus: 'pending',
        createdAt: now,
        updatedAt: now
      };

      await db.logs.add(newLog);

      // 重設表單
      setAmount('');
      setNote('');
      handleSetNow();

      confetti({ particleCount: 50, spread: 70, origin: { y: 0.85 } });
      onRefresh();

      // 背景靜默同步
      syncLogsToCloud().then(() => onRefresh());
    } finally {
      setIsSubmitting(false);
    }
  };

  // 刪除記錄
  const handleDelete = async (id: string) => {
    if (confirm(lang === 'zh' ? '確定刪除此記錄？' : 'Hapus catatan ini?')) {
      await db.logs.delete(id);
      onRefresh();
    }
  };

  return (
    <div className="space-y-4">
      {/* 快捷一鍵補水區 (床邊極速填報) */}
      <div className="bg-sky-50 border-2 border-sky-300 rounded-3xl p-3 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-black text-sky-800 flex items-center gap-1">
            ⚡ {t('quickAdd', lang)}
          </span>
          <span className="text-[11px] text-sky-600 font-bold">單手秒錄入</span>
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {[100, 150, 200, 250].map((vol) => (
            <button
              key={vol}
              type="button"
              onClick={() => handleQuickAdd(vol, '飲水')}
              className="bg-white hover:bg-sky-100 active:scale-95 border-2 border-sky-200 text-sky-800 py-2.5 rounded-2xl font-black text-sm shadow-sm transition-all"
            >
              +{vol}cc
            </button>
          ))}
        </div>
      </div>

      {/* 主填報表單卡片 */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-4 shadow-sm border-2 border-stone-200 space-y-4">
        {/* 四大類別切換頁籤 */}
        <div className="grid grid-cols-4 gap-1.5 bg-gray-50 p-1.5 rounded-2xl border border-gray-200">
          <button
            type="button"
            onClick={() => {
              setSelectedType('攝入');
              setCategory('飲水');
            }}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl font-black text-xs transition-all ${
              selectedType === '攝入'
                ? 'bg-sky-500 text-white shadow-sm border-2 border-sky-600'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Droplets className="w-5 h-5 mb-0.5" />
            <span>{typeLabels.intake[lang]}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedType('排出');
              setCategory('尿液');
            }}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl font-black text-xs transition-all ${
              selectedType === '排出'
                ? 'bg-amber-500 text-white shadow-sm border-2 border-amber-600'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Activity className="w-5 h-5 mb-0.5" />
            <span>{typeLabels.output[lang]}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedType('運動');
              setCategory('寶特瓶舉起');
            }}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl font-black text-xs transition-all ${
              selectedType === '運動'
                ? 'bg-emerald-500 text-white shadow-sm border-2 border-emerald-600'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Dumbbell className="w-5 h-5 mb-0.5" />
            <span>{typeLabels.exercise[lang]}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedType('血壓');
              setCategory('一般血壓');
            }}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl font-black text-xs transition-all ${
              selectedType === '血壓'
                ? 'bg-rose-500 text-white shadow-sm border-2 border-rose-600'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Heart className="w-5 h-5 mb-0.5" />
            <span>{typeLabels.bp[lang]}</span>
          </button>
        </div>

        {/* 日期與時間選擇 */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">📅 日期 / Tanggal</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-gray-50 border-2 border-gray-300 rounded-2xl py-2 px-2.5 text-sm font-bold text-gray-800 focus:outline-none focus:border-[#FB8B7A]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">🕐 時間 / Waktu</label>
            <div className="flex gap-1">
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="flex-1 bg-gray-50 border-2 border-gray-300 rounded-2xl py-2 px-2 text-sm font-bold text-gray-800 focus:outline-none focus:border-[#FB8B7A]"
              />
              <button
                type="button"
                onClick={handleSetNow}
                className="bg-gray-800 text-white px-2 rounded-2xl text-[10px] font-black shrink-0 active:scale-95"
              >
                現在
              </button>
            </div>
          </div>
        </div>

        {/* 依類別動態渲染子項 */}
        {selectedType === '攝入' && (
          <div className="space-y-3">
            <label className="block text-xs font-bold text-gray-500">項目 / Item</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: '飲水', label: intakeLabels.water[lang] },
                { key: '服藥飲水', label: intakeLabels.medicine[lang] },
                { key: '營養飲品', label: intakeLabels.nutrition[lang] },
                { key: '進食', label: intakeLabels.food[lang] }
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setCategory(item.key)}
                  className={`p-3 rounded-2xl border-2 font-black text-sm flex items-center justify-center gap-2 transition-all ${
                    category === item.key
                      ? 'border-sky-500 bg-sky-50 text-sky-800 shadow-sm'
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {category === item.key && <Check className="w-4 h-4 text-sky-600" />}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">
                {t('amount', lang)}
              </label>
              <div className="relative">
                <input
                  type="number"
                  placeholder="例如 150"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-gray-50 border-2 border-gray-300 rounded-2xl py-3 px-3 text-2xl font-black text-gray-900 focus:outline-none focus:border-sky-500"
                  required
                />
                <span className="absolute right-4 top-4 text-gray-500 font-bold text-sm">c.c.</span>
              </div>
            </div>
          </div>
        )}

        {selectedType === '排出' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setCategory('尿液')}
                className={`p-3 rounded-2xl border-2 font-black text-sm transition-all ${
                  category === '尿液'
                    ? 'border-amber-500 bg-amber-50 text-amber-800'
                    : 'border-gray-200 text-gray-700'
                }`}
              >
                💧 {outputLabels.urine[lang]}
              </button>
              <button
                type="button"
                onClick={() => setCategory('排便')}
                className={`p-3 rounded-2xl border-2 font-black text-sm transition-all ${
                  category === '排便'
                    ? 'border-amber-500 bg-amber-50 text-amber-800'
                    : 'border-gray-200 text-gray-700'
                }`}
              >
                💩 {outputLabels.stool[lang]}
              </button>
            </div>

            {category === '尿液' ? (
              <>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">尿量 / Jumlah Urine (c.c.)</label>
                  <input
                    type="number"
                    placeholder="例如 200"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-gray-50 border-2 border-gray-300 rounded-2xl py-3 px-3 text-2xl font-black text-gray-900 focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">尿液顏色 / Warna Urine</label>
                  <div className="grid grid-cols-4 gap-1.5 text-xs font-bold">
                    {['正常淡黃', '深黃色', '濃茶色', '血尿/紅色'].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setUrineColor(c)}
                        className={`p-2 rounded-xl border text-center transition-all ${
                          urineColor === c
                            ? 'border-amber-500 bg-amber-100 text-amber-900 font-black'
                            : 'border-gray-200 text-gray-600'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">排便狀態 / Status BAB</label>
                <div className="grid grid-cols-4 gap-1.5 text-xs font-bold">
                  {['正常軟便', '硬便/乾結', '糊狀便', '腹瀉水便'].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStoolStatus(s)}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        stoolStatus === s
                          ? 'border-amber-500 bg-amber-100 text-amber-900 font-black'
                          : 'border-gray-200 text-gray-600'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {selectedType === '運動' && (
          <div className="space-y-3">
            <label className="block text-xs font-bold text-gray-500">復健項目 / Latihan</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: '寶特瓶舉起', label: '寶特瓶舉起 / Botol' },
                { key: '腳踩腳踝幫浦', label: '腳踝幫浦 / Pompa Kaki' },
                { key: '膝蓋彎曲', label: '膝蓋彎曲 / Tekuk Lutut' },
                { key: '直腿抬高', label: '直腿抬高 / Angkat Kaki' },
                { key: '站立平衡', label: '站立平衡 / Berdiri' }
              ].map((ex) => (
                <button
                  key={ex.key}
                  type="button"
                  onClick={() => setCategory(ex.key)}
                  className={`p-3 rounded-2xl border-2 font-black text-xs flex items-center justify-center text-center transition-all ${
                    category === ex.key
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                      : 'border-gray-200 text-gray-700'
                  }`}
                >
                  {ex.label}
                </button>
              ))}
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">完成次數 / Jumlah (次)</label>
              <input
                type="number"
                placeholder="例如 10"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-gray-50 border-2 border-gray-300 rounded-2xl py-2.5 px-3 text-lg font-black text-gray-900"
              />
            </div>
          </div>
        )}

        {selectedType === '血壓' && (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] font-black text-rose-700 mb-1">
                  收縮壓 (Sys)
                </label>
                <input
                  type="number"
                  value={bpSys}
                  onChange={(e) => setBpSys(e.target.value)}
                  className="w-full bg-rose-50 border-2 border-rose-300 rounded-2xl py-2.5 text-center text-2xl font-black text-rose-950 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-black text-rose-700 mb-1">
                  舒張壓 (Dia)
                </label>
                <input
                  type="number"
                  value={bpDia}
                  onChange={(e) => setBpDia(e.target.value)}
                  className="w-full bg-rose-50 border-2 border-rose-300 rounded-2xl py-2.5 text-center text-2xl font-black text-rose-950 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-black text-rose-700 mb-1">
                  心率 (HR)
                </label>
                <input
                  type="number"
                  value={bpHr}
                  onChange={(e) => setBpHr(e.target.value)}
                  className="w-full bg-rose-50 border-2 border-rose-300 rounded-2xl py-2.5 text-center text-2xl font-black text-rose-950 focus:outline-none"
                  required
                />
              </div>
            </div>
            <p className="text-[11px] text-gray-500 font-bold">
              💡 測量指南：測量前靜止 15 分鐘，目標建議 &lt; 130/80 mmHg。
            </p>
          </div>
        )}

        {/* 備註 */}
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1">
            {t('note', lang)}
          </label>
          <input
            type="text"
            placeholder="長輩胃口、排便順暢等情況..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full bg-gray-50 border-2 border-gray-300 rounded-2xl py-2.5 px-3 text-sm font-bold text-gray-800"
          />
        </div>

        {/* 送出按鈕 */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[#FB8B7A] hover:bg-[#F4726B] text-white py-3.5 rounded-2xl font-black text-base shadow-md active:scale-98 transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          <span>{isSubmitting ? t('saving', lang) : t('save', lang)}</span>
        </button>
      </form>

      {/* 今日記錄時間軸 */}
      <div className="bg-white rounded-3xl p-4 shadow-sm border-2 border-stone-200">
        <div className="flex items-center justify-between mb-3 border-b pb-2">
          <h4 className="font-black text-gray-800 flex items-center gap-1.5 text-sm">
            <Clock className="w-4 h-4 text-gray-500" />
            <span>今日詳細記錄 ({todayLogs.length})</span>
          </h4>
          <button
            onClick={() => syncLogsToCloud().then(() => onRefresh())}
            className="text-xs text-sky-600 hover:text-sky-800 font-black flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>雲端同步</span>
          </button>
        </div>

        {todayLogs.length === 0 ? (
          <p className="text-center text-xs font-bold text-gray-400 py-6">
            今天尚無記錄，點擊上方按鈕開始填報 📝
          </p>
        ) : (
          <div className="space-y-2">
            {todayLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-2.5 bg-gray-50 rounded-2xl border border-gray-200 text-xs font-bold"
              >
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 font-mono text-[11px]">{log.time}</span>
                  <span className="px-2 py-0.5 rounded-lg bg-white border border-gray-300 font-black">
                    {log.category}
                  </span>
                  {log.amount && (
                    <span className="text-sky-700 font-black text-sm">
                      {log.amount} {log.type === '運動' ? '次' : 'c.c.'}
                    </span>
                  )}
                  {log.bpSys && (
                    <span className="text-rose-700 font-black">
                      {log.bpSys}/{log.bpDia} ({log.bpHr}bpm)
                    </span>
                  )}
                  {log.stoolStatus && (
                    <span className="text-amber-800 font-black">[{log.stoolStatus}]</span>
                  )}
                  {log.urineColor && (
                    <span className="text-amber-700">({log.urineColor})</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                      log.syncStatus === 'synced'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {log.syncStatus === 'synced' ? '已同步' : '待同步'}
                  </span>
                  <button
                    onClick={() => handleDelete(log.id)}
                    className="text-gray-400 hover:text-red-500 p-1"
                    title="刪除"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
