import React, { useState, useEffect } from 'react';
import { CalendarDays, Clock, AlertTriangle, Plus, Users, BookOpen } from 'lucide-react';
import { apiRequest } from '../api/client';
import { TimetablePeriod } from '../types';

export const TimetableView: React.FC = () => {
  const [periods, setPeriods] = useState<TimetablePeriod[]>([]);
  const [selectedClass, setSelectedClass] = useState('Grade 10');
  const [conflicts, setConflicts] = useState<any[]>([]);

  const fetchTimetable = async () => {
    try {
      const res = await apiRequest(`/timetable?gradeClass=${encodeURIComponent(selectedClass)}`);
      if (res.success && res.data) {
        setPeriods(res.data.periods);
        setConflicts(res.data.conflicts || []);
      }
    } catch (err) {
      console.error('Error fetching timetable:', err);
    }
  };

  useEffect(() => {
    fetchTimetable();
  }, [selectedClass]);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const timeslots = [
    '08:00 AM - 08:45 AM',
    '08:45 AM - 09:30 AM',
    '09:30 AM - 10:15 AM',
    '10:45 AM - 11:30 AM',
    '11:30 AM - 12:15 PM'
  ];

  return (
    <div className="p-8 space-y-6 font-sans text-slate-100 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-sky-400" />
            <span>Master Class Schedule & Timetable</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Weekly subject schedule, classroom allocation, and teacher conflict resolution.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-400">Class:</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
          >
            <option value="Grade 10">Grade 10</option>
            <option value="Grade 9">Grade 9</option>
            <option value="O-Levels">O-Levels</option>
          </select>
        </div>
      </div>

      {/* Conflict Warnings */}
      {conflicts.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs space-y-1">
          <div className="font-bold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Teacher Schedule Conflict Detected</span>
          </div>
          {conflicts.map((c, i) => (
            <p key={i} className="text-amber-200/90 text-[11px]">
              • {c.teacherName} is double-booked on {c.day} during period ({c.startTime}).
            </p>
          ))}
        </div>
      )}

      {/* Timetable Grid Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl overflow-x-auto">
        <table className="w-full text-center text-xs text-slate-300 border-collapse">
          <thead className="bg-slate-950 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
            <tr>
              <th className="p-4 text-left border-r border-slate-800">Day / Time</th>
              {timeslots.map((slot, i) => (
                <th key={i} className="p-4 border-r border-slate-800/60 min-w-[160px]">
                  <div className="text-white font-bold">{`Period ${i + 1}`}</div>
                  <div className="text-[10px] text-slate-500 font-normal mt-0.5">{slot}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {days.map((day) => (
              <tr key={day} className="hover:bg-slate-800/30 transition">
                <td className="p-4 font-bold text-white text-left border-r border-slate-800 bg-slate-950/50">
                  {day}
                </td>
                {timeslots.map((slot, i) => {
                  const startTime = slot.split(' - ')[0];
                  const period = periods.find((p) => p.day === day && p.startTime === startTime);

                  return (
                    <td key={i} className="p-3 border-r border-slate-800/60">
                      {period ? (
                        <div className="p-2.5 rounded-xl bg-slate-950 border border-sky-500/30 text-left space-y-1 shadow-sm">
                          <div className="font-bold text-sky-400 text-xs">{period.subject}</div>
                          <div className="text-[11px] text-slate-300 flex items-center gap-1">
                            <Users className="w-3 h-3 text-slate-500" />
                            <span>{period.teacherName}</span>
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            Room: {period.roomNo}
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 rounded-xl border border-dashed border-slate-800 text-slate-600 text-[11px]">
                          Free Period
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
