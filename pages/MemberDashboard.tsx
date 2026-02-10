
import React from 'react';
import { User, Payment, Language } from '../types';
import { translations } from '../translations';
import { Icons } from '../constants';

interface Props {
  member: User;
  payments: Payment[];
  language: Language;
}

export const MemberDashboard: React.FC<Props> = ({ member, payments, language }) => {
  const t = translations[language];
  const myPayments = payments.filter(p => p.memberId === member.memberId);
  const totalDeposited = myPayments.filter(p => p.status !== 'PENDING').reduce((sum, p) => sum + p.amount, 0);
  const lastPayment = myPayments.filter(p => p.status !== 'PENDING').length > 0 ? [...myPayments].filter(p => p.status !== 'PENDING').pop() : null;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center space-x-4">
        <div className="w-20 h-20 rounded-[1.5rem] bg-indigo-600 text-white overflow-hidden flex items-center justify-center text-3xl font-bold border-4 border-slate-50">
          {member.photoUrl ? (
            <img src={member.photoUrl} alt={member.nameEn} className="w-full h-full object-cover" />
          ) : (
            language === 'en' ? member.nameEn[0] : member.nameBn[0]
          )}
        </div>
        <div>
          <h2 className="text-2xl font-black text-gray-900 leading-tight">{language === 'en' ? member.nameEn : member.nameBn}</h2>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">ID: {member.memberId}</p>
          <div className="mt-2 inline-block px-3 py-1 bg-slate-50 rounded-full border border-slate-100">
             <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{t.memberSince}: {new Date(member.joinedDate).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-8 rounded-[2rem] text-white shadow-xl relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-emerald-50 text-xs font-bold uppercase tracking-widest opacity-80">{t.totalDeposited}</p>
            <h3 className="text-5xl font-black mt-2 tracking-tighter">৳{totalDeposited.toLocaleString()}</h3>
          </div>
          <div className="absolute -bottom-6 -right-6 text-white/10 scale-[3] transform group-hover:rotate-12 transition-transform duration-700">
            <Icons.Payments />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-[1.5rem] shadow-sm border border-gray-100">
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2">{t.lastPayment}</p>
            <p className="text-xl font-black text-gray-900">৳{lastPayment ? lastPayment.amount : 0}</p>
            <p className="text-[10px] text-gray-400 font-medium">{lastPayment ? new Date(lastPayment.date).toLocaleDateString() : '-'}</p>
          </div>
          <div className="bg-white p-5 rounded-[1.5rem] shadow-sm border border-gray-100">
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2">{t.paymentType}</p>
            <p className="text-xl font-black text-blue-600">{member.paymentType}</p>
            <p className="text-[10px] text-gray-400 font-medium">Fixed: ৳{member.fixedAmount}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4 px-2">
        <h4 className="font-black text-gray-900 uppercase tracking-widest text-xs">{t.recentTransactions}</h4>
        <div className="space-y-3">
          {myPayments.length > 0 ? (
            [...myPayments].reverse().map(p => (
              <div key={p.id} className="bg-white p-4 rounded-2xl border border-gray-100 flex justify-between items-center shadow-sm hover:translate-x-1 transition-transform">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border border-slate-100 ${p.status === 'PENDING' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                    <Icons.Payments />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-sm">{new Date(p.date).toLocaleDateString()}</p>
                    <p className="text-[9px] text-gray-400 font-bold uppercase">{p.id} • {p.methodName || 'Manual'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-black text-sm ${p.status === 'PENDING' ? 'text-amber-600' : 'text-emerald-600'}`}>৳{p.totalPaid}</p>
                  <p className={`text-[9px] font-bold px-2 py-0.5 rounded-full inline-block uppercase tracking-wider ${p.status === 'PENDING' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>{p.status}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 bg-white rounded-[2rem] border border-dashed border-slate-200 text-slate-400 text-sm font-medium">
              {t.noData}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
