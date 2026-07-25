import React, { useState, useEffect } from 'react';
import { Megaphone, Plus, Bell, X } from 'lucide-react';
import { apiRequest } from '../api/client';
import { Notice } from '../types';

export const NoticesView: React.FC = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetAudience, setTargetAudience] = useState<'ALL' | 'STUDENTS' | 'PARENTS' | 'STAFF'>('ALL');

  const fetchNotices = async () => {
    try {
      const res = await apiRequest('/notices');
      if (res.success && res.data) {
        setNotices(res.data);
      }
    } catch (err) {
      console.error('Error fetching notices:', err);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleCreateNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiRequest('/notices', 'POST', {
        title,
        content,
        targetAudience
      });

      if (res.success) {
        setShowAddModal(false);
        setTitle('');
        setContent('');
        fetchNotices();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to post notice');
    }
  };

  return (
    <div className="p-8 space-y-6 font-sans text-slate-100 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-sky-400" />
            <span>Campus Notice Board & Broadcasts</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Broadcast announcements to students, parents, and faculty staff.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-sky-500/20 transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Publish Notice</span>
        </button>
      </div>

      <div className="space-y-4">
        {notices.map((notice) => (
          <div
            key={notice.id}
            className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-2 hover:border-slate-700 transition"
          >
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                Audience: {notice.targetAudience}
              </span>
              <span className="text-[11px] text-slate-500 font-mono">{notice.publishDate}</span>
            </div>

            <h3 className="text-lg font-bold text-white">{notice.title}</h3>
            <p className="text-slate-300 text-xs leading-relaxed">{notice.content}</p>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 text-xs text-slate-100">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-sky-400" />
                <span>Publish Campus Notice</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNotice} className="space-y-3">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Midterm Examinations Timetable & Fee Clearance Notice"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-sky-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Target Audience</label>
                <select
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-sky-500"
                >
                  <option value="ALL">Entire Institution (All)</option>
                  <option value="STUDENTS">Students Only</option>
                  <option value="PARENTS">Parents / Guardians</option>
                  <option value="STAFF">Faculty & Staff</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Content Body</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={4}
                  placeholder="Write notice details..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-sky-500"
                  required
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 bg-slate-800 text-slate-300 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-xl shadow-lg shadow-sky-500/20"
                >
                  Publish Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
