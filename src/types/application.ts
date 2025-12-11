// Application types for better type safety

import type { Application, Course } from '@shared/schema';

export interface ApplicationWithCourse extends Application {
  course?: Course | null;
  data?: {
    parent_phone?: string;
    [key: string]: unknown;
  };
}

export interface ApplicationRow {
  id: string;
  full_name: string;
  age: number;
  phone: string;
  parent_phone: string;
  course_name: string;
  course_price: string;
  interests: string;
  created_at: string;
}

