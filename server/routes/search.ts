import { Router, Response } from 'express';
import { db } from '../db.js';
import { authenticate, requireTenantContext, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/v1/search - Global tenant-scoped search
router.get('/', authenticate, requireTenantContext, (req: AuthenticatedRequest, res: Response) => {
  const tenantId = req.tenantId!;
  const { q } = req.query;

  if (!q || String(q).trim().length < 2) {
    return res.json({
      success: true,
      data: { students: [], staff: [], vouchers: [] }
    });
  }

  const query = String(q).toLowerCase();
  const data = db.getRawData();

  // Search Students
  const students = data.students
    .filter(
      (s) =>
        s.institutionId === tenantId &&
        (s.fullName.toLowerCase().includes(query) ||
          s.studentId.toLowerCase().includes(query) ||
          s.cnicOrBForm.includes(query))
    )
    .slice(0, 5)
    .map((s) => ({
      id: s.id,
      title: s.fullName,
      subtitle: `${s.studentId} • ${s.admissionNo}`,
      type: 'STUDENT'
    }));

  // Search Staff
  const staff = data.staff
    .filter(
      (st) =>
        st.institutionId === tenantId &&
        (st.fullName.toLowerCase().includes(query) ||
          st.employeeId.toLowerCase().includes(query) ||
          st.designation.toLowerCase().includes(query))
    )
    .slice(0, 5)
    .map((st) => ({
      id: st.id,
      title: st.fullName,
      subtitle: `${st.employeeId} • ${st.designation}`,
      type: 'STAFF'
    }));

  // Search Vouchers
  const vouchers = data.feeVouchers
    .filter(
      (v) =>
        v.institutionId === tenantId &&
        (v.voucherNo.toLowerCase().includes(query) ||
          v.studentName.toLowerCase().includes(query))
    )
    .slice(0, 5)
    .map((v) => ({
      id: v.id,
      title: v.voucherNo,
      subtitle: `${v.studentName} • ${v.month} • PKR ${v.totalAmount}`,
      type: 'VOUCHER'
    }));

  res.json({
    success: true,
    data: { students, staff, vouchers }
  });
});

// GET /api/v1/early-warnings - Deterministic early warning alerts
router.get('/early-warnings', authenticate, requireTenantContext, (req: AuthenticatedRequest, res: Response) => {
  const tenantId = req.tenantId!;
  const warnings = db.getRawData().earlyWarnings.filter((ew) => ew.institutionId === tenantId);
  res.json({ success: true, data: warnings });
});

export default router;
