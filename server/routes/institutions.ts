import { Router, Response } from 'express';
import { db } from '../db.js';
import { authenticate, requirePermission, AuthenticatedRequest } from '../middleware/auth.js';
import { Institution, User } from '../../src/types/index.js';

const router = Router();

// GET /api/v1/institutions - List institutions
router.get('/', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const data = db.getRawData();
  const { search, status, page = 1, pageSize = 20 } = req.query;

  let items = [...data.institutions];

  if (search) {
    const q = String(search).toLowerCase();
    items = items.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        i.code.toLowerCase().includes(q) ||
        i.city.toLowerCase().includes(q) ||
        i.email.toLowerCase().includes(q)
    );
  }

  if (status) {
    items = items.filter((i) => i.status === status);
  }

  const paginated = db.paginate(items, Number(page), Number(pageSize));
  res.json({
    success: true,
    message: 'Institutions retrieved successfully.',
    ...paginated
  });
});

// GET /api/v1/institutions/:id
router.get('/:id', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const inst = db.getRawData().institutions.find((i) => i.id === req.params.id);
  if (!inst) {
    return res.status(404).json({ success: false, message: 'Institution not found.' });
  }
  res.json({ success: true, data: inst });
});

// POST /api/v1/institutions - Provision new institution
router.post('/', authenticate, requirePermission('saas.manage'), (req: AuthenticatedRequest, res: Response) => {
  const {
    name,
    code,
    slug,
    subdomain,
    planId,
    address,
    city,
    phone,
    email,
    adminName,
    adminEmail,
    primaryColor = '#0284c7',
    secondaryColor = '#0f172a'
  } = req.body;

  if (!name || !code || !email || !adminEmail || !planId) {
    return res.status(400).json({ success: false, message: 'Missing required fields for institution provisioning.' });
  }

  const data = db.getRawData();

  // Check code or slug duplicates
  if (data.institutions.some((i) => i.code.toUpperCase() === code.toUpperCase())) {
    return res.status(400).json({ success: false, message: `Institution code '${code}' is already taken.` });
  }

  const instId = `inst_${code.toLowerCase()}_${Date.now()}`;
  const cleanCode = code.toUpperCase().trim();
  const cleanSubdomain = (subdomain || cleanCode.toLowerCase()).replace(/[^a-z0-9-]/g, '');

  const newInst: Institution = {
    id: instId,
    code: cleanCode,
    name,
    slug: slug || cleanSubdomain,
    subdomain: cleanSubdomain,
    planId,
    address: address || 'Main Campus Address',
    city: city || 'Metropolis',
    phone: phone || '+92 300 0000000',
    email,
    status: 'ACTIVE',
    primaryColor,
    secondaryColor,
    studentCount: 0,
    staffCount: 0,
    createdAt: new Date().toISOString(),
    renewDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
  };

  data.institutions.unshift(newInst);

  // Auto-create Institute Admin user
  const adminUser: User = {
    id: `usr_${cleanCode.toLowerCase()}_admin`,
    email: adminEmail,
    name: adminName || `${name} Administrator`,
    role: 'INSTITUTE_ADMIN',
    institutionId: instId,
    permissions: [
      'students.read', 'students.create', 'students.update', 'students.archive', 'students.delete',
      'staff.read', 'staff.manage', 'attendance.mark', 'attendance.view', 'fees.read', 'fees.structure',
      'fees.generate', 'fees.collect', 'fees.concession.approve', 'fees.reversal', 'exams.read',
      'exams.manage', 'results.entry', 'results.publish', 'timetable.manage', 'assignments.manage',
      'ptm.manage', 'reports.view', 'website.publish', 'users.manage', 'settings.manage'
    ],
    status: 'ACTIVE',
    createdAt: new Date().toISOString()
  };

  data.users.unshift(adminUser);

  // Initialize Website Studio Content for Tenant
  data.websiteContents[instId] = {
    institutionId: instId,
    heroTitle: `Welcome to ${name}`,
    heroSubtitle: 'Delivering exceptional academic foundations, character building, and modern innovation.',
    aboutText: `${name} is dedicated to fostering academic mastery, leadership skills, and global readiness.`,
    primaryColor,
    secondaryColor,
    isPublished: true,
    programs: [
      { title: 'Primary Foundation', description: 'Core literacy, mathematics, and discovery.', icon: 'BookOpen' },
      { title: 'Secondary Excellence', description: 'Sciences, Humanities, and Information Technology.', icon: 'GraduationCap' }
    ],
    facultyProfiles: [],
    notices: [],
    gallery: [],
    contactEmail: email,
    contactPhone: phone || '+92 300 0000000',
    address: address || 'Main Campus Address'
  };

  db.logAudit({
    userId: req.user!.id,
    userName: req.user!.name,
    userRole: req.user!.role,
    action: 'INSTITUTION_PROVISIONED',
    details: `Provisioned new institution ${name} (${cleanCode}) with admin ${adminEmail}`
  });

  db.persist();

  res.status(201).json({
    success: true,
    message: 'Institution provisioned successfully with workspace and admin account.',
    data: {
      institution: newInst,
      adminUser
    }
  });
});

// PUT /api/v1/institutions/:id/status - Activate, Suspend, Archive
router.put('/:id/status', authenticate, requirePermission('saas.manage'), (req: AuthenticatedRequest, res: Response) => {
  const { status } = req.body;
  const inst = db.getRawData().institutions.find((i) => i.id === req.params.id);

  if (!inst) {
    return res.status(404).json({ success: false, message: 'Institution not found.' });
  }

  inst.status = status;

  db.logAudit({
    userId: req.user!.id,
    userName: req.user!.name,
    userRole: req.user!.role,
    action: 'INSTITUTION_STATUS_CHANGED',
    details: `Changed status of ${inst.name} to ${status}`
  });

  db.persist();

  res.json({ success: true, message: `Institution status updated to ${status}.`, data: inst });
});

export default router;
