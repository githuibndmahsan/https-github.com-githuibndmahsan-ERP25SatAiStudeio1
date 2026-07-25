import React, { useState, useEffect } from 'react';
import { BookOpenCheck, Plus, Calendar, Clock, CheckCircle2, X } from 'lucide-react';
import { apiRequest } from '../api/client';
import { Assignment } from '../types';

export const AssignmentsView: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form Fields
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Physics');
  const [gradeClass, setGradeClass] = useState('Grade 10');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('2026-07-30');

  const fetchAssignments = async () => {
    try {
      const res = await apiRequest('/assignments');
      if (res.success && res.data) {
        setAssignments(res.data);
      }
    } catch (err) {
      console.error('Error fetching assignments:', err);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiRequest('/assignments', 'POST', {
        title,
        subject,
        gradeClass,
        description,
        dueDate
      });

      if (res.success) {
        setShowAddModal(false);
        setTitle('');
        setDescription('');
        fetchAssignments();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to post assignment');
    }
  };

  return (
    <div className="p-8 space-y-6 font-sans text-slate-100 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BookOpenCheck className="w-6 h-6 text-sky-400" />
            <span>Homework & Course Assignments ({assignments.length})</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Teacher assignment portal with student submission tracking and deadlines.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-sky-500/20 transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Publish New Assignment</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {assignments.map((a) => (
          <div
            key={a.id}
            className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3 hover:border-slate-700 transition"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">
                  {a.subject} • {a.gradeClass}
                </span>
                <h3 className="font-bold text-white text-base leading-tight mt-0.5">{a.title}</h3>
              </div>
            </div>

            <p className="text-slate-400 text-xs line-clamp-3 leading-relaxed">{a.description}</p>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>Teacher: {a.teacherName}</span>
              <span className="text-amber-400">Due: {a.dueDate}</span>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 text-xs text-slate-100">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BookOpenCheck className="w-4 h-4 text-sky-400" />
                <span>Publish Homework Assignment</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAssignment} className="space-y-3">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Chapter 4 Electromagnetism Numerical Problems"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-sky-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Subject</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Physics"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-sky-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Grade / Class</label>
                  <select
                    value={gradeClass}
                    onChange={(e) => setGradeClass(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="Grade 10">Grade 10</option>
                    <option value="Grade 9">Grade 9</option>
                    <option value="O-Levels">O-Levels</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Instructions</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Solve textbook problems 4.1 to 4.8 in physics notebook."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-sky-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Submission Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
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
                  Publish Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
