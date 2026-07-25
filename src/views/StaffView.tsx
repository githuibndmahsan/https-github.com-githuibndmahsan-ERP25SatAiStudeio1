import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Mail, Phone, Briefcase, DollarSign, X } from 'lucide-react';
import { apiRequest } from '../api/client';
import { Staff } from '../types';

export const StaffView: React.FC = () => {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [designation, setDesignation] = useState('Senior Subject Specialist');
  const [department, setDepartment] = useState('Sciences');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [salary, setSalary] = useState(65000);

  const fetchStaff = async () => {
    try {
      const res = await apiRequest('/staff');
      if (res.success && res.data) {
        setStaffList(res.data);
      }
    } catch (err) {
      console.error('Error fetching staff:', err);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiRequest('/staff', 'POST', {
        fullName,
        designation,
        department,
        email,
        phone,
        salary
      });

      if (res.success) {
        setShowAddModal(false);
        setFullName('');
        setEmail('');
        setPhone('');
        fetchStaff();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to add staff');
    }
  };

  const filtered = staffList.filter(
    (st) =>
      st.fullName.toLowerCase().includes(search.toLowerCase()) ||
      st.designation.toLowerCase().includes(search.toLowerCase()) ||
      st.employeeId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 space-y-6 font-sans text-slate-100 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-purple-400" />
            <span>Faculty & Academic Staff ({staffList.length})</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Teacher roster, department specialization, contact info, and payroll structure.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-purple-500/20 transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Staff Member</span>
        </button>
      </div>

      <div className="relative bg-slate-900 border border-slate-800 p-3 rounded-2xl">
        <Search className="w-4 h-4 text-slate-500 absolute left-6 top-5" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search staff name, ID, or designation..."
          className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((staff) => (
          <div
            key={staff.id}
            className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3 relative hover:border-slate-700 transition"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-purple-400 font-mono">
                  {staff.employeeId}
                </span>
                <h3 className="font-bold text-white text-base leading-tight mt-0.5">
                  {staff.fullName}
                </h3>
                <p className="text-slate-400 text-xs">{staff.designation}</p>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                {staff.department}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-800/80 text-xs space-y-1.5 text-slate-400">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span className="truncate text-slate-200">{staff.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                <span className="font-mono text-slate-200">{staff.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-mono text-emerald-400 font-semibold">
                  Salary: PKR {staff.salary?.toLocaleString()} / mo
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 text-xs text-slate-100">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-400" />
                <span>Add Staff Member</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddStaff} className="space-y-3">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Dr. Salman Ahmed"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Designation</label>
                  <input
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="Senior Subject Teacher"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="Sciences">Sciences</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Languages">Languages</option>
                    <option value="Administration">Administration</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="teacher@school.edu.pk"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+92 300 1234567"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Monthly Salary (PKR)</label>
                  <input
                    type="number"
                    value={salary}
                    onChange={(e) => setSalary(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/20"
                >
                  Add Staff Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
