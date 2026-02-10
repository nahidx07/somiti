
import React, { useState } from 'react';
import { translations } from '../translations';
import { Language } from '../types';
import { Icons } from '../constants';

interface LoginProps {
  language: Language;
  onLogin: (id: string, pass: string) => void;
}

export const Login: React.FC<LoginProps> = ({ language, onLogin }) => {
  const [id, setId] = useState('');
  const [pass, setPass] = useState('');
  const t = translations[language];

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Dynamic Animated Background */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-blue-600/30 blur-[150px] rounded-full animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-900/40 blur-[150px] rounded-full delay-700 animate-pulse"></div>
      
      <div className="w-full max-w-md z-10 space-y-8">
        <div className="text-center space-y-3">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-700 rounded-3xl shadow-2xl shadow-blue-500/20 flex items-center justify-center text-white scale-110 mb-6">
            <Icons.Payments />
          </div>
          <h1 className="text-5xl font-black text-white tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
            {t.appName}
          </h1>
          <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px] bn-font">
            {language === 'bn' ? 'প্রিমিয়াম সমবায় ম্যানেজমেন্ট' : 'PREMIUM COOPERATIVE SYSTEM'}
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[3rem] p-8 shadow-2xl space-y-8 animate-in slide-in-from-bottom-10 duration-700">
          <div className="text-center">
            <h2 className="text-white text-lg font-bold tracking-wide">{t.login}</h2>
            <div className="h-1 w-8 bg-blue-500 mx-auto mt-2 rounded-full"></div>
          </div>

          <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); onLogin(id, pass); }}>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{t.username}</label>
              <input
                type="text"
                value={id}
                onChange={(e) => setId(e.target.value)}
                className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-slate-600 outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all font-bold"
                placeholder="Ex: A001"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{t.password}</label>
              <input
                type="password"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-slate-600 outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all font-bold"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-600/20 hover:bg-blue-500 active:scale-[0.97] transition-all flex items-center justify-center gap-3 group"
            >
              {t.login}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform group-hover:translate-x-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </form>
        </div>

        <p className="text-center text-slate-600 text-[9px] font-bold uppercase tracking-widest">
          Secured by Sanchay Encryption &copy; 2024
        </p>
      </div>
    </div>
  );
};
