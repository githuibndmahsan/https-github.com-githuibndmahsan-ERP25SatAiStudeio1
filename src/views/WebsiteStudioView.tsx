import React, { useState, useEffect } from 'react';
import { Globe, Save, ExternalLink, Sparkles, Image, Check } from 'lucide-react';
import { apiRequest } from '../api/client';
import { WebsiteConfig, Institution } from '../types';

interface WebsiteStudioProps {
  institution: Institution | null;
  onOpenPublicSite: (slug: string) => void;
}

export const WebsiteStudioView: React.FC<WebsiteStudioProps> = ({
  institution,
  onOpenPublicSite
}) => {
  const [config, setConfig] = useState<WebsiteConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Editable state
  const [heroTitle, setHeroTitle] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [aboutUs, setAboutUs] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#0284c7');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const fetchConfig = async () => {
    try {
      const res = await apiRequest('/website/config');
      if (res.success && res.data) {
        setConfig(res.data);
        setHeroTitle(res.data.heroTitle);
        setHeroSubtitle(res.data.heroSubtitle);
        setAboutUs(res.data.aboutUs);
        setPrimaryColor(res.data.primaryColor || '#0284c7');
        setPhone(res.data.phone);
        setEmail(res.data.email);
      }
    } catch (err) {
      console.error('Error fetching website config:', err);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      const res = await apiRequest('/website/config', 'PUT', {
        heroTitle,
        heroSubtitle,
        aboutUs,
        primaryColor,
        phone,
        email
      });

      if (res.success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      alert('Failed to save website config');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 space-y-6 font-sans text-slate-100 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Globe className="w-6 h-6 text-sky-400" />
            <span>Public Website Studio & Content Builder</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Customize your school's branded landing page, contact info, hero banners, and faculty showcases.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onOpenPublicSite(institution?.code.toLowerCase() || 'tcs')}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-2 border border-slate-700 transition"
          >
            <ExternalLink className="w-4 h-4 text-sky-400" />
            <span>Preview Public Website</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>Public website customization saved!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-2">
              Hero Header Banner
            </h3>

            <div>
              <label className="block text-slate-400 text-xs font-semibold mb-1">Hero Title</label>
              <input
                type="text"
                value={heroTitle}
                onChange={(e) => setHeroTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-sky-500"
                required
              />
            </div>

            <div>
              <label className="block text-slate-400 text-xs font-semibold mb-1">Hero Subtitle</label>
              <textarea
                value={heroSubtitle}
                onChange={(e) => setHeroSubtitle(e.target.value)}
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-sky-500"
                required
              />
            </div>

            <div>
              <label className="block text-slate-400 text-xs font-semibold mb-1">Primary Theme Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer p-1"
                />
                <span className="font-mono text-xs text-slate-300">{primaryColor}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-2">
              About & Contact Information
            </h3>

            <div>
              <label className="block text-slate-400 text-xs font-semibold mb-1">About Us Section</label>
              <textarea
                value={aboutUs}
                onChange={(e) => setAboutUs(e.target.value)}
                rows={4}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-sky-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-1">Public Contact Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white font-mono focus:outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-1">Public Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-sky-500/20 transition cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Publish Website Updates'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
