import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, Plus, CheckCircle2, Award, Search, X } from 'lucide-react';
import { apiRequest } from '../api/client';
import { Exam, Student } from '../types';

export const ExamsView: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [marksMap, setMarksMap] = useState<Record<string, { marksObtained: number; grade: string }>>({});
  const [savingMarks, setSavingMarks] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Exam Form
  const [title, setTitle] = useState('Midterm Examinations 2026');
  const [gradeClass, setGradeClass] = useState('Grade 10');
  const [term, setTerm] = useState('Midterm');
  const [startDate, setStartDate] = useState('2026-08-01');

  const fetchExams = async () => {
    try {
      const res = await apiRequest('/exams');
      if (res.success && res.data) {
        setExams(res.data);
      }
    } catch (err) {
      console.error('Error fetching exams:', err);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiRequest('/exams', 'POST', {
        title,
        gradeClass,
        term,
        startDate
      });

      if (res.success) {
        setShowCreateModal(false);
        fetchExams();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to create exam session');
    }
  };

  const openMarksSheet = async (exam: Exam) => {
    setSelectedExam(exam);
    try {
      const stRes = await apiRequest(`/students?class=${encodeURIComponent(exam.gradeClass)}&limit=50`);
      if (stRes.success && stRes.data) {
        setStudents(stRes.data);

        // Fetch existing results
        const resRes = await apiRequest(`/exams/${exam.id}/results`);
        const existingMap: Record<string, any> = {};

        if (resRes.success && resRes.data) {
          resRes.data.forEach((r: any) => {
            existingMap[r.studentId] = { marksObtained: r.marksObtained, grade: r.grade };
          });
        }

        stRes.data.forEach((st: Student) => {
          if (!existingMap[st.id]) {
            existingMap[st.id] = { marksObtained: 85, grade: 'A' };
          }
        });

        setMarksMap(existingMap);
      }
    } catch (err) {
      console.error('Error opening marks sheet:', err);
    }
  };

  const handleSaveMarks = async () => {
    if (!selectedExam) return;
    setSavingMarks(true);

    try {
      const results = Object.entries(marksMap).map(([studentId, data]: [string, any]) => {
        const student = students.find((s) => s.id === studentId);
        return {
          studentId,
          studentName: student?.fullName || 'Student',
          marksObtained: Number(data.marksObtained),
          totalMarks: 100,
          grade: Number(data.marksObtained) >= 80 ? 'A*' : Number(data.marksObtained) >= 70 ? 'A' : 'B'
        };
      });

      const res = await apiRequest(`/exams/${selectedExam.id}/results`, 'POST', { results });
      if (res.success) {
        alert('Exam marks & grades published successfully!');
        setSelectedExam(null);
        fetchExams();
      }
    } catch (err) {
      alert('Failed to publish exam results.');
    } finally {
      setSavingMarks(false);
    }
  };

  return (
    <div className="p-8 space-y-6 font-sans text-slate-100 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-sky-400" />
            <span>Exams, Grading & Result Cards Engine</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Exam session manager, marks entry sheet, automatic GP/grade calculation, and result cards.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-sky-500/20 transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Examination Session</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {exams.map((exam) => (
          <div
            key={exam.id}
            className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3 hover:border-slate-700 transition"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">
                  {exam.term}
                </span>
                <h3 className="font-bold text-white text-base leading-tight mt-0.5">
                  {exam.title}
                </h3>
                <p className="text-slate-400 text-xs mt-0.5">{exam.gradeClass}</p>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  exam.isPublished
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                }`}
              >
                {exam.isPublished ? 'PUBLISHED' : 'DRAFT'}
              </span>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Starts: {exam.startDate}</span>
              <button
                onClick={() => openMarksSheet(exam)}
                className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-lg text-xs shadow-md transition"
              >
                Marks Entry Sheet →
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Marks Entry Sheet Modal */}
      {selectedExam && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-3xl w-full p-6 text-xs text-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-slate-800 pb-3 mb-4">
              <div>
                <span className="text-[10px] font-bold text-sky-400 uppercase">
                  Marks Entry Register
                </span>
                <h3 className="text-xl font-bold text-white">{selectedExam.title}</h3>
                <p className="text-slate-400 text-xs">{selectedExam.gradeClass}</p>
              </div>
              <button
                onClick={() => setSelectedExam(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3">Student Reg ID</th>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Marks Obtained (Out of 100)</th>
                  <th className="p-3">Calculated Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {students.map((st) => {
                  const entry = marksMap[st.id] || { marksObtained: 80, grade: 'A' };
                  return (
                    <tr key={st.id}>
                      <td className="p-3 font-mono text-sky-400">{st.studentId}</td>
                      <td className="p-3 font-bold text-white text-sm">{st.fullName}</td>
                      <td className="p-3">
                        <input
                          type="number"
                          max={100}
                          min={0}
                          value={entry.marksObtained}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setMarksMap((prev) => ({
                              ...prev,
                              [st.id]: {
                                marksObtained: val,
                                grade: val >= 80 ? 'A*' : val >= 70 ? 'A' : val >= 60 ? 'B' : 'C'
                              }
                            }));
                          }}
                          className="w-24 bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-white focus:outline-none focus:border-sky-500"
                        />
                      </td>
                      <td className="p-3 font-bold font-mono text-emerald-400 text-sm">
                        {entry.marksObtained >= 80 ? 'A*' : entry.marksObtained >= 70 ? 'A' : 'B'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="pt-4 mt-4 border-t border-slate-800 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedExam(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveMarks}
                disabled={savingMarks}
                className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-xl shadow-lg shadow-sky-500/20"
              >
                {savingMarks ? 'Publishing...' : 'Publish Results & Result Cards'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Exam Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 text-xs text-slate-100">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-sky-400" />
                <span>Create Exam Session</span>
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateExam} className="space-y-3">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Exam Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Annual Final Examinations 2026"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-sky-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Target Grade</label>
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
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Term</label>
                  <input
                    type="text"
                    value={term}
                    onChange={(e) => setTerm(e.target.value)}
                    placeholder="Midterm / Final"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-sky-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-sky-500"
                  required
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 bg-slate-800 text-slate-300 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-xl shadow-lg shadow-sky-500/20"
                >
                  Create Exam Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
