
import React, { useState } from 'react';
import { User, Language } from '../types';
import { translations } from '../translations';
import { Icons } from '../constants';
import { db } from '../db';

interface Props {
  user: User;
  language: Language;
  onClose: () => void;
  onSuccess: () => void;
}

export const ChangePasswordModal: React.FC<Props> = ({ user, language, onClose, onSuccess }) => {
  const t = translations[language];
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (currentPass !== user.password) {
      setError(t.wrongCurrentPassword);
      return;
    }

    if (newPass !== confirmPass) {
      setError(t.passwordMismatch);
      return;
    }

    if (newPass.length < 4) {
      setError("Password must be at least 4 characters.");
      return;
    }

    setIsLoading(true);
    try {
      await db.updateUser(user.id, { password: newPass });
      onSuccess();
      alert(t.passwordChanged);
      onClose();
    } catch (err) {
      setError("Failed to update password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-t-[3rem] sm:rounded-[3rem] p-10 shadow-2xl animate-in slide-in-from-bottom duration-500">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-black text-slate-900 tracking-tighter">{t.changePassword}</h3>
          <button onClick={onClose} className="text-slate-400 bg-slate-50 p-2 rounded-full"><Icons.Close /></button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-500 rounded-2xl text-xs font-bold border border-red-100 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.currentPassword}</label>
            <input 
              type="password" 
              required 
              className="w-full bg-slate-50 border border-slate-100 p-5 rounded-3xl outline-none font-bold text-slate-800"
              value={currentPass}
              onChange={e => setCurrentPass(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.newPassword}</label>
            <input 
              type="password" 
              required 
              className="w-full bg-slate-50 border border-slate-100 p-5 rounded-3xl outline-none font-bold text-slate-800"
              value={newPass}
              onChange={e => setNewPass(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.confirmPassword}</label>
            <input 
              type="password" 
              required 
              className="w-full bg-slate-50 border border-slate-100 p-5 rounded-3xl outline-none font-bold text-slate-800"
              value={confirmPass}
              onChange={e => setConfirmPass(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-slate-900 text-white font-black py-6 rounded-3xl shadow-2xl active:scale-95 transition-all text-lg mt-4 disabled:opacity-50"
          >
            {isLoading ? "Updating..." : t.update}
          </button>
        </form>
      </div>
    </div>
  );
};
