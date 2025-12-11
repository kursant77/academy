import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface SystemOption {
  id: string;
  option_type: string;
  option_key: string;
  name_uz: string;
  name_ru: string;
  name_en: string;
  sort_order: number;
  is_active: boolean;
}

// Barcha option turlarini olish
export function useOptions(optionType: string) {
  const [options, setOptions] = useState<SystemOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOptions();
  }, [optionType]);

  const loadOptions = async () => {
    try {
      const { data, error } = await supabase
        .from('system_options')
        .select('*')
        .eq('option_type', optionType)
        .eq('is_active', true)
        .order('sort_order');

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading options:', error);
      }
      
      setOptions(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return { options, loading, reload: loadOptions };
}

// Bir nechta option turlarini bir vaqtda olish
export function useMultipleOptions(optionTypes: string[]) {
  const [options, setOptions] = useState<Record<string, SystemOption[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllOptions();
  }, [optionTypes.join(',')]);

  const loadAllOptions = async () => {
    try {
      const { data, error } = await supabase
        .from('system_options')
        .select('*')
        .in('option_type', optionTypes)
        .eq('is_active', true)
        .order('sort_order');

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading options:', error);
      }
      
      // Turlarga ajratish
      const grouped: Record<string, SystemOption[]> = {};
      optionTypes.forEach(type => {
        grouped[type] = (data || []).filter(o => o.option_type === type);
      });
      
      setOptions(grouped);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return { options, loading, reload: loadAllOptions };
}

// Option type konstantalari
export const OPTION_TYPES = {
  COURSE_LEVEL: 'course_level',
  COURSE_CATEGORY: 'course_category',
  EVENT_CATEGORY: 'event_category',
  PAYMENT_METHOD: 'payment_method',
  PAYMENT_STATUS: 'payment_status',
  GROUP_STATUS: 'group_status',
  TEACHER_STATUS: 'teacher_status',
  APPLICATION_STATUS: 'application_status',
  LESSON_FORMAT: 'lesson_format',
} as const;

