import React, { useState } from 'react';
import { RehabItem, REHAB_WARN_ITEMS } from '../clinical/rehabData';
import { Language } from '../types';
import { X, AlertTriangle, ShieldCheck } from 'lucide-react';

interface RehabModalProps {
  item: RehabItem | null;
  lang: Language;
  onClose: () => void;
}

export const RehabModal: React.FC<RehabModalProps> = ({ item, lang, onClose }) => {
  const [activeTab, setActiveTab] = useState<'demo' | 'errors'>('demo');

  if (!item) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* 彈窗頂部 */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-stone-50 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{item.icon}</span>
            <div>
              <h3 className="font-black text-gray-800 text-base leading-tight">
                {lang === 'zh' ? item.zh : item.id}
              </h3>
              <p className="text-[11px] text-gray-500 font-bold">
                {lang === 'zh' ? item.id : item.zh}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 font-black flex items-center justify-center active:scale-95 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 頁籤切換：示範教學 vs 錯誤姿勢與按摩 */}
        <div className="grid grid-cols-2 p-1.5 bg-gray-100 border-b border-gray-200 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('demo')}
            className={`py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === 'demo'
                ? 'bg-white text-emerald-800 shadow-sm border border-emerald-200'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            📖 {lang === 'zh' ? '分解教學示範' : 'Panduan Gerakan'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('errors')}
            className={`py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === 'errors'
                ? 'bg-white text-rose-800 shadow-sm border border-rose-200'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            ⚠️ {lang === 'zh' ? '錯誤示範與按摩' : 'Contoh Salah & Pijat'}
          </button>
        </div>

        {/* 彈窗內容滾動區 */}
        <div className="overflow-y-auto px-4 py-4 space-y-4">
          {activeTab === 'demo' ? (
            <>
              {/* 教學照片清單 */}
              <div className="space-y-3">
                {item.images.map((src, idx) => (
                  <div key={idx} className="relative rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-gray-50">
                    <img
                      src={src}
                      alt={`${item.zh} 示範 ${idx + 1}`}
                      className="w-full h-auto object-cover max-h-64 mx-auto rounded-2xl"
                      onError={(e) => {
                        // 若圖片路徑在子路徑，嘗試補正
                        const target = e.currentTarget;
                        if (!target.src.includes('legacy/')) {
                          target.src = `legacy/${src}`;
                        }
                      }}
                    />
                    <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {idx + 1} / {item.images.length}
                    </div>
                  </div>
                ))}
              </div>

              {/* 步驟說明 */}
              <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-3.5 space-y-2.5">
                <h4 className="text-xs font-black text-emerald-900 flex items-center gap-1.5 border-b border-emerald-200/80 pb-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>{lang === 'zh' ? '運動分解步驟' : 'Langkah Pelaksanaan'}</span>
                </h4>
                <div className="space-y-2">
                  {item.steps.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs">
                      <span className="shrink-0 w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] font-black flex items-center justify-center mt-0.5">
                        {idx + 1}
                      </span>
                      <div className="flex-1 space-y-0.5">
                        <p className="font-black text-gray-800 leading-snug">{step.zh}</p>
                        <p className="text-[11px] text-gray-600 font-medium leading-snug">{step.id}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 font-bold flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                <span>
                  {lang === 'zh'
                    ? '請對照下列姿勢防範受傷，並於運動間隔適度放鬆按摩肌肉。'
                    : 'Perhatikan postur salah di bawah ini & lakukan pijatan ringan di sela latihan.'}
                </span>
              </div>

              <div className="space-y-4">
                {REHAB_WARN_ITEMS.map((warn, i) => (
                  <div key={i} className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm bg-white p-2">
                    <img
                      src={warn.img}
                      alt={warn.zh}
                      className="w-full h-auto object-cover rounded-xl border border-gray-100"
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (!target.src.includes('legacy/')) {
                          target.src = `legacy/${warn.img}`;
                        }
                      }}
                    />
                    <div className="mt-2 px-1">
                      <p className={`text-xs font-black ${warn.bad ? 'text-red-600' : 'text-emerald-700'} flex items-center gap-1`}>
                        <span>{warn.bad ? '❌' : '💆'}</span>
                        <span>{warn.zh}</span>
                      </p>
                      <p className="text-[11px] text-gray-500 font-bold mt-0.5">{warn.id}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 底部關閉按鈕 */}
        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full bg-stone-700 hover:bg-stone-800 text-white rounded-2xl py-2.5 font-black text-sm active:scale-95 transition-all shadow-sm"
          >
            {lang === 'zh' ? '關閉教學指引' : 'Tutup Panduan'}
          </button>
        </div>
      </div>
    </div>
  );
};
