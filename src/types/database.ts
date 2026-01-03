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
  schedule: string; // Changed from optional to required based on adminApi usage, or keep optional and fix adminApi
  room: string;     // Changed from optional to required based on adminApi usage
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
  full_name: string; // or name? adminApi uses name || full_name
  name?: string;     // Added name as well since adminApi checks for it
  age?: number;
  phone?: string;
  group_id?: string | null;
  parent_name?: string;
  parent_contact?: string;
  monthly_payment?: string | number;
  payment_status?: string;
  payment_valid_until?: string;
  last_paid_month?: string;
  photo_url?: string;
  notes?: string;
  course_name?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DbPayment {
  id: string;
  student_id: string;
  amount: string | number;
  date: string;       // Was missing (previously payment_date?)
  method: string;     // Was missing (previously payment_method?)
  status: string;     // Was optional
  note?: string;      // Was missing
  created_at?: string;
}

export interface DbMonthlyPayment {
  id: string;
  student_id: string;
  month: string;
  year: number;
  month_number: number;
  amount: string | number;
  payment_date: string;
  method: string;
  status: string;
  note?: string;
  created_at?: string;
}

export interface DbRevenue {
  id: string;
  source: string;     // Was group_id
  amount: string | number;
  month: string;      // Was revenue_date
  note?: string;      // Was description
  created_at?: string;
}

export interface DbExpense {
  id: string;
  category: string;
  amount: string | number;
  month: string;      // Was expense_date
  description?: string;
  type?: string;      // Was missing
  created_at?: string;
}

