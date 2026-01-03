export type TeacherStatus = 'active' | 'inactive' | 'suspended';

export interface TeacherProfile {
  id: string;
  fullName: string;
  subject: string;
  experience: number;
  phone: string;
  monthlySalary: number;
  status: TeacherStatus;
  photoUrl?: string;
  bio?: string;
  groups?: Array<{
    id: string;
    name: string;
    schedule: string;
  }>;
}

export type TeacherPayload = Omit<TeacherProfile, 'id' | 'groups'>;

export type PaymentStatus = 'paid' | 'unpaid' | 'pending' | 'overdue' | 'cancelled';

export interface PaymentHistoryEntry {
  id: string;
  studentId: string;
  amount: number;
  date: string;
  status: PaymentStatus;
  method: 'cash' | 'card' | 'transfer';
  note?: string;
}

// Oylik to'lov entry
export interface MonthlyPayment {
  id: string;
  studentId: string;
  month: string; // YYYY-MM format
  year: number;
  monthNumber: number;
  amount: number;
  paymentDate: string;
  method: 'cash' | 'card' | 'transfer';
  status: PaymentStatus;
  note?: string;
}

export interface StudentProfile {
  id: string;
  fullName: string;
  groupId: string | null;
  groupName?: string;
  groupSchedule?: string;
  teacherName?: string;
  parentName: string;
  parentContact: string;
  monthlyPayment: number;
  paymentStatus: PaymentStatus;
  paymentValidUntil?: string; // To'lov amal qilish muddati
  lastPaidMonth?: string; // Oxirgi to'langan oy (YYYY-MM)
  isExpired?: boolean; // To'lov muddati o'tganmi
  daysRemaining?: number; // Qolgan kunlar
  photoUrl?: string;
  notes?: string;
  courseName?: string;
  createdAt?: string; // O'quvchi qo'shilgan sana
  history: PaymentHistoryEntry[];
  monthlyPayments?: MonthlyPayment[]; // Oylik to'lovlar tarixi
}

export type StudentPayload = Omit<StudentProfile, 'id' | 'history' | 'groupName' | 'groupSchedule' | 'teacherName' | 'isExpired' | 'daysRemaining' | 'monthlyPayments'> & {
  history?: PaymentHistoryEntry[];
  courseName?: string;
};

// Oylik to'lov qo'shish uchun payload
export interface MonthlyPaymentPayload {
  studentId: string;
  month: string; // YYYY-MM format
  amount: number;
  method: 'cash' | 'card' | 'transfer';
  note?: string;
}

// Talaba to'lov ma'lumotlari
export interface StudentPaymentInfo {
  studentId: string;
  currentStatus: PaymentStatus;
  validUntil?: string;
  lastPaidMonth?: string;
  currentMonth: string;
  paidMonths: Array<{
    month: string;
    amount: number;
    paymentDate: string;
    status: string;
  }>;
  monthsNeeded: string[]; // To'lanmagan oylar
  isExpired: boolean;
}

export type GroupStatus = 'active' | 'closed' | 'completed' | 'cancelled';

export interface GroupProfile {
  id: string;
  name: string;
  teacherId: string;
  teacherName: string;
  courseId?: string | null;
  courseName?: string;
  schedule: string;
  room: string;
  maxStudents: number;
  currentStudents: number;
  status: GroupStatus;
  attendanceRate: number;
  monthlyRevenue: number;
}

export type GroupPayload = Omit<GroupProfile, 'id' | 'teacherName' | 'currentStudents' | 'courseName'> & {
  currentStudents?: number;
};

export interface RevenueRecord {
  id: string;
  source: string;
  amount: number;
  month: string; // YYYY-MM
  note?: string;
}

export interface ExpenseRecord {
  id: string;
  category: string;
  amount: number;
  month: string;
  description?: string;
  type: 'fixed' | 'variable';
}

export interface DashboardSnapshot {
  teacherCount: number;
  studentCount: number;
  groupCount: number;
  monthlyRevenue: number;
  monthlyExpenses: number;
  teacherSalaryExpense: number; // O'qituvchilar oyligi (foizga qarab hisoblangan)
  netProfit: number;
  profitMargin: number;
  paidStudents: number;
  unpaidStudents: number;
  revenueSeries: { month: string; revenue: number }[];
  expenseSeries: { month: string; expense: number }[];
  profitSeries: { month: string; profit: number }[];
  studentStatusSeries: { status: PaymentStatus; value: number }[];
  studentsPerGroup: { name: string; value: number }[];
  teachersPerGroup: { teacher: string; value: number }[];
  capacityUsage: { name: string; value: number }[];
  topGroups: {
    byStudents: { id: string; name: string; value: number }[];
    byRevenue: { id: string; name: string; value: number }[];
    byAttendance: { id: string; name: string; value: number }[];
  };
}

export interface FinanceBreakdown {
  teacherSalaries: number;
  operatingExpenses: number;
  totalExpenses: number;
  additionalExpenses: ExpenseRecord[];
}


