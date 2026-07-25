import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Plus,
  Printer,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  DollarSign,
  CreditCard,
  X
} from 'lucide-react';
import { apiRequest } from '../api/client';
import { FeeVoucher, Institution } from '../types';
import { PrintModal } from '../components/PrintModal';

interface FeesViewProps {
  institution: Institution | null;
}

export const FeesView: React.FC<FeesViewProps> = ({ institution }) => {
  const [vouchers, setVouchers] = useState<FeeVoucher[]>([]);
  const [structures, setStructures] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [activeTab, setActiveTab] = useState<'vouchers' | 'structures'>('vouchers');

  // Generate Vouchers Modal
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [genClass, setGenClass] = useState('Grade 10');
  const [genMonth, setGenMonth] = useState('July 2026');
  const [genDueDate, setGenDueDate] = useState('2026-07-28');
  const [loadingGen, setLoadingGen] = useState(false);

  // Payment Collection Modal
  const [collectVoucher, setCollectVoucher] = useState<FeeVoucher | null>(null);
  const [paymentMode, setPaymentMode] = useState<'CASH' | 'BANK_TRANSFER' | 'CHEQUE'>('CASH');
  const [loadingPayment, setLoadingPayment] = useState(false);

  // Print Receipt Data
  const [printData, setPrintData] = useState<any | null>(null);

  const fetchFeeData = async () => {
    try {
      const vRes = await apiRequest('/fees/vouchers');
      if (vRes.success && vRes.data) {
        setVouchers(vRes.data);
      }

      const sRes = await apiRequest('/fees/structures');
      if (sRes.success && sRes.data) {
        setStructures(sRes.data);
      }
    } catch (err) {
      console.error('Error fetching fees data:', err);
    }
  };

  useEffect(() => {
    fetchFeeData();
  }, []);

  const handleGenerateVouchers = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingGen(true);
    try {
      const res = await apiRequest('/fees/vouchers/generate', 'POST', {
        gradeClass: genClass,
        month: genMonth,
        dueDate: genDueDate
      });

      if (res.success) {
        setShowGenerateModal(false);
        fetchFeeData();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to generate vouchers');
    } finally {
      setLoadingGen(false);
    }
  };

  const handleCollectPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!collectVoucher) return;
    setLoadingPayment(true);

    try {
      const res = await apiRequest(`/fees/vouchers/${collectVoucher.id}/pay`, 'POST', {
        paymentMode
      });

      if (res.success && res.data) {
        const updated = res.data;
        setCollectVoucher(null);
        fetchFeeData();
        setPrintData(updated);
      }
    } catch (err: any) {
      alert(err.message || 'Payment collection failed');
    } finally {
      setLoadingPayment(false);
    }
  };

  const filteredVouchers = vouchers.filter((v) => {
    const matchesSearch =
      v.studentName.toLowerCase().includes(search.toLowerCase()) ||
      v.voucherNo.toLowerCase().includes(search.toLowerCase()) ||
      v.studentId.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalCollected = vouchers
    .filter((v) => v.status === 'PAID')
    .reduce((acc, v) => acc + v.totalAmount, 0);

  const totalOutstanding = vouchers
    .filter((v) => v.status === 'UNPAID' || v.status === 'OVERDUE')
    .reduce((acc, v) => acc + v.totalAmount, 0);

  return (
    <div className="p-8 space-y-6 font-sans text-slate-100 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Receipt className="w-6 h-6 text-emerald-400" />
            <span>Fee Vouchers, Billing & Cash Register</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Automated monthly voucher generation, cash receipt printing, and defaulter tracking.
          </p>
        </div>

        <button
          onClick={() => setShowGenerateModal(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Generate Class Vouchers</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="text-slate-400 text-xs font-semibold">Total Fee Collected</div>
          <div className="text-2xl font-extrabold text-emerald-400 mt-2 font-mono">
            PKR {totalCollected.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-400/80 mt-1">Reconciled Payments</div>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="text-slate-400 text-xs font-semibold">Outstanding Dues</div>
          <div className="text-2xl font-extrabold text-rose-400 mt-2 font-mono">
            PKR {totalOutstanding.toLocaleString()}
          </div>
          <div className="text-[11px] text-rose-400/80 mt-1">Uncollected Fee Vouchers</div>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="text-slate-400 text-xs font-semibold">Vouchers Issued</div>
          <div className="text-2xl font-extrabold text-white mt-2">{vouchers.length}</div>
          <div className="text-[11px] text-sky-400 mt-1">July 2026 Billing Cycle</div>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div className="md:col-span-8 relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student name, voucher number, or student ID..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="md:col-span-4 flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="">All Voucher Statuses</option>
            <option value="PAID">PAID</option>
            <option value="UNPAID">UNPAID</option>
            <option value="OVERDUE">OVERDUE</option>
          </select>
        </div>
      </div>

      {/* Vouchers Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
            <tr>
              <th className="p-4">Voucher No</th>
              <th className="p-4">Student & Reg ID</th>
              <th className="p-4">Billing Month</th>
              <th className="p-4">Total Fee</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredVouchers.map((v) => (
              <tr key={v.id} className="hover:bg-slate-800/50 transition">
                <td className="p-4 font-mono font-bold text-sky-400">{v.voucherNo}</td>
                <td className="p-4">
                  <div className="font-bold text-white text-sm">{v.studentName}</div>
                  <div className="text-[11px] text-slate-400 font-mono">ID: {v.studentId}</div>
                </td>
                <td className="p-4 text-slate-300 font-medium">{v.month}</td>
                <td className="p-4 font-mono font-bold text-emerald-400 text-sm">
                  PKR {v.totalAmount?.toLocaleString()}
                </td>
                <td className="p-4">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      v.status === 'PAID'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {v.status}
                  </span>
                </td>
                <td className="p-4 text-right space-x-2">
                  {v.status !== 'PAID' ? (
                    <button
                      onClick={() => setCollectVoucher(v)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition"
                    >
                      Collect Cash
                    </button>
                  ) : (
                    <button
                      onClick={() => setPrintData(v)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 inline-flex"
                    >
                      <Printer className="w-3.5 h-3.5 text-sky-400" />
                      <span>Print Receipt</span>
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Generate Vouchers Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 text-xs text-slate-100">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-400" />
                <span>Generate Monthly Class Vouchers</span>
              </h3>
              <button
                onClick={() => setShowGenerateModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleGenerateVouchers} className="space-y-3">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Target Class</label>
                <select
                  value={genClass}
                  onChange={(e) => setGenClass(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Grade 10">Grade 10</option>
                  <option value="Grade 9">Grade 9</option>
                  <option value="O-Levels">O-Levels</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Billing Month Name</label>
                <input
                  type="text"
                  value={genMonth}
                  onChange={(e) => setGenMonth(e.target.value)}
                  placeholder="e.g. July 2026"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Due Payment Date</label>
                <input
                  type="date"
                  value={genDueDate}
                  onChange={(e) => setGenDueDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loadingGen}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/20"
                >
                  {loadingGen ? 'Generating...' : 'Batch Issue Vouchers'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Collect Fee Cash Modal */}
      {collectVoucher && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 text-xs text-slate-100">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                <span>Collect Cash Payment Counter</span>
              </h3>
              <button
                onClick={() => setCollectVoucher(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 mb-4 space-y-1">
              <div className="text-slate-400">Student: <strong className="text-white">{collectVoucher.studentName}</strong></div>
              <div className="text-slate-400">Voucher No: <span className="font-mono text-sky-400">{collectVoucher.voucherNo}</span></div>
              <div className="text-slate-400">Total Payable: <strong className="text-emerald-400 font-mono text-sm">PKR {collectVoucher.totalAmount?.toLocaleString()}</strong></div>
            </div>

            <form onSubmit={handleCollectPayment} className="space-y-4">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Payment Mode</label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="CASH">Cash Counter</option>
                  <option value="BANK_TRANSFER">Online Bank Transfer</option>
                  <option value="CHEQUE">Bank Cheque</option>
                </select>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setCollectVoucher(null)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loadingPayment}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/20"
                >
                  {loadingPayment ? 'Processing...' : 'Confirm Payment & Print Receipt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Print Voucher Modal */}
      {printData && (
        <PrintModal
          type="FEE_RECEIPT"
          institution={institution}
          data={printData}
          onClose={() => setPrintData(null)}
        />
      )}
    </div>
  );
};
