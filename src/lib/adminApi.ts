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

import type { DbTeacher, DbGroup, DbStudent, DbPayment, DbMonthlyPayment, DbRevenue, DbExpense } from '@/types/database';

// Helper function to convert database teacher to TeacherProfile
const mapTeacherFromDb = (dbTeacher: DbTeacher): TeacherProfile => ({
  id: dbTeacher.id,
  fullName: dbTeacher.name,
  subject: dbTeacher.specialty || dbTeacher.specialty_uz || '',
  experience: dbTeacher.experience || 0,
  phone: dbTeacher.phone || '',
  monthlySalary: parseFloat((dbTeacher.monthly_salary || '0').toString()),
  status: (dbTeacher.status || 'active') as 'active' | 'inactive',
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
const mapGroupFromDb = (dbGroup: DbGroup, teacherName?: string, courseName?: string): GroupProfile => ({
  id: dbGroup.id,
  name: dbGroup.name,
  teacherId: dbGroup.teacher_id,
  teacherName: teacherName || 'Unassigned',
  courseId: dbGroup.course_id || null,
  courseName: courseName || dbGroup.courses?.name_uz || undefined,
  schedule: dbGroup.schedule || '',
  room: dbGroup.room || '',
  maxStudents: dbGroup.max_students || 0,
  currentStudents: dbGroup.current_students || 0,
  status: (dbGroup.status || 'active') as 'active' | 'completed' | 'cancelled',
  attendanceRate: dbGroup.attendance_rate || 0,
  monthlyRevenue: parseFloat((dbGroup.monthly_revenue || '0').toString()),
});

// Helper function to convert GroupProfile to database format
const mapGroupToDb = (group: Partial<GroupPayload>) => ({
  name: group.name,
  teacher_id: group.teacherId,
  course_id: group.courseId || null,
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
  const createdAt = dbStudent.created_at;

  // To'lov eskirgan deb hisoblash: kursga yozilganiga 1 oydan o'tgan, lekin hali to'lov qilmagan
  let isExpired = false;
  if (createdAt) {
    const enrollmentDate = new Date(createdAt);
    // Qo'shilgan oydan keyingi oyning 1-kunidan boshlash
    const firstPaymentMonth = new Date(enrollmentDate.getFullYear(), enrollmentDate.getMonth() + 1, 1);
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Agar birinchi to'lov oyi o'tib ketgan bo'lsa va to'lov qilinmagan bo'lsa
    if (firstPaymentMonth < currentMonth) {
      // Agar payment_valid_until yo'q bo'lsa yoki o'tib ketgan bo'lsa, eskirgan deb hisoblash
      if (!paymentValidUntil || new Date(paymentValidUntil) < now) {
        isExpired = true;
      }
    }
  } else {
    // Agar qo'shilgan sana yo'q bo'lsa, eski logikani ishlatish
    isExpired = paymentValidUntil ? new Date(paymentValidUntil) < new Date() : true;
  }

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
    createdAt: dbStudent.created_at || undefined,
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
  method: dbPayment.method as 'cash' | 'card' | 'transfer',
  status: dbPayment.status as 'paid' | 'pending' | 'cancelled',
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

  return dbData;
};

// Helper function to convert database payment history to PaymentHistoryEntry
const mapPaymentFromDb = (dbPayment: DbPayment): PaymentHistoryEntry => ({
  id: dbPayment.id,
  studentId: dbPayment.student_id,
  amount: parseFloat((dbPayment.amount || '0').toString()),
  date: dbPayment.date,
  status: dbPayment.status as 'paid' | 'pending' | 'cancelled',
  method: dbPayment.method as 'cash' | 'card' | 'transfer',
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
const mapRevenueFromDb = (dbRevenue: DbRevenue): RevenueRecord => ({
  id: dbRevenue.id,
  source: dbRevenue.source,
  amount: parseFloat((dbRevenue.amount || '0').toString()),
  month: dbRevenue.month,
  note: dbRevenue.note || undefined,
});

// Helper function to convert database expense to ExpenseRecord
const mapExpenseFromDb = (dbExpense: DbExpense): ExpenseRecord => ({
  id: dbExpense.id,
  category: dbExpense.category,
  amount: parseFloat((dbExpense.amount || '0').toString()),
  month: dbExpense.month,
  description: dbExpense.description || undefined,
  type: (dbExpense.type || 'variable') as 'fixed' | 'variable',
});

// Helper to sync group metrics (current_students and monthly_revenue)
const syncGroupMetrics = async (groupId?: string | null) => {
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

  async getTeacher(id: string, payoutRate?: number): Promise<(TeacherProfile & {
    groups?: GroupProfile[];
    courses?: Array<{ id: string; name_uz: string; name_ru: string; name_en: string }>;
    totalStudents?: number;
    totalRevenue?: number;
    calculatedSalary?: number; // Dinamik hisoblangan oylik
    specialty_uz?: string;
    specialty_ru?: string;
    specialty_en?: string;
    bio_uz?: string;
    bio_ru?: string;
    bio_en?: string;
    linked_in?: string | null;
    telegram?: string | null;
    instagram?: string | null;
    featured?: boolean;
    created_at?: string;
    updated_at?: string;
  }) | undefined> {
    try {
      // Get teacher basic info
      const { data: teacher, error } = await supabase
        .from('teachers')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!teacher) return undefined;

      // Get all groups for this teacher with full details
      const { data: groups, error: groupsError } = await supabase
        .from('groups')
        .select('*')
        .eq('teacher_id', id);

      if (groupsError && import.meta.env.DEV) {
        console.warn('Error loading groups for teacher:', groupsError);
      }

      // Get courses separately if course_id exists
      const courseIds = groups?.filter(g => g.course_id).map(g => g.course_id) || [];
      let coursesMap: Record<string, any> = {};

      if (courseIds.length > 0) {
        const { data: coursesData } = await supabase
          .from('courses')
          .select('id, name_uz, name_ru, name_en')
          .in('id', courseIds);

        if (coursesData) {
          coursesMap = coursesData.reduce((acc: Record<string, { name_uz?: string; name_ru?: string; name_en?: string }>, course: { id: string; name_uz?: string; name_ru?: string; name_en?: string }) => {
            acc[course.id] = course;
            return acc;
          }, {});
        }
      }

      // Map groups to GroupProfile
      const teacherGroups: GroupProfile[] = (groups || []).map((g: DbGroup) => {
        const courseName = g.course_id ? coursesMap[g.course_id]?.name_uz : undefined;
        return mapGroupFromDb(
          g,
          teacher.name,
          courseName
        );
      });

      // Get courses taught by this teacher
      const { data: courses } = await supabase
        .from('courses')
        .select('id, name_uz, name_ru, name_en')
        .eq('teacher_id', id);

      // Get all students in teacher's groups
      const groupIds = teacherGroups.map(g => g.id);
      let totalStudents = 0;
      let totalRevenue = 0;

      if (groupIds.length > 0) {
        const { data: students } = await supabase
          .from('students')
          .select('id, monthly_payment, payment_status')
          .in('group_id', groupIds);

        totalStudents = students?.length || 0;
        totalRevenue = students
          ?.filter(s => s.payment_status === 'paid')
          .reduce((sum, s) => sum + parseFloat(s.monthly_payment || '0'), 0) || 0;
      }

      // Payout rate'ni olish (parametr yoki localStorage'dan)
      let finalPayoutRate = payoutRate;
      if (finalPayoutRate === undefined) {
        try {
          const stored = typeof window !== 'undefined' ? localStorage.getItem('academy_payout_rate') : null;
          finalPayoutRate = stored ? parseFloat(stored) : 0.35;
          // Validatsiya
          if (isNaN(finalPayoutRate) || finalPayoutRate < 0.20 || finalPayoutRate > 0.60) {
            finalPayoutRate = 0.35;
          }
        } catch {
          finalPayoutRate = 0.35;
        }
      }

      // Dinamik hisoblangan oylik (groups daromadlari * payout rate)
      const calculatedSalary = totalRevenue * finalPayoutRate;

      return {
        ...mapTeacherFromDb(teacher),
        groups: teacherGroups,
        courses: courses || [],
        totalStudents,
        totalRevenue,
        calculatedSalary, // Dinamik hisoblangan oylik
        specialty_uz: teacher.specialty_uz,
        specialty_ru: teacher.specialty_ru,
        specialty_en: teacher.specialty_en,
        bio_uz: teacher.bio_uz,
        bio_ru: teacher.bio_ru,
        bio_en: teacher.bio_en,
        linked_in: teacher.linked_in,
        telegram: teacher.telegram,
        instagram: teacher.instagram,
        featured: teacher.featured || false,
        created_at: teacher.created_at,
        updated_at: teacher.updated_at,
      };
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.error('Error getting teacher:', error);
      }
      throw new Error(error.message || 'Failed to get teacher');
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

      // Get courses separately if course_id exists
      const courseIds = groups?.filter(g => g.course_id).map(g => g.course_id) || [];
      let coursesMap: Record<string, any> = {};

      if (courseIds.length > 0) {
        const { data: courses } = await supabase
          .from('courses')
          .select('id, name_uz, name_ru, name_en')
          .in('id', courseIds);

        if (courses) {
          coursesMap = courses.reduce((acc: Record<string, { name_uz?: string; name_ru?: string; name_en?: string }>, course: { id: string; name_uz?: string; name_ru?: string; name_en?: string }) => {
            acc[course.id] = course;
            return acc;
          }, {});
        }
      }

      // Sync metrics before returning
      await syncGroupMetrics();

      return (groups || []).map((g: DbGroup) =>
        mapGroupFromDb(
          g,
          (Array.isArray(g.teachers) ? g.teachers[0]?.name : (g.teachers as any)?.name) || 'Unassigned',
          g.course_id ? coursesMap[g.course_id]?.name_uz : undefined
        )
      );
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.error('Error listing groups:', error);
      }
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

      // Get course separately if course_id exists
      let courseName: string | undefined;
      if (group.course_id) {
        const { data: course } = await supabase
          .from('courses')
          .select('name_uz, name_ru, name_en')
          .eq('id', group.course_id)
          .single();
        courseName = course?.name_uz;
      }

      return mapGroupFromDb(
        group,
        group.teachers?.name || 'Unassigned',
        courseName
      );
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.error('Error getting group:', error);
      }
      throw new Error(error.message || 'Failed to get group');
    }
  },

  async createGroup(payload: GroupPayload): Promise<GroupProfile> {
    try {
      const dbData = mapGroupToDb(payload);
      const { data, error } = await supabase.from('groups').insert(dbData).select(`
        *,
        teachers:teacher_id (name)
      `).single();

      if (error) throw error;

      // Get course separately if course_id exists
      let courseName: string | undefined;
      if (data.course_id) {
        const { data: course } = await supabase
          .from('courses')
          .select('name_uz, name_ru, name_en')
          .eq('id', data.course_id)
          .single();
        courseName = course?.name_uz;
      }

      await syncGroupMetrics(data.id);
      return mapGroupFromDb(
        data,
        data.teachers?.name || 'Unassigned',
        courseName
      );
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.error('Error creating group:', error);
      }
      throw new Error(error.message || 'Failed to create group');
    }
  },

  async updateGroup(id: string, payload: Partial<GroupPayload>): Promise<GroupProfile> {
    try {
      const dbData = mapGroupToDb(payload as GroupPayload);
      const { data, error } = await supabase.from('groups').update(dbData).eq('id', id).select(`
        *,
        teachers:teacher_id (name)
      `).single();

      if (error) throw error;
      if (!data) throw new Error('Group not found');

      // Get course separately if course_id exists
      let courseName: string | undefined;
      if (data.course_id) {
        const { data: course } = await supabase
          .from('courses')
          .select('name_uz, name_ru, name_en')
          .eq('id', data.course_id)
          .single();
        courseName = course?.name_uz;
      }

      await syncGroupMetrics(id);
      return mapGroupFromDb(
        data,
        data.teachers?.name || 'Unassigned',
        courseName
      );
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.error('Error updating group:', error);
      }
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
  async getStudent(id: string): Promise<StudentProfile | undefined> {
    try {
      const { data: student, error } = await supabase
        .from('students')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!student) return undefined;

      // Get group and teacher info
      let group: GroupProfile | undefined;
      let teacherName: string | undefined;

      if (student.group_id) {
        const { data: groupData } = await supabase
          .from('groups')
          .select(`
            *,
            teachers:teacher_id (name)
          `)
          .eq('id', student.group_id)
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

      // Get monthly payments
      const { data: monthlyPayments } = await supabase
        .from('monthly_payments')
        .select('*')
        .eq('student_id', id)
        .order('month', { ascending: false });

      return {
        ...mapStudentFromDb(student, group, teacherName),
        history: payments?.map(mapPaymentFromDb) || [],
        monthlyPayments: monthlyPayments?.map(mapMonthlyPaymentFromDb) || [],
      };
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.error('Error getting student:', error);
      }
      throw new Error(error.message || 'Failed to get student');
    }
  },

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
      const uniqueGroupIds = new Set(students?.map((s) => s.group_id).filter(Boolean) || []);
      const groupIds: string[] = [];
      uniqueGroupIds.forEach((id) => {
        if (id) groupIds.push(id);
      });
      const { data: groups } = await supabase
        .from('groups')
        .select(`
          *,
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
        const group = groups?.find((g: any) => g.id === student.group_id);
        const studentPayments = payments?.filter((p) => p.student_id === student.id) || [];
        const studentMonthlyPayments = monthlyPayments?.filter((p) => p.student_id === student.id) || [];
        const teacherName = group?.teachers
          ? (Array.isArray(group.teachers)
            ? (Array.isArray(group.teachers) ? group.teachers[0]?.name : (group.teachers as any)?.name)
            : (group.teachers as any)?.name)
          : undefined;
        return {
          ...mapStudentFromDb(student, group ? mapGroupFromDb(group, teacherName) : undefined, teacherName),
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
      if (payload.groupId !== undefined && payload.groupId !== null) {
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

  async getFinanceBreakdown(payoutRate: number = 0.35): Promise<FinanceBreakdown> {
    try {
      // Get active teachers and calculate salaries from groups revenue
      const { data: teachers, error: teachersError } = await supabase
        .from('teachers')
        .select('id, monthly_salary, status')
        .eq('status', 'active');

      if (teachersError && teachersError.code !== 'PGRST116') {
        // PGRST116 = table not found, ignore it
        console.warn('Error loading teachers for finance:', teachersError);
      }

      // Calculate teacher salaries from groups revenue using payout rate
      let teacherSalaries = 0;

      if (teachers && teachers.length > 0) {
        const teacherIds = teachers.map((t: { id: string }) => t.id);
        const { data: teacherGroups } = await supabase
          .from('groups')
          .select('teacher_id, monthly_revenue')
          .in('teacher_id', teacherIds);

        const teacherRevenueMap = new Map<string, number>();
        (teacherGroups || []).forEach((g: any) => {
          if (g.teacher_id) {
            const currentRevenue = teacherRevenueMap.get(g.teacher_id) || 0;
            teacherRevenueMap.set(g.teacher_id, currentRevenue + parseFloat(g.monthly_revenue || '0'));
          }
        });

        // Dashboard'da belgilangan foizga qarab oylik hisoblanadi
        teacherSalaries = teachers.reduce((sum, teacher) => {
          const groupsRevenue = teacherRevenueMap.get(teacher.id) || 0;
          const calculatedSalary = groupsRevenue * payoutRate;
          return sum + calculatedSalary;
        }, 0);
      }

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

  async getDashboardSnapshot(payoutRate: number = 0.35): Promise<DashboardSnapshot> {
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
      const paidStudents = (students || []).filter((s) => s.payment_status === 'paid').length || 0;
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
        (students || [])
          .filter((s) => s.payment_status === 'paid')
          .reduce((sum, s) => sum + parseFloat(s.monthly_payment || '0'), 0) || 0;

      const monthlyRevenue = revenueAmount + studentPayments;

      // Get teacher salaries - groups daromadlaridan hisoblanadi
      // Avval o'qituvchilarning groups'lari bo'yicha daromadlarni yig'amiz
      const { data: activeTeachers, error: teachersError } = await supabase
        .from('teachers')
        .select('id, name, monthly_salary')
        .eq('status', 'active');

      if (teachersError && teachersError.code !== 'PGRST116') {
        console.warn('Error loading teachers for dashboard:', teachersError);
      }

      // Har bir o'qituvchining groups'lari bo'yicha daromadlarni yig'amiz
      let teacherSalaryExpense = 0;
      if (activeTeachers && activeTeachers.length > 0) {
        const teacherIds = activeTeachers.map((t: { id: string }) => t.id);
        const { data: teacherGroups } = await supabase
          .from('groups')
          .select('teacher_id, monthly_revenue')
          .in('teacher_id', teacherIds);

        // Har bir o'qituvchi uchun groups daromadlarini yig'amiz
        const teacherRevenueMap = new Map<string, number>();
        (teacherGroups || []).forEach((g: any) => {
          if (g.teacher_id) {
            const currentRevenue = teacherRevenueMap.get(g.teacher_id) || 0;
            teacherRevenueMap.set(g.teacher_id, currentRevenue + parseFloat(g.monthly_revenue || '0'));
          }
        });

        // O'qituvchilar oyligi = groups daromadlari yig'indisi * payoutRate (dashboard'da belgilangan foiz)
        // Har bir o'qituvchining groups daromadlari yig'indisidan foiz olib hisoblanadi
        teacherSalaryExpense = activeTeachers.reduce((sum, teacher) => {
          const groupsRevenue = teacherRevenueMap.get(teacher.id) || 0;
          // Dashboard'da belgilangan foizga qarab oylik hisoblanadi
          const calculatedSalary = groupsRevenue * payoutRate;
          return sum + calculatedSalary;
        }, 0);
      }

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

      // Har bir oy uchun o'qituvchilar oyligini hisoblash
      // Har bir oy uchun o'qituvchilarning groups daromadlarini yig'ib, payoutRate ga ko'paytiramiz
      const monthlyTeacherSalaries = new Map<string, number>();

      // Faqat joriy oy uchun to'liq hisob-kitob mavjud
      // Boshqa oylar uchun o'qituvchilar oyligini faqat joriy oy uchun qo'llaymiz
      // (Real application'da har oy uchun alohida history saqlash kerak)
      for (const month of months) {
        if (month === currentMonth) {
          monthlyTeacherSalaries.set(month, teacherSalaryExpense);
        } else {
          // Boshqa oylar uchun o'qituvchilar oyligini joriy oy qiymatidan taxminiy hisoblaymiz
          // yoki 0 deb qoldiramiz (real application'da history saqlash kerak)
          monthlyTeacherSalaries.set(month, 0);
        }
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
            0) + (monthlyTeacherSalaries.get(month) || 0),
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

      // Get groups data with error handling
      let groupsData: any[] = [];
      let teachersData: any[] = [];

      try {
        const { data: groups, error: groupsError } = await supabase
          .from('groups')
          .select('id, name, current_students, max_students, monthly_revenue, attendance_rate, teacher_id');

        if (groupsError && groupsError.code !== 'PGRST116') {
          console.warn('Error loading groups for dashboard:', groupsError);
        } else if (groups) {
          groupsData = groups;
        }
      } catch (error) {
        console.error('Error loading groups:', error);
      }

      try {
        const { data: allTeachers, error: allTeachersError } = await supabase
          .from('teachers')
          .select('id, name');

        if (allTeachersError && allTeachersError.code !== 'PGRST116') {
          console.warn('Error loading teachers for dashboard:', allTeachersError);
        } else if (allTeachers) {
          teachersData = allTeachers;
        }
      } catch (error) {
        console.error('Error loading teachers:', error);
      }

      const studentsPerGroup = (groupsData || []).map((g: DbGroup) => ({
        name: (g.name || 'Noma\'lum').substring(0, 20), // Truncate long names
        value: Number(g.current_students) || 0
      }));

      const teachersPerGroup = (teachersData || []).map((teacher: DbTeacher) => ({
        teacher: (teacher.name || 'Noma\'lum').substring(0, 20),
        value: (groupsData || []).filter((g: any) => g.teacher_id === teacher.id).length || 0,
      }));

      const capacityUsage = (groupsData || []).map((g: DbGroup) => {
        const maxStudents = Number(g.max_students) || 1;
        const currentStudents = Number(g.current_students) || 0;
        const percentage = maxStudents === 0 ? 0 : Math.min(100, Math.round((currentStudents / maxStudents) * 100));
        return {
          name: (g.name || 'Noma\'lum').substring(0, 20),
          value: percentage,
        };
      });

      const topGroupsByStudents = [...(groupsData || [])]
        .sort((a: DbGroup, b: DbGroup) => (Number(b.current_students) || 0) - (Number(a.current_students) || 0))
        .slice(0, 5)
        .map((g: DbGroup) => ({ id: g.id, name: g.name || 'Noma\'lum', value: Number(g.current_students) || 0 }));

      const topGroupsByRevenue = [...(groupsData || [])]
        .sort((a: DbGroup, b: DbGroup) => parseFloat(String(b.monthly_revenue || '0')) - parseFloat(String(a.monthly_revenue || '0')))
        .slice(0, 5)
        .map((g: DbGroup) => ({ id: g.id, name: g.name || 'Noma\'lum', value: parseFloat(String(g.monthly_revenue || '0')) }));

      const topGroupsByAttendance = [...(groupsData || [])]
        .sort((a: DbGroup, b: DbGroup) => (Number(b.attendance_rate) || 0) - (Number(a.attendance_rate) || 0))
        .slice(0, 5)
        .map((g: DbGroup) => ({ id: g.id, name: g.name || 'Noma\'lum', value: Number(g.attendance_rate) || 0 }));

      return {
        teacherCount,
        studentCount,
        groupCount,
        monthlyRevenue,
        monthlyExpenses,
        teacherSalaryExpense, // O'qituvchilar oyligi (foizga qarab hisoblangan)
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
