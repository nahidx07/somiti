
import React from 'react';
import { Language, AppSettings } from '../types';
import { translations } from '../translations';
import { Icons } from '../constants';

interface Props {
  language: Language;
  onLoginClick: () => void;
  settings: AppSettings;
}

export const LandingPage: React.FC<Props> = ({ language, onLoginClick, settings }) => {
  const t = translations[language];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100/50 rounded-full -mr-32 -mt-32 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-100/50 rounded-full -ml-32 -mb-32 blur-3xl"></div>

      <div className="max-w-md w-full text-center space-y-12 animate-in fade-in zoom-in-95 duration-700">
        <div className="space-y-6">
          <div className="mx-auto w-32 h-32 rounded-[2.5rem] bg-white shadow-2xl p-6 flex items-center justify-center transform hover:scale-110 transition-transform duration-500">
            <img src={settings.logoUrl} className="w-full h-full object-contain" alt="Logo" />
          </div>
          <div className="space-y-2">
            <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-tight">
              {settings.appName}
            </h1>
            <p className="text-slate-400 font-bold uppercase tracking-[0.4em] text-[10px] bn-font">
              {language === 'bn' ? 'সঞ্চয় ও ঋণদান সমবায় সমিতি' : 'PREMIUM COOPERATIVE SYSTEM'}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <button
            onClick={onLoginClick}
            className="w-full bg-blue-600 text-white font-black py-6 rounded-[2rem] shadow-2xl shadow-blue-500/30 active:scale-95 transition-all text-xl flex items-center justify-center gap-3"
          >
            {t.enterApp}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{t.welcome}</p>
        </div>
      </div>

      <div className="absolute bottom-10 left-0 right-0 text-center">
        <p className="text-slate-300 text-[10px] font-black uppercase tracking-[0.2em]">Version 2.0 Pro</p>
      </div>
    </div>
  );
};
