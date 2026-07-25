import fs from 'fs';
import path from 'path';
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
  FeePayment,
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
  AuditLog,
  EarlyWarningAlert
} from '../src/types/index.js';

interface DatabaseSchema {
  users: User[];
  institutions: Institution[];
  subscriptionPlans: SubscriptionPlan[];
  saasInvoices: SaaSInvoice[];
  clientInquiries: ClientInquiry[];
  academicSessions: AcademicSession[];
  classes: ClassEntity[];
  sections: SectionEntity[];
  subjects: SubjectEntity[];
  guardians: Guardian[];
  students: Student[];
  staff: Staff[];
  timetableSlots: TimetableSlot[];
  studentAttendance: StudentAttendanceRecord[];
  staffAttendance: StaffAttendanceRecord[];
  feeHeads: FeeHead[];
  feeStructures: FeeStructure[];
  feeVouchers: FeeVoucher[];
  concessions: Concession[];
  exams: Exam[];
  examSubjects: ExamSubject[];
  marksEntries: MarkEntry[];
  resultSummaries: ResultSummary[];
  assignments: Assignment[];
  assignmentSubmissions: AssignmentSubmission[];
  ptmSchedules: PTMSchedule[];
  notices: Notice[];
  websiteContents: Record<string, WebsiteContent>; // key: institutionId
  auditLogs: AuditLog[];
  earlyWarnings: EarlyWarningAlert[];
  sequences: Record<string, number>; // key e.g. "TCS-STUDENT-2026", "TCS-VOUCHER-2026", "TCS-RECEIPT-2026"
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

function createInitialState(): DatabaseSchema {
  return {
    users: [],
    institutions: [],
    subscriptionPlans: [],
    saasInvoices: [],
    clientInquiries: [],
    academicSessions: [],
    classes: [],
    sections: [],
    subjects: [],
    guardians: [],
    students: [],
    staff: [],
    timetableSlots: [],
    studentAttendance: [],
    staffAttendance: [],
    feeHeads: [],
    feeStructures: [],
    feeVouchers: [],
    concessions: [],
    exams: [],
    examSubjects: [],
    marksEntries: [],
    resultSummaries: [],
    assignments: [],
    assignmentSubmissions: [],
    ptmSchedules: [],
    notices: [],
    websiteContents: {},
    auditLogs: [],
    earlyWarnings: [],
    sequences: {}
  };
}

class DatabaseService {
  private data: DatabaseSchema;

  constructor() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      try {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(fileContent);
      } catch (err) {
        console.error('Error loading db.json, creating new database state:', err);
        this.data = createInitialState();
        this.persist();
      }
    } else {
      this.data = createInitialState();
      this.persist();
    }
  }

  public persist() {
    try {
      const tmpFile = `${DB_FILE}.tmp`;
      fs.writeFileSync(tmpFile, JSON.stringify(this.data, null, 2), 'utf-8');
      fs.renameSync(tmpFile, DB_FILE);
    } catch (err) {
      console.error('Failed to persist database to file:', err);
    }
  }

  public getRawData(): DatabaseSchema {
    return this.data;
  }

  // Sequence generator
  public getNextSequence(prefix: string): number {
    const current = this.data.sequences[prefix] || 0;
    const next = current + 1;
    this.data.sequences[prefix] = next;
    this.persist();
    return next;
  }

  public formatSequence(prefix: string, nextVal: number, padLength = 4): string {
    return `${prefix}-${String(nextVal).padStart(padLength, '0')}`;
  }

  // Pagination Helper
  public paginate<T>(items: T[], page = 1, pageSize = 20) {
    const p = Math.max(1, page);
    const ps = Math.min(100, Math.max(1, pageSize));
    const totalRecords = items.length;
    const totalPages = Math.ceil(totalRecords / ps) || 1;
    const startIndex = (p - 1) * ps;
    const paginatedItems = items.slice(startIndex, startIndex + ps);

    return {
      data: paginatedItems,
      meta: {
        page: p,
        pageSize: ps,
        totalRecords,
        totalPages
      }
    };
  }

  // Audit Logger
  public logAudit(log: Omit<AuditLog, 'id' | 'timestamp'>) {
    const auditEntry: AuditLog = {
      ...log,
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString()
    };
    this.data.auditLogs.unshift(auditEntry);
    if (this.data.auditLogs.length > 1000) {
      this.data.auditLogs = this.data.auditLogs.slice(0, 1000);
    }
    this.persist();
  }
}

export const db = new DatabaseService();
