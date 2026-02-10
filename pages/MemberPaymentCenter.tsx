
import React, { useState, useEffect } from 'react';
import { User, Payment, Language, PaymentMethod, PaymentStatus } from '../types';
import { translations } from '../translations';
import { Icons } from '../constants';
import { db } from '../db';
import { telegramService } from '../services/telegram';

interface Props {
  member: User;
  payments: Payment[];
  language: Language;
  onRefresh: () => void;
}

export const MemberPaymentCenter: React.FC<Props> = ({ member, payments, language, onRefresh }) => {
  const t = translations[language];
  const myPayments = [...payments].filter(p => p.memberId === member.memberId).reverse();
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  
  const [selectedMethodId, setSelectedMethodId] = useState('');
  const [senderNumber, setSenderNumber] = useState('');
  const [txId, setTxId] = useState('');
  const [amount, setAmount] = useState(member.fixedAmount.toString());
  const [fine, setFine] = useState(0);

  // Fix: Fetch methods using async/await inside useEffect
  useEffect(() => {
    const loadMethods = async () => {
      const data = await db.getMethods();
      setMethods(data);
    };
    loadMethods();
    const day = new Date().getDate();
    setFine(day > 10 ? 50 : 0);
  }, []);

  // Fix: Handle async database operation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = methods.find(m => m.id === selectedMethodId);
    
    const newPayment = await db.addPayment({
      memberId: member.memberId,
      amount: Number(amount),
      fineAmount: fine,
      totalPaid: Number(amount) + fine,
      date: new Date().toISOString(),
      status: PaymentStatus.PENDING,
      type: member.paymentType,
      transactionId: txId,
      senderNumber: senderNumber,
      methodName: method?.name || 'Gateway',
      remarks: `Submitted by member via ${method?.name}`
    });

    telegramService.notifyPaymentRequest(newPayment, member);
    onRefresh();
    setShowSubmitModal(false);
    setSelectedMethodId(''); setSenderNumber(''); setTxId('');
  };

  return (
    <div className="space-y-8 pb-24">
      <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
         <div className="relative z-10 space-y-2">
            <p className="text-blue-100 text-[10px] font-black uppercase tracking-[0.2em]">{t.totalDeposited}</p>
            <h3 className="text-5xl font-black tracking-tighter">৳{myPayments.filter(p => p.status !== PaymentStatus.PENDING).reduce((s, p) => s + p.amount, 0).toLocaleString()}</h3>
            <button 
              onClick={() => setShowSubmitModal(true)}
              className="mt-6 bg-white text-blue-900 font-black px-10 py-4 rounded-2xl shadow-xl active:scale-95 transition-all text-sm flex items-center gap-2"
            >
              <Icons.Add /> {t.submitPayment}
            </button>
         </div>
      </div>

      <div className="space-y-4 px-2">
        <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">{t.howToPay}</h2>
        <div className="grid grid-cols-1 gap-4">
           {methods.map(m => (
             <div key={m.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between">
                <div>
                   <p className="font-black text-slate-900">{m.name}</p>
                   <p className="text-sm font-bold text-slate-400">{m.number}</p>
                </div>
                <button 
                   onClick={() => { navigator.clipboard.writeText(m.number); alert('Copied!'); }}
                   className="text-[10px] font-black bg-slate-50 text-slate-500 px-4 py-2 rounded-xl uppercase"
                >
                   Copy
                </button>
             </div>
           ))}
        </div>
      </div>

      <div className="space-y-4 px-2">
        <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">{t.recentTransactions}</h2>
        <div className="space-y-4">
          {myPayments.map(p => (
            <div key={p.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${p.status === PaymentStatus.PENDING ? 'bg-amber-50 text-amber-500' : 'bg-emerald-50 text-emerald-600'}`}>
                  <Icons.Payments />
                </div>
                <div>
                  <p className="font-black text-slate-800">৳{p.totalPaid.toLocaleString()}</p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase">{new Date(p.date).toLocaleDateString()}</p>
                </div>
              </div>
              <span className={`text-[10px] font-black px-4 py-1.5 rounded-full uppercase ${p.status === PaymentStatus.PENDING ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                {p.status === PaymentStatus.PENDING ? t.pending : t.paid}
              </span>
            </div>
          ))}
        </div>
      </div>

      {showSubmitModal && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-md rounded-t-[3rem] sm:rounded-[3rem] p-10 shadow-2xl animate-in slide-in-from-bottom duration-500 overflow-y-auto max-h-[90vh]">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{t.submitPayment}</h3>
                <button onClick={() => setShowSubmitModal(false)} className="text-slate-400"><Icons.Close /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.selectMethod}</label>
                   <select required className="w-full bg-slate-50 border border-slate-100 p-5 rounded-3xl outline-none font-bold" value={selectedMethodId} onChange={e => setSelectedMethodId(e.target.value)}>
                      <option value="">-- Choose --</option>
                      {methods.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                   </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.amount}</label>
                      <input type="number" required className="w-full bg-slate-50 border border-slate-100 p-5 rounded-3xl outline-none font-black" value={amount} onChange={e => setAmount(e.target.value)} />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.lateFee}</label>
                      <input disabled className="w-full bg-slate-200 p-5 rounded-3xl font-black text-red-500" value={fine} />
                   </div>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.senderMobile}</label>
                   <input required className="w-full bg-slate-50 border border-slate-100 p-5 rounded-3xl outline-none font-bold" value={senderNumber} onChange={e => setSenderNumber(e.target.value)} placeholder="01XXX..." />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.transactionId}</label>
                   <input required className="w-full bg-slate-50 border border-slate-100 p-5 rounded-3xl outline-none font-bold text-blue-600" value={txId} onChange={e => setTxId(e.target.value)} placeholder="TXID" />
                </div>
                <button type="submit" className="w-full bg-slate-900 text-white font-black py-6 rounded-3xl shadow-2xl active:scale-95 transition-all text-lg">
                   {t.save}
                </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};
