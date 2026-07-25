import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Users,
  Receipt,
  AlertTriangle,
  Plus,
  CheckSquare,
  FileSpreadsheet,
  TrendingUp,
  Megaphone,
  ArrowRight,
  Clock,
  Sparkles
} from 'lucide-react';
import { apiRequest } from '../api/client';
import { User, Institution } from '../types';

interface InstituteDashboardProps {
  user: User;
  institution: Institution | null;
  onNavigate: (view: string) => void;
}

export const InstituteDashboard: React.FC<InstituteDashboardProps> = ({
  user,
  institution,
  onNavigate
}) => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalStaff: 0,
    collectedFees: 0,
    unpaidFees: 0,
    attendancePercentage: 94.2
  });

  const [recentNotices, setRecentNotices] = useState<any[]>([]);
  const [earlyWarnings, setEarlyWarnings] = useState<any[]>([]);

  useEffect(() => {
    if (!institution) return;

    // Fetch stats
    apiRequest('/reports/dashboard-summary')
      .then((res) => {
        if (res.success && res.data) {
          setStats(res.data);
        }
      })
      .catch(() => {});

    // Fetch notices
    apiRequest('/notices')
      .then((res) => {
        if (res.success && res.data) {
          setRecentNotices(res.data.slice(0, 3));
        }
      })
      .catch(() => {});

    // Fetch warnings
    apiRequest('/search/early-warnings')
      .then((res) => {
        if (res.success && res.data) {
          setEarlyWarnings(res.data);
        }
      })
      .catch(() => {});
  }, [institution]);

  return (
    <div className="p-8 space-y-8 font-sans text-slate-100 max-w-7xl mx-auto">
      {/* Top Welcome Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800 border border-slate-800 p-6 rounded-2xl relative overflow-hidden shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 text-xs font-semibold mb-2 border border-sky-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{institution?.name} • ERP Operations Console</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {user.fullName}! 👋
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              Role: <span className="text-sky-400 font-semibold uppercase">{user.role}</span> • Session Status: <span className="text-emerald-400 font-semibold">Active Tenant Context</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onNavigate('students')}
              className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-lg shadow-sky-500/20 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Admission</span>
            </button>
            <button
              onClick={() => onNavigate('fees')}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition cursor-pointer"
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Collect Fee</span>
            </button>
            <button
              onClick={() => onNavigate('attendance')}
              className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Mark Attendance</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Enrolled Students */}
        <div
          onClick={() => onNavigate('students')}
          className="p-5 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl cursor-pointer transition group"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Enrolled Students</span>
            <div className="p-2 bg-sky-500/10 text-sky-400 rounded-xl group-hover:bg-sky-500 group-hover:text-white transition">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white mt-2">{stats.totalStudents}</div>
          <div className="text-[11px] text-sky-400 mt-1 flex items-center gap-1">
            <span>Active Academic Register</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition" />
          </div>
        </div>

        {/* Card 2: Faculty & Staff */}
        <div
          onClick={() => onNavigate('staff')}
          className="p-5 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl cursor-pointer transition group"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Faculty & Teachers</span>
            <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl group-hover:bg-purple-500 group-hover:text-white transition">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white mt-2">{stats.totalStaff}</div>
          <div className="text-[11px] text-purple-400 mt-1 flex items-center gap-1">
            <span>Academic & Admin Staff</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition" />
          </div>
        </div>

        {/* Card 3: Monthly Fee Collection */}
        <div
          onClick={() => onNavigate('fees')}
          className="p-5 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl cursor-pointer transition group"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>July Fee Collection</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl group-hover:bg-emerald-500 group-hover:text-white transition">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-400 mt-2 font-mono">
            PKR {stats.collectedFees.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Unpaid Dues: <span className="text-rose-400 font-bold">PKR {stats.unpaidFees.toLocaleString()}</span>
          </div>
        </div>

        {/* Card 4: Early Risk Warnings */}
        <div
          onClick={() => onNavigate('reports')}
          className="p-5 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl cursor-pointer transition group"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Early Warning Alerts</span>
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl group-hover:bg-amber-500 group-hover:text-white transition">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-amber-400 mt-2">{earlyWarnings.length}</div>
          <div className="text-[11px] text-amber-400 mt-1 flex items-center gap-1">
            <span>Academic & Attendance At-Risk</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition" />
          </div>
        </div>
      </div>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Risk & Defaulter Alerts */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Deterministic Early Risk Warning Dashboard</span>
            </h3>
            <button
              onClick={() => onNavigate('reports')}
              className="text-xs text-sky-400 hover:underline"
            >
              View Full Report →
            </button>
          </div>

          <div className="space-y-3">
            {earlyWarnings.map((warning) => (
              <div
                key={warning.id}
                className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white text-xs">{warning.studentName}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      warning.type === 'ATTENDANCE_RISK'
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {warning.type.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs mt-1">{warning.description}</p>
                </div>
                <button
                  onClick={() => onNavigate('students')}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium rounded-lg shrink-0"
                >
                  Inspect Profile
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Recent Notice Board */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-sky-400" />
              <span>Campus Announcements</span>
            </h3>
            <button
              onClick={() => onNavigate('notices')}
              className="text-xs text-sky-400 hover:underline"
            >
              Manage Board →
            </button>
          </div>

          <div className="space-y-3">
            {recentNotices.map((notice) => (
              <div key={notice.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-sky-400">{notice.title}</span>
                  <span className="text-[10px] text-slate-500">{notice.publishDate}</span>
                </div>
                <p className="text-slate-400 text-xs line-clamp-2">{notice.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
