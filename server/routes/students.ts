import { Router, Response } from 'express';
import { db } from '../db.js';
import { authenticate, requirePermission, requireTenantContext, AuthenticatedRequest } from '../middleware/auth.js';
import { Student, Guardian } from '../../src/types/index.js';

const router = Router();

// GET /api/v1/students - List tenant students with search, class filter, section filter, status filter, and pagination
router.get('/', authenticate, requireTenantContext, requirePermission('students.read'), (req: AuthenticatedRequest, res: Response) => {
  const tenantId = req.tenantId!;
  const data = db.getRawData();
  const { search, classId, sectionId, status = 'ACTIVE', page = 1, pageSize = 20 } = req.query;

  let items = data.students.filter((s) => s.institutionId === tenantId);

  if (status && status !== 'ALL') {
    items = items.filter((s) => s.status === status);
  }

  if (classId) {
    items = items.filter((s) => s.classId === classId);
  }

  if (sectionId) {
    items = items.filter((s) => s.sectionId === sectionId);
  }

  if (search) {
    const q = String(search).toLowerCase();
    items = items.filter(
      (s) =>
        s.fullName.toLowerCase().includes(q) ||
        s.studentId.toLowerCase().includes(q) ||
        s.admissionNo.toLowerCase().includes(q) ||
        s.cnicOrBForm.includes(q) ||
        (s.email && s.email.toLowerCase().includes(q))
    );
  }

  // Populate helper titles
  const populated = items.map((s) => {
    const cls = data.classes.find((c) => c.id === s.classId);
    const sec = data.sections.find((sec) => sec.id === s.sectionId);
    const grd = data.guardians.find((g) => g.id === s.guardianId);
    return {
      ...s,
      className: cls ? cls.name : 'Unassigned',
      sectionName: sec ? sec.name : 'Unassigned',
      guardianName: grd ? grd.name : 'Unassigned',
      guardianPhone: grd ? grd.phone : s.emergencyContact
    };
  });

  const paginated = db.paginate(populated, Number(page), Number(pageSize));
  res.json({ success: true, message: 'Students retrieved.', ...paginated });
});

// GET /api/v1/students/:id - Get student details profile
router.get('/:id', authenticate, requireTenantContext, requirePermission('students.read'), (req: AuthenticatedRequest, res: Response) => {
  const tenantId = req.tenantId!;
  const data = db.getRawData();
  const student = data.students.find((s) => s.id === req.params.id && s.institutionId === tenantId);

  if (!student) {
    return res.status(404).json({ success: false, message: 'Student not found in this institution workspace.' });
  }

  const cls = data.classes.find((c) => c.id === student.classId);
  const sec = data.sections.find((sec) => sec.id === student.sectionId);
  const guardian = data.guardians.find((g) => g.id === student.guardianId);
  const session = data.academicSessions.find((sess) => sess.id === student.sessionId);

  // Student Fee History
  const feeVouchers = data.feeVouchers.filter((v) => v.studentId === student.id && v.institutionId === tenantId);

  // Student Attendance History (recent 30 records)
  const attendanceRecords = data.studentAttendance
    .filter((a) => a.studentId === student.id && a.institutionId === tenantId)
    .sort((a, b) => b.date.localeCompare(a.date));

  const totalAtt = attendanceRecords.length;
  const presentCount = attendanceRecords.filter((a) => a.status === 'PRESENT').length;
  const attendancePercentage = totalAtt > 0 ? Math.round((presentCount / totalAtt) * 100) : 100;

  // Student Result History
  const results = data.resultSummaries.filter((r) => r.studentId === student.id && r.institutionId === tenantId);

  res.json({
    success: true,
    data: {
      ...student,
      className: cls?.name || 'N/A',
      sectionName: sec?.name || 'N/A',
      sessionName: session?.name || 'N/A',
      guardian,
      feeVouchers,
      attendanceRecords,
      attendancePercentage,
      results
    }
  });
});

// POST /api/v1/students - Admit new student
router.post('/', authenticate, requireTenantContext, requirePermission('students.create'), (req: AuthenticatedRequest, res: Response) => {
  const tenantId = req.tenantId!;
  const data = db.getRawData();
  const inst = data.institutions.find((i) => i.id === tenantId);

  if (!inst) {
    return res.status(404).json({ success: false, message: 'Institution workspace not found.' });
  }

  const {
    fullName,
    cnicOrBForm,
    dob,
    gender,
    phone,
    email,
    address,
    sessionId,
    classId,
    sectionId,
    guardianName,
    guardianCnic,
    guardianRelation,
    guardianPhone,
    guardianOccupation,
    emergencyContact,
    previousSchool,
    photoUrl
  } = req.body;

  if (!fullName || !cnicOrBForm || !classId || !sectionId || !guardianName || !guardianPhone) {
    return res.status(400).json({ success: false, message: 'Full name, B-Form/CNIC, class, section, guardian name, and guardian phone are required.' });
  }

  // Generate tenant student ID e.g. TCS-2026-0005
  const year = new Date().getFullYear();
  const seqKey = `${inst.code}-STUDENT-${year}`;
  const seq = db.getNextSequence(seqKey);
  const studentCode = `${inst.code}-${year}-${String(seq).padStart(4, '0')}`;
  const admissionNo = `ADM-${Math.floor(1000 + Math.random() * 9000)}`;

  // Find or create Guardian
  let guardian = data.guardians.find((g) => g.institutionId === tenantId && g.cnic === guardianCnic);
  if (!guardian) {
    guardian = {
      id: `grd_${Date.now()}`,
      institutionId: tenantId,
      name: guardianName,
      cnic: guardianCnic || 'N/A',
      relation: guardianRelation || 'Guardian',
      phone: guardianPhone,
      email: req.body.guardianEmail || '',
      occupation: guardianOccupation || '',
      address: address || 'N/A'
    };
    data.guardians.push(guardian);
  }

  const newStudent: Student = {
    id: `std_${Date.now()}`,
    institutionId: tenantId,
    studentId: studentCode,
    admissionNo,
    fullName,
    cnicOrBForm,
    dob: dob || '2012-01-01',
    gender: gender || 'MALE',
    phone,
    email,
    address: address || 'N/A',
    sessionId: sessionId || data.academicSessions.find((s) => s.institutionId === tenantId)?.id || 'sess_default',
    classId,
    sectionId,
    admissionDate: new Date().toISOString().split('T')[0],
    guardianId: guardian.id,
    emergencyContact: emergencyContact || guardianPhone,
    photoUrl,
    previousSchool,
    status: 'ACTIVE',
    documents: [],
    createdAt: new Date().toISOString()
  };

  data.students.unshift(newStudent);
  inst.studentCount = data.students.filter((s) => s.institutionId === tenantId && s.status === 'ACTIVE').length;

  db.logAudit({
    institutionId: tenantId,
    userId: req.user!.id,
    userName: req.user!.name,
    userRole: req.user!.role,
    action: 'STUDENT_ADMITTED',
    details: `Admitted student ${fullName} (${studentCode}) into Class ID ${classId}`
  });

  db.persist();

  res.status(201).json({
    success: true,
    message: `Student admitted successfully with official ID: ${studentCode}`,
    data: newStudent
  });
});

// PUT /api/v1/students/:id - Update student profile
router.put('/:id', authenticate, requireTenantContext, requirePermission('students.update'), (req: AuthenticatedRequest, res: Response) => {
  const tenantId = req.tenantId!;
  const data = db.getRawData();
  const student = data.students.find((s) => s.id === req.params.id && s.institutionId === tenantId);

  if (!student) {
    return res.status(404).json({ success: false, message: 'Student not found.' });
  }

  Object.assign(student, req.body);
  db.persist();

  res.json({ success: true, message: 'Student profile updated.', data: student });
});

// POST /api/v1/students/:id/archive - Archive student
router.post('/:id/archive', authenticate, requireTenantContext, requirePermission('students.archive'), (req: AuthenticatedRequest, res: Response) => {
  const tenantId = req.tenantId!;
  const data = db.getRawData();
  const student = data.students.find((s) => s.id === req.params.id && s.institutionId === tenantId);

  if (!student) {
    return res.status(404).json({ success: false, message: 'Student not found.' });
  }

  student.status = 'ARCHIVED';
  db.persist();

  res.json({ success: true, message: 'Student record archived.', data: student });
});

export default router;
