import { Router, Response } from 'express';
import { db } from '../db.js';
import { authenticate, requirePermission, requireTenantContext, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/v1/reports/summary - Tenant ERP high-level summary metrics
router.get('/summary', authenticate, requireTenantContext, requirePermission('reports.view'), (req: AuthenticatedRequest, res: Response) => {
  const tenantId = req.tenantId!;
  const data = db.getRawData();

  const totalStudents = data.students.filter((s) => s.institutionId === tenantId && s.status === 'ACTIVE').length;
  const totalStaff = data.staff.filter((s) => s.institutionId === tenantId && s.status === 'ACTIVE').length;

  // Today's Attendance stats
  const today = new Date().toISOString().split('T')[0];
  const todayAtt = data.studentAttendance.filter((a) => a.institutionId === tenantId && a.date === today);
  const presentToday = todayAtt.filter((a) => a.status === 'PRESENT').length;
  const absentToday = todayAtt.filter((a) => a.status === 'ABSENT').length;
  const leaveToday = todayAtt.filter((a) => a.status === 'LEAVE').length;

  // Fee collection stats
  const tenantVouchers = data.feeVouchers.filter((v) => v.institutionId === tenantId);
  const totalBilled = tenantVouchers.reduce((acc, v) => acc + v.totalAmount, 0);
  const totalCollected = tenantVouchers.reduce((acc, v) => acc + v.paidAmount, 0);
  const totalOutstanding = tenantVouchers.reduce((acc, v) => acc + v.remainingAmount, 0);

  // Overdue count
  const defaulterCount = tenantVouchers.filter((v) => v.status === 'OVERDUE' || v.remainingAmount > 0).length;

  res.json({
    success: true,
    data: {
      totalStudents,
      totalStaff,
      todayStats: {
        date: today,
        marked: todayAtt.length,
        present: presentToday,
        absent: absentToday,
        leave: leaveToday,
        attendancePercentage: todayAtt.length > 0 ? Math.round((presentToday / todayAtt.length) * 100) : 100
      },
      feeStats: {
        totalBilled,
        totalCollected,
        totalOutstanding,
        defaulterCount
      }
    }
  });
});

export default router;
