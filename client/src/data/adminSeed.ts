import type {
  ExpenseRecord,
  GroupProfile,
  PaymentHistoryEntry,
  RevenueRecord,
  StudentProfile,
  TeacherProfile,
} from '@/types/admin';

const currentMonth = new Date().toISOString().slice(0, 7);

export const teacherSeed: TeacherProfile[] = [
  {
    id: 't-1',
    fullName: 'Madina Karimova',
    subject: 'Frontend Development',
    experience: 6,
    phone: '+998 90 123 45 67',
    monthlySalary: 6500000,
    status: 'active',
    photoUrl: 'https://i.pravatar.cc/120?img=5',
    bio: 'Senior instructor specializing in React & TypeScript bootcamps.',
  },
  {
    id: 't-2',
    fullName: 'Sardor Aliyev',
    subject: 'IELTS Preparation',
    experience: 8,
    phone: '+998 91 777 44 22',
    monthlySalary: 5200000,
    status: 'active',
    photoUrl: 'https://i.pravatar.cc/120?img=12',
    bio: 'Cambridge certified IELTS mentor with 8+ years experience.',
  },
  {
    id: 't-3',
    fullName: 'Rayhon Rasulova',
    subject: 'Graphic Design',
    experience: 5,
    phone: '+998 93 556 78 90',
    monthlySalary: 4700000,
    status: 'inactive',
    photoUrl: 'https://i.pravatar.cc/120?img=15',
    bio: 'Leads design sprints and portfolio reviews for creatives.',
  },
];

const buildHistory = (studentId: string, payment: number): PaymentHistoryEntry[] => {
  const entries: PaymentHistoryEntry[] = [];
  for (let i = 3; i >= 0; i -= 1) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    entries.push({
      id: `${studentId}-ph-${i}`,
      studentId,
      amount: payment,
      date: date.toISOString(),
      status: i === 0 ? 'paid' : 'paid',
      method: 'card',
    });
  }
  return entries;
};

export const groupSeed: GroupProfile[] = [
  {
    id: 'g-1',
    name: 'Frontend Evening',
    teacherId: 't-1',
    teacherName: 'Madina Karimova',
    schedule: 'Mon & Wed — 18:00-20:30',
    room: 'Lab 301',
    maxStudents: 15,
    currentStudents: 0,
    status: 'active',
    attendanceRate: 92,
    monthlyRevenue: 0,
  },
  {
    id: 'g-2',
    name: 'IELTS Beginners',
    teacherId: 't-2',
    teacherName: 'Sardor Aliyev',
    schedule: 'Tue & Thu — 16:00-18:00',
    room: 'Room B12',
    maxStudents: 12,
    currentStudents: 0,
    status: 'active',
    attendanceRate: 88,
    monthlyRevenue: 0,
  },
  {
    id: 'g-3',
    name: 'Graphic Design Weekend',
    teacherId: 't-3',
    teacherName: 'Rayhon Rasulova',
    schedule: 'Sat — 10:00-14:00',
    room: 'Studio 2',
    maxStudents: 10,
    currentStudents: 0,
    status: 'closed',
    attendanceRate: 75,
    monthlyRevenue: 0,
  },
];

export const studentSeed: StudentProfile[] = [
  {
    id: 's-1',
    fullName: 'Hamidullo Nabiev',
    groupId: 'g-1',
    parentName: 'Dilnoza Nabieva',
    parentContact: '+998 99 123 45 66',
    monthlyPayment: 1800000,
    paymentStatus: 'paid',
    photoUrl: 'https://i.pravatar.cc/120?img=30',
    history: buildHistory('s-1', 1800000),
  },
  {
    id: 's-2',
    fullName: 'Saida Rasulova',
    groupId: 'g-2',
    parentName: 'Ravshan Rasulov',
    parentContact: '+998 97 777 33 22',
    monthlyPayment: 2200000,
    paymentStatus: 'unpaid',
    photoUrl: 'https://i.pravatar.cc/120?img=31',
    history: buildHistory('s-2', 2200000),
  },
  {
    id: 's-3',
    fullName: 'Shukhrat Abdullaev',
    groupId: 'g-3',
    parentName: 'Mansur Abdullaev',
    parentContact: '+998 95 444 22 11',
    monthlyPayment: 1600000,
    paymentStatus: 'paid',
    photoUrl: 'https://i.pravatar.cc/120?img=28',
    history: buildHistory('s-3', 1600000),
  },
];

export const revenueSeed: RevenueRecord[] = [
  { id: 'rev-1', source: 'Course Payments', amount: 15000000, month: currentMonth },
  { id: 'rev-2', source: 'Corporate Training', amount: 4500000, month: currentMonth },
  { id: 'rev-3', source: 'Workshops', amount: 2200000, month: currentMonth },
];

export const expenseSeed: ExpenseRecord[] = [
  { id: 'exp-1', category: 'Rent', amount: 5000000, month: currentMonth, type: 'fixed' },
  { id: 'exp-2', category: 'Utilities', amount: 1200000, month: currentMonth, type: 'fixed' },
  {
    id: 'exp-3',
    category: 'Marketing',
    amount: 900000,
    month: currentMonth,
    type: 'variable',
    description: 'Digital ads',
  },
];


