import { z } from "zod";

// Database types for Supabase
export type Course = {
  id: string;
  name: string;
  name_uz: string;
  name_ru: string;
  name_en: string;
  description: string;
  description_uz: string;
  description_ru: string;
  description_en: string;
  category: string;
  category_id: string | null;
  duration: string;
  price: string;
  level: string;
  teacher_id: string;
  schedule: string;
  image_url: string | null;
  featured?: boolean;
  is_published?: boolean;
  created_at?: string;
  updated_at?: string;
};

export type Teacher = {
  id: string;
  name: string;
  specialty: string;
  specialty_uz: string;
  specialty_ru: string;
  specialty_en: string;
  experience: number;
  bio: string;
  bio_uz: string;
  bio_ru: string;
  bio_en: string;
  image_url: string | null;
  linked_in: string | null;
  telegram: string | null;
  instagram: string | null;
  featured?: boolean;
  created_at?: string;
  updated_at?: string;
};

export type Application = {
  id: string;
  user_id: string | null;
  full_name: string;
  age: number;
  phone: string;
  course_id: string | null;
  category_id: string | null;
  interests: string;
  status: string;
  data: Record<string, any> | null;
  created_at: string;
};

export type Event = {
  id: string;
  title: string;
  title_uz: string;
  title_ru: string;
  title_en: string;
  description: string;
  description_uz: string;
  description_ru: string;
  description_en: string;
  date: string;
  image_url: string | null;
  category: string;
  featured?: boolean;
  is_published?: boolean;
  created_at?: string;
  updated_at?: string;
};

export type Achievement = {
  id: string;
  title: string;
  title_uz: string;
  title_ru: string;
  title_en: string;
  description: string;
  description_uz: string;
  description_ru: string;
  description_en: string;
  image_url: string | null;
  student_name: string;
  student_name_uz: string;
  student_name_ru: string;
  student_name_en: string;
  course_id: string | null;
  created_at?: string;
  updated_at?: string;
};

export type Category = {
  id: string;
  name: string;
  name_uz: string;
  name_ru: string;
  name_en: string;
  type: "course" | "event";
  created_at?: string;
  updated_at?: string;
};

export type ContentBlock = {
  id: string;
  section: string;
  content_key: string;
  locale: string;
  value: string;
  metadata: Record<string, any> | null;
  created_at?: string;
  updated_at?: string;
};

export type SiteStat = {
  id: string;
  value: string;
  label_uz: string;
  label_ru: string;
  label_en: string;
  icon: string;
  created_at?: string;
  updated_at?: string;
};

export type Testimonial = {
  id: string;
  name: string;
  course: string;
  text_uz: string;
  text_ru: string;
  text_en: string;
  rating: number;
  created_at?: string;
  updated_at?: string;
};

export type GalleryItem = {
  id: string;
  title_uz: string;
  title_ru: string;
  title_en: string;
  description_uz: string | null;
  description_ru: string | null;
  description_en: string | null;
  image_url: string;
  category: string | null;
  created_at?: string;
  updated_at?: string;
};

export type ScheduleEntry = {
  id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  title_uz: string;
  title_ru: string;
  title_en: string;
  room: string | null;
  format: string | null;
  teacher_name: string | null;
  created_at?: string;
  updated_at?: string;
};

export type User = {
  id: string;
  username: string;
  email: string;
  password: string;
  created_at: string;
};

export type Admin = {
  login: string;
  password: string;
  name: string | null;
  created_at: string;
};

export type Profile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: string;
  avatar_url: string | null;
  created_at?: string;
  updated_at?: string;
};

// Insert types (without auto-generated fields)
export type InsertCourse = Omit<Course, "id" | "created_at" | "updated_at">;
export type InsertTeacher = Omit<Teacher, "id" | "created_at" | "updated_at">;
export type InsertApplication = Omit<Application, "id" | "created_at">;
export type InsertEvent = Omit<Event, "id" | "created_at" | "updated_at">;
export type InsertAchievement = Omit<Achievement, "id" | "created_at" | "updated_at">;
export type InsertCategory = Omit<Category, "id" | "created_at" | "updated_at">;
export type InsertContentBlock = Omit<ContentBlock, "id" | "created_at" | "updated_at">;
export type InsertSiteStat = Omit<SiteStat, "id" | "created_at" | "updated_at">;
export type InsertTestimonial = Omit<Testimonial, "id" | "created_at" | "updated_at">;
export type InsertGalleryItem = Omit<GalleryItem, "id" | "created_at" | "updated_at">;
export type InsertScheduleEntry = Omit<ScheduleEntry, "id" | "created_at" | "updated_at">;
export type InsertProfile = Omit<Profile, "created_at" | "updated_at">;
export type InsertUser = Omit<User, "id" | "created_at">;
export type InsertAdmin = Omit<Admin, "created_at">;

// Zod schemas for validation
export const insertCourseSchema = z.object({
  name: z.string().min(1),
  name_uz: z.string().min(1),
  name_ru: z.string().min(1),
  name_en: z.string().min(1),
  description: z.string().min(1),
  description_uz: z.string().min(1),
  description_ru: z.string().min(1),
  description_en: z.string().min(1),
  category: z.string().min(1),
  duration: z.string().min(1),
  price: z.string().min(1),
  level: z.string().min(1),
  teacher_id: z.string().min(1),
  schedule: z.string().min(1),
  image_url: z.string().nullable().optional(),
});

export const insertTeacherSchema = z.object({
  name: z.string().min(1),
  specialty: z.string().min(1),
  specialty_uz: z.string().min(1),
  specialty_ru: z.string().min(1),
  specialty_en: z.string().min(1),
  experience: z.number().int().positive(),
  bio: z.string().min(1),
  bio_uz: z.string().min(1),
  bio_ru: z.string().min(1),
  bio_en: z.string().min(1),
  image_url: z.string().nullable().optional(),
  linked_in: z.string().nullable().optional(),
  telegram: z.string().nullable().optional(),
  instagram: z.string().nullable().optional(),
});

export const insertApplicationSchema = z.object({
  full_name: z.string().min(1),
  age: z.number().int().positive(),
  phone: z.string().min(1),
  course_id: z.string().uuid().nullable(),
  category_id: z.string().uuid().nullable(),
  interests: z.string().min(1),
  status: z.string().optional(),
  data: z.record(z.any()).nullable().optional(),
});

export const insertEventSchema = z.object({
  title: z.string().min(1),
  title_uz: z.string().min(1),
  title_ru: z.string().min(1),
  title_en: z.string().min(1),
  description: z.string().min(1),
  description_uz: z.string().min(1),
  description_ru: z.string().min(1),
  description_en: z.string().min(1),
  date: z.string().datetime(),
  image_url: z.string().nullable().optional(),
  category: z.string().min(1),
});

export const insertAchievementSchema = z.object({
  title: z.string().min(1),
  title_uz: z.string().min(1),
  title_ru: z.string().min(1),
  title_en: z.string().min(1),
  description: z.string().min(1),
  description_uz: z.string().min(1),
  description_ru: z.string().min(1),
  description_en: z.string().min(1),
  image_url: z.string().nullable().optional(),
  student_name: z.string().min(1),
  student_name_uz: z.string().min(1),
  student_name_ru: z.string().min(1),
  student_name_en: z.string().min(1),
  course_id: z.string().nullable().optional(),
});

export const insertCategorySchema = z.object({
  name: z.string().min(1),
  name_uz: z.string().min(1),
  name_ru: z.string().min(1),
  name_en: z.string().min(1),
  type: z.enum(["course", "event"]),
});

export const insertContentBlockSchema = z.object({
  section: z.string().min(1),
  content_key: z.string().min(1),
  locale: z.string().min(2),
  value: z.string().min(1),
  metadata: z.record(z.any()).nullable().optional(),
});

export const insertSiteStatSchema = z.object({
  value: z.string().min(1),
  label_uz: z.string().min(1),
  label_ru: z.string().min(1),
  label_en: z.string().min(1),
  icon: z.string().min(1),
});

export const insertTestimonialSchema = z.object({
  name: z.string().min(1),
  course: z.string().min(1),
  text_uz: z.string().min(1),
  text_ru: z.string().min(1),
  text_en: z.string().min(1),
  rating: z.number().int().min(1).max(5).default(5),
});

export const insertGalleryItemSchema = z.object({
  title_uz: z.string().min(1),
  title_ru: z.string().min(1),
  title_en: z.string().min(1),
  description_uz: z.string().nullable().optional(),
  description_ru: z.string().nullable().optional(),
  description_en: z.string().nullable().optional(),
  image_url: z.string().min(1),
  category: z.string().nullable().optional(),
});

export const insertScheduleEntrySchema = z.object({
  day_of_week: z.string().min(1),
  start_time: z.string().min(1),
  end_time: z.string().min(1),
  title_uz: z.string().min(1),
  title_ru: z.string().min(1),
  title_en: z.string().min(1),
  room: z.string().nullable().optional(),
  format: z.string().nullable().optional(),
  teacher_name: z.string().nullable().optional(),
});

export const insertAdminSchema = z.object({
  login: z.string().min(3),
  password: z.string().min(1),
  name: z.string().nullable().optional(),
});

export const insertProfileSchema = z.object({
  id: z.string().uuid(),
  full_name: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  role: z.string().optional(),
  avatar_url: z.string().nullable().optional(),
});
