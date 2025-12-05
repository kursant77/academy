import { supabase } from './supabase';
import type {
  DashboardSnapshot,
  ExpenseRecord,
  FinanceBreakdown,
  GroupPayload,
  GroupProfile,
  MonthlyPayment,
  MonthlyPaymentPayload,
  PaymentHistoryEntry,
  PaymentStatus,
  RevenueRecord,
  StudentPayload,
  StudentPaymentInfo,
  StudentProfile,
  TeacherPayload,
  TeacherProfile,
} from '@/types/admin';

// Helper function to convert database teacher to TeacherProfile
const mapTeacherFromDb = (dbTeacher: any): TeacherProfile => ({
  id: dbTeacher.id,
  fullName: dbTeacher.name,
  subject: dbTeacher.specialty || dbTeacher.specialty_uz || '',
  experience: dbTeacher.experience || 0,
  phone: dbTeacher.phone || '',
  monthlySalary: parseFloat(dbTeacher.monthly_salary || '0'),
  status: dbTeacher.status || 'active',
  photoUrl: dbTeacher.image_url || undefined,
  bio: dbTeacher.bio || dbTeacher.bio_uz || '',
  groups: [], // Will be populated separately
});

// Helper function to convert TeacherProfile to database format
const mapTeacherToDb = (teacher: Partial<TeacherPayload>) => ({
  name: teacher.fullName,
  specialty: teacher.subject,
  specialty_uz: teacher.subject,
  specialty_ru: teacher.subject,
  specialty_en: teacher.subject,
  experience: teacher.experience,
  bio: teacher.bio || '',
  bio_uz: teacher.bio || '',
  bio_ru: teacher.bio || '',
  bio_en: teacher.bio || '',
  phone: teacher.phone,
  monthly_salary: teacher.monthlySalary,
  status: teacher.status,
  image_url: teacher.photoUrl || null,
});

// Helper function to convert database group to GroupProfile
const mapGroupFromDb = (dbGroup: any, teacherName?: string): GroupProfile => ({
  id: dbGroup.id,
  name: dbGroup.name,
  teacherId: dbGroup.teacher_id,
  teacherName: teacherName || 'Unassigned',
  schedule: dbGroup.schedule,
  room: dbGroup.room,
  maxStudents: dbGroup.max_students || 0,
  currentStudents: dbGroup.current_students || 0,
  status: dbGroup.status || 'active',
  attendanceRate: dbGroup.attendance_rate || 0,
  monthlyRevenue: parseFloat(dbGroup.monthly_revenue || '0'),
});

// Helper function to convert GroupProfile to database format
const mapGroupToDb = (group: Partial<GroupPayload>) => ({
  name: group.name,
  teacher_id: group.teacherId,
  schedule: group.schedule,
  room: group.room,
  max_students: group.maxStudents,
  current_students: group.currentStudents,
  status: group.status,
  attendance_rate: group.attendanceRate,
  monthly_revenue: group.monthlyRevenue || 0,
});

// Helper function to convert database student to StudentProfile
const mapStudentFromDb = (dbStudent: any, group?: GroupProfile, teacherName?: string): StudentProfile => {
  const paymentValidUntil = dbStudent.payment_valid_until;
  const isExpired = paymentValidUntil ? new Date(paymentValidUntil) < new Date() : true;
  const daysRemaining = paymentValidUntil 
    ? Math.ceil((new Date(paymentValidUntil).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  
  return {
    id: dbStudent.id,
    fullName: dbStudent.name || dbStudent.full_name,
    groupId: dbStudent.group_id,
    groupName: group?.name,
    groupSchedule: group?.schedule,
    teacherName: teacherName || group?.teacherName,
    parentName: dbStudent.parent_name || '',
    parentContact: dbStudent.parent_contact || '',
    monthlyPayment: parseFloat(dbStudent.monthly_payment || '0'),
    paymentStatus: isExpired && dbStudent.payment_status === 'paid' ? 'unpaid' : (dbStudent.payment_status || 'unpaid'),
    paymentValidUntil: paymentValidUntil || undefined,
    lastPaidMonth: dbStudent.last_paid_month || undefined,
    isExpired,
    daysRemaining: daysRemaining > 0 ? daysRemaining : 0,
    photoUrl: dbStudent.photo_url || undefined,
    notes: dbStudent.notes || undefined,
    courseName: dbStudent.course_name || undefined,
    history: [], // Will be loaded separately
    monthlyPayments: [], // Will be loaded separately
  };
};

// Helper function to convert MonthlyPayment from database
const mapMonthlyPaymentFromDb = (dbPayment: any): MonthlyPayment => ({
  id: dbPayment.id,
  studentId: dbPayment.student_id,
  month: dbPayment.month,
  year: dbPayment.year,
  monthNumber: dbPayment.month_number,
  amount: parseFloat(dbPayment.amount || '0'),
  paymentDate: dbPayment.payment_date,
  method: dbPayment.method,
  status: dbPayment.status,
  note: dbPayment.note || undefined,
});

// Helper function to convert StudentProfile to database format
const mapStudentToDb = (student: Partial<StudentPayload>) => {
  const dbData: Record<string, any> = {
    name: student.fullName,
    group_id: student.groupId || null,
    parent_name: student.parentName || '',
    parent_contact: student.parentContact || '',
    monthly_payment: student.monthlyPayment || 0,
    payment_status: student.paymentStatus || 'unpaid',
    photo_url: student.photoUrl || null,
    notes: student.notes || null,
  };
  
  // courseName ni qo'shish
  if (student.courseName) {
    dbData.course_name = student.courseName;
  }
  
  // payment_valid_until ni qo'shish
  if (student.paymentValidUntil) {
    dbData.payment_valid_until = student.paymentValidUntil;
  }
  
  // last_paid_month ni qo'shish
  if (student.lastPaidMonth) {
    dbData.last_paid_month = student.lastPaidMonth;
  }
  
  console.log('Mapping student to DB:', { input: student, output: dbData });
  return dbData;
};

// Helper function to convert database payment history to PaymentHistoryEntry
const mapPaymentFromDb = (dbPayment: any): PaymentHistoryEntry => ({
  id: dbPayment.id,
  studentId: dbPayment.student_id,
  amount: parseFloat(dbPayment.amount || '0'),
  date: dbPayment.date,
  status: dbPayment.status,
  method: dbPayment.method,
  note: dbPayment.note || undefined,
});

// Helper function to convert PaymentHistoryEntry to database format
const mapPaymentToDb = (payment: Omit<PaymentHistoryEntry, 'id' | 'studentId'>) => ({
  amount: payment.amount,
  date: payment.date,
  status: payment.status,
  method: payment.method,
  note: payment.note || null,
});

// Helper function to convert database revenue to RevenueRecord
const mapRevenueFromDb = (dbRevenue: any): RevenueRecord => ({
  id: dbRevenue.id,
  source: dbRevenue.source,
  amount: parseFloat(dbRevenue.amount || '0'),
  month: dbRevenue.month,
  note: dbRevenue.note || undefined,
});

// Helper function to convert database expense to ExpenseRecord
const mapExpenseFromDb = (dbExpense: any): ExpenseRecord => ({
  id: dbExpense.id,
  category: dbExpense.category,
  amount: parseFloat(dbExpense.amount || '0'),
  month: dbExpense.month,
  description: dbExpense.description || undefined,
  type: dbExpense.type || 'variable',
});

// Helper to sync group metrics (current_students and monthly_revenue)
const syncGroupMetrics = async (groupId?: string) => {
  try {
    // Get all groups or specific group
    const groupsQuery = supabase.from('groups').select('id');
    if (groupId) {
      groupsQuery.eq('id', groupId);
    }
    const { data: groups } = await groupsQuery;

    if (!groups) return;

    for (const group of groups) {
      // Count students in this group
      const { data: students } = await supabase
        .from('students')
        .select('id, monthly_payment, payment_status')
        .eq('group_id', group.id);

      const currentStudents = students?.length || 0;
      const monthlyRevenue = students
        ?.filter((s) => s.payment_status === 'paid')
        .reduce((sum, s) => sum + parseFloat(s.monthly_payment || '0'), 0) || 0;

      // Update group
      await supabase
        .from('groups')
        .update({
          current_students: currentStudents,
          monthly_revenue: monthlyRevenue,
        })
        .eq('id', group.id);
    }
  } catch (error) {
    console.error('Error syncing group metrics:', error);
  }
};

export const adminApi = {
  // Teachers
  async listTeachers(): Promise<TeacherProfile[]> {
    try {
      // Get all teachers
      const { data: teachers, error } = await supabase
        .from('teachers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get groups for each teacher
      const { data: groups } = await supabase.from('groups').select('id, name, schedule, teacher_id');

      const teacherProfiles: TeacherProfile[] = (teachers || []).map((teacher) => {
        const teacherGroups = groups
          ?.filter((g) => g.teacher_id === teacher.id)
          .map((g) => ({ id: g.id, name: g.name, schedule: g.schedule })) || [];
        return { ...mapTeacherFromDb(teacher), groups: teacherGroups };
      });

      return teacherProfiles;
    } catch (error: any) {
      console.error('Error listing teachers:', error);
      throw new Error(error.message || 'Failed to list teachers');
    }
  },

  async createTeacher(payload: TeacherPayload): Promise<TeacherProfile> {
    try {
      const dbData = mapTeacherToDb(payload);
      const { data, error } = await supabase.from('teachers').insert(dbData).select().single();

      if (error) throw error;

      return mapTeacherFromDb(data);
    } catch (error: any) {
      console.error('Error creating teacher:', error);
      throw new Error(error.message || 'Failed to create teacher');
    }
  },

  async updateTeacher(id: string, payload: Partial<TeacherPayload>): Promise<TeacherProfile> {
    try {
      const dbData = mapTeacherToDb(payload as TeacherPayload);
      const { data, error } = await supabase.from('teachers').update(dbData).eq('id', id).select().single();

      if (error) throw error;
      if (!data) throw new Error('Teacher not found');

      // Get groups for this teacher
      const { data: groups } = await supabase
        .from('groups')
        .select('id, name, schedule')
        .eq('teacher_id', id);

      const teacherGroups = groups?.map((g) => ({ id: g.id, name: g.name, schedule: g.schedule })) || [];
      return { ...mapTeacherFromDb(data), groups: teacherGroups };
    } catch (error: any) {
      console.error('Error updating teacher:', error);
      throw new Error(error.message || 'Failed to update teacher');
    }
  },

  async deleteTeacher(id: string): Promise<void> {
    try {
      // Update groups to remove teacher reference
      await supabase.from('groups').update({ teacher_id: '' }).eq('teacher_id', id);

      const { error } = await supabase.from('teachers').delete().eq('id', id);
      if (error) throw error;
    } catch (error: any) {
      console.error('Error deleting teacher:', error);
      throw new Error(error.message || 'Failed to delete teacher');
    }
  },

  // Groups
  async listGroups(): Promise<GroupProfile[]> {
    try {
      // Get all groups with teacher info
      const { data: groups, error } = await supabase
        .from('groups')
        .select(`
          *,
          teachers:teacher_id (
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Sync metrics before returning
      await syncGroupMetrics();

      return (groups || []).map((g: any) =>
        mapGroupFromDb(g, g.teachers?.name || 'Unassigned')
      );
    } catch (error: any) {
      console.error('Error listing groups:', error);
      throw new Error(error.message || 'Failed to list groups');
    }
  },

  async getGroup(id: string): Promise<GroupProfile | undefined> {
    try {
      const { data: group, error } = await supabase
        .from('groups')
        .select(`
          *,
          teachers:teacher_id (
            name
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!group) return undefined;

      return mapGroupFromDb(group, group.teachers?.name || 'Unassigned');
    } catch (error: any) {
      console.error('Error getting group:', error);
      throw new Error(error.message || 'Failed to get group');
    }
  },

  async createGroup(payload: GroupPayload): Promise<GroupProfile> {
    try {
      const dbData = mapGroupToDb(payload);
      const { data, error } = await supabase.from('groups').insert(dbData).select().single();

      if (error) throw error;

      // Get teacher name
      const { data: teacher } = await supabase.from('teachers').select('name').eq('id', payload.teacherId).single();

      await syncGroupMetrics(data.id);
      return mapGroupFromDb(data, teacher?.name || 'Unassigned');
    } catch (error: any) {
      console.error('Error creating group:', error);
      throw new Error(error.message || 'Failed to create group');
    }
  },

  async updateGroup(id: string, payload: Partial<GroupPayload>): Promise<GroupProfile> {
    try {
      const dbData = mapGroupToDb(payload as GroupPayload);
      const { data, error } = await supabase.from('groups').update(dbData).eq('id', id).select().single();

      if (error) throw error;
      if (!data) throw new Error('Group not found');

      // Get teacher name
      const teacherId = payload.teacherId || data.teacher_id;
      const { data: teacher } = await supabase.from('teachers').select('name').eq('id', teacherId).single();

      await syncGroupMetrics(id);
      return mapGroupFromDb(data, teacher?.name || 'Unassigned');
    } catch (error: any) {
      console.error('Error updating group:', error);
      throw new Error(error.message || 'Failed to update group');
    }
  },

  async deleteGroup(id: string): Promise<void> {
    try {
      // Remove students from this group
      await supabase.from('students').update({ group_id: null }).eq('group_id', id);

      const { error } = await supabase.from('groups').delete().eq('id', id);
      if (error) throw error;
    } catch (error: any) {
      console.error('Error deleting group:', error);
      throw new Error(error.message || 'Failed to delete group');
    }
  },

  // Students
  async listStudents(): Promise<StudentProfile[]> {
    try {
      const { data: students, error } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        // If table doesn't exist, return empty array
        if (error.code === 'PGRST116' || error.message?.includes('does not exist')) {
          console.warn('Students table does not exist yet. Please run COMPLETE_DATABASE_SETUP.sql');
          return [];
        }
        throw error;
      }

      // Get groups and teachers
      const groupIds = [...new Set(students?.map((s) => s.group_id).filter(Boolean) || [])];
      const { data: groups } = await supabase
        .from('groups')
        .select(`
          id,
          name,
          schedule,
          teacher_id,
          teachers:teacher_id (
            name
          )
        `)
        .in('id', groupIds);

      // Get payment history for all students
      const studentIds = students?.map((s) => s.id) || [];
      const { data: payments } = await supabase
        .from('payment_history')
        .select('*')
        .in('student_id', studentIds)
        .order('date', { ascending: false });

      // Get monthly payments for all students
      const { data: monthlyPayments } = await supabase
        .from('monthly_payments')
        .select('*')
        .in('student_id', studentIds)
        .order('month', { ascending: false });

      return (students || []).map((student) => {
        const group = groups?.find((g) => g.id === student.group_id);
        const studentPayments = payments?.filter((p) => p.student_id === student.id) || [];
        const studentMonthlyPayments = monthlyPayments?.filter((p) => p.student_id === student.id) || [];
        return {
          ...mapStudentFromDb(student, group ? mapGroupFromDb(group, group.teachers?.name) : undefined, group?.teachers?.name),
          history: studentPayments.map(mapPaymentFromDb),
          monthlyPayments: studentMonthlyPayments.map(mapMonthlyPaymentFromDb),
        };
      });
    } catch (error: any) {
      console.error('Error listing students:', error);
      throw new Error(error.message || 'Failed to list students');
    }
  },

  async createStudent(payload: StudentPayload): Promise<StudentProfile> {
    try {
      const dbData = mapStudentToDb(payload);
      const { data, error } = await supabase.from('students').insert(dbData).select().single();

      if (error) throw error;

      // Sync group metrics
      if (payload.groupId) {
        await syncGroupMetrics(payload.groupId);
      }

      // Get group and teacher info
      let group: GroupProfile | undefined;
      let teacherName: string | undefined;

      if (data.group_id) {
        const { data: groupData } = await supabase
          .from('groups')
          .select(`
            *,
            teachers:teacher_id (
              name
            )
          `)
          .eq('id', data.group_id)
          .single();

        if (groupData) {
          group = mapGroupFromDb(groupData, groupData.teachers?.name);
          teacherName = groupData.teachers?.name;
        }
      }

      return mapStudentFromDb(data, group, teacherName);
    } catch (error: any) {
      console.error('Error creating student:', error);
      throw new Error(error.message || 'Failed to create student');
    }
  },

  async updateStudent(id: string, payload: Partial<StudentPayload>): Promise<StudentProfile> {
    try {
      const dbData = mapStudentToDb(payload as StudentPayload);
      const { data, error } = await supabase.from('students').update(dbData).eq('id', id).select().single();

      if (error) throw error;
      if (!data) throw new Error('Student not found');

      // Sync group metrics if group changed
      if (payload.groupId !== undefined) {
        await syncGroupMetrics(payload.groupId);
      }

      // Get group and teacher info
      let group: GroupProfile | undefined;
      let teacherName: string | undefined;

      if (data.group_id) {
        const { data: groupData } = await supabase
          .from('groups')
          .select(`
            *,
            teachers:teacher_id (
              name
            )
          `)
          .eq('id', data.group_id)
          .single();

        if (groupData) {
          group = mapGroupFromDb(groupData, groupData.teachers?.name);
          teacherName = groupData.teachers?.name;
        }
      }

      // Get payment history
      const { data: payments } = await supabase
        .from('payment_history')
        .select('*')
        .eq('student_id', id)
        .order('date', { ascending: false });

      return {
        ...mapStudentFromDb(data, group, teacherName),
        history: payments?.map(mapPaymentFromDb) || [],
      };
    } catch (error: any) {
      console.error('Error updating student:', error);
      throw new Error(error.message || 'Failed to update student');
    }
  },

  async deleteStudent(id: string): Promise<void> {
    try {
      // Get student to find group_id before deletion
      const { data: student } = await supabase.from('students').select('group_id').eq('id', id).single();

      // Delete payment history first
      await supabase.from('payment_history').delete().eq('student_id', id);

      // Delete student
      const { error } = await supabase.from('students').delete().eq('id', id);
      if (error) throw error;

      // Sync group metrics
      if (student?.group_id) {
        await syncGroupMetrics(student.group_id);
      }
    } catch (error: any) {
      console.error('Error deleting student:', error);
      throw new Error(error.message || 'Failed to delete student');
    }
  },

  async recordPayment(studentId: string, entry: Omit<PaymentHistoryEntry, 'id' | 'studentId'>, month?: string): Promise<StudentProfile> {
    try {
      // Oy aniqlanmagan bo'lsa, joriy oyni olish
      const paymentMonth = month || new Date().toISOString().slice(0, 7);
      const year = parseInt(paymentMonth.slice(0, 4));
      const monthNumber = parseInt(paymentMonth.slice(5, 7));
      
      // To'lov muddati - keyingi oyning shu sanasi
      const expiryDate = new Date(year, monthNumber, 1); // Keyingi oyning 1-sanasi
      
      // Insert payment record
      const dbData = mapPaymentToDb(entry);
      const { data: payment, error: paymentError } = await supabase
        .from('payment_history')
        .insert({ ...dbData, student_id: studentId, note: entry.note || `${paymentMonth} oyi uchun to'lov` })
        .select()
        .single();

      if (paymentError) throw paymentError;

      // Monthly payment qo'shish
      try {
        await supabase
          .from('monthly_payments')
          .upsert({
            student_id: studentId,
            month: paymentMonth,
            year,
            month_number: monthNumber,
            amount: entry.amount,
            method: entry.method,
            status: 'paid',
            note: entry.note || `${paymentMonth} oyi uchun to'lov`,
          }, { onConflict: 'student_id,month' });
      } catch (monthlyError) {
        console.warn('Monthly payment insert error (table may not exist):', monthlyError);
      }

      // Update student payment status
      const { data: student, error: studentError } = await supabase
        .from('students')
        .update({ 
          payment_status: entry.status,
          payment_valid_until: expiryDate.toISOString().slice(0, 10),
          last_paid_month: paymentMonth,
        })
        .eq('id', studentId)
        .select()
        .single();

      if (studentError) throw studentError;

      // Sync group metrics
      if (student.group_id) {
        await syncGroupMetrics(student.group_id);
      }

      // Get group and teacher info
      let group: GroupProfile | undefined;
      let teacherName: string | undefined;

      if (student.group_id) {
        const { data: groupData } = await supabase
          .from('groups')
          .select(`
            *,
            teachers:teacher_id (
              name
            )
          `)
          .eq('id', student.group_id)
          .single();

        if (groupData) {
          group = mapGroupFromDb(groupData, groupData.teachers?.name);
          teacherName = groupData.teachers?.name;
        }
      }

      // Get all payment history
      const { data: payments } = await supabase
        .from('payment_history')
        .select('*')
        .eq('student_id', studentId)
        .order('date', { ascending: false });

      // Get monthly payments
      const { data: monthlyPayments } = await supabase
        .from('monthly_payments')
        .select('*')
        .eq('student_id', studentId)
        .order('month', { ascending: false });

      return {
        ...mapStudentFromDb(student, group, teacherName),
        history: payments?.map(mapPaymentFromDb) || [],
        monthlyPayments: monthlyPayments?.map(mapMonthlyPaymentFromDb) || [],
      };
    } catch (error: any) {
      console.error('Error recording payment:', error);
      throw new Error(error.message || 'Failed to record payment');
    }
  },

  // Oylik to'lov qo'shish (yangi)
  async recordMonthlyPayment(payload: MonthlyPaymentPayload): Promise<StudentProfile> {
    return this.recordPayment(payload.studentId, {
      amount: payload.amount,
      date: new Date().toISOString(),
      method: payload.method,
      status: 'paid',
      note: payload.note || `${payload.month} oyi uchun to'lov`,
    }, payload.month);
  },

  // Talaba to'lov ma'lumotlarini olish
  async getStudentPaymentInfo(studentId: string): Promise<StudentPaymentInfo> {
    try {
      const currentMonth = new Date().toISOString().slice(0, 7);
      
      // Talaba ma'lumotlari
      const { data: student, error: studentError } = await supabase
        .from('students')
        .select('*')
        .eq('id', studentId)
        .single();

      if (studentError) throw studentError;

      // To'langan oylar
      const { data: paidMonths } = await supabase
        .from('monthly_payments')
        .select('*')
        .eq('student_id', studentId)
        .eq('status', 'paid')
        .order('month', { ascending: false });

      // Oxirgi 3 oyni hisoblash
      const months: string[] = [];
      for (let i = 2; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        months.push(date.toISOString().slice(0, 7));
      }

      // To'lanmagan oylarni topish
      const paidMonthSet = new Set(paidMonths?.map(p => p.month) || []);
      const monthsNeeded = months.filter(m => !paidMonthSet.has(m));

      const isExpired = student.payment_valid_until 
        ? new Date(student.payment_valid_until) < new Date() 
        : true;

      return {
        studentId,
        currentStatus: isExpired ? 'unpaid' : student.payment_status,
        validUntil: student.payment_valid_until || undefined,
        lastPaidMonth: student.last_paid_month || undefined,
        currentMonth,
        paidMonths: (paidMonths || []).map(p => ({
          month: p.month,
          amount: parseFloat(p.amount),
          paymentDate: p.payment_date,
          status: p.status,
        })),
        monthsNeeded,
        isExpired,
      };
    } catch (error: any) {
      console.error('Error getting student payment info:', error);
      throw new Error(error.message || 'Failed to get student payment info');
    }
  },

  // To'lov muddati o'tgan talabalarni yangilash
  async updateExpiredPayments(): Promise<void> {
    try {
      const today = new Date().toISOString().slice(0, 10);
      await supabase
        .from('students')
        .update({ payment_status: 'unpaid' })
        .lt('payment_valid_until', today)
        .eq('payment_status', 'paid');
    } catch (error: any) {
      console.error('Error updating expired payments:', error);
    }
  },

  async listGroupStudents(groupId: string): Promise<StudentProfile[]> {
    try {
      const { data: students, error } = await supabase
        .from('students')
        .select('*')
        .eq('group_id', groupId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get group and teacher info
      const { data: groupData } = await supabase
        .from('groups')
        .select(`
          *,
          teachers:teacher_id (
            name
          )
        `)
        .eq('id', groupId)
        .single();

      const group = groupData ? mapGroupFromDb(groupData, groupData.teachers?.name) : undefined;
      const teacherName = groupData?.teachers?.name;

      // Get payment history
      const studentIds = students?.map((s) => s.id) || [];
      const { data: payments } = await supabase
        .from('payment_history')
        .select('*')
        .in('student_id', studentIds)
        .order('date', { ascending: false });

      return (students || []).map((student) => {
        const studentPayments = payments?.filter((p) => p.student_id === student.id) || [];
        return {
          ...mapStudentFromDb(student, group, teacherName),
          history: studentPayments.map(mapPaymentFromDb),
        };
      });
    } catch (error: any) {
      console.error('Error listing group students:', error);
      throw new Error(error.message || 'Failed to list group students');
    }
  },

  // Revenue / expenses
  async listRevenue(): Promise<RevenueRecord[]> {
    try {
      const { data, error } = await supabase.from('revenue').select('*').order('created_at', { ascending: false });

      if (error) {
        // If table doesn't exist, return empty array
        if (error.code === 'PGRST116' || error.message?.includes('does not exist')) {
          console.warn('Revenue table does not exist yet. Please run COMPLETE_DATABASE_SETUP.sql');
          return [];
        }
        throw error;
      }

      return (data || []).map(mapRevenueFromDb);
    } catch (error: any) {
      console.error('Error listing revenue:', error);
      return [];
    }
  },

  async addRevenue(payload: Omit<RevenueRecord, 'id'>): Promise<RevenueRecord> {
    try {
      const { data, error } = await supabase
        .from('revenue')
        .insert({
          source: payload.source,
          amount: payload.amount,
          month: payload.month,
          note: payload.note || null,
        })
        .select()
        .single();

      if (error) throw error;

      return mapRevenueFromDb(data);
    } catch (error: any) {
      console.error('Error adding revenue:', error);
      throw new Error(error.message || 'Failed to add revenue');
    }
  },

  async listExpenses(): Promise<ExpenseRecord[]> {
    try {
      const { data, error } = await supabase.from('expenses').select('*').order('created_at', { ascending: false });

      if (error) {
        // If table doesn't exist, return empty array
        if (error.code === 'PGRST116' || error.message?.includes('does not exist')) {
          console.warn('Expenses table does not exist yet. Please run COMPLETE_DATABASE_SETUP.sql');
          return [];
        }
        throw error;
      }

      return (data || []).map(mapExpenseFromDb);
    } catch (error: any) {
      console.error('Error listing expenses:', error);
      return [];
    }
  },

  async addExpense(payload: Omit<ExpenseRecord, 'id'>): Promise<ExpenseRecord> {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .insert({
          category: payload.category,
          amount: payload.amount,
          month: payload.month,
          description: payload.description || null,
          type: payload.type,
        })
        .select()
        .single();

      if (error) throw error;

      return mapExpenseFromDb(data);
    } catch (error: any) {
      console.error('Error adding expense:', error);
      throw new Error(error.message || 'Failed to add expense');
    }
  },

  async deleteExpense(id: string): Promise<void> {
    try {
      const { error } = await supabase.from('expenses').delete().eq('id', id);
      if (error) throw error;
    } catch (error: any) {
      console.error('Error deleting expense:', error);
      throw new Error(error.message || 'Failed to delete expense');
    }
  },

  async getFinanceBreakdown(): Promise<FinanceBreakdown> {
    try {
      // Get active teachers and their salaries
      const { data: teachers, error: teachersError } = await supabase
        .from('teachers')
        .select('monthly_salary, status')
        .eq('status', 'active');

      if (teachersError && teachersError.code !== 'PGRST116') {
        // PGRST116 = table not found, ignore it
        console.warn('Error loading teachers for finance:', teachersError);
      }

      const teacherSalaries =
        teachers?.reduce((sum, t) => sum + parseFloat(t.monthly_salary || '0'), 0) || 0;

      // Get all expenses
      const { data: expenses, error: expensesError } = await supabase.from('expenses').select('*');

      if (expensesError && expensesError.code !== 'PGRST116') {
        console.warn('Error loading expenses:', expensesError);
      }

      const operatingExpenses = expenses?.reduce((sum, e) => sum + parseFloat(e.amount || '0'), 0) || 0;

      return {
        teacherSalaries,
        operatingExpenses,
        totalExpenses: teacherSalaries + operatingExpenses,
        additionalExpenses: (expenses || []).map(mapExpenseFromDb),
      };
    } catch (error: any) {
      console.error('Error getting finance breakdown:', error);
      // Return empty breakdown if error
      return {
        teacherSalaries: 0,
        operatingExpenses: 0,
        totalExpenses: 0,
        additionalExpenses: [],
      };
    }
  },

  async getDashboardSnapshot(): Promise<DashboardSnapshot> {
    try {
      // Get counts
      const [teachersRes, studentsRes, groupsRes] = await Promise.all([
        supabase.from('teachers').select('id', { count: 'exact', head: true }),
        supabase.from('students').select('id', { count: 'exact', head: true }),
        supabase.from('groups').select('id', { count: 'exact', head: true }),
      ]);

      const teacherCount = teachersRes.count || 0;
      const studentCount = studentsRes.count || 0;
      const groupCount = groupsRes.count || 0;

      // Get students with payment status
      const { data: students, error: studentsError } = await supabase
        .from('students')
        .select('payment_status, monthly_payment');

      if (studentsError && studentsError.code !== 'PGRST116') {
        console.warn('Error loading students for dashboard:', studentsError);
      }
      const paidStudents = students?.filter((s) => s.payment_status === 'paid').length || 0;
      const unpaidStudents = studentCount - paidStudents;

      const currentMonth = new Date().toISOString().slice(0, 7);

      // Get monthly revenue from revenue table and student payments
      const { data: revenue, error: revenueError } = await supabase
        .from('revenue')
        .select('amount, month')
        .eq('month', currentMonth);

      if (revenueError && revenueError.code !== 'PGRST116') {
        console.warn('Error loading revenue for dashboard:', revenueError);
      }

      const revenueAmount = revenue?.reduce((sum, r) => sum + parseFloat(r.amount || '0'), 0) || 0;

      const studentPayments =
        students
          ?.filter((s) => s.payment_status === 'paid')
          .reduce((sum, s) => sum + parseFloat(s.monthly_payment || '0'), 0) || 0;

      const monthlyRevenue = revenueAmount + studentPayments;

      // Get teacher salaries
      const { data: activeTeachers, error: teachersError } = await supabase
        .from('teachers')
        .select('monthly_salary')
        .eq('status', 'active');

      if (teachersError && teachersError.code !== 'PGRST116') {
        console.warn('Error loading teachers for dashboard:', teachersError);
      }

      const teacherSalaryExpense =
        activeTeachers?.reduce((sum, t) => sum + parseFloat(t.monthly_salary || '0'), 0) || 0;

      // Get monthly expenses
      const { data: expenses, error: expensesError } = await supabase
        .from('expenses')
        .select('amount, month')
        .eq('month', currentMonth);

      if (expensesError && expensesError.code !== 'PGRST116') {
        console.warn('Error loading expenses for dashboard:', expensesError);
      }

      const expenseAmount = expenses?.reduce((sum, e) => sum + parseFloat(e.amount || '0'), 0) || 0;

      const monthlyExpenses = teacherSalaryExpense + expenseAmount;

      const netProfit = monthlyRevenue - monthlyExpenses;
      const profitMargin = monthlyRevenue === 0 ? 0 : (netProfit / monthlyRevenue) * 100;

      // Generate last 6 months
      const months = Array.from({ length: 6 }).map((_, index) => {
        const date = new Date();
        date.setMonth(date.getMonth() - (5 - index));
        return date.toISOString().slice(0, 7);
      });

      // Get revenue and expenses for last 6 months
      const { data: allRevenue, error: allRevenueError } = await supabase
        .from('revenue')
        .select('amount, month')
        .in('month', months);

      if (allRevenueError && allRevenueError.code !== 'PGRST116') {
        console.warn('Error loading all revenue:', allRevenueError);
      }

      const { data: allExpenses, error: allExpensesError } = await supabase
        .from('expenses')
        .select('amount, month')
        .in('month', months);

      if (allExpensesError && allExpensesError.code !== 'PGRST116') {
        console.warn('Error loading all expenses:', allExpensesError);
      }

      const revenueSeries = months.map((month) => ({
        month,
        revenue:
          allRevenue?.filter((r) => r.month === month).reduce((sum, r) => sum + parseFloat(r.amount || '0'), 0) || 0,
      }));

      const expenseSeries = months.map((month) => ({
        month,
        expense:
          (allExpenses?.filter((e) => e.month === month).reduce((sum, e) => sum + parseFloat(e.amount || '0'), 0) ||
            0) + teacherSalaryExpense,
      }));

      const profitSeries = months.map((month) => {
        const revenueValue = revenueSeries.find((item) => item.month === month)?.revenue || 0;
        const expenseValue = expenseSeries.find((item) => item.month === month)?.expense || 0;
        return { month, profit: revenueValue - expenseValue };
      });

      const studentStatusSeries: { status: PaymentStatus; value: number }[] = [
        { status: 'paid', value: paidStudents },
        { status: 'unpaid', value: unpaidStudents },
      ];

      // Get groups data
      const { data: groups } = await supabase.from('groups').select('id, name, current_students, max_students, monthly_revenue, attendance_rate, teacher_id');
      const { data: allTeachers } = await supabase.from('teachers').select('id, name');

      const studentsPerGroup = (groups || []).map((g) => ({ name: g.name, value: g.current_students || 0 }));

      const teachersPerGroup = (allTeachers || []).map((teacher) => ({
        teacher: teacher.name,
        value: groups?.filter((g) => g.teacher_id === teacher.id).length || 0,
      }));

      const capacityUsage = (groups || []).map((g) => ({
        name: g.name,
        value: g.max_students === 0 ? 0 : Math.min(100, Math.round(((g.current_students || 0) / g.max_students) * 100)),
      }));

      const topGroupsByStudents = [...(groups || [])]
        .sort((a, b) => (b.current_students || 0) - (a.current_students || 0))
        .slice(0, 5)
        .map((g) => ({ id: g.id, name: g.name, value: g.current_students || 0 }));

      const topGroupsByRevenue = [...(groups || [])]
        .sort((a, b) => parseFloat(b.monthly_revenue || '0') - parseFloat(a.monthly_revenue || '0'))
        .slice(0, 5)
        .map((g) => ({ id: g.id, name: g.name, value: parseFloat(g.monthly_revenue || '0') }));

      const topGroupsByAttendance = [...(groups || [])]
        .sort((a, b) => (b.attendance_rate || 0) - (a.attendance_rate || 0))
        .slice(0, 5)
        .map((g) => ({ id: g.id, name: g.name, value: g.attendance_rate || 0 }));

      return {
        teacherCount,
        studentCount,
        groupCount,
        monthlyRevenue,
        monthlyExpenses,
        netProfit,
        profitMargin,
        paidStudents,
        unpaidStudents,
        revenueSeries,
        expenseSeries,
        profitSeries,
        studentStatusSeries,
        studentsPerGroup,
        teachersPerGroup,
        capacityUsage,
        topGroups: {
          byStudents: topGroupsByStudents,
          byRevenue: topGroupsByRevenue,
          byAttendance: topGroupsByAttendance,
        },
      };
    } catch (error: any) {
      console.error('Error getting dashboard snapshot:', error);
      throw new Error(error.message || 'Failed to get dashboard snapshot');
    }
  },
};
