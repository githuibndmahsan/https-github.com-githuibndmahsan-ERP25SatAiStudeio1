import React, { useState, useEffect } from 'react';
import {
  Search,
  Bell,
  Building2,
  LogOut,
  User as UserIcon,
  Globe,
  ChevronDown,
  AlertTriangle,
  X
} from 'lucide-react';
import { User, Institution } from '../types';
import { apiRequest, setTenantContext } from '../api/client';

interface NavbarProps {
  user: User;
  currentInstitution: Institution | null;
  allInstitutions: Institution[];
  onSelectInstitution: (institution: Institution | null) => void;
  onLogout: () => void;
  onNavigate: (view: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  currentInstitution,
  allInstitutions,
  onSelectInstitution,
  onLogout,
  onNavigate
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{
    students: any[];
    staff: any[];
    vouchers: any[];
  }>({ students: [], staff: [], vouchers: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [earlyWarnings, setEarlyWarnings] = useState<any[]>([]);
  const [showWarningPanel, setShowWarningPanel] = useState(false);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults({ students: [], staff: [], vouchers: [] });
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await apiRequest(`/search?q=${encodeURIComponent(searchQuery)}`);
        if (res.success && res.data) {
          setSearchResults(res.data);
          setShowDropdown(true);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch early warnings
  useEffect(() => {
    if (currentInstitution) {
      apiRequest('/search/early-warnings')
        .then((res) => {
          if (res.success && res.data) {
            setEarlyWarnings(res.data);
          }
        })
        .catch(() => {});
    }
  }, [currentInstitution]);

  const handleSelectTenant = (instId: string) => {
    if (instId === 'SUPER_ADMIN') {
      setTenantContext('');
      onSelectInstitution(null);
      onNavigate('super-admin');
    } else {
      const selected = allInstitutions.find((i) => i.id === instId);
      if (selected) {
        setTenantContext(selected.id);
        onSelectInstitution(selected);
        onNavigate('dashboard');
      }
    }
  };

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-30 font-sans">
      {/* Left: Brand & Tenant Selector */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => onNavigate('dashboard')}>
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-sky-500/20">
            E
          </div>
          <span className="font-bold text-white text-base tracking-tight hidden sm:inline">
            EduCore <span className="text-sky-400 font-normal text-xs ml-1">ERP</span>
          </span>
        </div>

        {/* Tenant Workspace Switcher */}
        <div className="relative">
          <select
            value={currentInstitution ? currentInstitution.id : 'SUPER_ADMIN'}
            onChange={(e) => handleSelectTenant(e.target.value)}
            className="bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs font-medium text-slate-200 rounded-lg py-1.5 pl-3 pr-8 focus:outline-none focus:border-sky-500 cursor-pointer transition"
          >
            {user.role === 'SUPER_ADMIN' && (
              <option value="SUPER_ADMIN">🌐 Platform Administration (Super Admin)</option>
            )}
            {allInstitutions.map((inst) => (
              <option key={inst.id} value={inst.id}>
                🏫 {inst.name} ({inst.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Middle: Global Tenant Search Bar */}
      {currentInstitution && (
        <div className="relative flex-1 max-w-md mx-6 hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search student, staff, fee voucher..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition"
            />
            {isSearching && (
              <span className="absolute right-3 top-2 text-[10px] text-sky-400 animate-pulse">
                Searching...
              </span>
            )}
          </div>

          {/* Search Dropdown Results */}
          {showDropdown && (
            <div className="absolute left-0 right-0 top-10 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 z-50 text-xs max-h-80 overflow-y-auto">
              {searchResults.students.length === 0 &&
              searchResults.staff.length === 0 &&
              searchResults.vouchers.length === 0 ? (
                <div className="p-3 text-slate-400 text-center">No matching records found.</div>
              ) : (
                <div className="space-y-3">
                  {searchResults.students.length > 0 && (
                    <div>
                      <div className="text-[10px] font-bold text-sky-400 uppercase tracking-wider px-2 py-1">
                        Students
                      </div>
                      {searchResults.students.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => {
                            setShowDropdown(false);
                            onNavigate('students');
                          }}
                          className="p-2 hover:bg-slate-800 rounded-lg cursor-pointer flex justify-between items-center"
                        >
                          <span className="font-medium text-white">{item.title}</span>
                          <span className="text-slate-400 text-[11px]">{item.subtitle}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {searchResults.staff.length > 0 && (
                    <div>
                      <div className="text-[10px] font-bold text-purple-400 uppercase tracking-wider px-2 py-1">
                        Staff & Teachers
                      </div>
                      {searchResults.staff.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => {
                            setShowDropdown(false);
                            onNavigate('staff');
                          }}
                          className="p-2 hover:bg-slate-800 rounded-lg cursor-pointer flex justify-between items-center"
                        >
                          <span className="font-medium text-white">{item.title}</span>
                          <span className="text-slate-400 text-[11px]">{item.subtitle}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {searchResults.vouchers.length > 0 && (
                    <div>
                      <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider px-2 py-1">
                        Fee Vouchers
                      </div>
                      {searchResults.vouchers.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => {
                            setShowDropdown(false);
                            onNavigate('fees');
                          }}
                          className="p-2 hover:bg-slate-800 rounded-lg cursor-pointer flex justify-between items-center"
                        >
                          <span className="font-medium text-white">{item.title}</span>
                          <span className="text-slate-400 text-[11px]">{item.subtitle}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Right: Actions, Early Warnings & Profile */}
      <div className="flex items-center gap-3">
        {/* Public Site Link */}
        {currentInstitution && (
          <button
            onClick={() => onNavigate('public-site')}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-medium border border-slate-700 transition"
            title="Preview Institution Public Website"
          >
            <Globe className="w-3.5 h-3.5 text-sky-400" />
            <span>Public Site</span>
          </button>
        )}

        {/* Early Warning Bell */}
        {currentInstitution && (
          <div className="relative">
            <button
              onClick={() => setShowWarningPanel(!showWarningPanel)}
              className="p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 hover:text-white hover:border-slate-700 relative transition"
            >
              <Bell className="w-4 h-4" />
              {earlyWarnings.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                  {earlyWarnings.length}
                </span>
              )}
            </button>

            {/* Early Warnings Popover Panel */}
            {showWarningPanel && (
              <div className="absolute right-0 top-11 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 z-50 text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                  <h4 className="font-bold text-white flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>Early Warning Alerts ({earlyWarnings.length})</span>
                  </h4>
                  <button
                    onClick={() => setShowWarningPanel(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {earlyWarnings.length === 0 ? (
                  <p className="text-slate-400 py-3 text-center">No risk alerts found.</p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {earlyWarnings.map((w) => (
                      <div
                        key={w.id}
                        className={`p-2.5 rounded-xl border ${
                          w.type === 'ATTENDANCE_RISK'
                            ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                            : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                        }`}
                      >
                        <div className="font-semibold text-white mb-0.5">{w.studentName}</div>
                        <div className="text-[11px] opacity-90">{w.description}</div>
                        <div className="text-[10px] opacity-60 mt-1">{w.date}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Active User Badge */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-sky-400 font-bold text-xs">
            {user.fullName.charAt(0)}
          </div>
          <div className="hidden lg:block text-left">
            <div className="text-xs font-semibold text-white leading-none">{user.fullName}</div>
            <div className="text-[10px] text-slate-400 mt-0.5 capitalize">{user.role.replace('_', ' ')}</div>
          </div>

          <button
            onClick={onLogout}
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition ml-1"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
