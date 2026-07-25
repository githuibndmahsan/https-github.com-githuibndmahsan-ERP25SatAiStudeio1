import React, { useState, useEffect } from 'react';
import { Building2, Phone, Mail, MapPin, Sparkles, GraduationCap, Users, ArrowRight, ArrowLeft } from 'lucide-react';
import { apiRequest } from '../api/client';

interface PublicWebsiteViewProps {
  slug: string;
  onBackToApp: () => void;
}

export const PublicWebsiteView: React.FC<PublicWebsiteViewProps> = ({ slug, onBackToApp }) => {
  const [siteData, setSiteData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest(`/website/public/${slug}`)
      .then((res) => {
        if (res.success && res.data) {
          setSiteData(res.data);
        }
      })
      .catch((err) => console.error('Public site fetch error:', err))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center font-sans">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 text-xs">Loading Institution Website...</p>
        </div>
      </div>
    );
  }

  const inst = siteData?.institution;
  const config = siteData?.config;
  const staff = siteData?.faculty || [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Admin Quick Back Bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-2 flex items-center justify-between text-xs">
        <button
          onClick={onBackToApp}
          className="text-sky-400 hover:underline flex items-center gap-1 font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to ERP Console</span>
        </button>
        <span className="text-slate-500">
          Public Website Engine • Domain: <code className="text-slate-300 font-mono">{inst?.subdomain || slug}.educore.app</code>
        </span>
      </div>

      {/* Top Header Navigation */}
      <header className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between border-b border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-lg shadow-sky-500/20">
            {inst?.name?.charAt(0) || 'E'}
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">{inst?.name || 'EduCore Academy'}</h1>
            <p className="text-xs text-slate-400">{inst?.address}</p>
          </div>
        </div>

        <button
          onClick={onBackToApp}
          className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold shadow-md transition"
        >
          Student Portal Login
        </button>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 text-xs font-medium border border-sky-500/20">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Admissions Open for Session 2026-2027</span>
        </div>

        <h2 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight max-w-4xl mx-auto">
          {config?.heroTitle || 'Empowering Future Leaders Through Academic Excellence'}
        </h2>

        <p className="text-slate-400 text-base max-w-2xl mx-auto leading-relaxed">
          {config?.heroSubtitle || 'Fostering intellectual growth, character development, and modern STEM innovation.'}
        </p>

        <div className="pt-4 flex items-center justify-center gap-4">
          <button
            onClick={onBackToApp}
            className="px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-semibold rounded-xl text-sm shadow-xl shadow-sky-500/20 transition flex items-center gap-2 cursor-pointer"
          >
            <span>Apply for Admission Online</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* About Us Section */}
      <section className="bg-slate-900 border-y border-slate-800 py-16 px-6">
        <div className="max-w-5xl mx-auto space-y-4 text-center">
          <h3 className="text-2xl font-bold text-white">About Our Institution</h3>
          <p className="text-slate-300 text-sm leading-relaxed max-w-3xl mx-auto">
            {config?.aboutUs || 'Dedicated to providing world-class education with state-of-the-art laboratories and veteran faculty.'}
          </p>
        </div>
      </section>

      {/* Featured Faculty Staff Roster */}
      <section className="max-w-7xl mx-auto px-6 py-16 space-y-8">
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold text-white">Distinguished Academic Faculty</h3>
          <p className="text-slate-400 text-xs">Meet our experienced educators and department specialists</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {staff.map((st: any) => (
            <div key={st.id} className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
              <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold text-lg mb-2">
                {st.fullName.charAt(0)}
              </div>
              <h4 className="font-bold text-white text-base">{st.fullName}</h4>
              <p className="text-sky-400 text-xs font-semibold">{st.designation}</p>
              <p className="text-slate-500 text-xs">{st.department} Department</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-12 px-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h4 className="font-bold text-white text-sm mb-2">{inst?.name}</h4>
            <p className="text-slate-400 leading-relaxed">{inst?.address}</p>
          </div>
          <div>
            <h4 className="font-bold text-white text-sm mb-2">Contact Details</h4>
            <p className="text-slate-400">Phone: {config?.phone || inst?.phone}</p>
            <p className="text-slate-400">Email: {config?.email}</p>
          </div>
          <div>
            <h4 className="font-bold text-white text-sm mb-2">EduCore Enterprise SaaS</h4>
            <p className="text-slate-400">Powered by EduCore Cloud School Management Engine.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
