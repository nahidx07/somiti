
import React, { useState, useEffect } from 'react';
import { User, UserRole, Language, Payment, AppSettings, PaymentType } from './types';
import { db } from './db';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { LandingPage } from './pages/LandingPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { MemberManagement } from './pages/MemberManagement';
import { MemberDashboard } from './pages/MemberDashboard';
import { PaymentEntry } from './pages/PaymentEntry';
import { MemberPaymentCenter } from './pages/MemberPaymentCenter';
import { ReportsOverview } from './pages/ReportsOverview';
import { PaymentSettings } from './pages/PaymentSettings';
import { NoticeBoard } from './pages/NoticeBoard';
import { translations } from './translations';
import { ChangePasswordModal } from './components/ChangePasswordModal';

const App: React.FC = () => {
  const [stage, setStage] = useState<'splash' | 'landing' | 'login' | 'app'>('splash');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [language, setLanguage] = useState<Language>('bn');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [members, setMembers] = useState<User[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPassModal, setShowPassModal] = useState(false);

  useEffect(() => {
    const initApp = async () => {
      try {
        await refreshData();
      } catch (e) {
        console.error("App initialization failed", e);
      } finally {
        setIsLoading(false);
        setTimeout(() => setStage('landing'), 2000);
      }
    };
    initApp();
  }, []);

  const refreshData = async () => {
    try {
      const [u, p, s] = await Promise.all([
        db.getUsers(),
        db.getPayments(),
        db.getSettings()
      ]);
      
      // Auto-create first admin if DB is empty
      if (u && u.length === 0) {
        const firstAdmin = await db.addMember({
          memberId: 'admin',
          nameEn: 'Main Admin',
          nameBn: 'প্রধান অ্যাডমিন',
          mobile: '01000000000',
          address: 'System',
          paymentType: PaymentType.MONTHLY,
          fixedAmount: 0,
          role: UserRole.MAIN_ADMIN,
          status: 'ACTIVE',
          password: 'admin123'
        });
        setMembers([firstAdmin]);
      } else {
        setMembers(u || []);
      }
      
      setPayments(p || []);
      setSettings(s);

      // Refresh current user data if logged in
      if (currentUser) {
        const updatedMe = u.find(user => user.id === currentUser.id);
        if (updatedMe) setCurrentUser(updatedMe);
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
      if (!settings) {
        const defaultSettings = await db.getSettings();
        setSettings(defaultSettings);
      }
    }
  };

  const handleLogin = (id: string, pass: string) => {
    const user = members.find(u => (u.memberId === id || u.mobile === id) && u.password === pass);
    if (user) {
      setCurrentUser(user);
      setStage('app');
      setActiveTab('dashboard');
    } else {
      alert('Invalid credentials!');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setStage('landing');
  };

  if (stage === 'splash' || !settings) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-transparent"></div>
        <div className="relative animate-in fade-in zoom-in-50 duration-1000 text-center">
           <div className="w-24 h-24 mx-auto rounded-3xl bg-white shadow-2xl p-4 flex items-center justify-center animate-bounce">
              <img src={settings?.logoUrl || "https://cdn-icons-png.flaticon.com/512/3258/3258446.png"} className="w-full h-full object-contain" alt="Logo" />
           </div>
           <h1 className="text-white font-black text-2xl mt-6 tracking-tighter">Sanchay Pro</h1>
           <div className="h-1 w-32 bg-white/10 mt-6 mx-auto rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 animate-[loading_2s_ease-in-out]"></div>
           </div>
        </div>
        <style>{`
          @keyframes loading { 0% { width: 0%; } 100% { width: 100%; } }
        `}</style>
      </div>
    );
  }

  if (stage === 'landing') {
    return <LandingPage language={language} settings={settings} onLoginClick={() => setStage('login')} />;
  }

  if (stage === 'login') {
    return <Login language={language} onLogin={handleLogin} />;
  }

  const renderContent = () => {
    if (!currentUser) return null;
    const isAdmin = currentUser.role === UserRole.MAIN_ADMIN || currentUser.role === UserRole.ADMIN;
    const t = translations[language];

    if (isAdmin) {
      switch (activeTab) {
        case 'dashboard': return <AdminDashboard members={members} payments={payments} language={language} />;
        case 'members': return <MemberManagement members={members} language={language} onRefresh={refreshData} />;
        case 'notices': return <NoticeBoard role={currentUser.role} language={language} />;
        case 'payments': return <PaymentEntry adminId={currentUser.id} members={members} payments={payments} language={language} onRefresh={refreshData} />;
        case 'reports': return <ReportsOverview members={members} payments={payments} language={language} />;
        case 'settings': return <PaymentSettings user={currentUser} language={language} onRefresh={refreshData} />;
        default: return <AdminDashboard members={members} payments={payments} language={language} />;
      }
    } else {
      switch (activeTab) {
        case 'dashboard': return <MemberDashboard member={currentUser} payments={payments} language={language} />;
        case 'history': return <MemberPaymentCenter member={currentUser} payments={payments} language={language} onRefresh={refreshData} />;
        case 'notices': return <NoticeBoard role={currentUser.role} language={language} />;
        case 'profile':
          return (
            <div className="space-y-6">
              <div className="flex flex-col items-center py-4 text-center">
                 <div className="w-28 h-28 rounded-[2.5rem] bg-indigo-600 text-white overflow-hidden flex items-center justify-center text-5xl font-black border-4 border-white shadow-2xl">
                   {currentUser.photoUrl ? (
                     <img src={currentUser.photoUrl} alt={currentUser.nameEn} className="w-full h-full object-cover" />
                   ) : (
                     language === 'en' ? currentUser.nameEn[0] : currentUser.nameBn[0]
                   )}
                 </div>
                 <h2 className="text-2xl font-black text-gray-900 mt-4 leading-tight">{language === 'en' ? currentUser.nameEn : currentUser.nameBn}</h2>
                 <p className="text-xs text-gray-400 font-black uppercase tracking-[0.2em] mt-1">ID: {currentUser.memberId}</p>
                 <div className="mt-4 px-4 py-2 bg-blue-50 border border-blue-100 rounded-2xl">
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Joined: {new Date(currentUser.joinedDate).toLocaleDateString()}</p>
                 </div>
              </div>
              
              <div className="bg-white rounded-[3rem] p-10 space-y-6 shadow-sm border border-slate-100">
                 <div>
                   <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Mobile</p>
                   <p className="font-bold text-gray-800 text-lg">{currentUser.mobile}</p>
                 </div>
                 <div>
                   <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Address</p>
                   <p className="font-bold text-gray-800 text-lg">{currentUser.address}</p>
                 </div>
                 
                 <div className="pt-4 border-t border-slate-50">
                    <button 
                      onClick={() => setShowPassModal(true)}
                      className="w-full bg-slate-50 text-slate-900 font-black py-5 rounded-2xl border border-slate-100 flex items-center justify-center gap-3 transition-all active:scale-95"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      {t.changePassword}
                    </button>
                 </div>
              </div>
            </div>
          );
        default: return <MemberDashboard member={currentUser} payments={payments} language={language} />;
      }
    }
  };

  return (
    <>
      <Layout
        title={settings.appName}
        role={currentUser?.role || UserRole.MEMBER}
        language={language}
        onLanguageChange={setLanguage}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={handleLogout}
      >
        {renderContent()}
      </Layout>

      {showPassModal && currentUser && (
        <ChangePasswordModal 
          user={currentUser} 
          language={language} 
          onClose={() => setShowPassModal(false)} 
          onSuccess={refreshData}
        />
      )}
    </>
  );
};

export default App;
