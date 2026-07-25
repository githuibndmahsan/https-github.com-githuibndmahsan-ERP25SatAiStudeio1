import { db } from './db.js';
import bcrypt from 'bcryptjs';
import {
  User,
  Institution,
  SubscriptionPlan,
  SaaSInvoice,
  ClientInquiry,
  AcademicSession,
  ClassEntity,
  SectionEntity,
  SubjectEntity,
  Guardian,
  Student,
  Staff,
  TimetableSlot,
  StudentAttendanceRecord,
  StaffAttendanceRecord,
  FeeHead,
  FeeStructure,
  FeeVoucher,
  Concession,
  Exam,
  ExamSubject,
  MarkEntry,
  ResultSummary,
  Assignment,
  AssignmentSubmission,
  PTMSchedule,
  Notice,
  WebsiteContent,
  EarlyWarningAlert
} from '../src/types/index.js';

export async function seedDatabase() {
  const data = db.getRawData();

  // If already seeded with users, skip unless empty
  if (data.users.length > 0 && data.institutions.length > 0) {
    console.log('Database already populated with seed data.');
    return;
  }

  console.log('Seeding EduCore Enterprise ERP database...');

  const passwordHash = await bcrypt.hash('admin123', 10);

  // 1. Subscription Plans
  const plans: SubscriptionPlan[] = [
    {
      id: 'plan_starter',
      name: 'Starter Campus',
      priceMonthly: 199,
      priceYearly: 1990,
      maxStudents: 300,
      maxStaff: 30,
      features: ['Core ERP Workspace', 'Attendance & Timetable', 'Basic Fee Collection', 'Public Website Studio', 'Email Support']
    },
    {
      id: 'plan_enterprise',
      name: 'Enterprise Institute',
      priceMonthly: 499,
      priceYearly: 4990,
      maxStudents: 1500,
      maxStaff: 120,
      recommended: true,
      features: ['Full Multi-Tenant ERP', 'Advanced Finance & Vouchers', 'Exams & Automated Report Cards', 'Parent & Student Portal', 'Early Warning Alerts', 'Custom Subdomain', '24/7 Priority Support']
    },
    {
      id: 'plan_university',
      name: 'University & Multi-Campus',
      priceMonthly: 999,
      priceYearly: 9990,
      maxStudents: 5000,
      maxStaff: 500,
      features: ['Unlimited Campus Nodes', 'Custom API Integrations', 'Multi-Currency Financial Ledger', 'Dedicated Cloud Instance', 'White-label Branding']
    }
  ];
  data.subscriptionPlans = plans;

  // 2. Institutions
  const institutions: Institution[] = [
    {
      id: 'inst_tcs',
      code: 'TCS',
      name: 'The City School - Main Campus',
      slug: 'the-city-school',
      subdomain: 'tcs',
      address: 'Sector F-8/3, Park Road',
      city: 'Islamabad',
      phone: '+92 51 2854301',
      email: 'info@thecityschool.edu.pk',
      website: 'https://thecityschool.edu.pk',
      status: 'ACTIVE',
      planId: 'plan_enterprise',
      primaryColor: '#0284c7', // Sky Blue
      secondaryColor: '#0f172a', // Slate
      studentCount: 840,
      staffCount: 65,
      createdAt: '2025-01-15T08:00:00Z',
      renewDate: '2027-01-15T08:00:00Z'
    },
    {
      id: 'inst_lums',
      code: 'LUMS',
      name: 'LUMS Academy & Preparatory',
      slug: 'lums-academy',
      subdomain: 'lums',
      address: 'DHA Phase 5, Knowledge City',
      city: 'Lahore',
      phone: '+92 42 35608000',
      email: 'admissions@lums.edu.pk',
      website: 'https://lums.edu.pk',
      status: 'ACTIVE',
      planId: 'plan_university',
      primaryColor: '#15803d', // Forest Green
      secondaryColor: '#1e293b',
      studentCount: 1250,
      staffCount: 95,
      createdAt: '2025-02-01T08:00:00Z',
      renewDate: '2027-02-01T08:00:00Z'
    },
    {
      id: 'inst_roots',
      code: 'ROOTS',
      name: 'Roots International Schools',
      slug: 'roots-international',
      subdomain: 'roots',
      address: 'Korang Town, Expressway',
      city: 'Rawalpindi',
      phone: '+92 51 5970001',
      email: 'contact@rootsinternational.edu.pk',
      website: 'https://rootsinternational.edu.pk',
      status: 'ACTIVE',
      planId: 'plan_starter',
      primaryColor: '#b91c1c', // Deep Crimson
      secondaryColor: '#18181b',
      studentCount: 420,
      staffCount: 38,
      createdAt: '2025-03-10T08:00:00Z',
      renewDate: '2026-03-10T08:00:00Z'
    },
    {
      id: 'inst_bhs',
      code: 'BHS',
      name: 'Beaconhouse School System',
      slug: 'beaconhouse-school',
      subdomain: 'bhs',
      address: 'Gulberg III, Main Boulevard',
      city: 'Lahore',
      phone: '+92 42 111232266',
      email: 'info@bh.edu.pk',
      website: 'https://beaconhouse.net',
      status: 'TRIAL',
      planId: 'plan_enterprise',
      primaryColor: '#d97706', // Amber/Gold
      secondaryColor: '#0f172a',
      studentCount: 610,
      staffCount: 48,
      createdAt: '2026-06-01T08:00:00Z',
      renewDate: '2026-08-01T08:00:00Z'
    }
  ];
  data.institutions = institutions;

  // 3. Super Admin & Tenant Users
  const allPermissions = [
    'students.read', 'students.create', 'students.update', 'students.archive', 'students.delete',
    'staff.read', 'staff.manage', 'attendance.mark', 'attendance.view', 'fees.read', 'fees.structure',
    'fees.generate', 'fees.collect', 'fees.concession.approve', 'fees.reversal', 'exams.read',
    'exams.manage', 'results.entry', 'results.publish', 'timetable.manage', 'assignments.manage',
    'ptm.manage', 'reports.view', 'website.publish', 'users.manage', 'settings.manage', 'saas.manage'
  ] as const;

  const users: User[] = [
    {
      id: 'usr_superadmin',
      email: 'admin-ndmahsan@educore.io',
      name: 'NDM Ahsan (Super Admin)',
      role: 'SUPER_ADMIN',
      permissions: [...allPermissions],
      status: 'ACTIVE',
      createdAt: '2025-01-01T00:00:00Z',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: 'usr_tcs_admin',
      email: 'admin@thecityschool.edu.pk',
      name: 'Dr. Tariq Rahman',
      role: 'INSTITUTE_ADMIN',
      institutionId: 'inst_tcs',
      permissions: [...allPermissions],
      status: 'ACTIVE',
      createdAt: '2025-01-15T08:00:00Z',
      phone: '+92 300 5551212',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: 'usr_tcs_accountant',
      email: 'accountant@thecityschool.edu.pk',
      name: 'Kashif Ali (Bursar)',
      role: 'ACCOUNTANT',
      institutionId: 'inst_tcs',
      permissions: ['fees.read', 'fees.structure', 'fees.generate', 'fees.collect', 'fees.reversal', 'reports.view', 'students.read'],
      status: 'ACTIVE',
      createdAt: '2025-01-20T08:00:00Z',
      phone: '+92 301 4443322'
    },
    {
      id: 'usr_tcs_teacher',
      email: 'aisha.khan@thecityschool.edu.pk',
      name: 'Aisha Khan (Senior Math Faculty)',
      role: 'TEACHER',
      institutionId: 'inst_tcs',
      permissions: ['students.read', 'attendance.mark', 'attendance.view', 'exams.read', 'results.entry', 'timetable.manage', 'assignments.manage', 'ptm.manage'],
      status: 'ACTIVE',
      createdAt: '2025-02-01T08:00:00Z',
      phone: '+92 321 9876543'
    },
    {
      id: 'usr_lums_admin',
      email: 'principal@lums.edu.pk',
      name: 'Prof. Sajjad Malik',
      role: 'INSTITUTE_ADMIN',
      institutionId: 'inst_lums',
      permissions: [...allPermissions],
      status: 'ACTIVE',
      createdAt: '2025-02-01T08:00:00Z'
    },
    {
      id: 'usr_tcs_student1',
      email: 'student.hamza@thecityschool.edu.pk',
      name: 'Hamza Farooq',
      role: 'STUDENT',
      institutionId: 'inst_tcs',
      permissions: ['students.read', 'attendance.view', 'exams.read', 'reports.view'],
      status: 'ACTIVE',
      createdAt: '2025-03-01T08:00:00Z'
    },
    {
      id: 'usr_tcs_parent1',
      email: 'farooq.father@gmail.com',
      name: 'Farooq Ahmed (Guardian)',
      role: 'PARENT',
      institutionId: 'inst_tcs',
      permissions: ['students.read', 'attendance.view', 'fees.read', 'exams.read', 'reports.view'],
      status: 'ACTIVE',
      createdAt: '2025-03-01T08:00:00Z'
    }
  ];
  data.users = users;

  // 4. SaaS Invoices & CRM
  data.saasInvoices = [
    {
      id: 'inv_101',
      invoiceNumber: 'SAAS-INV-2026-001',
      institutionId: 'inst_tcs',
      institutionName: 'The City School - Main Campus',
      planName: 'Enterprise Institute',
      amount: 499,
      dueDate: '2026-08-01',
      status: 'PAID',
      paidAt: '2026-07-02T10:30:00Z',
      paymentMethod: 'Credit Card',
      createdAt: '2026-07-01T00:00:00Z'
    },
    {
      id: 'inv_102',
      invoiceNumber: 'SAAS-INV-2026-002',
      institutionId: 'inst_lums',
      institutionName: 'LUMS Academy & Preparatory',
      planName: 'University & Multi-Campus',
      amount: 999,
      dueDate: '2026-08-01',
      status: 'PAID',
      paidAt: '2026-07-05T14:15:00Z',
      paymentMethod: 'Wire Transfer',
      createdAt: '2026-07-01T00:00:00Z'
    },
    {
      id: 'inv_103',
      invoiceNumber: 'SAAS-INV-2026-003',
      institutionId: 'inst_roots',
      institutionName: 'Roots International Schools',
      planName: 'Starter Campus',
      amount: 199,
      dueDate: '2026-07-15',
      status: 'OVERDUE',
      createdAt: '2026-06-15T00:00:00Z'
    }
  ];

  data.clientInquiries = [
    {
      id: 'inq_1',
      institutionName: 'Army Public School - Garrison',
      contactName: 'Brig. Saleem Raza',
      email: 'sraza@apsg.edu.pk',
      phone: '+92 333 1122334',
      estimatedStudents: 2200,
      status: 'DEMO_SCHEDULED',
      notes: 'Interested in Multi-Campus ERP with customized grading scheme and biometric clock sync.',
      createdAt: '2026-07-18T11:00:00Z'
    },
    {
      id: 'inq_2',
      institutionName: 'National Grammar School',
      contactName: 'Sobia Hassan',
      email: 'sobia@ngs.edu.pk',
      phone: '+92 302 9988776',
      estimatedStudents: 550,
      status: 'NEW',
      notes: 'Requested quotation for Starter Campus plan with online fee voucher integration.',
      createdAt: '2026-07-22T09:30:00Z'
    }
  ];

  // 5. Academic Sessions, Classes, Sections, Subjects for TCS
  const sessionTcs: AcademicSession = {
    id: 'sess_tcs_2026',
    institutionId: 'inst_tcs',
    name: '2025-2026 Academic Year',
    startDate: '2025-08-15',
    endDate: '2026-06-30',
    isCurrent: true
  };
  data.academicSessions.push(sessionTcs);

  const classesTcs: ClassEntity[] = [
    { id: 'cls_tcs_9', institutionId: 'inst_tcs', name: 'Grade 9 (O-Levels Prep)', code: 'G9' },
    { id: 'cls_tcs_10', institutionId: 'inst_tcs', name: 'Grade 10 (O-Levels Final)', code: 'G10' },
    { id: 'cls_tcs_11', institutionId: 'inst_tcs', name: 'Grade 11 (A-Levels Year 1)', code: 'G11' }
  ];
  data.classes.push(...classesTcs);

  const sectionsTcs: SectionEntity[] = [
    { id: 'sec_tcs_9a', institutionId: 'inst_tcs', classId: 'cls_tcs_9', name: 'Section A (Eagles)', capacity: 35 },
    { id: 'sec_tcs_9b', institutionId: 'inst_tcs', classId: 'cls_tcs_9', name: 'Section B (Falcon)', capacity: 35 },
    { id: 'sec_tcs_10a', institutionId: 'inst_tcs', classId: 'cls_tcs_10', name: 'Section A (Star)', capacity: 35 }
  ];
  data.sections.push(...sectionsTcs);

  const subjectsTcs: SubjectEntity[] = [
    { id: 'sub_math', institutionId: 'inst_tcs', classId: 'cls_tcs_9', name: 'Mathematics (Syllabus D)', code: '4024', isOptional: false },
    { id: 'sub_phy', institutionId: 'inst_tcs', classId: 'cls_tcs_9', name: 'Physics', code: '5054', isOptional: false },
    { id: 'sub_chem', institutionId: 'inst_tcs', classId: 'cls_tcs_9', name: 'Chemistry', code: '5070', isOptional: false },
    { id: 'sub_eng', institutionId: 'inst_tcs', classId: 'cls_tcs_9', name: 'English Language', code: '1123', isOptional: false },
    { id: 'sub_cs', institutionId: 'inst_tcs', classId: 'cls_tcs_9', name: 'Computer Science', code: '2210', isOptional: true }
  ];
  data.subjects.push(...subjectsTcs);

  // 6. Guardians & Students
  const guardian1: Guardian = {
    id: 'grd_tcs_1',
    institutionId: 'inst_tcs',
    name: 'Farooq Ahmed',
    cnic: '37405-1234567-1',
    relation: 'Father',
    phone: '+92 300 1234567',
    email: 'farooq.father@gmail.com',
    occupation: 'Senior Software Architect',
    address: 'House #42, Street 12, Sector F-8/3, Islamabad'
  };
  const guardian2: Guardian = {
    id: 'grd_tcs_2',
    institutionId: 'inst_tcs',
    name: 'Dr. Shahida Parveen',
    cnic: '37405-7654321-2',
    relation: 'Mother',
    phone: '+92 301 7654321',
    email: 'dr.shahida@gmail.com',
    occupation: 'Consultant Physician',
    address: 'House #108, St 5, Sector E-11, Islamabad'
  };
  data.guardians.push(guardian1, guardian2);

  const studentsTcs: Student[] = [
    {
      id: 'std_tcs_1',
      institutionId: 'inst_tcs',
      studentId: 'TCS-2026-0001',
      admissionNo: 'ADM-8801',
      fullName: 'Hamza Farooq',
      cnicOrBForm: '61101-9876543-1',
      dob: '2011-04-12',
      gender: 'MALE',
      phone: '+92 333 5556677',
      email: 'student.hamza@thecityschool.edu.pk',
      address: 'House #42, Street 12, Sector F-8/3, Islamabad',
      sessionId: 'sess_tcs_2026',
      classId: 'cls_tcs_9',
      sectionId: 'sec_tcs_9a',
      admissionDate: '2025-08-20',
      guardianId: 'grd_tcs_1',
      emergencyContact: '+92 300 1234567',
      photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
      status: 'ACTIVE',
      documents: [
        { title: 'B-Form Certificate', url: '/uploads/bform_hamza.pdf', uploadedAt: '2025-08-20' },
        { title: 'Previous School Leaving Cert', url: '/uploads/slc_hamza.pdf', uploadedAt: '2025-08-20' }
      ],
      createdAt: '2025-08-20T08:00:00Z'
    },
    {
      id: 'std_tcs_2',
      institutionId: 'inst_tcs',
      studentId: 'TCS-2026-0002',
      admissionNo: 'ADM-8802',
      fullName: 'Zara Shahida',
      cnicOrBForm: '61101-1122334-2',
      dob: '2011-09-25',
      gender: 'FEMALE',
      phone: '+92 321 8889900',
      email: 'zara.shahida@thecityschool.edu.pk',
      address: 'House #108, St 5, Sector E-11, Islamabad',
      sessionId: 'sess_tcs_2026',
      classId: 'cls_tcs_9',
      sectionId: 'sec_tcs_9a',
      admissionDate: '2025-08-22',
      guardianId: 'grd_tcs_2',
      emergencyContact: '+92 301 7654321',
      photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      status: 'ACTIVE',
      documents: [
        { title: 'B-Form Copy', url: '/uploads/bform_zara.pdf', uploadedAt: '2025-08-22' }
      ],
      createdAt: '2025-08-22T08:00:00Z'
    },
    {
      id: 'std_tcs_3',
      institutionId: 'inst_tcs',
      studentId: 'TCS-2026-0003',
      admissionNo: 'ADM-8803',
      fullName: 'Bilal Hassan',
      cnicOrBForm: '61101-4455667-3',
      dob: '2011-02-14',
      gender: 'MALE',
      phone: '+92 345 9988112',
      address: 'Sector G-9/1, Islamabad',
      sessionId: 'sess_tcs_2026',
      classId: 'cls_tcs_9',
      sectionId: 'sec_tcs_9b',
      admissionDate: '2025-08-25',
      guardianId: 'grd_tcs_1',
      emergencyContact: '+92 345 9988112',
      status: 'ACTIVE',
      documents: [],
      createdAt: '2025-08-25T08:00:00Z'
    },
    {
      id: 'std_tcs_4',
      institutionId: 'inst_tcs',
      studentId: 'TCS-2026-0004',
      admissionNo: 'ADM-8804',
      fullName: 'Amina Zainab',
      cnicOrBForm: '61101-7788990-4',
      dob: '2010-11-08',
      gender: 'FEMALE',
      address: 'Sector F-10/2, Islamabad',
      sessionId: 'sess_tcs_2026',
      classId: 'cls_tcs_10',
      sectionId: 'sec_tcs_10a',
      admissionDate: '2024-08-15',
      guardianId: 'grd_tcs_2',
      emergencyContact: '+92 301 7654321',
      status: 'ACTIVE',
      documents: [],
      createdAt: '2024-08-15T08:00:00Z'
    }
  ];
  data.students.push(...studentsTcs);

  // 7. Staff & Teachers
  const staffTcs: Staff[] = [
    {
      id: 'stf_tcs_1',
      institutionId: 'inst_tcs',
      employeeId: 'EMP-001',
      fullName: 'Aisha Khan',
      designation: 'Senior Faculty',
      department: 'Mathematics',
      email: 'aisha.khan@thecityschool.edu.pk',
      phone: '+92 321 9876543',
      cnic: '37405-9988776-5',
      joiningDate: '2022-09-01',
      salary: 185000,
      status: 'ACTIVE',
      subjectsAssigned: ['sub_math'],
      classesAssigned: ['cls_tcs_9', 'cls_tcs_10'],
      photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: 'stf_tcs_2',
      institutionId: 'inst_tcs',
      employeeId: 'EMP-002',
      fullName: 'Dr. Usman Mahmood',
      designation: 'Head of Physics Department',
      department: 'Science',
      email: 'usman.mahmood@thecityschool.edu.pk',
      phone: '+92 300 4433221',
      cnic: '37405-1122334-9',
      joiningDate: '2020-08-15',
      salary: 220000,
      status: 'ACTIVE',
      subjectsAssigned: ['sub_phy'],
      classesAssigned: ['cls_tcs_9']
    },
    {
      id: 'stf_tcs_3',
      institutionId: 'inst_tcs',
      employeeId: 'EMP-003',
      fullName: 'Kashif Ali',
      designation: 'Bursar & Accountant',
      department: 'Finance',
      email: 'accountant@thecityschool.edu.pk',
      phone: '+92 301 4443322',
      cnic: '37405-3344556-7',
      joiningDate: '2021-01-10',
      salary: 140000,
      status: 'ACTIVE'
    }
  ];
  data.staff.push(...staffTcs);

  // 8. Timetable
  const timetableTcs: TimetableSlot[] = [
    {
      id: 'slot_1',
      institutionId: 'inst_tcs',
      classId: 'cls_tcs_9',
      sectionId: 'sec_tcs_9a',
      subjectId: 'sub_math',
      staffId: 'stf_tcs_1',
      dayOfWeek: 'MONDAY',
      periodNumber: 1,
      startTime: '08:00',
      endTime: '08:45',
      roomNo: 'Room 101'
    },
    {
      id: 'slot_2',
      institutionId: 'inst_tcs',
      classId: 'cls_tcs_9',
      sectionId: 'sec_tcs_9a',
      subjectId: 'sub_phy',
      staffId: 'stf_tcs_2',
      dayOfWeek: 'MONDAY',
      periodNumber: 2,
      startTime: '08:45',
      endTime: '09:30',
      roomNo: 'Physics Lab 1'
    },
    {
      id: 'slot_3',
      institutionId: 'inst_tcs',
      classId: 'cls_tcs_9',
      sectionId: 'sec_tcs_9a',
      subjectId: 'sub_cs',
      staffId: 'stf_tcs_1',
      dayOfWeek: 'TUESDAY',
      periodNumber: 1,
      startTime: '08:00',
      endTime: '08:45',
      roomNo: 'Computer Lab B'
    }
  ];
  data.timetableSlots.push(...timetableTcs);

  // 9. Attendance
  const dates = ['2026-07-20', '2026-07-21', '2026-07-22', '2026-07-23', '2026-07-24'];
  dates.forEach((d) => {
    data.studentAttendance.push(
      {
        id: `att_${d}_1`,
        institutionId: 'inst_tcs',
        studentId: 'std_tcs_1',
        classId: 'cls_tcs_9',
        sectionId: 'sec_tcs_9a',
        date: d,
        status: 'PRESENT',
        markedBy: 'usr_tcs_teacher'
      },
      {
        id: `att_${d}_2`,
        institutionId: 'inst_tcs',
        studentId: 'std_tcs_2',
        classId: 'cls_tcs_9',
        sectionId: 'sec_tcs_9a',
        date: d,
        status: d === '2026-07-22' ? 'ABSENT' : 'PRESENT',
        remarks: d === '2026-07-22' ? 'Sick Leave' : undefined,
        markedBy: 'usr_tcs_teacher'
      }
    );
  });

  // 10. Fee Heads & Structures
  const feeHead1: FeeHead = { id: 'head_tuition', institutionId: 'inst_tcs', title: 'Monthly Tuition Fee', type: 'RECURRING' };
  const feeHead2: FeeHead = { id: 'head_lab', institutionId: 'inst_tcs', title: 'Computer & Science Lab Charge', type: 'RECURRING' };
  const feeHead3: FeeHead = { id: 'head_annual', institutionId: 'inst_tcs', title: 'Annual Development Fund', type: 'ONE_TIME' };
  data.feeHeads.push(feeHead1, feeHead2, feeHead3);

  const feeStructureTcs: FeeStructure = {
    id: 'struct_tcs_9',
    institutionId: 'inst_tcs',
    classId: 'cls_tcs_9',
    title: 'Grade 9 Monthly Fee Package',
    frequency: 'MONTHLY',
    items: [
      { feeHeadId: 'head_tuition', feeHeadTitle: 'Monthly Tuition Fee', amount: 32000 },
      { feeHeadId: 'head_lab', feeHeadTitle: 'Computer & Science Lab Charge', amount: 3500 }
    ],
    totalAmount: 35500
  };
  data.feeStructures.push(feeStructureTcs);

  // 11. Fee Vouchers & Receipts
  const voucher1: FeeVoucher = {
    id: 'vch_1',
    institutionId: 'inst_tcs',
    voucherNo: 'TCS-VOUCH-2026-0001',
    studentId: 'std_tcs_1',
    studentName: 'Hamza Farooq',
    studentCode: 'TCS-2026-0001',
    classId: 'cls_tcs_9',
    sectionId: 'sec_tcs_9a',
    issueDate: '2026-07-01',
    dueDate: '2026-07-15',
    month: '2026-07',
    items: [
      { headTitle: 'Monthly Tuition Fee', amount: 32000 },
      { headTitle: 'Computer & Science Lab Charge', amount: 3500 }
    ],
    subTotal: 35500,
    concessionAmount: 3500, // Merit Concession
    lateFee: 0,
    totalAmount: 32000,
    paidAmount: 32000,
    remainingAmount: 0,
    status: 'PAID',
    payments: [
      {
        id: 'pay_1',
        institutionId: 'inst_tcs',
        voucherId: 'vch_1',
        receiptNo: 'TCS-REC-2026-0001',
        amountPaid: 32000,
        paymentDate: '2026-07-10',
        paymentMethod: 'ONLINE_CARD',
        collectedBy: 'usr_tcs_accountant',
        notes: 'Paid via HBL Online Gateway'
      }
    ]
  };

  const voucher2: FeeVoucher = {
    id: 'vch_2',
    institutionId: 'inst_tcs',
    voucherNo: 'TCS-VOUCH-2026-0002',
    studentId: 'std_tcs_2',
    studentName: 'Zara Shahida',
    studentCode: 'TCS-2026-0002',
    classId: 'cls_tcs_9',
    sectionId: 'sec_tcs_9a',
    issueDate: '2026-07-01',
    dueDate: '2026-07-15',
    month: '2026-07',
    items: [
      { headTitle: 'Monthly Tuition Fee', amount: 32000 },
      { headTitle: 'Computer & Science Lab Charge', amount: 3500 }
    ],
    subTotal: 35500,
    concessionAmount: 0,
    lateFee: 1500, // Overdue late fee
    totalAmount: 37000,
    paidAmount: 15000,
    remainingAmount: 22000,
    status: 'PARTIAL',
    payments: [
      {
        id: 'pay_2',
        institutionId: 'inst_tcs',
        voucherId: 'vch_2',
        receiptNo: 'TCS-REC-2026-0002',
        amountPaid: 15000,
        paymentDate: '2026-07-18',
        paymentMethod: 'CASH',
        collectedBy: 'usr_tcs_accountant',
        notes: 'Partial cash payment accepted by Bursar'
      }
    ]
  };

  const voucher3: FeeVoucher = {
    id: 'vch_3',
    institutionId: 'inst_tcs',
    voucherNo: 'TCS-VOUCH-2026-0003',
    studentId: 'std_tcs_3',
    studentName: 'Bilal Hassan',
    studentCode: 'TCS-2026-0003',
    classId: 'cls_tcs_9',
    sectionId: 'sec_tcs_9b',
    issueDate: '2026-06-01',
    dueDate: '2026-06-15',
    month: '2026-06',
    items: [{ headTitle: 'Monthly Tuition Fee', amount: 32000 }],
    subTotal: 32000,
    concessionAmount: 0,
    lateFee: 2000,
    totalAmount: 34000,
    paidAmount: 0,
    remainingAmount: 34000,
    status: 'OVERDUE',
    payments: []
  };

  data.feeVouchers.push(voucher1, voucher2, voucher3);

  // 12. Exams & Results
  const examMidterm: Exam = {
    id: 'ex_mid_2026',
    institutionId: 'inst_tcs',
    title: 'Midterm Comprehensive Examination 2026',
    sessionId: 'sess_tcs_2026',
    classId: 'cls_tcs_9',
    startDate: '2026-05-10',
    endDate: '2026-05-22',
    status: 'PUBLISHED'
  };
  data.exams.push(examMidterm);

  const examSubjects: ExamSubject[] = [
    { id: 'exsub_math', examId: 'ex_mid_2026', subjectId: 'sub_math', subjectName: 'Mathematics (Syllabus D)', maxMarks: 100, passMarks: 40 },
    { id: 'exsub_phy', examId: 'ex_mid_2026', subjectId: 'sub_phy', subjectName: 'Physics', maxMarks: 100, passMarks: 40 },
    { id: 'exsub_chem', examId: 'ex_mid_2026', subjectId: 'sub_chem', subjectName: 'Chemistry', maxMarks: 100, passMarks: 40 },
    { id: 'exsub_eng', examId: 'ex_mid_2026', subjectId: 'sub_eng', subjectName: 'English Language', maxMarks: 100, passMarks: 40 }
  ];
  data.examSubjects.push(...examSubjects);

  const marksEntries: MarkEntry[] = [
    { id: 'm1', institutionId: 'inst_tcs', examId: 'ex_mid_2026', subjectId: 'sub_math', studentId: 'std_tcs_1', marksObtained: 94, isAbsent: false },
    { id: 'm2', institutionId: 'inst_tcs', examId: 'ex_mid_2026', subjectId: 'sub_phy', studentId: 'std_tcs_1', marksObtained: 88, isAbsent: false },
    { id: 'm3', institutionId: 'inst_tcs', examId: 'ex_mid_2026', subjectId: 'sub_chem', studentId: 'std_tcs_1', marksObtained: 91, isAbsent: false },
    { id: 'm4', institutionId: 'inst_tcs', examId: 'ex_mid_2026', subjectId: 'sub_eng', studentId: 'std_tcs_1', marksObtained: 85, isAbsent: false },

    { id: 'm5', institutionId: 'inst_tcs', examId: 'ex_mid_2026', subjectId: 'sub_math', studentId: 'std_tcs_2', marksObtained: 78, isAbsent: false },
    { id: 'm6', institutionId: 'inst_tcs', examId: 'ex_mid_2026', subjectId: 'sub_phy', studentId: 'std_tcs_2', marksObtained: 82, isAbsent: false },
    { id: 'm7', institutionId: 'inst_tcs', examId: 'ex_mid_2026', subjectId: 'sub_chem', studentId: 'std_tcs_2', marksObtained: 76, isAbsent: false },
    { id: 'm8', institutionId: 'inst_tcs', examId: 'ex_mid_2026', subjectId: 'sub_eng', studentId: 'std_tcs_2', marksObtained: 80, isAbsent: false }
  ];
  data.marksEntries.push(...marksEntries);

  const results: ResultSummary[] = [
    {
      id: 'res_1',
      institutionId: 'inst_tcs',
      examId: 'ex_mid_2026',
      studentId: 'std_tcs_1',
      studentName: 'Hamza Farooq',
      studentCode: 'TCS-2026-0001',
      totalMaxMarks: 400,
      totalObtainedMarks: 358,
      percentage: 89.5,
      grade: 'A*',
      gpa: 4.0,
      position: 1,
      status: 'PASS',
      isPublished: true
    },
    {
      id: 'res_2',
      institutionId: 'inst_tcs',
      examId: 'ex_mid_2026',
      studentId: 'std_tcs_2',
      studentName: 'Zara Shahida',
      studentCode: 'TCS-2026-0002',
      totalMaxMarks: 400,
      totalObtainedMarks: 316,
      percentage: 79.0,
      grade: 'A',
      gpa: 3.6,
      position: 2,
      status: 'PASS',
      isPublished: true
    }
  ];
  data.resultSummaries.push(...results);

  // 13. Assignments
  const assignment1: Assignment = {
    id: 'asg_1',
    institutionId: 'inst_tcs',
    title: 'Algebraic Polynomials & Quadratic Modeling Problem Set',
    description: 'Solve problems 1 through 15 on Chapter 4. Submit neat hand-written calculations or PDF scan.',
    classId: 'cls_tcs_9',
    sectionId: 'sec_tcs_9a',
    subjectId: 'sub_math',
    staffId: 'stf_tcs_1',
    dueDate: '2026-07-28',
    maxPoints: 50,
    attachmentUrl: '/uploads/math_hw_ch4.pdf',
    createdAt: '2026-07-20T10:00:00Z'
  };
  data.assignments.push(assignment1);

  data.assignmentSubmissions.push({
    id: 'sub_asg_1_1',
    assignmentId: 'asg_1',
    studentId: 'std_tcs_1',
    studentName: 'Hamza Farooq',
    submissionDate: '2026-07-22T15:30:00Z',
    content: 'Attached solution document with step-by-step proofs for questions 1-15.',
    fileUrl: '/uploads/hamza_math_solution.pdf',
    marksObtained: 48,
    feedback: 'Excellent rigor and neat layout!',
    status: 'GRADED'
  });

  // 14. PTM
  data.ptmSchedules.push({
    id: 'ptm_1',
    institutionId: 'inst_tcs',
    title: 'Parent-Teacher Progress Review Conference - Term 1',
    date: '2026-08-05',
    startTime: '09:00',
    endTime: '14:00',
    classId: 'cls_tcs_9',
    sectionId: 'sec_tcs_9a',
    slots: [
      { id: 's1', time: '09:00 - 09:20', guardianId: 'grd_tcs_1', studentId: 'std_tcs_1', studentName: 'Hamza Farooq', status: 'BOOKED', notes: 'Discuss advanced STEM track options.' },
      { id: 's2', time: '09:20 - 09:40', guardianId: 'grd_tcs_2', studentId: 'std_tcs_2', studentName: 'Zara Shahida', status: 'BOOKED' },
      { id: 's3', time: '09:40 - 10:00', status: 'AVAILABLE' }
    ]
  });

  // 15. Notices
  data.notices.push(
    {
      id: 'not_1',
      institutionId: 'inst_tcs',
      title: 'Annual Sports Olympiad & Science Fair Registration Open',
      content: 'All students from Grade 8 through A-Levels are invited to submit project proposals for the upcoming Science Fair. Registration closes on August 10th.',
      category: 'ACADEMIC',
      targetAudience: 'ALL',
      publishDate: '2026-07-21',
      isImportant: true,
      isPublished: true
    },
    {
      id: 'not_2',
      institutionId: 'inst_tcs',
      title: 'Term 2 Fee Voucher Issuance & Bank Clearance Notice',
      content: 'Fee vouchers for August 2026 have been generated. Parents can view and pay online or deposit cash/cheque at any Allied Bank or HBL branch.',
      category: 'GENERAL',
      targetAudience: 'PARENTS',
      publishDate: '2026-07-15',
      isImportant: false,
      isPublished: true
    }
  );

  // 16. Website Studio Contents for Institutions
  data.websiteContents['inst_tcs'] = {
    institutionId: 'inst_tcs',
    heroTitle: 'Empowering Next-Generation Leaders Through Holistic Academic Excellence',
    heroSubtitle: 'The City School - Main Campus provides world-class Cambridge O/A Levels curriculum, state-of-the-art STEM labs, and rich extra-curricular development.',
    heroBannerUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&auto=format&fit=crop&q=80',
    aboutText: 'Established with a vision for uncompromising academic standards, The City School represents one of the largest private school networks in South Asia. Our Islamabad Main Campus spans 12 acres of dedicated educational infrastructure.',
    primaryColor: '#0284c7',
    secondaryColor: '#0f172a',
    isPublished: true,
    programs: [
      { title: 'Cambridge O-Levels', description: 'Comprehensive 3-year preparation in Sciences, Humanities, and Information Technology.', icon: 'GraduationCap' },
      { title: 'Cambridge A-Levels', description: 'Rigorous pre-university academic tracks leading to top global university placements.', icon: 'BookOpen' },
      { title: 'Robotics & AI Lab', description: 'Hands-on practical training in microcontrollers, Python programming, and automation.', icon: 'Cpu' }
    ],
    facultyProfiles: [
      { name: 'Dr. Tariq Rahman', title: 'Campus Principal & Educationist', bio: 'Ph.D. in Educational Leadership with 25+ years experience in Cambridge curriculum administration.' },
      { name: 'Aisha Khan', title: 'Senior Faculty - Mathematics', bio: 'M.Sc. Mathematics, recipient of National Outstanding Educator Award.' }
    ],
    notices: [
      { title: 'O-Levels High Achievers Ceremony', date: '2026-08-12', snippet: 'Celebrating students scoring 8+ A* grades in 2025 Cambridge Exams.' }
    ],
    gallery: [
      { title: 'Main Academic Block', imageUrl: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?w=600&auto=format&fit=crop&q=80' },
      { title: 'Robotics Laboratory', imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80' }
    ],
    contactEmail: 'info@thecityschool.edu.pk',
    contactPhone: '+92 51 2854301',
    address: 'Sector F-8/3, Park Road, Islamabad'
  };

  data.websiteContents['inst_lums'] = {
    institutionId: 'inst_lums',
    heroTitle: 'Excellence Without Borders at LUMS Academy',
    heroSubtitle: 'Transformative pre-collegiate education preparing students for global impact, research, and critical leadership.',
    primaryColor: '#15803d',
    secondaryColor: '#1e293b',
    isPublished: true,
    aboutText: 'LUMS Academy brings collegiate rigor and interdisciplinary learning to secondary education.',
    programs: [
      { title: 'STEM Honor Track', description: 'Advanced Physics, Mathematics, and Data Science.', icon: 'Compass' }
    ],
    facultyProfiles: [],
    notices: [],
    gallery: [],
    contactEmail: 'admissions@lums.edu.pk',
    contactPhone: '+92 42 35608000',
    address: 'DHA Phase 5, Knowledge City, Lahore'
  };

  // 17. Early Warning Alerts
  data.earlyWarnings.push(
    {
      id: 'ew_1',
      institutionId: 'inst_tcs',
      studentId: 'std_tcs_3',
      studentName: 'Bilal Hassan',
      studentCode: 'TCS-2026-0003',
      className: 'Grade 9',
      sectionName: 'Section B',
      type: 'OVERDUE_FEE',
      severity: 'HIGH',
      description: 'Fee voucher TCS-VOUCH-2026-0003 is overdue by 39 days with balance PKR 34,000.',
      metricValue: 'Overdue: 39 Days',
      createdAt: '2026-07-20T08:00:00Z'
    },
    {
      id: 'ew_2',
      institutionId: 'inst_tcs',
      studentId: 'std_tcs_2',
      studentName: 'Zara Shahida',
      studentCode: 'TCS-2026-0002',
      className: 'Grade 9',
      sectionName: 'Section A',
      type: 'LOW_ATTENDANCE',
      severity: 'MEDIUM',
      description: 'Student marked absent 1 time in past 5 school days (80% attendance).',
      metricValue: 'Attendance: 80%',
      createdAt: '2026-07-22T08:00:00Z'
    }
  );

  // 18. Audit Logs
  data.auditLogs.push(
    {
      id: 'log_1',
      userId: 'usr_superadmin',
      userName: 'NDM Ahsan (Super Admin)',
      userRole: 'SUPER_ADMIN',
      action: 'SYSTEM_INITIALIZATION',
      details: 'Initial multi-tenant ERP platform environment bootstrapped successfully.',
      timestamp: new Date().toISOString()
    },
    {
      id: 'log_2',
      institutionId: 'inst_tcs',
      userId: 'usr_tcs_accountant',
      userName: 'Kashif Ali (Bursar)',
      userRole: 'ACCOUNTANT',
      action: 'FEE_PAYMENT_COLLECTED',
      details: 'Collected PKR 32,000 for Voucher TCS-VOUCH-2026-0001 (Receipt # TCS-REC-2026-0001).',
      timestamp: '2026-07-10T11:20:00Z'
    }
  );

  // Initialize sequence tracking
  data.sequences['TCS-STUDENT-2026'] = 4;
  data.sequences['TCS-VOUCHER-2026'] = 3;
  data.sequences['TCS-RECEIPT-2026'] = 2;

  db.persist();
  console.log('EduCore Enterprise ERP database seeded successfully!');
}
