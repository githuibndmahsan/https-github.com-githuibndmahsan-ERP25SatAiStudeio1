import { Router, Response } from 'express';
import { db } from '../db.js';
import { authenticate, requireTenantContext, AuthenticatedRequest } from '../middleware/auth.js';
import { Notice } from '../../src/types/index.js';

const router = Router();

// GET /api/v1/notices
router.get('/', authenticate, requireTenantContext, (req: AuthenticatedRequest, res: Response) => {
  const tenantId = req.tenantId!;
  const notices = db.getRawData().notices.filter((n) => n.institutionId === tenantId && n.isPublished);
  res.json({ success: true, data: notices });
});

// POST /api/v1/notices
router.post('/', authenticate, requireTenantContext, (req: AuthenticatedRequest, res: Response) => {
  const tenantId = req.tenantId!;
  const data = db.getRawData();
  const { title, content, category, targetAudience, isImportant } = req.body;

  if (!title || !content) {
    return res.status(400).json({ success: false, message: 'Title and content are required.' });
  }

  const notice: Notice = {
    id: `not_${Date.now()}`,
    institutionId: tenantId,
    title,
    content,
    category: category || 'GENERAL',
    targetAudience: targetAudience || 'ALL',
    publishDate: new Date().toISOString().split('T')[0],
    isImportant: Boolean(isImportant),
    isPublished: true
  };

  data.notices.unshift(notice);
  db.persist();

  res.status(201).json({ success: true, message: 'Notice published.', data: notice });
});

export default router;
