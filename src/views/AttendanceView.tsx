import React, { useState, useEffect } from 'react';
import { CheckSquare, Save, Calendar, Search, Check, X, Clock } from 'lucide-react';
import { apiRequest } from '../api/client';
import { Student } from '../types';

export const AttendanceView: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState('Grade 10');
  const [selectedSection, setSelectedSection] = useState('A');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Record<string, 'PRESENT' | 'ABSENT' | 'LEAVE' | 'LATE'>>({});
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const fetchClassRoster = async () => {
    try {
      const res = await apiRequest(`/students?class=${encodeURIComponent(selectedClass)}&limit=50`);
      if (res.success && res.data) {
        setStudents(res.data);

        // Fetch existing attendance if any
        const attRes = await apiRequest(`/attendance?date=${date}&gradeClass=${encodeURIComponent(selectedClass)}`);
        if (attRes.success && attRes.data) {
          const map: Record<string, any> = {};
          attRes.data.forEach((a: any) => {
            map[a.studentId] = a.status;
          });

          // Fill defaults for any missing student
          res.data.forEach((s: Student) => {
            if (!map[s.id]) {
              map[s.id] = 'PRESENT';
            }
          });
          setAttendance(map);
        }
      }
    } catch (err) {
      console.error('Error fetching roster:', err);
    }
  };

  useEffect(() => {
    fetchClassRoster();
  }, [selectedClass, date]);

  const setStatus = (studentId: string, status: 'PRESENT' | 'ABSENT' | 'LEAVE' | 'LATE') => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSavedSuccess(false);

    try {
      const records = Object.entries(attendance).map(([studentId, status]) => {
        const student = students.find((s) => s.id === studentId);
        return {
          studentId,
          studentName: student?.fullName || 'Student',
          gradeClass: selectedClass,
          section: selectedSection,
          date,
          status
        };
      });

      const res = await apiRequest('/attendance', 'POST', { records });
      if (res.success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      alert('Failed to save attendance records.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 space-y-6 font-sans text-slate-100 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-emerald-400" />
            <span>Daily Attendance Marking Register</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Real-time daily roll call for SMS alerts and early warning attendance risk triggers.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition cursor-pointer self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving Roll Call...' : 'Save Attendance Register'}</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>Attendance register saved successfully!</span>
        </div>
      )}

      {/* Roster Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div>
          <label className="block text-slate-400 text-xs font-semibold mb-1">Class / Grade</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="Grade 10">Grade 10</option>
            <option value="Grade 9">Grade 9</option>
            <option value="O-Levels">O-Levels</option>
            <option value="A-Levels">A-Levels</option>
          </select>
        </div>

        <div>
          <label className="block text-slate-400 text-xs font-semibold mb-1">Section</label>
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="A">Section A</option>
            <option value="B">Section B</option>
          </select>
        </div>

        <div>
          <label className="block text-slate-400 text-xs font-semibold mb-1">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Roster Student List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
            <tr>
              <th className="p-4">Reg ID</th>
              <th className="p-4">Student Name</th>
              <th className="p-4">Father Name</th>
              <th className="p-4 text-center">Attendance Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {students.map((st) => {
              const currentStatus = attendance[st.id] || 'PRESENT';
              return (
                <tr key={st.id} className="hover:bg-slate-800/50 transition">
                  <td className="p-4 font-mono text-sky-400">{st.studentId}</td>
                  <td className="p-4 font-bold text-white text-sm">{st.fullName}</td>
                  <td className="p-4 text-slate-400">{st.fatherName}</td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setStatus(st.id, 'PRESENT')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                          currentStatus === 'PRESENT'
                            ? 'bg-emerald-600 text-white shadow-md'
                            : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                        }`}
                      >
                        Present
                      </button>
                      <button
                        type="button"
                        onClick={() => setStatus(st.id, 'ABSENT')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                          currentStatus === 'ABSENT'
                            ? 'bg-rose-600 text-white shadow-md'
                            : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                        }`}
                      >
                        Absent
                      </button>
                      <button
                        type="button"
                        onClick={() => setStatus(st.id, 'LEAVE')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                          currentStatus === 'LEAVE'
                            ? 'bg-amber-600 text-white shadow-md'
                            : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                        }`}
                      >
                        On Leave
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
