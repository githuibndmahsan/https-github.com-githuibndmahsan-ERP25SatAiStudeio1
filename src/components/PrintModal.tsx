import React from 'react';
import { X, Printer, Download, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Student, FeeVoucher, ExamResult, Institution } from '../types';

interface PrintModalProps {
  type: 'STUDENT_CARD' | 'FEE_RECEIPT' | 'RESULT_CARD';
  institution: Institution | null;
  data: any;
  onClose: () => void;
}

export const PrintModal: React.FC<PrintModalProps> = ({
  type,
  institution,
  data,
  onClose
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white text-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full p-8 relative print:p-0 print:shadow-none print:w-full print:max-w-none">
        {/* Action Controls - Hidden on Print */}
        <div className="flex items-center justify-between border-b pb-4 mb-6 print:hidden">
          <h3 className="font-bold text-slate-800 text-lg">Official Document Preview</h3>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-md transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Download PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Header Branding for Official Document */}
        <div className="text-center border-b-2 border-slate-900 pb-4 mb-6">
          <h1 className="text-2xl font-extrabold uppercase tracking-tight text-slate-900">
            {institution?.name || 'EduCore Partner Institution'}
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            {institution?.address || 'Main Campus'} • Phone: {institution?.phone || 'N/A'}
          </p>
          <div className="inline-block mt-2 px-3 py-0.5 bg-slate-100 rounded-full text-[10px] font-bold tracking-widest text-slate-700 uppercase">
            Official Academic Record
          </div>
        </div>

        {/* Content 1: CV-Style Student Profile */}
        {type === 'STUDENT_CARD' && (
          <div className="space-y-6 text-xs">
            <div className="flex items-start justify-between bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Student Name</span>
                <h2 className="text-xl font-bold text-slate-900">{data.fullName}</h2>
                <p className="text-slate-600 text-xs mt-1">
                  Admission No: <span className="font-mono font-semibold">{data.admissionNo}</span>
                </p>
                <p className="text-slate-600 text-xs">
                  Class & Section: <span className="font-semibold">{data.gradeClass} - {data.section}</span>
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase">System Reg ID</span>
                <p className="font-mono font-bold text-slate-800 text-sm">{data.studentId}</p>
                <span className={`inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  data.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  {data.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 border rounded-xl space-y-1">
                <div className="text-[10px] text-slate-500 font-bold uppercase">CNIC / B-Form</div>
                <div className="font-mono font-medium text-slate-800">{data.cnicOrBForm}</div>
              </div>
              <div className="p-3 border rounded-xl space-y-1">
                <div className="text-[10px] text-slate-500 font-bold uppercase">Date of Birth</div>
                <div className="font-medium text-slate-800">{data.dateOfBirth}</div>
              </div>
              <div className="p-3 border rounded-xl space-y-1">
                <div className="text-[10px] text-slate-500 font-bold uppercase">Father / Guardian Name</div>
                <div className="font-medium text-slate-800">{data.fatherName}</div>
              </div>
              <div className="p-3 border rounded-xl space-y-1">
                <div className="text-[10px] text-slate-500 font-bold uppercase">Guardian Contact Phone</div>
                <div className="font-mono font-medium text-slate-800">{data.fatherPhone}</div>
              </div>
            </div>

            <div className="p-3 border rounded-xl">
              <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">Residential Address</div>
              <div className="text-slate-800">{data.address}</div>
            </div>
          </div>
        )}

        {/* Content 2: Fee Voucher Receipt */}
        {type === 'FEE_RECEIPT' && (
          <div className="space-y-6 text-xs">
            <div className="flex justify-between items-center bg-emerald-50 p-4 rounded-xl border border-emerald-200">
              <div>
                <div className="text-[10px] text-emerald-700 font-bold uppercase">Voucher Number</div>
                <div className="text-lg font-bold font-mono text-emerald-900">{data.voucherNo}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-emerald-700 font-bold uppercase">Status</div>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                  data.status === 'PAID' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                }`}>
                  {data.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase">Student Name:</span>
                <p className="font-bold text-slate-900 text-sm">{data.studentName}</p>
                <p className="text-slate-600">ID: {data.studentId}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Billing Month:</span>
                <p className="font-bold text-slate-900 text-sm">{data.month}</p>
                <p className="text-slate-600">Due Date: {data.dueDate}</p>
              </div>
            </div>

            <table className="w-full text-left border-collapse border border-slate-200">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold">
                  <th className="p-2 border">Description</th>
                  <th className="p-2 border text-right">Amount (PKR)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2 border">Monthly Tuition Fee</td>
                  <td className="p-2 border text-right font-mono">{data.tuitionFee?.toLocaleString()}</td>
                </tr>
                {data.labFee > 0 && (
                  <tr>
                    <td className="p-2 border">Laboratory & IT Charges</td>
                    <td className="p-2 border text-right font-mono">{data.labFee?.toLocaleString()}</td>
                  </tr>
                )}
                {data.examFee > 0 && (
                  <tr>
                    <td className="p-2 border">Examination Fee</td>
                    <td className="p-2 border text-right font-mono">{data.examFee?.toLocaleString()}</td>
                  </tr>
                )}
                {data.otherCharges > 0 && (
                  <tr>
                    <td className="p-2 border">Library & Activity Charges</td>
                    <td className="p-2 border text-right font-mono">{data.otherCharges?.toLocaleString()}</td>
                  </tr>
                )}
                <tr className="bg-slate-50 font-bold text-slate-900">
                  <td className="p-2 border">Total Amount Payable</td>
                  <td className="p-2 border text-right font-mono text-sm text-emerald-700">
                    PKR {data.totalAmount?.toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>

            {data.paidAt && (
              <div className="p-3 bg-slate-50 rounded-xl border text-[11px] flex justify-between items-center text-slate-600">
                <span>Payment Mode: <strong>{data.paymentMode}</strong></span>
                <span>Paid On: <strong>{data.paidAt}</strong></span>
              </div>
            )}
          </div>
        )}

        {/* Footer Authorization Stamp */}
        <div className="mt-8 pt-6 border-t flex justify-between items-end text-[10px] text-slate-500">
          <div>
            <p>Generated by EduCore Enterprise Cloud ERP</p>
            <p>Verification Code: {Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
          </div>
          <div className="text-center">
            <div className="w-32 border-b border-slate-400 mb-1" />
            <p className="font-bold text-slate-700">Authorized Officer Stamp</p>
          </div>
        </div>
      </div>
    </div>
  );
};
