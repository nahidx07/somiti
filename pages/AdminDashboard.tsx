
import React from 'react';
import { User, Payment, Language } from '../types';
import { translations } from '../translations';
import { Icons } from '../constants';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface Props {
  members: User[];
  payments: Payment[];
  language: Language;
}

export const AdminDashboard: React.FC<Props> = ({ members, payments, language }) => {
  const t = translations[language];
  const activeCount = members.filter(m => m.status === 'ACTIVE').length;
  
  const today = new Date().toISOString().split('T')[0];
  const todayTotal = payments
    .filter(p => p.date.startsWith(today))
    .reduce((sum, p) => sum + p.amount, 0);

  const monthlyTotal = payments
    .filter(p => new Date(p.date).getMonth() === new Date().getMonth())
    .reduce((sum, p) => sum + p.amount, 0);

  // Mock chart data
  const data = [
    { name: 'Jan', amount: 4000 },
    { name: 'Feb', amount: 3000 },
    { name: 'Mar', amount: 2000 },
    { name: 'Apr', amount: 2780 },
    { name: 'May', amount: 1890 },
    { name: 'Jun', amount: 2390 },
  ];

  return (
    <div className="space-y-6">
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="bg-blue-50 w-10 h-10 rounded-lg flex items-center justify-center text-blue-600 mb-3">
            <Icons.Members />
          </div>
          <div>
            <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">{t.activeMembers}</p>
            <p className="text-2xl font-bold text-gray-800">{activeCount}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="bg-emerald-50 w-10 h-10 rounded-lg flex items-center justify-center text-emerald-600 mb-3">
            <Icons.Payments />
          </div>
          <div>
            <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">{t.todayCollection}</p>
            <p className="text-2xl font-bold text-gray-800">৳{todayTotal}</p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-indigo-600 to-blue-700 p-6 rounded-3xl text-white shadow-xl">
        <p className="text-blue-100 text-sm font-medium">{t.monthlyCollection}</p>
        <h3 className="text-4xl font-extrabold mt-1">৳{monthlyTotal}</h3>
        <div className="mt-4 flex items-center text-xs text-blue-100 bg-white/10 w-fit px-3 py-1 rounded-full">
          <span className="mr-1">↑ 12%</span> from last month
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <h4 className="font-bold text-gray-800 mb-4">{t.financialOverview}</h4>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
              <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
              <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#1E40AF' : '#3B82F6'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Payments */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h4 className="font-bold text-gray-800">{t.recentTransactions}</h4>
          <button className="text-blue-600 text-sm font-semibold">View All</button>
        </div>
        <div className="space-y-3">
          {payments.slice(-5).reverse().map((p) => {
            const member = members.find(m => m.memberId === p.memberId);
            return (
              <div key={p.id} className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-400">
                    {member ? (language === 'en' ? member.nameEn[0] : member.nameBn[0]) : '?'}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-sm">{member ? (language === 'en' ? member.nameEn : member.nameBn) : 'Unknown'}</p>
                    <p className="text-[10px] text-gray-400 uppercase">{p.memberId} • {new Date(p.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-emerald-600 text-sm">+ ৳{p.amount}</p>
                  <p className="text-[10px] text-gray-400 px-2 py-0.5 bg-gray-50 rounded-full">{p.status}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
