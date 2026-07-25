import React, { useState } from 'react';
import { Building2, ShieldCheck, UserCheck, KeyRound, Sparkles, ArrowRight, Info, CheckCircle2 } from 'lucide-react';
import { apiRequest, setAuthToken, setTenantContext } from '../api/client';
import { User, Institution } from '../types';

interface LoginViewProps {
  onLoginSuccess: (user: User, institution: Institution | null) => void;
  onOpenPublicSite: (slug: string) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess, onOpenPublicSite }) => {
  const [institutionCode, setInstitutionCode] = useState('TCS');
  const [email, setEmail] = useState('admin@thecityschool.edu.pk');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await apiRequest<{ token: string; user: User; institution: Institution | null }>(
        '/auth/login',
        'POST',
        { email, password, institutionCode }
      );

      if (res.success && res.data) {
        setAuthToken(res.data.token);
        if (res.data.institution) {
          setTenantContext(res.data.institution.id);
        } else {
          setTenantContext('');
        }
        onLoginSuccess(res.data.user, res.data.institution);
      } else {
        setError(res.message || 'Login failed. Please check credentials.');
      }
    } catch (err: any) {
      setError(err.message || 'Unable to sign in. Please verify server connectivity.');
    } finally {
      setLoading(false);
    }
  };

  const quickSelectRole = (
    code: string,
    userEmail: string,
    pass: string = 'admin123'
  ) => {
    setInstitutionCode(code);
    setEmail(userEmail);
    setPassword(pass);
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans relative overflow-hidden">
      {/* Background Subtle Gradient Spheres */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-sky-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="max-w-7xl w-full mx-auto px-6 py-6 flex items-center justify-between border-b border-slate-800/60 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-lg shadow-sky-500/20">
            E
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              EduCore <span className="text-xs bg-sky-500/20 text-sky-400 px-2 py-0.5 rounded-full border border-sky-500/30 font-medium">Enterprise SaaS</span>
            </h1>
            <p className="text-xs text-slate-400">Multi-Tenant School & College ERP Engine</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onOpenPublicSite('tcs')}
            className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-lg transition"
          >
            Preview TCS Website
          </button>
          <button
            onClick={() => onOpenPublicSite('lums')}
            className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-lg transition"
          >
            Preview LUMS Website
          </button>
        </div>
      </header>

      {/* Main Content Grid */}
      <main className="max-w-7xl w-full mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center z-10 flex-1">
        {/* Left Side: Product Details & Demo Credentials Panel */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 text-xs font-medium border border-sky-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ready-to-Test Enterprise Sandbox Environment</span>
          </div>

          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Comprehensive Management for <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-400 to-indigo-300">Modern Educational Institutions</span>
          </h2>

          <p className="text-slate-400 text-base leading-relaxed max-w-2xl">
            Isolated tenant workspaces with student admission registers, fee vouchers with online & cash payment counters, automated report card publication, teacher timetable conflict detection, and public branded website studio.
          </p>

          {/* Preset Demo Sign-In Credentials Section */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-sky-400" />
                <span>Quick Sign-In Credentials (Click to Auto-Fill)</span>
              </h3>
              <span className="text-xs text-slate-400">Password for all: <code className="text-amber-300 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">admin123</code></span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Super Admin */}
              <button
                onClick={() => quickSelectRole('DEMO001', 'admin-ndmahsan@educore.io')}
                className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-left transition group"
              >
                <div className="flex items-center justify-between font-semibold text-amber-400 group-hover:text-amber-300">
                  <span>1. Super Admin</span>
                  <span className="text-[10px] bg-amber-400/10 text-amber-400 px-1.5 py-0.5 rounded">Platform Owner</span>
                </div>
                <p className="text-slate-400 mt-1 truncate">Code: <span className="text-slate-200 font-mono">DEMO001</span></p>
                <p className="text-slate-400 truncate">User: <span className="text-slate-200 font-mono">admin-ndmahsan@educore.io</span></p>
              </button>

              {/* Institute Admin (TCS) */}
              <button
                onClick={() => quickSelectRole('TCS', 'admin@thecityschool.edu.pk')}
                className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-left transition group"
              >
                <div className="flex items-center justify-between font-semibold text-sky-400 group-hover:text-sky-300">
                  <span>2. School Admin (TCS)</span>
                  <span className="text-[10px] bg-sky-400/10 text-sky-400 px-1.5 py-0.5 rounded">The City School</span>
                </div>
                <p className="text-slate-400 mt-1 truncate">Code: <span className="text-slate-200 font-mono">TCS</span></p>
                <p className="text-slate-400 truncate">User: <span className="text-slate-200 font-mono">admin@thecityschool.edu.pk</span></p>
              </button>

              {/* Bursar / Accountant */}
              <button
                onClick={() => quickSelectRole('TCS', 'accountant@thecityschool.edu.pk')}
                className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-left transition group"
              >
                <div className="flex items-center justify-between font-semibold text-emerald-400 group-hover:text-emerald-300">
                  <span>3. Bursar / Accountant</span>
                  <span className="text-[10px] bg-emerald-400/10 text-emerald-400 px-1.5 py-0.5 rounded">Fees & Ledger</span>
                </div>
                <p className="text-slate-400 mt-1 truncate">Code: <span className="text-slate-200 font-mono">TCS</span></p>
                <p className="text-slate-400 truncate">User: <span className="text-slate-200 font-mono">accountant@thecityschool.edu.pk</span></p>
              </button>

              {/* Senior Teacher */}
              <button
                onClick={() => quickSelectRole('TCS', 'aisha.khan@thecityschool.edu.pk')}
                className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-left transition group"
              >
                <div className="flex items-center justify-between font-semibold text-purple-400 group-hover:text-purple-300">
                  <span>4. Senior Faculty</span>
                  <span className="text-[10px] bg-purple-400/10 text-purple-400 px-1.5 py-0.5 rounded">Attendance & Marks</span>
                </div>
                <p className="text-slate-400 mt-1 truncate">Code: <span className="text-slate-200 font-mono">TCS</span></p>
                <p className="text-slate-400 truncate">User: <span className="text-slate-200 font-mono">aisha.khan@thecityschool.edu.pk</span></p>
              </button>

              {/* Parent */}
              <button
                onClick={() => quickSelectRole('TCS', 'farooq.father@gmail.com')}
                className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-left transition group"
              >
                <div className="flex items-center justify-between font-semibold text-rose-400 group-hover:text-rose-300">
                  <span>5. Parent / Guardian</span>
                  <span className="text-[10px] bg-rose-400/10 text-rose-400 px-1.5 py-0.5 rounded">Parent Portal</span>
                </div>
                <p className="text-slate-400 mt-1 truncate">Code: <span className="text-slate-200 font-mono">TCS</span></p>
                <p className="text-slate-400 truncate">User: <span className="text-slate-200 font-mono">farooq.father@gmail.com</span></p>
              </button>

              {/* LUMS University Admin */}
              <button
                onClick={() => quickSelectRole('LUMS', 'principal@lums.edu.pk')}
                className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-left transition group"
              >
                <div className="flex items-center justify-between font-semibold text-teal-400 group-hover:text-teal-300">
                  <span>6. LUMS Academy Admin</span>
                  <span className="text-[10px] bg-teal-400/10 text-teal-400 px-1.5 py-0.5 rounded">LUMS Tenant</span>
                </div>
                <p className="text-slate-400 mt-1 truncate">Code: <span className="text-slate-200 font-mono">LUMS</span></p>
                <p className="text-slate-400 truncate">User: <span className="text-slate-200 font-mono">principal@lums.edu.pk</span></p>
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Sign In Form Box */}
        <div className="lg:col-span-5">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl relative">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-white mb-1">Sign in to your account</h3>
              <p className="text-slate-400 text-sm">Access your institution workspace or platform administration</p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <Info className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Institution Code
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={institutionCode}
                    onChange={(e) => setInstitutionCode(e.target.value.toUpperCase())}
                    placeholder="DEMO001, TCS, LUMS, ROOTS, BHS"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 font-mono transition uppercase"
                    required
                  />
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Use <span className="text-sky-400 font-medium">DEMO001</span> for Super Admin or <span className="text-sky-400 font-medium">TCS</span> for school workspace
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Username / Email Address
                </label>
                <div className="relative">
                  <UserCheck className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email address"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-sky-500/20 transition flex items-center justify-center gap-2 text-sm disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-800/80 text-center text-xs text-slate-500">
              <p>EduCore multi-tenant session is protected with strict institution-level query isolation.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 py-6 text-center text-xs text-slate-500 z-10">
        <p>© 2026 EduCore Enterprise ERP. Built with Node.js, Express REST API, and React.</p>
      </footer>
    </div>
  );
};
