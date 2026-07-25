export type UserRole = 
  | 'SUPER_ADMIN' 
  | 'INSTITUTE_ADMIN' 
  | 'PRINCIPAL' 
  | 'TEACHER' 
  | 'ACCOUNTANT' 
  | 'LIBRARIAN' 
  | 'STUDENT' 
  | 'PARENT';

export type Permission = 
  | 'students.read'
  | 'students.create'
  | 'students.update'
  | 'students.archive'
  | 'students.delete'
  | 'staff.read'
  | 'staff.manage'
  | 'attendance.mark'
  | 'attendance.view'
  | 'fees.read'
  | 'fees.structure'
  | 'fees.generate'
  | 'fees.collect'
  | 'fees.concession.approve'
  | 'fees.reversal'
  | 'exams.read'
  | 'exams.manage'
  | 'results.entry'
  | 'results.publish'
  | 'timetable.manage'
  | 'assignments.manage'
  | 'ptm.manage'
  | 'reports.view'
  | 'website.publish'
  | 'users.manage'
  | 'settings.manage'
  | 'saas.manage';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  permissions: Permission[];
  institutionId?: string; // empty for SUPER_ADMIN
  avatar?: string;
  phone?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  createdAt: string;
  lastLogin?: string;
}

export type InstitutionStatus = 'ACTIVE' | 'SUSPENDED' | 'TRIAL' | 'ARCHIVED';

export interface Institution {
  id: string;
  code: string; // e.g. TCS, LUMS, ROOTS, BHS
  name: string;
  slug: string; // e.g. city-school
  logo?: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  website?: string;
  status: InstitutionStatus;
  planId: string;
  primaryColor: string;
  secondaryColor: string;
  subdomain: string;
  customDomain?: string;
  studentCount: number;
  staffCount: number;
  createdAt: string;
  renewDate: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  priceMonthly: number;
  priceYearly: number;
  maxStudents: number;
  maxStaff: number;
  features: string[];
  recommended?: boolean;
}

export interface SaaSInvoice {
  id: string;
  invoiceNumber: string;
  institutionId: string;
  institutionName: string;
  planName: string;
  amount: number;
  dueDate: string;
  status: 'PAID' | 'UNPAID' | 'OVERDUE' | 'CANCELLED';
  paidAt?: string;
  paymentMethod?: string;
  createdAt: string;
}

export interface ClientInquiry {
  id: string;
  institutionName: string;
  contactName: string;
  email: string;
  phone: string;
  estimatedStudents: number;
  status: 'NEW' | 'CONTACTED' | 'DEMO_SCHEDULED' | 'CONVERTED' | 'LOST';
  notes?: string;
  createdAt: string;
}

export interface AcademicSession {
  id: string;
  institutionId: string;
  name: string; // e.g. "2025-2026"
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

export interface ClassEntity {
  id: string;
  institutionId: string;
  name: string; // e.g. "Grade 9"
  code: string;
}

export interface SectionEntity {
  id: string;
  institutionId: string;
  classId: string;
  name: string; // e.g. "A", "B"
  capacity: number;
}

export interface SubjectEntity {
  id: string;
  institutionId: string;
  classId: string;
  name: string;
  code: string;
  isOptional: boolean;
}

export interface Guardian {
  id: string;
  institutionId: string;
  name: string;
  cnic: string;
  relation: string; // Father, Mother, Guardian
  phone: string;
  email?: string;
  occupation?: string;
  address: string;
}

export interface Student {
  id: string;
  institutionId: string;
  studentId: string; // format: TCS-2026-0001
  admissionNo: string;
  fullName: string;
  cnicOrBForm: string;
  dob: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  phone?: string;
  email?: string;
  address: string;
  sessionId: string;
  classId: string;
  sectionId: string;
  admissionDate: string;
  guardianId: string;
  emergencyContact: string;
  photoUrl?: string;
  status: 'ACTIVE' | 'ARCHIVED' | 'PROMOTED' | 'TRANSFERRED' | 'DELETED';
  documents: { title: string; url: string; uploadedAt: string }[];
  previousSchool?: string;
  createdAt: string;
}

export interface Staff {
  id: string;
  institutionId: string;
  employeeId: string; // e.g. EMP-001
  fullName: string;
  designation: string; // Teacher, Accountant, Principal, etc.
  department: string;
  email: string;
  phone: string;
  cnic: string;
  joiningDate: string;
  salary: number;
  status: 'ACTIVE' | 'ON_LEAVE' | 'TERMINATED';
  subjectsAssigned?: string[]; // Subject IDs
  classesAssigned?: string[]; // Class IDs
  photoUrl?: string;
}

export interface TimetableSlot {
  id: string;
  institutionId: string;
  classId: string;
  sectionId: string;
  subjectId: string;
  staffId: string;
  dayOfWeek: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY';
  periodNumber: number;
  startTime: string; // "08:00"
  endTime: string;   // "08:45"
  roomNo: string;
}

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LEAVE' | 'LATE';

export interface StudentAttendanceRecord {
  id: string;
  institutionId: string;
  studentId: string;
  classId: string;
  sectionId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  remarks?: string;
  markedBy: string;
}

export interface StaffAttendanceRecord {
  id: string;
  institutionId: string;
  staffId: string;
  date: string;
  status: AttendanceStatus;
  checkIn?: string;
  checkOut?: string;
  remarks?: string;
}

export interface FeeHead {
  id: string;
  institutionId: string;
  title: string; // e.g. Tuition Fee, Admission Fee, Computer Lab Fee
  type: 'RECURRING' | 'ONE_TIME';
}

export interface FeeStructure {
  id: string;
  institutionId: string;
  classId: string;
  title: string;
  items: { feeHeadId: string; feeHeadTitle: string; amount: number }[];
  totalAmount: number;
  frequency: 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';
}

export interface Concession {
  id: string;
  institutionId: string;
  studentId: string;
  title: string;
  amount: number;
  percentage?: number;
  approvedBy: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface FeeVoucher {
  id: string;
  institutionId: string;
  voucherNo: string; // e.g. VOUCH-2026-0001
  studentId: string;
  studentName: string;
  studentCode: string;
  classId: string;
  sectionId: string;
  issueDate: string;
  dueDate: string;
  month: string; // e.g. "2026-07"
  items: { headTitle: string; amount: number }[];
  subTotal: number;
  concessionAmount: number;
  lateFee: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: 'PAID' | 'UNPAID' | 'PARTIAL' | 'OVERDUE' | 'CANCELLED';
  payments: FeePayment[];
}

export interface FeePayment {
  id: string;
  institutionId: string;
  voucherId: string;
  receiptNo: string; // e.g. REC-2026-0001
  amountPaid: number;
  paymentDate: string;
  paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'ONLINE_CARD' | 'CHEQUE';
  collectedBy: string;
  notes?: string;
  isReversed?: boolean;
}

export interface Exam {
  id: string;
  institutionId: string;
  title: string; // e.g. Midterm Exams 2026
  sessionId: string;
  classId: string;
  gradeClass?: string;
  term?: string;
  isPublished?: boolean;
  startDate: string;
  endDate: string;
  status: 'DRAFT' | 'ONGOING' | 'COMPLETED' | 'PUBLISHED';
}

export interface ExamSubject {
  id: string;
  examId: string;
  subjectId: string;
  subjectName: string;
  maxMarks: number;
  passMarks: number;
}

export interface MarkEntry {
  id: string;
  institutionId: string;
  examId: string;
  subjectId: string;
  studentId: string;
  marksObtained: number;
  isAbsent: boolean;
  remarks?: string;
}

export interface ResultSummary {
  id: string;
  institutionId: string;
  examId: string;
  studentId: string;
  studentName: string;
  studentCode: string;
  totalMaxMarks: number;
  totalObtainedMarks: number;
  percentage: number;
  grade: string;
  gpa: number;
  position: number;
  status: 'PASS' | 'FAIL';
  isPublished: boolean;
}

export interface Assignment {
  id: string;
  institutionId: string;
  title: string;
  description: string;
  classId: string;
  sectionId: string;
  subjectId: string;
  staffId: string;
  dueDate: string;
  maxPoints: number;
  attachmentUrl?: string;
  createdAt: string;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  submissionDate: string;
  content: string;
  fileUrl?: string;
  marksObtained?: number;
  feedback?: string;
  status: 'SUBMITTED' | 'GRADED' | 'LATE';
}

export interface PTMSchedule {
  id: string;
  institutionId: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  classId: string;
  sectionId: string;
  slots: {
    id: string;
    time: string;
    guardianId?: string;
    studentId?: string;
    studentName?: string;
    status: 'AVAILABLE' | 'BOOKED' | 'COMPLETED';
    notes?: string;
  }[];
}

export interface Notice {
  id: string;
  institutionId: string;
  title: string;
  content: string;
  category: 'ACADEMIC' | 'EVENT' | 'EXAM' | 'GENERAL' | 'EMERGENCY';
  targetAudience: 'ALL' | 'STUDENTS' | 'PARENTS' | 'STAFF';
  publishDate: string;
  isImportant: boolean;
  isPublished: boolean;
}

export interface WebsiteContent {
  institutionId: string;
  heroTitle: string;
  heroSubtitle: string;
  heroBannerUrl?: string;
  aboutText: string;
  primaryColor: string;
  secondaryColor: string;
  isPublished: boolean;
  programs: { title: string; description: string; icon: string }[];
  facultyProfiles: { name: string; title: string; image?: string; bio: string }[];
  notices: { title: string; date: string; snippet: string }[];
  gallery: { title: string; imageUrl: string }[];
  contactEmail: string;
  contactPhone: string;
  address: string;
}

export interface EarlyWarningAlert {
  id: string;
  institutionId: string;
  studentId: string;
  studentName: string;
  studentCode: string;
  className: string;
  sectionName: string;
  type: 'LOW_ATTENDANCE' | 'FALLING_GRADES' | 'OVERDUE_FEE' | 'MISSING_DOCS';
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  metricValue: string; // e.g. "Attendance: 62%"
  createdAt: string;
}

export interface ExamResult {
  id: string;
  studentId: string;
  studentName: string;
  marksObtained: number;
  totalMarks: number;
  grade: string;
}

export interface PtmMeeting {
  id: string;
  teacherName: string;
  studentName: string;
  studentId: string;
  date: string;
  timeSlot: string;
  status: string;
}

export interface TimetablePeriod {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  subject: string;
  teacherName: string;
  roomNo: string;
}

export interface WebsiteConfig {
  heroTitle: string;
  heroSubtitle: string;
  aboutUs: string;
  primaryColor?: string;
  phone: string;
  email: string;
}

export interface AuditLog {
  id: string;
  institutionId?: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  details: string;
  ipAddress?: string;
  timestamp: string;
}

export interface PaginatedResult<T> {
  success: boolean;
  message: string;
  data: T[];
  meta: {
    page: number;
    pageSize: number;
    totalRecords: number;
    totalPages: number;
  };
}
