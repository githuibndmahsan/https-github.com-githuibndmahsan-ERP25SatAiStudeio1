import React, { useState, useEffect } from 'react';
import { BarChart3, AlertTriangle, FileSpreadsheet, Download, Printer } from 'lucide-react';
import { apiRequest } from '../api/client';

export const ReportsView: React.FC = () => {
  const [defaulters, setDefaulters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest('/reports/defaulters')
      .then((res) => {
        if (res.success && res.data) {
          setDefaulters(res.data);
        }
      })
      .catch((err) => console.error('Reports fetch error:', err))
      .finally(() => setLoading(false));
  }, []);

  const totalOutstanding = defaulters.reduce((acc, d) => acc + d.totalAmount, 0);

  return (
    <div className="p-8 space-y-6 font-sans text-slate-100 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-sky-400" />
            <span>Academic Analytics & Defaulters Report</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Real-time fee defaulters list, attendance risk registers, and exportable financial audits.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-sky-500/20 transition cursor-pointer self-start sm:self-auto"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Export Audit Report</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="text-slate-400 text-xs font-semibold">Total Active Defaulters</div>
          <div className="text-3xl font-extrabold text-rose-400 mt-2">{defaulters.length}</div>
          <div className="text-[11px] text-rose-400/80 mt-1">Students with Unpaid Vouchers</div>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="text-slate-400 text-xs font-semibold">Cumulative Defaulter Balance</div>
          <div className="text-3xl font-extrabold text-rose-400 mt-2 font-mono">
            PKR {totalOutstanding.toLocaleString()}
          </div>
          <div className="text-[11px] text-rose-400/80 mt-1">Pending Financial Receivables</div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 bg-slate-950 border-b border-slate-800 font-bold text-white text-sm flex items-center justify-between">
          <span>Fee Defaulters Roster</span>
          <span className="text-xs text-rose-400 font-normal">Overdue Accounts</span>
        </div>

        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
            <tr>
              <th className="p-4">Student Name & Reg ID</th>
              <th className="p-4">Voucher No</th>
              <th className="p-4">Billing Month</th>
              <th className="p-4">Amount Due</th>
              <th className="p-4">Due Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {loading ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-slate-400">
                  Loading defaulter records...
                </td>
              </tr>
            ) : defaulters.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-emerald-400 font-medium">
                  🎉 Zero fee defaulters found! All student accounts are fully cleared.
                </td>
              </tr>
            ) : (
              defaulters.map((d) => (
                <tr key={d.id} className="hover:bg-slate-800/50 transition">
                  <td className="p-4">
                    <div className="font-bold text-white text-sm">{d.studentName}</div>
                    <div className="text-[11px] text-slate-400 font-mono">ID: {d.studentId}</div>
                  </td>
                  <td className="p-4 font-mono text-sky-400">{d.voucherNo}</td>
                  <td className="p-4 text-slate-300">{d.month}</td>
                  <td className="p-4 font-mono font-bold text-rose-400 text-sm">
                    PKR {d.totalAmount?.toLocaleString()}
                  </td>
                  <td className="p-4 text-slate-400 font-mono">{d.dueDate}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
