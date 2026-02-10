
import React from 'react';
import { Icons } from '../constants';
import { UserRole, Language } from '../types';
import { translations } from '../translations';
import { LanguageToggle } from './LanguageToggle';

interface LayoutProps {
  children: React.ReactNode;
  role: UserRole;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  title: string;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  role,
  language,
  onLanguageChange,
  activeTab,
  onTabChange,
  onLogout,
  title
}) => {
  const t = translations[language];

  const adminTabs = [
    { id: 'dashboard', label: t.dashboard, icon: Icons.Dashboard },
    { id: 'members', label: t.members, icon: Icons.Members },
    { id: 'notices', label: t.notices, icon: Icons.Reports },
    { id: 'payments', label: t.payments, icon: Icons.Payments },
    { id: 'reports', label: t.reports, icon: () => (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    )},
    { id: 'settings', label: t.settings, icon: () => (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ) },
  ];

  const memberTabs = [
    { id: 'dashboard', label: t.dashboard, icon: Icons.Dashboard },
    { id: 'notices', label: t.notices, icon: Icons.Reports },
    { id: 'history', label: t.payments, icon: Icons.Payments },
    { id: 'profile', label: t.profile, icon: Icons.Profile },
  ];

  const tabs = (role === UserRole.MAIN_ADMIN || role === UserRole.ADMIN) ? adminTabs : memberTabs;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-24">
      <header className="bg-white border-b sticky top-0 z-50 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-500/20">
            <Icons.Payments />
          </div>
          <h1 className="text-xl font-black text-slate-800 tracking-tighter">{title}</h1>
        </div>
        <div className="flex items-center space-x-4">
          <LanguageToggle current={language} onChange={onLanguageChange} />
          <button onClick={onLogout} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-lg mx-auto w-full overflow-x-hidden animate-in fade-in duration-500">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-100 px-6 py-3 flex justify-between items-center z-[60] shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center p-2 rounded-2xl transition-all min-w-[64px] ${
                isActive ? 'text-blue-600 bg-blue-50/50' : 'text-slate-400'
              }`}
            >
              <div className={isActive ? 'scale-110' : ''}>
                <Icon />
              </div>
              <span className={`text-[9px] mt-1 font-black uppercase tracking-widest ${language === 'bn' ? 'bn-font' : ''}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
