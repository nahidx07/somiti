
import React, { useState, useEffect } from 'react';
import { User, Payment, Language, PaymentMethod, PaymentStatus } from '../types';
import { translations } from '../translations';
import { Icons } from '../constants';
import { db } from '../db';

interface Props {
  member: User;
  payments: Payment[];
  language: Language;
}

export const MemberHistory: React.FC<Props> = ({ member, payments, language }) => {
  const t = translations[language];
  const myPayments = [...payments].filter(p => p.memberId === member.memberId).reverse();
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  
  // Submission Form State
  const [selectedMethodId, setSelectedMethodId] = useState('');
  const [senderNumber, setSenderNumber] = useState('');
  const [txId, setTxId] = useState('');
  const [amount, setAmount] = useState(member.fixedAmount.toString());
  const [fine, setFine] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);

  // Fix: Fetch methods using async/await inside useEffect
  useEffect(() => {
    const init = async () => {
      const data = await db.getMethods();
      setMethods(data);
    };
    init();
    
    // Automatic fine calculation logic
    const today = new Date();
    if (today.getDate() > 10) {
      setFine(50);
    } else {
      setFine(0);
    }
  }, []);

  // Fix: Await async database operation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMethodId || !senderNumber || !txId || !amount) {
      alert('Please fill all required fields');
      return;
    }

    const method = methods.find(m => m.id === selectedMethodId);
    
    await db.addPayment({
      memberId: member.memberId,
      amount: Number(amount),
      fineAmount: fine,
      totalPaid: Number(amount) + fine,
      date: new Date().toISOString(),
      status: PaymentStatus.PENDING,
      type: member.paymentType,
      transactionId: txId,
      senderNumber: senderNumber,
      methodName: method?.name || 'Unknown',
      remarks: `Submitted by user via ${method?.name}`
    });

    setIsSuccess(true);
    setTimeout(() => {
      setShowSubmitModal(false);
      setIsSuccess(false);
      window.location.reload(); // Refresh to show the new pending item
    }, 2000);
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Submit Payment Button */}
      <div className="bg-white p-6 rounded-[2rem] border border-blue-50 shadow-sm flex items-center justify-between">
        <div>
           <h3 className="font-black text-slate-800 tracking-tight">{t.submitPayment}</h3>
           <p className="text-xs text-slate-400 font-medium">Have you sent the money? Submit info here.</p>
        </div>
        <button 
          onClick={() => setShowSubmitModal(true)}
          className="bg-blue-600 text-white px-5 py-3 rounded-2xl font-bold shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
        >
          {t.submitPayment}
        </button>
      </div>

      {/* Payment Methods Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-black text-gray-900 uppercase tracking-widest">{t.howToPay}</h2>
        <div className="grid grid-cols-1 gap-4">
           {methods.map(method => (
             <div key={method.id} className="bg-white p-5 rounded-[2rem] border-2 border-dashed border-blue-100 flex flex-col items-center text-center space-y-2">
                <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{method.name}</p>
                <p className="text-2xl font-black text-slate-900 select-all">{method.number}</p>
                {method.instructions && <p className="text-xs text-slate-400 px-4">{method.instructions}</p>}
             </div>
           ))}
        </div>
      </div>

      {/* History Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-black text-gray-900 uppercase tracking-widest">{t.payments}</h2>
          <div className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider">
            {myPayments.length} Records
          </div>
        </div>

        <div className="space-y-3">
          {myPayments.length > 0 ? (
            myPayments.map(p => (
              <div key={p.id} className={`bg-white p-5 rounded-2xl border border-slate-100 flex justify-between items-center shadow-sm hover:translate-x-1 transition-transform border-l-4 ${p.status === PaymentStatus.PENDING ? 'border-l-amber-400' : p.fineAmount > 0 ? 'border-l-red-500' : 'border-l-emerald-500'}`}>
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 ${p.status === PaymentStatus.PENDING ? 'text-amber-500' : p.fineAmount > 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                    <Icons.Payments />
                  </div>
                  <div>
                    <p className="font-black text-slate-800 text-base">৳{(p.totalPaid || (p.amount + (p.fineAmount || 0))).toLocaleString()}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                      {new Date(p.date).toLocaleDateString()} • {p.id}
                    </p>
                    {p.fineAmount > 0 && (
                      <p className="text-[9px] font-bold text-red-400 uppercase">Includes Late Fee: ৳{p.fineAmount}</p>
                    )}
                    {p.transactionId && <p className="text-[9px] text-blue-500 font-bold uppercase mt-1">TXID: {p.transactionId}</p>}
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter ${p.status === PaymentStatus.PENDING ? 'bg-amber-50 text-amber-600' : p.fineAmount > 0 ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-600'}`}>
                    {p.status === PaymentStatus.PENDING ? t.pending : (p.fineAmount > 0 ? t.late : t.paid)}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-slate-200 text-slate-400">
              <div className="scale-150 opacity-20 mb-4 flex justify-center">
                <Icons.Payments />
              </div>
              <p className="font-bold">{t.noData}</p>
            </div>
          )}
        </div>
      </div>

      {/* Submission Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
           <div className="bg-white w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[95vh] overflow-y-auto">
             {isSuccess ? (
               <div className="py-10 text-center space-y-4">
                  <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center text-white mx-auto animate-bounce">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900">{t.paymentSuccess}</h3>
               </div>
             ) : (
               <>
                 <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-black text-gray-900">{t.submitPayment}</h3>
                    <button onClick={() => setShowSubmitModal(false)} className="text-gray-400">
                      <Icons.Close />
                    </button>
                 </div>
                 <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.selectMethod}</label>
                      <select 
                        required
                        className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl outline-none"
                        value={selectedMethodId}
                        onChange={e => setSelectedMethodId(e.target.value)}
                      >
                        <option value="">-- {t.selectMethod} --</option>
                        {methods.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.amount}</label>
                        <input type="number" required className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl outline-none" value={amount} onChange={e => setAmount(e.target.value)} />
                       </div>
                       <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.lateFee}</label>
                        <input type="number" disabled className="w-full bg-slate-200 border border-slate-100 p-4 rounded-2xl outline-none text-red-500 font-bold" value={fine} />
                       </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.senderMobile}</label>
                      <input required className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl outline-none" value={senderNumber} onChange={e => setSenderNumber(e.target.value)} placeholder="01XXX-XXXXXX" />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.transactionId}</label>
                      <input required className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl outline-none" value={txId} onChange={e => setTxId(e.target.value)} placeholder="ABC123XYZ" />
                    </div>

                    <div className="pt-4 border-t border-slate-50 flex justify-between items-center">
                       <span className="text-sm font-bold text-slate-500">{t.totalAmount}</span>
                       <span className="text-2xl font-black text-slate-900">৳{(Number(amount) + fine).toLocaleString()}</span>
                    </div>

                    <button type="submit" className="w-full bg-slate-900 text-white font-bold py-5 rounded-2xl shadow-xl mt-4 active:scale-95 transition-all">
                      {t.save}
                    </button>
                 </form>
               </>
             )}
           </div>
        </div>
      )}
    </div>
  );
};
