import React from 'react';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  CalendarDays,
  CheckSquare,
  Receipt,
  FileSpreadsheet,
  BookOpenCheck,
  CalendarCheck,
  Megaphone,
  Globe,
  BarChart3,
  ShieldCheck,
  Building2,
  ChevronRight
} from 'lucide-react';
import { User, Institution } from '../types';

interface SidebarProps {
  currentView: string;
  user: User;
  currentInstitution: Institution | null;
  onNavigate: (view: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  user,
  currentInstitution,
  onNavigate
}) => {
  const isSuperAdminView = currentView === 'super-admin';

  const erpNavItems = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'students', label: 'Student Management', icon: GraduationCap },
    { id: 'staff', label: 'Faculty & Staff', icon: Users },
    { id: 'timetable', label: 'Master Timetable', icon: CalendarDays },
    { id: 'attendance', label: 'Daily Attendance', icon: CheckSquare },
    { id: 'fees', label: 'Fee Vouchers & Ledger', icon: Receipt },
    { id: 'exams', label: 'Exams & Result Cards', icon: FileSpreadsheet },
    { id: 'assignments', label: 'Homework & Tasks', icon: BookOpenCheck },
    { id: 'ptm', label: 'PTM Schedules', icon: CalendarCheck },
    { id: 'notices', label: 'Notice Board', icon: Megaphone },
    { id: 'website-studio', label: 'Website Studio', icon: Globe },
    { id: 'reports', label: 'Reports & Defaulters', icon: BarChart3 }
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 font-sans min-h-[calc(100vh-4rem)]">
      <div className="p-4 space-y-6">
        {/* Active Workspace Banner */}
        <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            Active Workspace
          </div>
          <div className="font-semibold text-white text-sm truncate">
            {isSuperAdminView ? '🌐 Platform Control Plane' : currentInstitution?.name || 'No Institution'}
          </div>
          <div className="text-xs text-sky-400 mt-0.5">
            {isSuperAdminView ? 'Super Admin Mode' : `Code: ${currentInstitution?.code || 'N/A'}`}
          </div>
        </div>

        {/* Super Admin Switcher Link if user has permission */}
        {user.role === 'SUPER_ADMIN' && (
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 mb-2">
              Platform Admin
            </div>
            <button
              onClick={() => onNavigate('super-admin')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                isSuperAdminView
                  ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Multi-Tenant Platform</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ERP Modules List */}
        {!isSuperAdminView && (
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 mb-2">
              ERP Core Modules
            </div>
            <nav className="space-y-1">
              {erpNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                      isActive
                        ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20 font-semibold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        )}
      </div>

      {/* Footer System Info */}
      <div className="p-4 border-t border-slate-800 text-[11px] text-slate-500">
        <div className="flex items-center justify-between mb-1">
          <span>System Status:</span>
          <span className="text-emerald-400 font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Online
          </span>
        </div>
        <div>Tenant Isolation: <span className="text-slate-400">Strict Enabled</span></div>
      </div>
    </aside>
  );
};
