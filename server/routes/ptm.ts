import { Router, Response } from 'express';
import { db } from '../db.js';
import { authenticate, requirePermission, requireTenantContext, AuthenticatedRequest } from '../middleware/auth.js';
import { PTMSchedule } from '../../src/types/index.js';

const router = Router();

// GET /api/v1/ptm
router.get('/', authenticate, requireTenantContext, (req: AuthenticatedRequest, res: Response) => {
  const tenantId = req.tenantId!;
  const ptms = db.getRawData().ptmSchedules.filter((p) => p.institutionId === tenantId);
  res.json({ success: true, data: ptms });
});

// POST /api/v1/ptm
router.post('/', authenticate, requireTenantContext, requirePermission('ptm.manage'), (req: AuthenticatedRequest, res: Response) => {
  const tenantId = req.tenantId!;
  const data = db.getRawData();
  const { title, date, startTime, endTime, classId, sectionId, slotTimes } = req.body;

  if (!title || !date || !classId) {
    return res.status(400).json({ success: false, message: 'Title, date, and class are required.' });
  }

  const times = Array.isArray(slotTimes) ? slotTimes : ['09:00 - 09:20', '09:20 - 09:40', '09:40 - 10:00', '10:00 - 10:20'];

  const ptm: PTMSchedule = {
    id: `ptm_${Date.now()}`,
    institutionId: tenantId,
    title,
    date,
    startTime: startTime || '09:00',
    endTime: endTime || '12:00',
    classId,
    sectionId: sectionId || 'sec_all',
    slots: times.map((t, idx) => ({
      id: `s_${idx}_${Date.now()}`,
      time: t,
      status: 'AVAILABLE'
    }))
  };

  data.ptmSchedules.unshift(ptm);
  db.persist();

  res.status(201).json({ success: true, message: 'PTM Schedule created with slots.', data: ptm });
});

export default router;
