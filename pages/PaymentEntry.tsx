
import React, { useState, useEffect } from 'react';
import { User, Language, PaymentStatus, PaymentType, Payment } from '../types';
import { translations } from '../translations';
import { Icons } from '../constants';
import { db } from '../db';
import { telegramService } from '../services/telegram';

interface Props {
  members: User[];
  payments: Payment[];
  language: Language;
  onRefresh: () => void;
  adminId: string;
}

export const PaymentEntry: React.FC<Props> = ({ members, payments, language, onRefresh, adminId }) => {
  const t = translations[language];
  const [activeTab, setActiveTab] = useState<'new' | 'pending'>('new');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState<User | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [fine, setFine] = useState<number>(0);
  const [remarks, setRemarks] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const pendingPayments = payments.filter(p => p.status === PaymentStatus.PENDING);

  useEffect(() => {
    if (selectedMember) {
      const today = new Date();
      setFine(today.getDate() > 10 ? 50 : 0);
    }
  }, [selectedMember]);

  const filteredMembers = members.filter(m => 
    m.status === 'ACTIVE' && (
    m.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.memberId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.mobile.includes(searchTerm))
  );

  // Fix: Handle async database operation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember || !amount) return;

    const baseAmount = Number(amount);
    const totalPaid = baseAmount + fine;

    const p = await db.addPayment({
      memberId: selectedMember.memberId,
      amount: baseAmount,
      fineAmount: fine,
      totalPaid: totalPaid,
      date: new Date().toISOString(),
      status: fine > 0 ? PaymentStatus.LATE : PaymentStatus.PAID,
      type: selectedMember.paymentType,
      adminId: adminId,
      remarks: remarks
    });

    telegramService.notifyPaymentVerified(p, selectedMember);
    setShowSuccess(true);
    setAmount(''); setFine(0); setRemarks(''); setSelectedMember(null);
    onRefresh();
    setTimeout(() => setShowSuccess(false), 3000);
  };

  // Fix: Make handleApprove async to await the resolved payment object
  const handleApprove = async (id: string) => {
    const p = await db.approvePayment(id, adminId);
    if (p) {
      const member = members.find(m => m.memberId === p.memberId);
      telegramService.notifyPaymentVerified(p, member);
    }
    onRefresh();
  };

  // Fix: Handle async database operation
  const handleReject = async (id: string) => {
    if (confirm('Are you sure you want to reject this payment?')) {
      await db.rejectPayment(id);
      onRefresh();
    }
  };

  return (
    <div className="space-y-6 pb-24">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-gray-900">{t.payments}</h2>
        <div className="flex bg-slate-100 p-1 rounded-xl">
           <button onClick={() => setActiveTab('new')} className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'new' ? 'bg-white shadow text-blue-600' : 'text-slate-400'}`}>
             {t.addPayment}
           </button>
           <button onClick={() => setActiveTab('pending')} className={`px-4 py-2 text-xs font-bold rounded-lg transition-all relative ${activeTab === 'pending' ? 'bg-white shadow text-blue-600' : 'text-slate-400'}`}>
             {t.pendingApprovals}
             {pendingPayments.length > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[8px] rounded-full flex items-center justify-center border-2 border-white">{pendingPayments.length}</span>}
           </button>
        </div>
      </div>

      {activeTab === 'new' ? (
        <div className="space-y-4">
          {!selectedMember ? (
            <>
              <input type="text" placeholder={t.searchMember} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-white border border-slate-100 p-5 rounded-3xl outline-none shadow-sm font-bold" />
              <div className="space-y-3">
                {filteredMembers.map(m => (
                  <button key={m.id} onClick={() => { setSelectedMember(m); setAmount(m.fixedAmount.toString()); }} className="w-full bg-white p-5 rounded-[2rem] border border-slate-50 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3 text-left">
                       <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center font-black text-blue-600">{m.nameEn[0]}</div>
                       <div>
                          <p className="font-bold text-slate-800">{m.nameEn}</p>
                          <p className="text-[10px] text-slate-400 font-bold">{m.memberId}</p>
                       </div>
                    </div>
                    <Icons.Add />
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl space-y-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                   <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center font-black text-slate-300">{selectedMember.nameEn[0]}</div>
                   <div>
                      <p className="font-black text-slate-900">{selectedMember.nameEn}</p>
                      <p className="text-xs text-slate-400 font-bold">{selectedMember.memberId}</p>
                   </div>
                </div>
                <button onClick={() => setSelectedMember(null)} className="bg-slate-50 p-3 rounded-full"><Icons.Close /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-1">
                   <label className="text-[10px] font-black text-slate-400 uppercase ml-1">{t.amount}</label>
                   <input type="number" required value={amount} onChange={e => setAmount(e.target.value)} className="w-full bg-slate-50 border border-slate-100 p-5 rounded-3xl outline-none font-black text-2xl text-blue-600" />
                </div>
                {fine > 0 && <p className="text-xs font-bold text-red-500 bg-red-50 p-4 rounded-2xl">Late Fee Applied: ৳{fine}</p>}
                <button type="submit" className="w-full bg-slate-900 text-white font-black py-6 rounded-3xl shadow-2xl active:scale-95 transition-all text-lg">
                   {t.save}
                </button>
              </form>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
           {pendingPayments.map(p => {
             const m = members.find(x => x.memberId === p.memberId);
             return (
               <div key={p.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
                  <div className="flex justify-between">
                     <div>
                        <p className="font-black text-slate-900">{m?.nameEn}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{p.methodName} • {p.transactionId}</p>
                     </div>
                     <p className="text-xl font-black text-blue-600">৳{p.totalPaid.toLocaleString()}</p>
                  </div>
                  <div className="flex gap-2">
                     <button onClick={() => handleReject(p.id)} className="flex-1 bg-red-50 text-red-500 font-bold py-4 rounded-2xl text-xs uppercase">{t.reject}</button>
                     <button onClick={() => handleApprove(p.id)} className="flex-[2] bg-emerald-500 text-white font-black py-4 rounded-2xl text-xs uppercase shadow-lg shadow-emerald-500/20">{t.approve}</button>
                  </div>
               </div>
             )
           })}
        </div>
      )}
    </div>
  );
};
