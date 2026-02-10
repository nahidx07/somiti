
import React, { useState, useEffect } from 'react';
import { UserRole, AdminPost, Language } from '../types';
import { translations } from '../translations';
import { Icons } from '../constants';
import { db } from '../db';

interface Props {
  role: UserRole;
  language: Language;
}

export const NoticeBoard: React.FC<Props> = ({ role, language }) => {
  const t = translations[language];
  const isAdmin = role === UserRole.MAIN_ADMIN || role === UserRole.ADMIN;
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ title: '', content: '', photoUrl: '' });

  // Fix: Load posts using async/await inside useEffect
  useEffect(() => {
    const loadPosts = async () => {
      const p = await db.getPosts();
      setPosts(p);
    };
    loadPosts();
  }, []);

  // Fix: Handle async database operation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await db.addPost(formData);
    const p = await db.getPosts();
    setPosts(p);
    setShowModal(false);
    setFormData({ title: '', content: '', photoUrl: '' });
  };

  // Fix: Handle async database operation
  const deletePost = async (id: string) => {
    if (confirm('Delete this post?')) {
      await db.deletePost(id);
      const p = await db.getPosts();
      setPosts(p);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center px-2">
        <div>
           <h2 className="text-3xl font-black text-slate-900 tracking-tighter">{t.notices}</h2>
           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Latest from Cooperative</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white p-4 rounded-2xl shadow-xl shadow-blue-600/20 active:scale-90 transition-all"
          >
            <Icons.Add />
          </button>
        )}
      </div>

      <div className="space-y-6">
        {posts.length > 0 ? (
          posts.map(post => (
            <div key={post.id} className="bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
               {post.photoUrl && (
                 <div className="h-56 w-full relative">
                   <img src={post.photoUrl} className="w-full h-full object-cover" alt="" />
                   <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent"></div>
                 </div>
               )}
               <div className="p-8 space-y-4">
                 <div className="flex justify-between items-start">
                    <h3 className="text-xl font-black text-slate-800 leading-tight">{post.title}</h3>
                    {isAdmin && (
                      <button onClick={() => deletePost(post.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                        <Icons.Close />
                      </button>
                    )}
                 </div>
                 <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
                 <div className="pt-4 border-t border-slate-50 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{new Date(post.createdAt).toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                 </div>
               </div>
            </div>
          ))
        ) : (
          <div className="text-center py-32 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
             <div className="scale-150 opacity-10 mb-6 flex justify-center"><Icons.Reports /></div>
             <p className="font-bold text-slate-400">{t.noData}</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-md rounded-t-[3rem] sm:rounded-[3rem] p-10 shadow-2xl animate-in slide-in-from-bottom duration-500 overflow-y-auto max-h-[90vh]">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{t.addNotice}</h3>
                <button onClick={() => setShowModal(false)} className="bg-slate-50 p-3 rounded-full text-slate-400"><Icons.Close /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.postTitle}</label>
                  <input required className="w-full bg-slate-50 border border-slate-100 p-5 rounded-3xl outline-none font-bold text-slate-800" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Title..." />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.postContent}</label>
                  <textarea rows={4} required className="w-full bg-slate-50 border border-slate-100 p-5 rounded-3xl outline-none font-medium text-slate-700 resize-none" value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} placeholder="Write here..." />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.photoUrl}</label>
                  <input className="w-full bg-slate-50 border border-slate-100 p-5 rounded-3xl outline-none text-blue-500 font-medium" value={formData.photoUrl} onChange={e => setFormData({...formData, photoUrl: e.target.value})} placeholder="https://image-link.jpg" />
                </div>
                <button type="submit" className="w-full bg-slate-900 text-white font-black py-6 rounded-3xl shadow-2xl active:scale-95 transition-all text-lg">
                  {t.createPost}
                </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};
