import React, { useState, useEffect } from 'react';
import {
  Building2,
  Plus,
  Search,
  DollarSign,
  Users,
  ShieldCheck,
  Briefcase,
  CheckCircle2,
  Clock,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { apiRequest } from '../api/client';
import { Institution } from '../types';

interface SuperAdminDashboardProps {
  onRefreshInstitutions: () => void;
}

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ onRefreshInstitutions }) => {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'institutions' | 'billing' | 'crm'>('institutions');

  // New Institution Modal Form State
  const [showProvisionModal, setShowProvisionModal] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [plan, setPlan] = useState<'FREE' | 'BASIC' | 'PRO' | 'ENTERPRISE'>('PRO');
  const [loading, setLoading] = useState(false);

  const fetchPlatformData = async () => {
    try {
      const instRes = await apiRequest('/saas/institutions');
      if (instRes.success && instRes.data) {
        setInstitutions(instRes.data);
      }

      const invRes = await apiRequest('/saas/invoices');
      if (invRes.success && invRes.data) {
        setInvoices(invRes.data);
      }

      const crmRes = await apiRequest('/saas/crm');
      if (crmRes.success && crmRes.data) {
        setLeads(crmRes.data);
      }
    } catch (err) {
      console.error('Error fetching SaaS platform data:', err);
    }
  };

  useEffect(() => {
    fetchPlatformData();
  }, []);

  const handleProvisionInstitution = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await apiRequest('/saas/institutions', 'POST', {
        name,
        code,
        subdomain,
        address,
        phone,
        plan
      });

      if (res.success) {
        setShowProvisionModal(false);
        setName('');
        setCode('');
        setSubdomain('');
        setAddress('');
        setPhone('');
        fetchPlatformData();
        onRefreshInstitutions();
      }
    } catch (err: any) {
      alert(err.message || 'Provisioning failed');
    } finally {
      setLoading(false);
    }
  };

  const totalMRR = institutions.reduce((acc, inst) => {
    const prices = { FREE: 0, BASIC: 15000, PRO: 35000, ENTERPRISE: 85000 };
    return acc + (prices[inst.plan] || 0);
  }, 0);

  return (
    <div className="p-8 space-y-8 font-sans text-slate-100 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold mb-2 border border-amber-500/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>EduCore Multi-Tenant Master Control Plane</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Platform Administration & SaaS Subscriptions
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Manage educational institutions, track recurring ARR/MRR, and monitor client onboarding.
          </p>
        </div>

        <button
          onClick={() => setShowProvisionModal(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-semibold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-sky-500/20 transition cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Provision New Tenant</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Total Onboarded Schools</span>
            <Building2 className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-3xl font-extrabold text-white mt-2">{institutions.length}</div>
          <div className="text-[11px] text-sky-400 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>Active Tenant Workspaces</span>
          </div>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Monthly Recurring Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-white mt-2">
            PKR {totalMRR.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-400 mt-1">Contract MRR Run-Rate</div>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Enterprise Contracts</span>
            <Briefcase className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-extrabold text-white mt-2">
            {institutions.filter((i) => i.plan === 'ENTERPRISE' || i.plan === 'PRO').length}
          </div>
          <div className="text-[11px] text-purple-400 mt-1">High-Tier Tier SLAs</div>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Incoming CRM Leads</span>
            <Users className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-white mt-2">{leads.length}</div>
          <div className="text-[11px] text-amber-400 mt-1">Pending Onboarding Inquiries</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 text-xs font-medium">
        <button
          onClick={() => setActiveTab('institutions')}
          className={`pb-3 px-3 transition border-b-2 ${
            activeTab === 'institutions'
              ? 'border-sky-400 text-sky-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Tenant Institutions ({institutions.length})
        </button>
        <button
          onClick={() => setActiveTab('billing')}
          className={`pb-3 px-3 transition border-b-2 ${
            activeTab === 'billing'
              ? 'border-sky-400 text-sky-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          SaaS Billing & Invoices ({invoices.length})
        </button>
        <button
          onClick={() => setActiveTab('crm')}
          className={`pb-3 px-3 transition border-b-2 ${
            activeTab === 'crm'
              ? 'border-sky-400 text-sky-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Client Onboarding CRM ({leads.length})
        </button>
      </div>

      {/* Tab Content 1: Tenant Institutions */}
      {activeTab === 'institutions' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4">Institution Name</th>
                <th className="p-4">Tenant Code</th>
                <th className="p-4">Subdomain / Domain</th>
                <th className="p-4">SaaS Tier Plan</th>
                <th className="p-4">Status</th>
                <th className="p-4">Provisioned On</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {institutions.map((inst) => (
                <tr key={inst.id} className="hover:bg-slate-800/50 transition">
                  <td className="p-4 font-semibold text-white flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold">
                      {inst.name.charAt(0)}
                    </div>
                    <span>{inst.name}</span>
                  </td>
                  <td className="p-4 font-mono text-sky-400">{inst.code}</td>
                  <td className="p-4 text-slate-400 font-mono">{inst.subdomain}.educore.app</td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      {inst.plan}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {inst.status}
                    </span>
                  </td>
                  <td className="p-4 text-slate-400">{inst.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab Content 2: Billing & Invoices */}
      {activeTab === 'billing' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4">Invoice #</th>
                <th className="p-4">Institution</th>
                <th className="p-4">Billing Month</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4">Due Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-800/50 transition">
                  <td className="p-4 font-mono font-bold text-slate-200">{inv.invoiceNo}</td>
                  <td className="p-4 text-white font-medium">{inv.institutionName}</td>
                  <td className="p-4 text-slate-400">{inv.month}</td>
                  <td className="p-4 font-mono text-emerald-400 font-semibold">
                    PKR {inv.amount.toLocaleString()}
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {inv.status}
                    </span>
                  </td>
                  <td className="p-4 text-slate-400">{inv.dueDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab Content 3: CRM */}
      {activeTab === 'crm' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4">Inquirer Name</th>
                <th className="p-4">School / Campus</th>
                <th className="p-4">Contact Phone</th>
                <th className="p-4">Estimated Students</th>
                <th className="p-4">Stage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-800/50 transition">
                  <td className="p-4 font-medium text-white">{lead.inquirerName}</td>
                  <td className="p-4 text-slate-300">{lead.institutionName}</td>
                  <td className="p-4 text-slate-400 font-mono">{lead.phone}</td>
                  <td className="p-4 text-slate-300 font-bold">{lead.estimatedStudents}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      {lead.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Provision New Institution Modal */}
      {showProvisionModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 text-xs text-slate-100">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-sky-400" />
                <span>Provision New Tenant Institution</span>
              </h3>
              <button
                onClick={() => setShowProvisionModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleProvisionInstitution} className="space-y-3">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Institution Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Beaconhouse School System"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-sky-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Tenant Code</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="e.g. BSS"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono uppercase focus:outline-none focus:border-sky-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Subdomain Prefix</label>
                  <input
                    type="text"
                    value={subdomain}
                    onChange={(e) => setSubdomain(e.target.value.toLowerCase())}
                    placeholder="beaconhouse"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-sky-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">SaaS Tier Plan</label>
                <select
                  value={plan}
                  onChange={(e) => setPlan(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-sky-500"
                >
                  <option value="FREE">FREE Tier (Up to 100 students)</option>
                  <option value="BASIC">BASIC Tier (Up to 500 students - PKR 15k/mo)</option>
                  <option value="PRO">PRO Tier (Up to 2,000 students - PKR 35k/mo)</option>
                  <option value="ENTERPRISE">ENTERPRISE Tier (Unlimited - PKR 85k/mo)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Address / Campus</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Main Gulberg Campus, Lahore"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-sky-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Contact Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+92 42 111 232 266"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-sky-500"
                  required
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowProvisionModal(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-xl shadow-lg shadow-sky-500/20"
                >
                  {loading ? 'Provisioning...' : 'Deploy Tenant Workspace'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
