import { Router, Response } from 'express';
import { db } from '../db.js';
import { authenticate, requirePermission, requireTenantContext, AuthenticatedRequest } from '../middleware/auth.js';
import { Staff } from '../../src/types/index.js';

const router = Router();

// GET /api/v1/staff
router.get('/', authenticate, requireTenantContext, requirePermission('staff.read'), (req: AuthenticatedRequest, res: Response) => {
  const tenantId = req.tenantId!;
  const data = db.getRawData();
  const { search, department, page = 1, pageSize = 20 } = req.query;

  let items = data.staff.filter((s) => s.institutionId === tenantId);

  if (department) {
    items = items.filter((s) => s.department.toLowerCase() === String(department).toLowerCase());
  }

  if (search) {
    const q = String(search).toLowerCase();
    items = items.filter(
      (s) =>
        s.fullName.toLowerCase().includes(q) ||
        s.employeeId.toLowerCase().includes(q) ||
        s.designation.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q)
    );
  }

  const paginated = db.paginate(items, Number(page), Number(pageSize));
  res.json({ success: true, ...paginated });
});

// POST /api/v1/staff - Add Staff
router.post('/', authenticate, requireTenantContext, requirePermission('staff.manage'), (req: AuthenticatedRequest, res: Response) => {
  const tenantId = req.tenantId!;
  const data = db.getRawData();
  const { fullName, designation, department, email, phone, cnic, joiningDate, salary, subjectsAssigned, classesAssigned } = req.body;

  if (!fullName || !email || !designation || !department) {
    return res.status(400).json({ success: false, message: 'Full name, email, designation, and department are required.' });
  }

  const count = data.staff.filter((s) => s.institutionId === tenantId).length + 1;
  const empId = `EMP-${String(count).padStart(3, '0')}`;

  const newStaff: Staff = {
    id: `stf_${Date.now()}`,
    institutionId: tenantId,
    employeeId: empId,
    fullName,
    designation,
    department,
    email,
    phone: phone || '',
    cnic: cnic || 'N/A',
    joiningDate: joiningDate || new Date().toISOString().split('T')[0],
    salary: Number(salary) || 120000,
    status: 'ACTIVE',
    subjectsAssigned: subjectsAssigned || [],
    classesAssigned: classesAssigned || []
  };

  data.staff.unshift(newStaff);

  const inst = data.institutions.find((i) => i.id === tenantId);
  if (inst) {
    inst.staffCount = data.staff.filter((s) => s.institutionId === tenantId && s.status === 'ACTIVE').length;
  }

  db.persist();

  res.status(201).json({ success: true, message: `Staff member added with ID: ${empId}`, data: newStaff });
});

export default router;
