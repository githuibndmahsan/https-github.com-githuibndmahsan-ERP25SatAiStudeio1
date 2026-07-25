import { Router, Response } from 'express';
import { db } from '../db.js';
import { authenticate, requirePermission, requireTenantContext, AuthenticatedRequest } from '../middleware/auth.js';
import { Assignment } from '../../src/types/index.js';

const router = Router();

// GET /api/v1/assignments
router.get('/', authenticate, requireTenantContext, (req: AuthenticatedRequest, res: Response) => {
  const tenantId = req.tenantId!;
  const data = db.getRawData();
  const { classId, sectionId } = req.query;

  let assignments = data.assignments.filter((a) => a.institutionId === tenantId);

  if (classId) assignments = assignments.filter((a) => a.classId === classId);
  if (sectionId) assignments = assignments.filter((a) => a.sectionId === sectionId);

  res.json({ success: true, data: assignments });
});

// POST /api/v1/assignments
router.post('/', authenticate, requireTenantContext, requirePermission('assignments.manage'), (req: AuthenticatedRequest, res: Response) => {
  const tenantId = req.tenantId!;
  const data = db.getRawData();
  const { title, description, classId, sectionId, subjectId, dueDate, maxPoints } = req.body;

  if (!title || !classId || !sectionId || !subjectId || !dueDate) {
    return res.status(400).json({ success: false, message: 'Title, class, section, subject, and due date are required.' });
  }

  const asg: Assignment = {
    id: `asg_${Date.now()}`,
    institutionId: tenantId,
    title,
    description: description || '',
    classId,
    sectionId,
    subjectId,
    staffId: req.user!.id,
    dueDate,
    maxPoints: Number(maxPoints) || 100,
    createdAt: new Date().toISOString()
  };

  data.assignments.unshift(asg);
  db.persist();

  res.status(201).json({ success: true, message: 'Assignment created.', data: asg });
});

export default router;
