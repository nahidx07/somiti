
import React, { useState, useEffect } from 'react';
import { Language, PaymentMethod, AppSettings, User } from '../types';
import { translations } from '../translations';
import { Icons } from '../constants';
import { db } from '../db';
import { telegramService } from '../services/telegram';
import { ChangePasswordModal } from '../components/ChangePasswordModal';

interface Props {
  user: User;
  language: Language;
  onRefresh: () => void;
}

export const PaymentSettings: React.FC<Props> = ({ user, language, onRefresh }) => {
  const t = translations[language];
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [appSettings, setAppSettings] = useState<AppSettings>({
    appName: 'সঞ্চয় প্রো',
    logoUrl: 'https://cdn-icons-png.flaticon.com/512/3258/3258446.png',
    enableNotifications: false,
    telegramBotToken: '',
    telegramChatId: ''
  });
  const [showMethodModal, setShowMethodModal] = useState(false);
  const [showPassModal, setShowPassModal] = useState(false);
  const [editingMethodId, setEditingMethodId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', number: '', instructions: '' });

  useEffect(() => {
    const loadData = async () => {
      const [s, m] = await Promise.all([db.getSettings(), db.getMethods()]);
      setAppSettings(s);
      setMethods(m);
    };
    loadData();
  }, []);

  const handleSaveSettings = async () => {
    await db.saveSettings(appSettings);
    alert('Settings saved successfully!');
    window.location.reload();
  };

  const handleTestNotification = async () => {
    if (!appSettings.telegramBotToken || !appSettings.telegramChatId) {
      alert('Please fill Token and Chat ID first');
      return;
    }
    const currentEnabled = appSettings.enableNotifications;
    const testSettings = { ...appSettings, enableNotifications: true };
    await db.saveSettings(testSettings);
    
    await telegramService.sendMessage('🔔 <b>Test Notification</b>\n\nYour Sanchay Pro Telegram bot is connected successfully!');
    alert('Test message sent! Check your Telegram.');
    
    await db.saveSettings({ ...appSettings, enableNotifications: currentEnabled });
  };

  const resetMethodForm = () => {
    setFormData({ name: '', number: '', instructions: '' });
    setEditingMethodId(null);
  };

  const handleMethodSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMethodId) {
      await db.updateMethod(editingMethodId, formData);
    } else {
      await db.addMethod(formData);
    }
    const m = await db.getMethods();
    setMethods(m);
    setShowMethodModal(false);
    resetMethodForm();
  };

  const handleEditMethod = (method: PaymentMethod) => {
    setFormData({
      name: method.name,
      number: method.number,
      instructions: method.instructions || ''
    });
    setEditingMethodId(method.id);
    setShowMethodModal(true);
  };

  const deleteMethod = async (id: string) => {
    if (confirm('Are you sure?')) {
      await db.deleteMethod(id);
      const m = await db.getMethods();
      setMethods(m);
    }
  };

  return (
    <div className="space-y-10 pb-24 px-2">
      <div className="space-y-6">
        <h2 className="text-3xl font-black text-slate-900 tracking-tighter">{t.paymentSettings}</h2>
        
        {/* Admin Password Change */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-[3rem] text-white shadow-xl flex justify-between items-center group overflow-hidden relative">
           <div className="relative z-10">
              <h3 className="font-black text-lg">{t.profile}</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Logged as: {user.memberId}</p>
              <button 
                onClick={() => setShowPassModal(true)}
                className="mt-4 bg-white text-slate-900 font-black px-6 py-3 rounded-2xl text-[10px] uppercase tracking-widest active:scale-95 transition-all"
              >
                {t.changePassword}
              </button>
           </div>
           <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center scale-[2] translate-x-4">
              <Icons.Profile />
           </div>
        </div>

        {/* Branding Settings */}
        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
           <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">General Branding</h3>
           <div className="space-y-4">
              <div className="space-y-1">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">App Title</label>
                 <input className="w-full bg-slate-50 border border-slate-100 p-5 rounded-3xl outline-none font-bold" value={appSettings.appName} onChange={e => setAppSettings({...appSettings, appName: e.target.value})} />
              </div>
              <div className="space-y-1">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.logoUrl}</label>
                 <input className="w-full bg-slate-50 border border-slate-100 p-5 rounded-3xl outline-none font-bold text-blue-600" value={appSettings.logoUrl} onChange={e => setAppSettings({...appSettings, logoUrl: e.target.value})} />
              </div>
           </div>
        </div>

        {/* Telegram Notifications */}
        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
           <div className="flex justify-between items-center">
             <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">{t.telegramConfig}</h3>
             <button 
               onClick={() => setAppSettings({...appSettings, enableNotifications: !appSettings.enableNotifications})}
               className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase transition-all ${appSettings.enableNotifications ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}
             >
               {appSettings.enableNotifications ? t.enabled : t.disabled}
             </button>
           </div>
           
           <div className="space-y-4">
              <div className="space-y-1">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.botToken}</label>
                 <input 
                  type="password"
                  className="w-full bg-slate-50 border border-slate-100 p-5 rounded-3xl outline-none font-medium text-xs" 
                  value={appSettings.telegramBotToken} 
                  onChange={e => setAppSettings({...appSettings, telegramBotToken: e.target.value})} 
                  placeholder="0000000000:AAxxxxxxxxxxxxxxxxxxx"
                 />
              </div>
              <div className="space-y-1">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.chatId}</label>
                 <input 
                  className="w-full bg-slate-50 border border-slate-100 p-5 rounded-3xl outline-none font-bold" 
                  value={appSettings.telegramChatId} 
                  onChange={e => setAppSettings({...appSettings, telegramChatId: e.target.value})} 
                  placeholder="-100xxxxxxxxx"
                 />
              </div>
              <button 
                onClick={handleTestNotification}
                className="w-full bg-indigo-50 text-indigo-600 font-bold py-4 rounded-2xl text-xs uppercase tracking-widest hover:bg-indigo-100 transition-colors"
              >
                {t.testNotification}
              </button>
           </div>
        </div>

        <button onClick={handleSaveSettings} className="w-full bg-blue-600 text-white font-black py-6 rounded-3xl shadow-xl shadow-blue-500/20 active:scale-95 transition-all uppercase tracking-[0.2em] text-sm">
           Save All Settings
        </button>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-center px-2">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">{t.paymentMethods}</h3>
          <button onClick={() => { resetMethodForm(); setShowMethodModal(true); }} className="text-blue-600 bg-blue-50 p-3 rounded-full"><Icons.Add /></button>
        </div>

        <div className="space-y-4">
          {methods.map(method => (
            <div key={method.id} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex justify-between items-start group">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                   <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 font-black text-sm">
                      {method.name[0]}
                   </div>
                   <h3 className="font-black text-slate-800">{method.name}</h3>
                </div>
                <p className="text-xl font-black text-slate-900 tracking-tight">{method.number}</p>
                {method.instructions && <p className="text-xs text-slate-400 font-medium">{method.instructions}</p>}
              </div>
              <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => handleEditMethod(method)} 
                  className="p-3 text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                >
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                   </svg>
                </button>
                <button 
                  onClick={() => deleteMethod(method.id)} 
                  className="p-3 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                >
                   <Icons.Close />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showMethodModal && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-t-[3rem] sm:rounded-[3rem] p-10 shadow-2xl animate-in slide-in-from-bottom duration-500">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{editingMethodId ? t.editMethod : t.addMethod}</h3>
              <button onClick={() => setShowMethodModal(false)} className="text-slate-400"><Icons.Close /></button>
            </div>
            <form onSubmit={handleMethodSubmit} className="space-y-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.methodName}</label>
                <input required className="w-full bg-slate-50 border border-slate-100 p-5 rounded-3xl outline-none font-bold" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="BKash / Nagad" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.accountNumber}</label>
                <input required className="w-full bg-slate-50 border border-slate-100 p-5 rounded-3xl outline-none font-black" value={formData.number} onChange={e => setFormData({...formData, number: e.target.value})} placeholder="017..." />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.instructions}</label>
                <textarea className="w-full bg-slate-50 border border-slate-100 p-5 rounded-3xl outline-none resize-none font-medium" value={formData.instructions} onChange={e => setFormData({...formData, instructions: e.target.value})} placeholder="..." />
              </div>
              <button type="submit" className="w-full bg-slate-900 text-white font-black py-6 rounded-3xl shadow-2xl active:scale-95 transition-all text-lg uppercase tracking-widest">
                {editingMethodId ? t.update : t.save}
              </button>
            </form>
          </div>
        </div>
      )}

      {showPassModal && (
        <ChangePasswordModal 
          user={user} 
          language={language} 
          onClose={() => setShowPassModal(false)} 
          onSuccess={onRefresh}
        />
      )}
    </div>
  );
};
