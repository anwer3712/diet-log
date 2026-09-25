import React, { useState } from 'react';
import { Language } from '../types';
import { t } from '../i18n';
import { AlertTriangle, Globe, User } from 'lucide-react';

interface HeaderProps {
  lang: Language;
  onLangChange: (lang: Language) => void;
  caregiver: string;
  onCaregiverChange: (caregiver: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  onLangChange,
  caregiver,
  onCaregiverChange
}) => {
  const [bedrailDismissed, setBedrailDismissed] = useState(false);

  return (
    <header className="mb-4">
      {/* 標題 */}
      <div className="text-center mb-3">
        <h1 className="text-2xl font-black text-[#FB8B7A] tracking-wide flex items-center justify-center gap-1.5 drop-shadow-sm">
          {t('appTitle', lang)}
        </h1>
        <p className="text-xs text-gray-500 font-bold mt-0.5">
          {t('appSub', lang)}
        </p>
      </div>

      {/* 使用者與語言切換列 */}
      <div className="flex items-center justify-between bg-white px-3 py-2 rounded-2xl border-2 border-stone-200 shadow-sm mb-3">
        {/* 照護者切換 */}
        <div className="flex items-center gap-1.5">
          <User className="w-4 h-4 text-gray-500" />
          <div className="flex gap-1 text-xs font-black">
            {['照顧者1', '照顧者2', '家屬'].map((u) => (
              <button
                key={u}
                onClick={() => onCaregiverChange(u)}
                className={`px-2 py-1 rounded-xl transition-all ${
                  caregiver === u
                    ? 'bg-[#FB8B7A] text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {u}
              </button>
            ))}
          </div>
        </div>

        {/* 語言切換 */}
        <div className="flex items-center gap-1">
          <Globe className="w-4 h-4 text-gray-500" />
          <div className="flex gap-1 text-xs font-black">
            <button
              onClick={() => onLangChange('zh')}
              className={`px-2 py-1 rounded-xl transition-all ${
                lang === 'zh'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              中文
            </button>
            <button
              onClick={() => onLangChange('id')}
              className={`px-2 py-1 rounded-xl transition-all ${
                lang === 'id'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Indo
            </button>
          </div>
        </div>
      </div>

      {/* 床圍欄安全警示 Banner */}
      {!bedrailDismissed && (
        <div className="bg-red-600 text-white rounded-2xl px-4 py-3 shadow-md flex items-start justify-between gap-2 border-2 border-red-700 animate-pulse">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-6 h-6 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-black leading-snug">
                {t('bedrailBanner', 'zh')}
              </p>
              <p className="text-xs font-bold text-red-100 mt-0.5 leading-snug">
                {t('bedrailBanner', 'id')}
              </p>
            </div>
          </div>
          <button
            onClick={() => setBedrailDismissed(true)}
            className="text-xs bg-red-800 hover:bg-red-900 px-2.5 py-1 rounded-xl font-bold shrink-0 self-center"
          >
            知道了 / Mengerti
          </button>
        </div>
      )}
    </header>
  );
};
