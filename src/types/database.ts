// Database types for adminApi

export interface DbTeacher {
  id: string;
  name: string;
  specialty?: string;
  specialty_uz?: string;
  specialty_ru?: string;
  specialty_en?: string;
  experience?: number;
  phone?: string;
  monthly_salary?: string | number;
  status?: string;
  image_url?: string | null;
  bio?: string;
  bio_uz?: string;
  bio_ru?: string;
  bio_en?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DbGroup {
  id: string;
  name: string;
  teacher_id: string;
  course_id?: string | null;
  schedule?: string | null;
  room?: string | null;
  max_students?: number;
  current_students?: number;
  status?: string;
  attendance_rate?: number;
  monthly_revenue?: string | number;
  courses?: {
    name_uz?: string;
    name_ru?: string;
    name_en?: string;
  } | null;
  teachers?: Array<{ name: string }> | { name: string } | null;
  created_at?: string;
  updated_at?: string;
}

export interface DbStudent {
  id: string;
  full_name: string;
  age?: number;
  phone?: string;
  group_id?: string | null;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DbPayment {
  id: string;
  student_id: string;
  amount: string | number;
  payment_date: string;
  payment_method?: string;
  status?: string;
  created_at?: string;
}

export interface DbMonthlyPayment {
  id: string;
  student_id: string;
  group_id: string;
  month: string;
  amount: string | number;
  status?: string;
  created_at?: string;
}

export interface DbRevenue {
  id: string;
  group_id: string;
  amount: string | number;
  revenue_date: string;
  description?: string;
  created_at?: string;
}

export interface DbExpense {
  id: string;
  category: string;
  amount: string | number;
  expense_date: string;
  description?: string;
  created_at?: string;
}

