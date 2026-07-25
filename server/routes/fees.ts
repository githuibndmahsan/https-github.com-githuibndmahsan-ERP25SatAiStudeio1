import { Router, Response } from 'express';
import { db } from '../db.js';
import { authenticate, requirePermission, requireTenantContext, AuthenticatedRequest } from '../middleware/auth.js';
import { FeeHead, FeeStructure, FeeVoucher, FeePayment } from '../../src/types/index.js';

const router = Router();

// GET /api/v1/fees/heads
router.get('/heads', authenticate, requireTenantContext, requirePermission('fees.read'), (req: AuthenticatedRequest, res: Response) => {
  const tenantId = req.tenantId!;
  const heads = db.getRawData().feeHeads.filter((f) => f.institutionId === tenantId);
  res.json({ success: true, data: heads });
});

// POST /api/v1/fees/heads
router.post('/heads', authenticate, requireTenantContext, requirePermission('fees.structure'), (req: AuthenticatedRequest, res: Response) => {
  const tenantId = req.tenantId!;
  const { title, type } = req.body;

  if (!title) {
    return res.status(400).json({ success: false, message: 'Fee head title is required.' });
  }

  const newHead: FeeHead = {
    id: `head_${Date.now()}`,
    institutionId: tenantId,
    title,
    type: type || 'RECURRING'
  };

  db.getRawData().feeHeads.push(newHead);
  db.persist();

  res.status(201).json({ success: true, message: 'Fee head created.', data: newHead });
});

// GET /api/v1/fees/structures
router.get('/structures', authenticate, requireTenantContext, requirePermission('fees.read'), (req: AuthenticatedRequest, res: Response) => {
  const tenantId = req.tenantId!;
  const structures = db.getRawData().feeStructures.filter((f) => f.institutionId === tenantId);
  res.json({ success: true, data: structures });
});

// POST /api/v1/fees/structures
router.post('/structures', authenticate, requireTenantContext, requirePermission('fees.structure'), (req: AuthenticatedRequest, res: Response) => {
  const tenantId = req.tenantId!;
  const { classId, title, items, frequency = 'MONTHLY' } = req.body;

  if (!classId || !title || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Class, title, and fee items are required.' });
  }

  const totalAmount = items.reduce((sum: number, it: any) => sum + (Number(it.amount) || 0), 0);

  const newStruct: FeeStructure = {
    id: `struct_${Date.now()}`,
    institutionId: tenantId,
    classId,
    title,
    frequency,
    items,
    totalAmount
  };

  db.getRawData().feeStructures.push(newStruct);
  db.persist();

  res.status(201).json({ success: true, message: 'Fee structure configured.', data: newStruct });
});

// GET /api/v1/fees/vouchers - List vouchers
router.get('/vouchers', authenticate, requireTenantContext, requirePermission('fees.read'), (req: AuthenticatedRequest, res: Response) => {
  const tenantId = req.tenantId!;
  const data = db.getRawData();
  const { month, status, classId, search, page = 1, pageSize = 20 } = req.query;

  let vouchers = data.feeVouchers.filter((v) => v.institutionId === tenantId);

  if (month) {
    vouchers = vouchers.filter((v) => v.month === month);
  }

  if (status && status !== 'ALL') {
    vouchers = vouchers.filter((v) => v.status === status);
  }

  if (classId) {
    vouchers = vouchers.filter((v) => v.classId === classId);
  }

  if (search) {
    const q = String(search).toLowerCase();
    vouchers = vouchers.filter(
      (v) =>
        v.voucherNo.toLowerCase().includes(q) ||
        v.studentName.toLowerCase().includes(q) ||
        v.studentCode.toLowerCase().includes(q)
    );
  }

  const paginated = db.paginate(vouchers, Number(page), Number(pageSize));
  res.json({ success: true, ...paginated });
});

// POST /api/v1/fees/vouchers/generate - Generate vouchers for class for a given month
router.post('/vouchers/generate', authenticate, requireTenantContext, requirePermission('fees.generate'), (req: AuthenticatedRequest, res: Response) => {
  const tenantId = req.tenantId!;
  const data = db.getRawData();
  const inst = data.institutions.find((i) => i.id === tenantId);

  const { classId, month, issueDate, dueDate } = req.body;

  if (!classId || !month) {
    return res.status(400).json({ success: false, message: 'Class and month (YYYY-MM) are required.' });
  }

  const struct = data.feeStructures.find((fs) => fs.institutionId === tenantId && fs.classId === classId);
  if (!struct) {
    return res.status(400).json({ success: false, message: 'No active fee structure found for the selected class. Please configure a fee structure first.' });
  }

  const students = data.students.filter((s) => s.institutionId === tenantId && s.classId === classId && s.status === 'ACTIVE');
  if (students.length === 0) {
    return res.status(400).json({ success: false, message: 'No active students found in this class.' });
  }

  let generatedCount = 0;
  const createdVouchers: FeeVoucher[] = [];

  students.forEach((std) => {
    // Check if voucher already exists for student + month
    const exists = data.feeVouchers.some(
      (v) => v.institutionId === tenantId && v.studentId === std.id && v.month === month && v.status !== 'CANCELLED'
    );

    if (!exists) {
      const year = new Date().getFullYear();
      const seqKey = `${inst?.code || 'INST'}-VOUCHER-${year}`;
      const seq = db.getNextSequence(seqKey);
      const voucherNo = `${inst?.code || 'INST'}-VOUCH-${year}-${String(seq).padStart(4, '0')}`;

      // Calculate concessions
      const studentConcession = data.concessions.find(
        (c) => c.institutionId === tenantId && c.studentId === std.id && c.status === 'APPROVED'
      );
      const concessionAmt = studentConcession ? studentConcession.amount : 0;

      const subTotal = struct.totalAmount;
      const totalAmount = Math.max(0, subTotal - concessionAmt);

      const voucher: FeeVoucher = {
        id: `vch_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
        institutionId: tenantId,
        voucherNo,
        studentId: std.id,
        studentName: std.fullName,
        studentCode: std.studentId,
        classId: std.classId,
        sectionId: std.sectionId,
        issueDate: issueDate || new Date().toISOString().split('T')[0],
        dueDate: dueDate || new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        month,
        items: struct.items.map((it) => ({ headTitle: it.feeHeadTitle, amount: it.amount })),
        subTotal,
        concessionAmount: concessionAmt,
        lateFee: 0,
        totalAmount,
        paidAmount: 0,
        remainingAmount: totalAmount,
        status: 'UNPAID',
        payments: []
      };

      data.feeVouchers.unshift(voucher);
      createdVouchers.push(voucher);
      generatedCount++;
    }
  });

  db.logAudit({
    institutionId: tenantId,
    userId: req.user!.id,
    userName: req.user!.name,
    userRole: req.user!.role,
    action: 'FEE_VOUCHERS_GENERATED',
    details: `Generated ${generatedCount} fee vouchers for Month ${month} (Class ID: ${classId})`
  });

  db.persist();

  res.status(201).json({
    success: true,
    message: `Generated ${generatedCount} fee vouchers for month ${month}.`,
    data: createdVouchers
  });
});

// POST /api/v1/fees/payments - Collect fee payment
router.post('/payments', authenticate, requireTenantContext, requirePermission('fees.collect'), (req: AuthenticatedRequest, res: Response) => {
  const tenantId = req.tenantId!;
  const data = db.getRawData();
  const inst = data.institutions.find((i) => i.id === tenantId);

  const { voucherId, amountPaid, paymentMethod = 'CASH', notes } = req.body;

  if (!voucherId || !amountPaid || Number(amountPaid) <= 0) {
    return res.status(400).json({ success: false, message: 'Valid voucher ID and positive payment amount are required.' });
  }

  const voucher = data.feeVouchers.find((v) => v.id === voucherId && v.institutionId === tenantId);
  if (!voucher) {
    return res.status(404).json({ success: false, message: 'Fee voucher not found.' });
  }

  const payAmt = Number(amountPaid);

  if (payAmt > voucher.remainingAmount) {
    return res.status(400).json({
      success: false,
      message: `Payment amount (PKR ${payAmt}) exceeds remaining voucher balance (PKR ${voucher.remainingAmount}).`
    });
  }

  const year = new Date().getFullYear();
  const seqKey = `${inst?.code || 'INST'}-RECEIPT-${year}`;
  const seq = db.getNextSequence(seqKey);
  const receiptNo = `${inst?.code || 'INST'}-REC-${year}-${String(seq).padStart(4, '0')}`;

  const payment: FeePayment = {
    id: `pay_${Date.now()}`,
    institutionId: tenantId,
    voucherId: voucher.id,
    receiptNo,
    amountPaid: payAmt,
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod,
    collectedBy: req.user!.name,
    notes: notes || 'Official fee counter transaction'
  };

  voucher.payments.push(payment);
  voucher.paidAmount += payAmt;
  voucher.remainingAmount = voucher.totalAmount - voucher.paidAmount;

  if (voucher.remainingAmount === 0) {
    voucher.status = 'PAID';
  } else {
    voucher.status = 'PARTIAL';
  }

  db.logAudit({
    institutionId: tenantId,
    userId: req.user!.id,
    userName: req.user!.name,
    userRole: req.user!.role,
    action: 'FEE_PAYMENT_COLLECTED',
    details: `Collected PKR ${payAmt} for Voucher ${voucher.voucherNo} (Receipt #${receiptNo})`
  });

  db.persist();

  res.json({
    success: true,
    message: `Payment collected successfully! Receipt Issued: ${receiptNo}`,
    data: {
      voucher,
      receipt: payment
    }
  });
});

// GET /api/v1/fees/defaulters - Fee defaulters list
router.get('/defaulters', authenticate, requireTenantContext, requirePermission('fees.read'), (req: AuthenticatedRequest, res: Response) => {
  const tenantId = req.tenantId!;
  const data = db.getRawData();

  const defaulterVouchers = data.feeVouchers.filter(
    (v) => v.institutionId === tenantId && (v.status === 'OVERDUE' || (v.status === 'UNPAID' && new Date(v.dueDate) < new Date()))
  );

  const totalOutstanding = defaulterVouchers.reduce((acc, v) => acc + v.remainingAmount, 0);

  res.json({
    success: true,
    data: {
      count: defaulterVouchers.length,
      totalOutstanding,
      vouchers: defaulterVouchers
    }
  });
});

// GET /api/v1/fees/receipt/:receiptNo - Get receipt details for printing
router.get('/receipt/:receiptNo', authenticate, requireTenantContext, requirePermission('fees.read'), (req: AuthenticatedRequest, res: Response) => {
  const tenantId = req.tenantId!;
  const data = db.getRawData();
  const inst = data.institutions.find((i) => i.id === tenantId);

  for (const v of data.feeVouchers) {
    if (v.institutionId === tenantId) {
      const pay = v.payments.find((p) => p.receiptNo === req.params.receiptNo);
      if (pay) {
        const student = data.students.find((s) => s.id === v.studentId);
        const cls = data.classes.find((c) => c.id === v.classId);
        const sec = data.sections.find((s) => s.id === v.sectionId);
        return res.json({
          success: true,
          data: {
            institution: inst,
            voucher: v,
            payment: pay,
            student,
            className: cls?.name,
            sectionName: sec?.name
          }
        });
      }
    }
  }

  res.status(404).json({ success: false, message: 'Receipt record not found.' });
});

export default router;
