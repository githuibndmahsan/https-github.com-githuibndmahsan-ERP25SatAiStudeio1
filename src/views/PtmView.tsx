import React, { useState, useEffect } from 'react';
import { CalendarCheck, Plus, Clock, Users, X } from 'lucide-react';
import { apiRequest } from '../api/client';
import { PtmMeeting } from '../types';

export const PtmView: React.FC = () => {
  const [ptms, setPtms] = useState<PtmMeeting[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form
  const [teacherName, setTeacherName] = useState('Ms. Aisha Khan');
  const [studentName, setStudentName] = useState('Farooq Ahmed');
  const [studentId, setStudentId] = useState('STD-TCS-101');
  const [date, setDate] = useState('2026-08-05');
  const [timeSlot, setTimeSlot] = useState('10:00 AM - 10:20 AM');

  const fetchPtms = async () => {
    try {
      const res = await apiRequest('/ptm');
      if (res.success && res.data) {
        setPtms(res.data);
      }
    } catch (err) {
      console.error('Error fetching PTMs:', err);
    }
  };

  useEffect(() => {
    fetchPtms();
  }, []);

  const handleCreatePtm = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiRequest('/ptm', 'POST', {
        teacherName,
        studentName,
        studentId,
        date,
        timeSlot
      });

      if (res.success) {
        setShowAddModal(false);
        fetchPtms();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to book slot');
    }
  };

  return (
    <div className="p-8 space-y-6 font-sans text-slate-100 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <CalendarCheck className="w-6 h-6 text-purple-400" />
            <span>Parent-Teacher Meeting (PTM) Schedules</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Book 1-on-1 parent-teacher discussion slots with progress reports.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-purple-500/20 transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Book PTM Slot</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ptms.map((ptm) => (
          <div
            key={ptm.id}
            className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3 hover:border-slate-700 transition"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-purple-400 uppercase">
                  {ptm.timeSlot}
                </span>
                <h3 className="font-bold text-white text-base leading-tight mt-0.5">
                  {ptm.studentName}
                </h3>
                <p className="text-slate-400 text-xs">Reg ID: {ptm.studentId}</p>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {ptm.status}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-800 text-xs text-slate-300 space-y-1">
              <div>Teacher: <strong>{ptm.teacherName}</strong></div>
              <div>Date: <strong className="font-mono">{ptm.date}</strong></div>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 text-xs text-slate-100">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-purple-400" />
                <span>Book PTM Slot</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePtm} className="space-y-3">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Teacher Name</label>
                <input
                  type="text"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Student Name</label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Time Slot</label>
                  <input
                    type="text"
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    placeholder="10:00 AM - 10:20 AM"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
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
                  className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/20"
                >
                  Book Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
