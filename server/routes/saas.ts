import { Router, Response } from 'express';
import { db } from '../db.js';
import { authenticate, requirePermission, AuthenticatedRequest } from '../middleware/auth.js';
import { SaaSInvoice, ClientInquiry } from '../../src/types/index.js';

const router = Router();

// GET /api/v1/saas/overview - Super Admin Dashboard Statistics
router.get('/overview', authenticate, requirePermission('saas.manage'), (req: AuthenticatedRequest, res: Response) => {
  const data = db.getRawData();

  const totalInstitutions = data.institutions.length;
  const activeInstitutions = data.institutions.filter((i) => i.status === 'ACTIVE').length;
  const trialInstitutions = data.institutions.filter((i) => i.status === 'TRIAL').length;
  const suspendedInstitutions = data.institutions.filter((i) => i.status === 'SUSPENDED').length;

  const totalStudentsAcrossSaaS = data.students.filter((s) => s.status === 'ACTIVE').length;
  const totalStaffAcrossSaaS = data.staff.filter((s) => s.status === 'ACTIVE').length;

  const paidInvoices = data.saasInvoices.filter((inv) => inv.status === 'PAID');
  const overdueInvoices = data.saasInvoices.filter((inv) => inv.status === 'OVERDUE');
  const unpaidInvoices = data.saasInvoices.filter((inv) => inv.status === 'UNPAID');

  const totalRevenue = paidInvoices.reduce((acc, inv) => acc + inv.amount, 0);
  const outstandingRevenue = [...overdueInvoices, ...unpaidInvoices].reduce((acc, inv) => acc + inv.amount, 0);

  const newInquiries = data.clientInquiries.filter((inq) => inq.status === 'NEW' || inq.status === 'DEMO_SCHEDULED').length;

  res.json({
    success: true,
    data: {
      totalInstitutions,
      activeInstitutions,
      trialInstitutions,
      suspendedInstitutions,
      totalStudentsAcrossSaaS,
      totalStaffAcrossSaaS,
      totalRevenue,
      outstandingRevenue,
      newInquiries,
      plansCount: data.subscriptionPlans.length
    }
  });
});

// GET /api/v1/saas/plans
router.get('/plans', authenticate, (req: AuthenticatedRequest, res: Response) => {
  res.json({ success: true, data: db.getRawData().subscriptionPlans });
});

// GET /api/v1/saas/invoices
router.get('/invoices', authenticate, requirePermission('saas.manage'), (req: AuthenticatedRequest, res: Response) => {
  const { status, page = 1, pageSize = 20 } = req.query;
  let items = [...db.getRawData().saasInvoices];

  if (status) {
    items = items.filter((inv) => inv.status === status);
  }

  const paginated = db.paginate(items, Number(page), Number(pageSize));
  res.json({ success: true, ...paginated });
});

// POST /api/v1/saas/invoices - Generate SaaS Invoice
router.post('/invoices', authenticate, requirePermission('saas.manage'), (req: AuthenticatedRequest, res: Response) => {
  const { institutionId, planName, amount, dueDate } = req.body;
  const data = db.getRawData();
  const inst = data.institutions.find((i) => i.id === institutionId);

  if (!inst) {
    return res.status(404).json({ success: false, message: 'Institution not found.' });
  }

  const seq = db.getNextSequence('SAAS-INV');
  const invNo = db.formatSequence('SAAS-INV-2026', seq, 3);

  const newInvoice: SaaSInvoice = {
    id: `inv_${Date.now()}`,
    invoiceNumber: invNo,
    institutionId,
    institutionName: inst.name,
    planName: planName || 'Enterprise Plan',
    amount: Number(amount) || 499,
    dueDate: dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'UNPAID',
    createdAt: new Date().toISOString()
  };

  data.saasInvoices.unshift(newInvoice);
  db.persist();

  res.status(201).json({ success: true, message: 'SaaS Invoice created.', data: newInvoice });
});

// GET /api/v1/saas/crm - Client Inquiries
router.get('/crm', authenticate, requirePermission('saas.manage'), (req: AuthenticatedRequest, res: Response) => {
  const items = [...db.getRawData().clientInquiries];
  const paginated = db.paginate(items, Number(req.query.page || 1), Number(req.query.pageSize || 20));
  res.json({ success: true, ...paginated });
});

// POST /api/v1/saas/crm - New Client Inquiry
router.post('/crm', (req: AuthenticatedRequest, res: Response) => {
  const { institutionName, contactName, email, phone, estimatedStudents, notes } = req.body;

  if (!institutionName || !contactName || !email) {
    return res.status(400).json({ success: false, message: 'Institution name, contact person, and email are required.' });
  }

  const data = db.getRawData();
  const inq: ClientInquiry = {
    id: `inq_${Date.now()}`,
    institutionName,
    contactName,
    email,
    phone: phone || '',
    estimatedStudents: Number(estimatedStudents) || 100,
    status: 'NEW',
    notes,
    createdAt: new Date().toISOString()
  };

  data.clientInquiries.unshift(inq);
  db.persist();

  res.status(201).json({ success: true, message: 'Inquiry submitted successfully. Our enterprise SaaS team will contact you shortly.', data: inq });
});

export default router;
