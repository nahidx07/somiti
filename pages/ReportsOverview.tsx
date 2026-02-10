
import React from 'react';
import { User, Payment, Language, PaymentStatus } from '../types';
import { translations } from '../translations';
import { Icons } from '../constants';
import { telegramService } from '../services/telegram';

interface Props {
  members: User[];
  payments: Payment[];
  language: Language;
}

export const ReportsOverview: React.FC<Props> = ({ members, payments, language }) => {
  const t = translations[language];

  const totalCollection = payments
    .filter(p => p.status !== PaymentStatus.PENDING)
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingApprovals = payments.filter(p => p.status === PaymentStatus.PENDING).length;

  const handleSendTelegramReport = () => {
    telegramService.notifyReportSummary({
      totalMembers: members.length,
      totalCollection: totalCollection,
      pendingApprovals: pendingApprovals
    });
    alert('Summary sent to Telegram Admin!');
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center px-2">
        <h2 className="text-3xl font-black text-slate-900 tracking-tighter">{t.reports}</h2>
        <button 
          onClick={handleSendTelegramReport}
          className="bg-indigo-600 text-white p-3 rounded-2xl shadow-lg shadow-indigo-500/20 active:scale-95 transition-all flex items-center gap-2"
        >
          <Icons.Reports />
          <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Send Summary</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
           <h3 className="font-black text-xs text-slate-400 uppercase tracking-widest">Active Member Balances</h3>
           <div className="space-y-3">
             {members.filter(m => m.status === 'ACTIVE').slice(0, 8).map(m => {
               const balance = payments
                .filter(p => p.memberId === m.memberId && p.status !== PaymentStatus.PENDING)
                .reduce((s, p) => s + p.amount, 0);
               return (
                 <div key={m.id} className="flex justify-between items-center py-3 border-b border-slate-50 last:border-0">
                   <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center font-bold text-slate-300 text-xs">
                       {m.photoUrl ? <img src={m.photoUrl} className="w-full h-full object-cover" /> : m.nameEn[0]}
                     </div>
                     <div>
                        <p className="font-black text-slate-800 text-sm leading-none">{language === 'en' ? m.nameEn : m.nameBn}</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">{m.memberId}</p>
                     </div>
                   </div>
                   <p className="text-sm font-black text-indigo-600">৳{balance.toLocaleString()}</p>
                 </div>
               );
             })}
           </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
           <h3 className="font-black text-xs text-slate-400 uppercase tracking-widest">Global Statistics</h3>
           <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-5 rounded-3xl">
                 <p className="text-[10px] font-bold text-blue-600 uppercase mb-1">{t.activeMembers}</p>
                 <p className="text-2xl font-black text-blue-900">{members.length}</p>
              </div>
              <div className="bg-emerald-50 p-5 rounded-3xl">
                 <p className="text-[10px] font-bold text-emerald-600 uppercase mb-1">Total Collection</p>
                 <p className="text-2xl font-black text-emerald-900">৳{totalCollection.toLocaleString()}</p>
              </div>
           </div>
        </div>

        <div className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-xl space-y-4 relative overflow-hidden group">
           <div className="relative z-10 space-y-4">
             <div className="flex justify-between items-center">
               <h3 className="font-black text-xs text-slate-400 uppercase tracking-[0.3em]">Quick Report</h3>
               <Icons.Reports />
             </div>
             <p className="text-sm text-slate-300 leading-relaxed">System is running efficiently. {pendingApprovals} payment requests are awaiting verification.</p>
             <button 
                onClick={() => alert('PDF generation feature requires backend integration. Local summary sent to Telegram.')}
                className="w-full bg-white text-slate-900 font-black py-4 rounded-2xl transition-all text-xs uppercase tracking-widest hover:bg-slate-100"
             >
               Export System Log
             </button>
           </div>
           <div className="absolute -bottom-10 -right-10 text-white/5 scale-[5] rotate-12 group-hover:rotate-45 transition-transform duration-1000">
              <Icons.Reports />
           </div>
        </div>
      </div>
    </div>
  );
};
