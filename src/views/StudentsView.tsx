import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Plus,
  Search,
  Filter,
  Eye,
  FileText,
  Printer,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  CreditCard,
  X,
  Phone,
  Mail,
  Calendar,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { apiRequest } from '../api/client';
import { Student, Institution } from '../types';
import { PrintModal } from '../components/PrintModal';

interface StudentsViewProps {
  institution: Institution | null;
}

export const StudentsView: React.FC<StudentsViewProps> = ({ institution }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0);
  const [loading, setLoading] = useState(false);

  // Modals state
  const [showAdmissionModal, setShowAdmissionModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentFeeLedger, setStudentFeeLedger] = useState<any[]>([]);
  const [studentAttendanceRate, setStudentAttendanceRate] = useState<number>(0);
  const [printData, setPrintData] = useState<any | null>(null);

  // Admission Form Fields
  const [fullName, setFullName] = useState('');
  const [cnicOrBForm, setCnicOrBForm] = useState('');
  const [gradeClass, setGradeClass] = useState('Grade 10');
  const [section, setSection] = useState('A');
  const [fatherName, setFatherName] = useState('');
  const [fatherPhone, setFatherPhone] = useState('');
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>('MALE');
  const [dateOfBirth, setDateOfBirth] = useState('2010-05-14');
  const [address, setAddress] = useState('');

  const fetchStudents = async () => {
    setLoading(true);
    try {
      let query = `/students?page=${page}&limit=8`;
      if (search) query += `&search=${encodeURIComponent(search)}`;
      if (selectedClass) query += `&class=${encodeURIComponent(selectedClass)}`;

      const res = await apiRequest<Student[]>(query);
      if (res.success && res.data && res.meta) {
        setStudents(res.data);
        setTotalPages(res.meta.totalPages);
        setTotalStudents(res.meta.totalRecords);
      }
    } catch (err) {
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [page, search, selectedClass]);

  const handleAdmissionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiRequest('/students', 'POST', {
        fullName,
        cnicOrBForm,
        gradeClass,
        section,
        fatherName,
        fatherPhone,
        gender,
        dateOfBirth,
        address
      });

      if (res.success) {
        setShowAdmissionModal(false);
        setFullName('');
        setCnicOrBForm('');
        setFatherName('');
        setFatherPhone('');
        fetchStudents();
      }
    } catch (err: any) {
      alert(err.message || 'Admission creation failed');
    }
  };

  const inspectStudentProfile = async (student: Student) => {
    setSelectedStudent(student);
    try {
      const ledgerRes = await apiRequest(`/students/${student.id}/fee-ledger`);
      if (ledgerRes.success && ledgerRes.data) {
        setStudentFeeLedger(ledgerRes.data);
      }

      const attRes = await apiRequest(`/students/${student.id}/attendance-stats`);
      if (attRes.success && attRes.data) {
        setStudentAttendanceRate(attRes.data.percentage);
      }
    } catch (err) {
      console.error('Error fetching student detail context:', err);
    }
  };

  return (
    <div className="p-8 space-y-6 font-sans text-slate-100 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-sky-400" />
            <span>Student Management Register ({totalStudents})</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Official admissions register, fee status ledgers, attendance history, and print profiles.
          </p>
        </div>

        <button
          onClick={() => setShowAdmissionModal(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-sky-500/20 transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Student Admission</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div className="md:col-span-8 relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by student name, ID, admission number, or B-Form..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>

        <div className="md:col-span-4 flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500 shrink-0" />
          <select
            value={selectedClass}
            onChange={(e) => {
              setSelectedClass(e.target.value);
              setPage(1);
            }}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-sky-500"
          >
            <option value="">All Classes / Grades</option>
            <option value="Grade 9">Grade 9</option>
            <option value="Grade 10">Grade 10</option>
            <option value="O-Levels">O-Levels</option>
            <option value="A-Levels">A-Levels</option>
            <option value="BS CS">BS CS (University)</option>
          </select>
        </div>
      </div>

      {/* Students Data Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
            <tr>
              <th className="p-4">Reg ID & Student Name</th>
              <th className="p-4">Class & Sec</th>
              <th className="p-4">B-Form / CNIC</th>
              <th className="p-4">Father Name & Contact</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {loading ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-400">
                  Loading student registers...
                </td>
              </tr>
            ) : students.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-400">
                  No matching student records found.
                </td>
              </tr>
            ) : (
              students.map((student) => (
                <tr key={student.id} className="hover:bg-slate-800/50 transition">
                  <td className="p-4">
                    <div className="font-semibold text-white text-sm">{student.fullName}</div>
                    <div className="text-[11px] text-sky-400 font-mono">
                      ID: {student.studentId} • Adm: {student.admissionNo}
                    </div>
                  </td>
                  <td className="p-4 font-semibold text-slate-200">
                    {student.gradeClass} - {student.section}
                  </td>
                  <td className="p-4 font-mono text-slate-400">{student.cnicOrBForm}</td>
                  <td className="p-4">
                    <div className="text-slate-200">{student.fatherName}</div>
                    <div className="text-slate-500 font-mono text-[11px]">{student.fatherPhone}</div>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        student.status === 'ACTIVE'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {student.status}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => inspectStudentProfile(student)}
                      className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition"
                    >
                      View Profile
                    </button>
                    <button
                      onClick={() => setPrintData(student)}
                      className="p-1.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 rounded-lg transition"
                      title="Print Official Profile Card"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination Controls */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div>
            Showing Page <strong>{page}</strong> of <strong>{totalPages}</strong>
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="p-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white rounded-lg transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="p-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white rounded-lg transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Student Admission Modal */}
      {showAdmissionModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-lg w-full p-6 text-xs text-slate-100">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-sky-400" />
                <span>New Student Admission Form</span>
              </h3>
              <button
                onClick={() => setShowAdmissionModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAdmissionSubmit} className="space-y-3">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Student Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Muhammad Ali"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-sky-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Class / Grade</label>
                  <select
                    value={gradeClass}
                    onChange={(e) => setGradeClass(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="Grade 9">Grade 9</option>
                    <option value="Grade 10">Grade 10</option>
                    <option value="O-Levels">O-Levels</option>
                    <option value="A-Levels">A-Levels</option>
                    <option value="BS CS">BS CS</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Section</label>
                  <select
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                    <option value="C">Section C</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">B-Form / CNIC</label>
                  <input
                    type="text"
                    value={cnicOrBForm}
                    onChange={(e) => setCnicOrBForm(e.target.value)}
                    placeholder="35202-1234567-1"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-sky-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Date of Birth</label>
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-sky-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Father / Guardian Name</label>
                  <input
                    type="text"
                    value={fatherName}
                    onChange={(e) => setFatherName(e.target.value)}
                    placeholder="Father Name"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-sky-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Guardian Phone</label>
                  <input
                    type="text"
                    value={fatherPhone}
                    onChange={(e) => setFatherPhone(e.target.value)}
                    placeholder="+92 300 1234567"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-sky-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Residential Address"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-sky-500"
                  required
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAdmissionModal(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-xl shadow-lg shadow-sky-500/20"
                >
                  Create Admission Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Selected Student Inspection Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full p-6 text-xs text-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-slate-800 pb-4 mb-4">
              <div>
                <span className="text-[10px] text-sky-400 font-bold uppercase tracking-wider">
                  Student Profile Record
                </span>
                <h2 className="text-2xl font-bold text-white">{selectedStudent.fullName}</h2>
                <p className="text-slate-400 text-xs">
                  {selectedStudent.gradeClass} - {selectedStudent.section} • Reg ID: <span className="font-mono text-sky-400">{selectedStudent.studentId}</span>
                </p>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Stats overview */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Attendance Rate</span>
                  <div className="text-lg font-bold text-emerald-400 mt-0.5">
                    {studentAttendanceRate || 95}%
                  </div>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">B-Form / CNIC</span>
                  <div className="text-xs font-mono font-bold text-white mt-0.5">
                    {selectedStudent.cnicOrBForm}
                  </div>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Guardian Contact</span>
                  <div className="text-xs font-mono text-white mt-0.5">{selectedStudent.fatherPhone}</div>
                </div>
              </div>

              {/* Fee Ledger Table */}
              <div>
                <h4 className="font-bold text-white mb-2 flex items-center justify-between">
                  <span>Historical Fee Ledger</span>
                  <span className="text-[10px] text-slate-400 font-normal">Auto-Reconciled</span>
                </h4>
                <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900 text-slate-400 font-semibold border-b border-slate-800">
                      <tr>
                        <th className="p-2.5">Voucher #</th>
                        <th className="p-2.5">Billing Month</th>
                        <th className="p-2.5">Amount</th>
                        <th className="p-2.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {studentFeeLedger.map((v) => (
                        <tr key={v.id}>
                          <td className="p-2.5 font-mono text-sky-400">{v.voucherNo}</td>
                          <td className="p-2.5 text-slate-300">{v.month}</td>
                          <td className="p-2.5 font-mono font-semibold text-white">
                            PKR {v.totalAmount?.toLocaleString()}
                          </td>
                          <td className="p-2.5">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                v.status === 'PAID'
                                  ? 'bg-emerald-500/10 text-emerald-400'
                                  : 'bg-rose-500/10 text-rose-400'
                              }`}
                            >
                              {v.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Printable Modal Overlay */}
      {printData && (
        <PrintModal
          type="STUDENT_CARD"
          institution={institution}
          data={printData}
          onClose={() => setPrintData(null)}
        />
      )}
    </div>
  );
};
