import { Router, Response } from 'express';
import { db } from '../db.js';
import { authenticate, requirePermission, requireTenantContext, AuthenticatedRequest } from '../middleware/auth.js';
import { Exam, ExamSubject, MarkEntry, ResultSummary } from '../../src/types/index.js';

const router = Router();

// GET /api/v1/exams
router.get('/', authenticate, requireTenantContext, requirePermission('exams.read'), (req: AuthenticatedRequest, res: Response) => {
  const tenantId = req.tenantId!;
  const exams = db.getRawData().exams.filter((e) => e.institutionId === tenantId);
  res.json({ success: true, data: exams });
});

// POST /api/v1/exams - Create Exam
router.post('/', authenticate, requireTenantContext, requirePermission('exams.manage'), (req: AuthenticatedRequest, res: Response) => {
  const tenantId = req.tenantId!;
  const data = db.getRawData();
  const { title, sessionId, classId, startDate, endDate, subjects } = req.body;

  if (!title || !classId || !startDate || !endDate || !Array.isArray(subjects)) {
    return res.status(400).json({ success: false, message: 'Title, class, start/end dates, and subject list are required.' });
  }

  const examId = `ex_${Date.now()}`;
  const newExam: Exam = {
    id: examId,
    institutionId: tenantId,
    title,
    sessionId: sessionId || data.academicSessions.find((s) => s.institutionId === tenantId)?.id || 'sess_default',
    classId,
    startDate,
    endDate,
    status: 'DRAFT'
  };

  data.exams.unshift(newExam);

  // Add exam subjects
  subjects.forEach((s: any) => {
    data.examSubjects.push({
      id: `exsub_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      examId,
      subjectId: s.subjectId,
      subjectName: s.subjectName || 'Subject',
      maxMarks: Number(s.maxMarks) || 100,
      passMarks: Number(s.passMarks) || 40
    });
  });

  db.persist();

  res.status(201).json({ success: true, message: 'Exam created with subjects configured.', data: newExam });
});

// GET /api/v1/exams/:id/sheet - Marks entry sheet for exam + subject
router.get('/:id/sheet', authenticate, requireTenantContext, requirePermission('results.entry'), (req: AuthenticatedRequest, res: Response) => {
  const tenantId = req.tenantId!;
  const data = db.getRawData();
  const { subjectId } = req.query;

  const exam = data.exams.find((e) => e.id === req.params.id && e.institutionId === tenantId);
  if (!exam) {
    return res.status(404).json({ success: false, message: 'Exam not found.' });
  }

  const students = data.students.filter((s) => s.institutionId === tenantId && s.classId === exam.classId && s.status === 'ACTIVE');
  const existingMarks = data.marksEntries.filter((m) => m.examId === exam.id && m.subjectId === String(subjectId));

  const sheet = students.map((std) => {
    const entry = existingMarks.find((m) => m.studentId === std.id);
    return {
      studentId: std.id,
      studentCode: std.studentId,
      fullName: std.fullName,
      admissionNo: std.admissionNo,
      marksObtained: entry ? entry.marksObtained : 0,
      isAbsent: entry ? entry.isAbsent : false,
      remarks: entry?.remarks || ''
    };
  });

  res.json({
    success: true,
    data: {
      exam,
      subjectId,
      sheet
    }
  });
});

// POST /api/v1/exams/:id/marks/save - Save or update subject marks
router.post('/:id/marks/save', authenticate, requireTenantContext, requirePermission('results.entry'), (req: AuthenticatedRequest, res: Response) => {
  const tenantId = req.tenantId!;
  const data = db.getRawData();
  const { subjectId, entries } = req.body;

  if (!subjectId || !Array.isArray(entries)) {
    return res.status(400).json({ success: false, message: 'Subject ID and marks entry list are required.' });
  }

  // Clear previous entries for exam + subject
  data.marksEntries = data.marksEntries.filter(
    (m) => !(m.institutionId === tenantId && m.examId === req.params.id && m.subjectId === subjectId)
  );

  entries.forEach((e: any) => {
    data.marksEntries.push({
      id: `m_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      institutionId: tenantId,
      examId: req.params.id,
      subjectId,
      studentId: e.studentId,
      marksObtained: Number(e.marksObtained) || 0,
      isAbsent: Boolean(e.isAbsent),
      remarks: e.remarks || ''
    });
  });

  db.persist();

  res.json({ success: true, message: `Saved marks for ${entries.length} students.` });
});

// POST /api/v1/exams/:id/publish - Calculate percentages, grades, ranks, and publish results
router.post('/:id/publish', authenticate, requireTenantContext, requirePermission('results.publish'), (req: AuthenticatedRequest, res: Response) => {
  const tenantId = req.tenantId!;
  const data = db.getRawData();

  const exam = data.exams.find((e) => e.id === req.params.id && e.institutionId === tenantId);
  if (!exam) {
    return res.status(404).json({ success: false, message: 'Exam not found.' });
  }

  const examSubs = data.examSubjects.filter((es) => es.examId === exam.id);
  if (examSubs.length === 0) {
    return res.status(400).json({ success: false, message: 'No subjects configured for this exam.' });
  }

  const totalMaxMarks = examSubs.reduce((sum, s) => sum + s.maxMarks, 0);
  const students = data.students.filter((s) => s.institutionId === tenantId && s.classId === exam.classId && s.status === 'ACTIVE');

  // Clear previous result summaries
  data.resultSummaries = data.resultSummaries.filter((r) => r.examId !== exam.id);

  const studentResults: {
    studentId: string;
    studentName: string;
    studentCode: string;
    totalObtained: number;
    pct: number;
    grade: string;
    gpa: number;
    status: 'PASS' | 'FAIL';
  }[] = [];

  students.forEach((std) => {
    let totalObtained = 0;
    let failedAny = false;

    examSubs.forEach((es) => {
      const entry = data.marksEntries.find((m) => m.examId === exam.id && m.subjectId === es.subjectId && m.studentId === std.id);
      const obt = entry && !entry.isAbsent ? entry.marksObtained : 0;
      totalObtained += obt;
      if (obt < es.passMarks) {
        failedAny = true;
      }
    });

    const pct = totalMaxMarks > 0 ? Math.round((totalObtained / totalMaxMarks) * 1000) / 10 : 0;

    let grade = 'F';
    let gpa = 0;
    if (pct >= 85) { grade = 'A*'; gpa = 4.0; }
    else if (pct >= 75) { grade = 'A'; gpa = 3.7; }
    else if (pct >= 65) { grade = 'B'; gpa = 3.0; }
    else if (pct >= 55) { grade = 'C'; gpa = 2.5; }
    else if (pct >= 45) { grade = 'D'; gpa = 2.0; }
    else { grade = 'F'; gpa = 0.0; }

    studentResults.push({
      studentId: std.id,
      studentName: std.fullName,
      studentCode: std.studentId,
      totalObtained,
      pct,
      grade,
      gpa,
      status: failedAny ? 'FAIL' : 'PASS'
    });
  });

  // Calculate Positions
  studentResults.sort((a, b) => b.totalObtained - a.totalObtained);

  studentResults.forEach((sr, idx) => {
    data.resultSummaries.push({
      id: `res_${exam.id}_${sr.studentId}`,
      institutionId: tenantId,
      examId: exam.id,
      studentId: sr.studentId,
      studentName: sr.studentName,
      studentCode: sr.studentCode,
      totalMaxMarks,
      totalObtainedMarks: sr.totalObtained,
      percentage: sr.pct,
      grade: sr.grade,
      gpa: sr.gpa,
      position: idx + 1,
      status: sr.status,
      isPublished: true
    });
  });

  exam.status = 'PUBLISHED';

  db.logAudit({
    institutionId: tenantId,
    userId: req.user!.id,
    userName: req.user!.name,
    userRole: req.user!.role,
    action: 'RESULTS_PUBLISHED',
    details: `Calculated and published results for ${studentResults.length} students in Exam: ${exam.title}`
  });

  db.persist();

  res.json({
    success: true,
    message: `Results published successfully for ${studentResults.length} students.`,
    data: data.resultSummaries.filter((r) => r.examId === exam.id)
  });
});

// GET /api/v1/exams/:id/result-card/:studentId - Get printable result card
router.get('/:id/result-card/:studentId', authenticate, requireTenantContext, requirePermission('exams.read'), (req: AuthenticatedRequest, res: Response) => {
  const tenantId = req.tenantId!;
  const data = db.getRawData();
  const inst = data.institutions.find((i) => i.id === tenantId);

  const exam = data.exams.find((e) => e.id === req.params.id && e.institutionId === tenantId);
  const student = data.students.find((s) => s.id === req.params.studentId && s.institutionId === tenantId);
  const resultSummary = data.resultSummaries.find((r) => r.examId === req.params.id && r.studentId === req.params.studentId);

  if (!exam || !student) {
    return res.status(404).json({ success: false, message: 'Exam or student record not found.' });
  }

  const examSubs = data.examSubjects.filter((es) => es.examId === exam.id);
  const subjectBreakdown = examSubs.map((es) => {
    const entry = data.marksEntries.find((m) => m.examId === exam.id && m.subjectId === es.subjectId && m.studentId === student.id);
    const obt = entry && !entry.isAbsent ? entry.marksObtained : 0;
    const pct = es.maxMarks > 0 ? (obt / es.maxMarks) * 100 : 0;
    let gr = 'F';
    if (pct >= 85) gr = 'A*';
    else if (pct >= 75) gr = 'A';
    else if (pct >= 65) gr = 'B';
    else if (pct >= 55) gr = 'C';
    else gr = 'F';

    return {
      subjectName: es.subjectName,
      maxMarks: es.maxMarks,
      passMarks: es.passMarks,
      marksObtained: obt,
      isAbsent: entry ? entry.isAbsent : false,
      grade: gr,
      status: obt >= es.passMarks ? 'PASS' : 'FAIL'
    };
  });

  const cls = data.classes.find((c) => c.id === student.classId);
  const sec = data.sections.find((s) => s.id === student.sectionId);

  res.json({
    success: true,
    data: {
      institution: inst,
      exam,
      student,
      className: cls?.name,
      sectionName: sec?.name,
      resultSummary,
      subjectBreakdown
    }
  });
});

export default router;
