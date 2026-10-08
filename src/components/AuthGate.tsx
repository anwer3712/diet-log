import React, { useEffect, useState } from 'react';
import {
  CARE_AUTH_CLIENT_ID,
  getStoredToken,
  getDeviceKey,
  saveToken,
  saveDeviceKey,
  isAuthEnforced
} from '../auth/careAuth';
import { Language } from '../types';
import { Lock, KeyRound, AlertCircle } from 'lucide-react';

interface AuthGateProps {
  lang: Language;
  children: React.ReactNode;
}

declare global {
  interface Window {
    google?: any;
  }
}

export const AuthGate: React.FC<AuthGateProps> = ({ lang, children }) => {
  const [authed, setAuthed] = useState<boolean>(false);
  const [devKeyInput, setDevKeyInput] = useState<string>('');
  const [showDevKeyField, setShowDevKeyField] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [enforced, setEnforced] = useState<boolean>(true);

  // 檢查是否已具備授權（Google Token 或 Device Key 或未強制啟用）
  useEffect(() => {
    // 檢查 URL 中的 ?devkey=
    const params = new URLSearchParams(window.location.search);
    const urlDevKey = params.get('devkey');
    if (urlDevKey) {
      saveDeviceKey(urlDevKey);
      params.delete('devkey');
      const newUrl = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
      window.history.replaceState(null, '', newUrl);
    }

    const isEnforceActive = isAuthEnforced();
    setEnforced(isEnforceActive);

    const token = getStoredToken();
    const currentDevKey = getDeviceKey();

    if (!isEnforceActive || token || currentDevKey) {
      setAuthed(true);
      return;
    }

    // 載入 Google Identity Services Script
    if (!window.google && !document.getElementById('google-jssdk')) {
      const script = document.createElement('script');
      script.id = 'google-jssdk';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => initGoogleBtn();
      document.body.appendChild(script);
    } else if (window.google) {
      initGoogleBtn();
    }
  }, []);

  const initGoogleBtn = () => {
    if (!window.google?.accounts?.id) return;
    try {
      window.google.accounts.id.initialize({
        client_id: CARE_AUTH_CLIENT_ID,
        callback: handleGoogleResponse
      });
      const btnContainer = document.getElementById('g_id_signin_btn');
      if (btnContainer) {
        window.google.accounts.id.renderButton(btnContainer, {
          theme: 'filled_blue',
          size: 'large',
          text: 'signin_with',
          shape: 'pill'
        });
      }
    } catch (err) {
      console.warn('GIS init error:', err);
    }
  };

  const handleGoogleResponse = (res: any) => {
    if (res.credential) {
      saveToken(res.credential);
      setAuthed(true);
    } else {
      setErrorMsg(lang === 'zh' ? 'Google 驗證失敗' : 'Gagal verifikasi Google');
    }
  };

  const handleVerifyDevKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!devKeyInput.trim()) {
      setErrorMsg(lang === 'zh' ? '請輸入裝置金鑰' : 'Masukkan kunci perangkat');
      return;
    }
    saveDeviceKey(devKeyInput.trim());
    setAuthed(true);
  };

  // 當無須驗證或驗證通過時，渲染正常內容
  if (!enforced || authed) {
    return <>{children}</>;
  }

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl border-4 border-amber-400 space-y-5 animate-scale-up">
        <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <Lock className="w-8 h-8" />
        </div>

        <div className="space-y-1">
          <h2 className="text-xl font-black text-gray-900">
            {lang === 'zh' ? '陽光日誌 · 安全驗證閘門' : 'Gerbang Autentikasi Mentari'}
          </h2>
          <p className="text-xs font-bold text-gray-500">
            {lang === 'zh'
              ? '為防止照護個資與生理病歷外洩，請以 Google 帳號或專屬裝置金鑰解鎖'
              : 'Silakan masuk dengan akun Google atau kunci perangkat terdaftar untuk membuka data'}
          </p>
        </div>

        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold p-2.5 rounded-xl flex items-center gap-1.5 justify-center">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Google 登入按鈕容器 */}
        <div className="flex flex-col items-center justify-center pt-2">
          <div id="g_id_signin_btn" className="min-h-[44px] flex items-center justify-center"></div>
        </div>

        <div className="relative my-3">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-2 text-gray-400 font-bold">
              {lang === 'zh' ? '或使用裝置金鑰' : 'atau Kunci Perangkat'}
            </span>
          </div>
        </div>

        {/* 裝置金鑰輸入（給無 Google 帳號的看照人員手機） */}
        {!showDevKeyField ? (
          <button
            type="button"
            onClick={() => setShowDevKeyField(true)}
            className="w-full py-2.5 px-3 rounded-2xl border-2 border-dashed border-gray-300 text-gray-600 hover:text-gray-900 font-black text-xs flex items-center justify-center gap-1.5 transition-all"
          >
            <KeyRound className="w-4 h-4" />
            <span>{lang === 'zh' ? '輸入一次性裝置金鑰 (DevKey)' : 'Masukkan Kunci Perangkat'}</span>
          </button>
        ) : (
          <form onSubmit={handleVerifyDevKey} className="space-y-2">
            <input
              type="text"
              placeholder={lang === 'zh' ? '請貼上裝置金鑰...' : 'Tempel kunci di sini...'}
              value={devKeyInput}
              onChange={(e) => setDevKeyInput(e.target.value)}
              className="w-full bg-gray-50 border-2 border-gray-300 rounded-2xl py-2 px-3 text-sm font-bold text-gray-800 text-center focus:outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-600 text-white rounded-2xl py-2.5 font-black text-xs shadow-md transition-all active:scale-95"
            >
              {lang === 'zh' ? '驗證並進入' : 'Verifikasi & Masuk'}
            </button>
          </form>
        )}

        <div className="pt-2 text-[10px] text-gray-400 font-bold">
          🔒 Google OAuth 2.0 / Device Key Verified
        </div>
      </div>
    </div>
  );
};
