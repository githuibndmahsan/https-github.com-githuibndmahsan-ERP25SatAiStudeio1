import { Router, Response } from 'express';
import { db } from '../db.js';
import { authenticate, requirePermission, requireTenantContext, AuthenticatedRequest } from '../middleware/auth.js';
import { StudentAttendanceRecord, StaffAttendanceRecord } from '../../src/types/index.js';

const router = Router();

// GET /api/v1/attendance/students - Get daily class attendance
router.get('/students', authenticate, requireTenantContext, requirePermission('attendance.view'), (req: AuthenticatedRequest, res: Response) => {
  const tenantId = req.tenantId!;
  const data = db.getRawData();
  const { classId, sectionId, date } = req.query;

  const targetDate = String(date || new Date().toISOString().split('T')[0]);

  // Fetch all active students for this class/section
  let students = data.students.filter((s) => s.institutionId === tenantId && s.status === 'ACTIVE');
  if (classId) students = students.filter((s) => s.classId === classId);
  if (sectionId) students = students.filter((s) => s.sectionId === sectionId);

  // Fetch existing attendance records for target date
  const existingRecords = data.studentAttendance.filter(
    (a) => a.institutionId === tenantId && a.date === targetDate
  );

  const roster = students.map((std) => {
    const record = existingRecords.find((r) => r.studentId === std.id);
    return {
      studentId: std.id,
      studentCode: std.studentId,
      fullName: std.fullName,
      admissionNo: std.admissionNo,
      status: record ? record.status : 'PRESENT', // default present in draft
      remarks: record?.remarks || ''
    };
  });

  res.json({
    success: true,
    data: {
      date: targetDate,
      classId,
      sectionId,
      roster
    }
  });
});

// POST /api/v1/attendance/students/mark - Save or update daily attendance
router.post('/students/mark', authenticate, requireTenantContext, requirePermission('attendance.mark'), (req: AuthenticatedRequest, res: Response) => {
  const tenantId = req.tenantId!;
  const data = db.getRawData();
  const { classId, sectionId, date, records } = req.body;

  if (!classId || !sectionId || !date || !Array.isArray(records)) {
    return res.status(400).json({ success: false, message: 'Class, section, date, and attendance records list are required.' });
  }

  // Remove existing records for this class/section/date
  data.studentAttendance = data.studentAttendance.filter(
    (a) => !(a.institutionId === tenantId && a.classId === classId && a.sectionId === sectionId && a.date === date)
  );

  const newRecords: StudentAttendanceRecord[] = records.map((r: any) => ({
    id: `att_${r.studentId}_${date}`,
    institutionId: tenantId,
    studentId: r.studentId,
    classId,
    sectionId,
    date,
    status: r.status || 'PRESENT',
    remarks: r.remarks || '',
    markedBy: req.user!.id
  }));

  data.studentAttendance.push(...newRecords);

  // Check low attendance triggers (<75%)
  records.forEach((r: any) => {
    if (r.status === 'ABSENT') {
      const studentHistory = data.studentAttendance.filter((a) => a.studentId === r.studentId && a.institutionId === tenantId);
      const total = studentHistory.length;
      const presents = studentHistory.filter((a) => a.status === 'PRESENT').length;
      const pct = total > 0 ? Math.round((presents / total) * 100) : 100;

      if (total >= 5 && pct < 75) {
        const std = data.students.find((s) => s.id === r.studentId);
        // Create or update Early Warning
        const existingWarning = data.earlyWarnings.find((ew) => ew.studentId === r.studentId && ew.type === 'LOW_ATTENDANCE');
        if (existingWarning) {
          existingWarning.metricValue = `Attendance: ${pct}%`;
        } else if (std) {
          data.earlyWarnings.unshift({
            id: `ew_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
            institutionId: tenantId,
            studentId: std.id,
            studentName: std.fullName,
            studentCode: std.studentId,
            className: data.classes.find((c) => c.id === std.classId)?.name || 'Class',
            sectionName: data.sections.find((s) => s.id === std.sectionId)?.name || 'Section',
            type: 'LOW_ATTENDANCE',
            severity: pct < 60 ? 'HIGH' : 'MEDIUM',
            description: `Student attendance dropped to ${pct}% across past ${total} sessions.`,
            metricValue: `Attendance: ${pct}%`,
            createdAt: new Date().toISOString()
          });
        }
      }
    }
  });

  db.logAudit({
    institutionId: tenantId,
    userId: req.user!.id,
    userName: req.user!.name,
    userRole: req.user!.role,
    action: 'ATTENDANCE_MARKED',
    details: `Marked attendance for ${records.length} students on ${date} (Class ID: ${classId})`
  });

  db.persist();

  res.json({ success: true, message: `Attendance saved for ${records.length} students.`, data: newRecords });
});

export default router;
