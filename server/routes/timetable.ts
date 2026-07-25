import { Router, Response } from 'express';
import { db } from '../db.js';
import { authenticate, requirePermission, requireTenantContext, AuthenticatedRequest } from '../middleware/auth.js';
import { TimetableSlot } from '../../src/types/index.js';

const router = Router();

// GET /api/v1/timetable - Get grid for class or teacher
router.get('/', authenticate, requireTenantContext, (req: AuthenticatedRequest, res: Response) => {
  const tenantId = req.tenantId!;
  const data = db.getRawData();
  const { classId, sectionId, staffId } = req.query;

  let slots = data.timetableSlots.filter((ts) => ts.institutionId === tenantId);

  if (classId) {
    slots = slots.filter((s) => s.classId === classId);
  }
  if (sectionId) {
    slots = slots.filter((s) => s.sectionId === sectionId);
  }
  if (staffId) {
    slots = slots.filter((s) => s.staffId === staffId);
  }

  // Populate references
  const populated = slots.map((s) => {
    const cls = data.classes.find((c) => c.id === s.classId);
    const sec = data.sections.find((sec) => sec.id === s.sectionId);
    const sub = data.subjects.find((sub) => sub.id === s.subjectId);
    const stf = data.staff.find((st) => st.id === s.staffId);
    return {
      ...s,
      className: cls?.name || 'N/A',
      sectionName: sec?.name || 'N/A',
      subjectName: sub?.name || 'N/A',
      teacherName: stf?.fullName || 'N/A'
    };
  });

  res.json({ success: true, data: populated });
});

// POST /api/v1/timetable/slot - Add or edit slot with conflict check
router.post('/slot', authenticate, requireTenantContext, requirePermission('timetable.manage'), (req: AuthenticatedRequest, res: Response) => {
  const tenantId = req.tenantId!;
  const data = db.getRawData();
  const { classId, sectionId, subjectId, staffId, dayOfWeek, periodNumber, startTime, endTime, roomNo } = req.body;

  if (!classId || !sectionId || !subjectId || !staffId || !dayOfWeek || !periodNumber) {
    return res.status(400).json({ success: false, message: 'Class, section, subject, teacher, day, and period are required.' });
  }

  // Conflict Check 1: Teacher double booking on same day and period
  const teacherConflict = data.timetableSlots.find(
    (s) => s.institutionId === tenantId && s.dayOfWeek === dayOfWeek && s.periodNumber === Number(periodNumber) && s.staffId === staffId
  );

  if (teacherConflict) {
    const teacher = data.staff.find((st) => st.id === staffId);
    return res.status(400).json({
      success: false,
      message: `Conflict Detected: Teacher '${teacher?.fullName || 'Teacher'}' is already assigned to period ${periodNumber} on ${dayOfWeek}.`
    });
  }

  // Conflict Check 2: Room collision
  if (roomNo) {
    const roomConflict = data.timetableSlots.find(
      (s) => s.institutionId === tenantId && s.dayOfWeek === dayOfWeek && s.periodNumber === Number(periodNumber) && s.roomNo.toLowerCase() === roomNo.toLowerCase()
    );
    if (roomConflict) {
      return res.status(400).json({
        success: false,
        message: `Conflict Detected: Room '${roomNo}' is already occupied during period ${periodNumber} on ${dayOfWeek}.`
      });
    }
  }

  const slot: TimetableSlot = {
    id: `slot_${Date.now()}`,
    institutionId: tenantId,
    classId,
    sectionId,
    subjectId,
    staffId,
    dayOfWeek,
    periodNumber: Number(periodNumber),
    startTime: startTime || '08:00',
    endTime: endTime || '08:45',
    roomNo: roomNo || 'Standard Class'
  };

  data.timetableSlots.push(slot);
  db.persist();

  res.status(201).json({ success: true, message: 'Timetable slot created with zero conflicts.', data: slot });
});

export default router;
