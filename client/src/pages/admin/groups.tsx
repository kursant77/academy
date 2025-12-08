import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'wouter';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AdminLayout } from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/lib/supabase';
import type { Teacher, Course } from '@shared/schema';
import { Loader2, MoreHorizontal, Plus, Calendar, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Group {
  id: string;
  name: string;
  teacher_id: string;
  course_id?: string | null;
  schedule: string;
  room: string;
  max_students: number;
  current_students: number;
  status: 'active' | 'closed';
  attendance_rate: number;
  monthly_revenue: number;
  created_at?: string;
  updated_at?: string;
  teachers?: { name: string };
  courses?: { name_uz: string; name_ru: string; name_en: string };
}

function GroupsContent() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const weekDays = [
    { value: 'Monday', label: 'Dushanba' },
    { value: 'Tuesday', label: 'Seshanba' },
    { value: 'Wednesday', label: 'Chorshanba' },
    { value: 'Thursday', label: 'Payshanba' },
    { value: 'Friday', label: 'Juma' },
    { value: 'Saturday', label: 'Shanba' },
    { value: 'Sunday', label: 'Yakshanba' },
  ];

  const [formData, setFormData] = useState({
    name: '',
    teacher_id: '',
    course_id: '',
    schedule: '',
    room: '',
    max_students: 12,
    current_students: 0,
    status: 'active' as 'active' | 'closed',
    attendance_rate: 85,
    monthly_revenue: 0,
    selectedDays: [] as string[], // Tanlangan kunlar
    start_time: '09:00',
    end_time: '10:30',
  });
  const [searchValue, setSearchValue] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'closed'>('all');
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [groupsRes, teachersRes, coursesRes] = await Promise.all([
        supabase
          .from('groups')
          .select('*, teachers(name)')
          .order('created_at', { ascending: false }),
        supabase
          .from('teachers')
          .select('*')
          .order('name'),
        supabase
          .from('courses')
          .select('*')
          .order('name_uz'),
      ]);

      if (groupsRes.error) {
        if (import.meta.env.DEV) {
          console.error('Groups error:', groupsRes.error);
        }
        if (groupsRes.error.code === 'PGRST116' || groupsRes.error.message?.includes('does not exist')) {
          toast({
            title: 'Xatolik',
            description: 'Groups jadvali topilmadi. Iltimos, FIX_GROUPS_TABLE.sql faylini Supabase SQL Editor\'da ishga tushiring.',
            variant: 'destructive',
          });
        } else {
          throw groupsRes.error;
        }
        setGroups([]);
      } else {
        // Get courses separately and map them to groups
        const groups = groupsRes.data || [];
        const courses = coursesRes.data || [];
        const coursesMap = courses.reduce((acc: Record<string, any>, course: any) => {
          acc[course.id] = course;
          return acc;
        }, {});

        // Add course info to groups
        const groupsWithCourses = groups.map((group: any) => ({
          ...group,
          courses: group.course_id ? coursesMap[group.course_id] : null,
        }));

        setGroups(groupsWithCourses);
      }

      if (teachersRes.error) {
        if (import.meta.env.DEV) {
          console.error('Teachers error:', teachersRes.error);
        }
        toast({
          title: 'Xatolik',
          description: 'O\'qituvchilar yuklanmadi: ' + teachersRes.error.message,
          variant: 'destructive',
        });
        setTeachers([]);
      } else {
        setTeachers(teachersRes.data || []);
      }

      if (coursesRes.error) {
        if (import.meta.env.DEV) {
          console.error('Courses error:', coursesRes.error);
        }
        setCourses([]);
      } else {
        setCourses(coursesRes.data || []);
      }
    } catch (error: any) {
      toast({
        title: 'Xatolik',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Schedule stringdan kunlarni parse qilish
  const parseScheduleDays = (scheduleStr: string): string[] => {
    const days: string[] = [];
    const lower = scheduleStr.toLowerCase();
    
    const dayMap: Record<string, string> = {
      'dushanba': 'Monday',
      'seshanba': 'Tuesday',
      'chorshanba': 'Wednesday',
      'payshanba': 'Thursday',
      'juma': 'Friday',
      'shanba': 'Saturday',
      'yakshanba': 'Sunday',
      'dush': 'Monday',
      'sesh': 'Tuesday',
      'chorsh': 'Wednesday',
      'paysh': 'Thursday',
    };

    for (const [uz, en] of Object.entries(dayMap)) {
      if (lower.includes(uz)) {
        days.push(en);
      }
    }
    
    return days;
  };

  // Vaqtni schedule stringdan parse qilish
  const parseScheduleTime = (scheduleStr: string): { start: string; end: string } => {
    const timeMatch = scheduleStr.match(/(\d{1,2}:\d{2})\s*[-–—]\s*(\d{1,2}:\d{2})/);
    if (timeMatch) {
      return { start: timeMatch[1], end: timeMatch[2] };
    }
    return { start: '09:00', end: '10:30' };
  };

  const resetForm = () => {
    setEditingGroup(null);
    setFormData({
      name: '',
      teacher_id: teachers[0]?.id || '',
      course_id: '',
      schedule: '',
      room: '',
      max_students: 12,
      current_students: 0,
      status: 'active',
      attendance_rate: 85,
      monthly_revenue: 0,
      selectedDays: [],
      start_time: '09:00',
      end_time: '10:30',
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!formData.teacher_id) {
      toast({ title: 'Ogohlantirish', description: 'Iltimos, ustozni tanlang', variant: 'destructive' });
      return;
    }
    if (formData.selectedDays.length === 0) {
      toast({ title: 'Ogohlantirish', description: 'Iltimos, kamida bitta kunni tanlang', variant: 'destructive' });
      return;
    }

    try {
      // Tanlangan kunlar ro'yxatini formatlash
      const selectedDaysLabels = formData.selectedDays.map(day => {
        const dayObj = weekDays.find(d => d.value === day);
        return dayObj ? dayObj.label : day;
      }).join(', ');
      
      const scheduleString = `${selectedDaysLabels} — ${formData.start_time}-${formData.end_time}`;

      const selectedTeacher = teachers.find(t => t.id === formData.teacher_id);
      const selectedCourse = courses.find(c => c.id === formData.course_id);

      // selectedDays, start_time, end_time ni submitData dan olib tashlash (groups jadvalida saqlanmaydi)
      const { selectedDays, start_time, end_time, ...restFormData } = formData;
      
      const submitData = {
        ...restFormData,
        schedule: scheduleString,
        course_id: formData.course_id || null,
      };
      
      let groupId: string;
      
      if (editingGroup) {
        const { data, error } = await supabase
          .from('groups')
          .update(submitData)
          .eq('id', editingGroup.id)
          .select()
          .single();

        if (error) throw error;
        groupId = editingGroup.id;
        toast({ title: 'Yangilandi', description: 'Guruh ma\'lumotlari yangilandi' });
      } else {
        const { data, error } = await supabase
          .from('groups')
          .insert([submitData])
          .select()
          .single();

        if (error) throw error;
        groupId = data.id;
        toast({ title: 'Qo\'shildi', description: 'Yangi guruh yaratildi' });
      }

      // Schedule entries ga avtomatik qo'shish
      if (selectedTeacher && formData.selectedDays.length > 0) {
        const courseName = selectedCourse 
          ? (selectedCourse.name_uz || formData.name)
          : formData.name;
        
        await syncGroupToScheduleEntries(
          groupId,
          courseName,
          selectedTeacher.name,
          selectedCourse?.name_uz || null,
          formData.selectedDays,
          formData.start_time,
          formData.end_time,
          formData.room
        );
      }

      setDialogOpen(false);
      resetForm();
      loadData();
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.error(error);
      }
      toast({ title: 'Xatolik', description: error.message || 'Ma\'lumotlarni saqlab bo\'lmadi', variant: 'destructive' });
    }
  };

  const handleEdit = (group: Group) => {
    setEditingGroup(group);
    const parsedDays = parseScheduleDays(group.schedule);
    const parsedTime = parseScheduleTime(group.schedule);
    
    setFormData({
      name: group.name,
      teacher_id: group.teacher_id,
      course_id: group.course_id || '',
      schedule: group.schedule,
      room: group.room,
      max_students: group.max_students,
      current_students: group.current_students,
      status: group.status,
      attendance_rate: group.attendance_rate,
      monthly_revenue: group.monthly_revenue,
      selectedDays: parsedDays.length > 0 ? parsedDays : [],
      start_time: parsedTime.start,
      end_time: parsedTime.end,
    });
    setDialogOpen(true);
  };

  // Groups dan schedule_entries ga avtomatik qo'shish
  const syncGroupToScheduleEntries = async (groupId: string, groupName: string, teacherName: string, courseName: string | null, days: string[], startTime: string, endTime: string, room: string) => {
    try {
      // Avval bu guruh uchun eski schedule_entries larni o'chirish
      await supabase
        .from('schedule_entries')
        .delete()
        .eq('teacher_name', teacherName)
        .eq('title_uz', groupName);

      // Har bir tanlangan kun uchun schedule_entry yaratish
      if (days.length > 0) {
        const entries = days.map(day => ({
          day_of_week: day,
          start_time: startTime,
          end_time: endTime,
          title_uz: groupName,
          title_ru: groupName,
          title_en: groupName,
          room: room || null,
          format: 'offline',
          teacher_name: teacherName,
        }));

        const { error } = await supabase
          .from('schedule_entries')
          .insert(entries);

        if (error) {
          console.error('Error syncing schedule entries:', error);
        }
      }
    } catch (error) {
      console.error('Error in syncGroupToScheduleEntries:', error);
    }
  };

  const handleDelete = async (group: Group) => {
    if (!confirm(`"${group.name}" guruhini o'chirishni istaysizmi?`)) return;
    try {
      // Avval schedule_entries dan bu guruhga tegishli jadvallarni o'chirish
      if (group.teachers?.name) {
        await supabase
          .from('schedule_entries')
          .delete()
          .eq('teacher_name', group.teachers.name)
          .eq('title_uz', group.name);
      }

      // Keyin guruhni o'chirish
      const { error } = await supabase
        .from('groups')
        .delete()
        .eq('id', group.id);

      if (error) throw error;
      toast({ title: 'O\'chirildi', description: 'Guruh muvaffaqiyatli o\'chirildi' });
      loadData();
    } catch (error: any) {
      toast({ title: 'Xatolik', description: error.message, variant: 'destructive' });
    }
  };

  const filteredGroups = useMemo(() => {
    return groups
      .filter((group) => (statusFilter === 'all' ? true : group.status === statusFilter))
      .filter((group) => group.name.toLowerCase().includes(searchValue.toLowerCase()));
  }, [groups, statusFilter, searchValue]);

  const stats = useMemo(() => {
    const active = groups.filter((group) => group.status === 'active').length;
    const capacity = groups.reduce(
      (acc, group) => acc + (group.max_students ? group.current_students / group.max_students : 0),
      0
    );
    const avgCapacity = groups.length ? Math.round((capacity / groups.length) * 100) : 0;
    const revenue = groups.reduce((sum, group) => sum + Number(group.monthly_revenue), 0);
    return { total: groups.length, active, closed: groups.length - active, avgCapacity, revenue };
  }, [groups]);

  return (
    <AdminLayout>
      <div className="space-y-4 sm:space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in-down">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Guruhlar
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">Guruhlarni boshqaring</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="w-full sm:w-auto text-sm">
                <Plus className="mr-2 h-4 w-4" />
                Yangi guruh
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] sm:max-w-3xl max-h-[95vh] overflow-y-auto p-3 sm:p-4 md:p-6">
              <DialogHeader>
                <DialogTitle className="text-sm sm:text-base md:text-lg">{editingGroup ? 'Guruhni tahrirlash' : 'Yangi guruh yaratish'}</DialogTitle>
                <DialogDescription className="text-[11px] sm:text-xs md:text-sm">Ustoz, jadval va sig\'im ma\'lumotlarini kiriting</DialogDescription>
              </DialogHeader>
              <form className="space-y-3 sm:space-y-4" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-2">
                    <Label>Guruh nomi</Label>
                    <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Kurs</Label>
                    <Select
                      value={formData.course_id || 'none'}
                      onValueChange={(value) => setFormData({ ...formData, course_id: value === 'none' ? '' : value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Kursni tanlang" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Kurs tanlanmagan</SelectItem>
                        {courses.map((course) => (
                          <SelectItem key={course.id} value={course.id}>
                            {course.name_uz}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Ustoz</Label>
                    <Select
                      value={formData.teacher_id}
                      onValueChange={(value) => setFormData({ ...formData, teacher_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Ustozni tanlang" />
                      </SelectTrigger>
                      <SelectContent>
                        {teachers.length === 0 ? (
                          <SelectItem value="no-teachers" disabled>
                            O'qituvchilar topilmadi
                          </SelectItem>
                        ) : (
                          teachers.map((teacher) => (
                            <SelectItem key={teacher.id} value={teacher.id}>
                              {teacher.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Dars kunlari */}
                  <div className="space-y-2 md:col-span-2">
                    <Label className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      Dars kunlari <span className="text-destructive">*</span>
                    </Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-4 rounded-lg border bg-muted/30">
                      {weekDays.map((day) => (
                        <div key={day.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={`day-${day.value}`}
                            checked={formData.selectedDays.includes(day.value)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setFormData({
                                  ...formData,
                                  selectedDays: [...formData.selectedDays, day.value],
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  selectedDays: formData.selectedDays.filter((d) => d !== day.value),
                                });
                              }
                            }}
                          />
                          <label
                            htmlFor={`day-${day.value}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            {day.label}
                          </label>
                        </div>
                      ))}
                    </div>
                    {formData.selectedDays.length === 0 && (
                      <p className="text-xs text-destructive mt-1">Kamida bitta kunni tanlang</p>
                    )}
                  </div>

                  {/* Vaqt sozlamalari */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" />
                      Boshlanish vaqti <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      type="time"
                      value={formData.start_time}
                      onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" />
                      Tugash vaqti <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      type="time"
                      value={formData.end_time}
                      onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Xona</Label>
                    <Input value={formData.room} onChange={(e) => setFormData({ ...formData, room: e.target.value })} placeholder="Lab 201" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Maksimal o'quvchilar</Label>
                    <Input
                      type="number"
                      value={formData.max_students}
                      onChange={(e) => setFormData({ ...formData, max_students: Number(e.target.value) })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as 'active' | 'closed' })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Attendance (%)</Label>
                    <Input
                      type="number"
                      value={formData.attendance_rate}
                      onChange={(e) => setFormData({ ...formData, attendance_rate: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Bekor qilish
                  </Button>
                  <Button type="submit">
                    {editingGroup ? 'Yangilash' : 'Qo\'shish'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
          <div className="stagger-item">
            <StatCard title="Jami guruhlar" value={stats.total} note="Yaratilgan bo'limlar" />
          </div>
          <div className="stagger-item">
            <StatCard title="Faol guruhlar" value={stats.active} note="Dars davom etmoqda" accent="text-emerald-600" />
          </div>
          <div className="stagger-item">
            <StatCard title="Yopilgan" value={stats.closed} note="Rejalashtirilgan / yakunlangan" accent="text-amber-600" />
          </div>
          <div className="stagger-item">
            <StatCard title="O'rtacha sig'im" value={`${stats.avgCapacity}%`} note="Bandlik koeffitsienti" />
          </div>
        </div>

        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">Guruhlar jadvali</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
            <div className="flex flex-col md:flex-row gap-3">
              <Input
                placeholder="Qidirish..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="md:w-1/3"
              />
              <Select value={statusFilter} onValueChange={(value: 'all' | 'active' | 'closed') => setStatusFilter(value)}>
                <SelectTrigger className="md:w-48">
                  <SelectValue placeholder="Holat" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Barchasi</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-10 text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Yuklanmoqda...
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="min-w-[700px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs sm:text-sm">Guruh</TableHead>
                        <TableHead className="text-xs sm:text-sm hidden lg:table-cell">Kurs</TableHead>
                        <TableHead className="text-xs sm:text-sm hidden md:table-cell">Ustoz</TableHead>
                        <TableHead className="text-xs sm:text-sm hidden lg:table-cell">Jadval</TableHead>
                        <TableHead className="text-xs sm:text-sm hidden xl:table-cell">Xona</TableHead>
                        <TableHead className="text-xs sm:text-sm">Sig'im</TableHead>
                        <TableHead className="text-xs sm:text-sm">Status</TableHead>
                        <TableHead className="text-right text-xs sm:text-sm">Amallar</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredGroups.map((group, index) => (
                        <TableRow key={group.id} className="table-row-hover stagger-item" style={{ animationDelay: `${index * 0.02}s` }}>
                          <TableCell className="font-semibold text-xs sm:text-sm">
                            <div>
                              <div>{group.name}</div>
                              <div className="lg:hidden mt-1 text-xs text-muted-foreground">
                                {(group.courses as any)?.name_uz || 'Kurs tanlanmagan'}
                              </div>
                              <div className="md:hidden mt-1 text-xs text-muted-foreground">
                                {(group.teachers as any)?.name || 'Noma\'lum'}
                              </div>
                              <div className="lg:hidden mt-1 text-xs text-muted-foreground">
                                {group.schedule}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-xs sm:text-sm">
                            {(group.courses as any)?.name_uz || <span className="text-muted-foreground">Kurs tanlanmagan</span>}
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-xs sm:text-sm">{(group.teachers as any)?.name || 'Noma\'lum'}</TableCell>
                          <TableCell className="hidden lg:table-cell text-xs sm:text-sm text-muted-foreground">{group.schedule}</TableCell>
                          <TableCell className="hidden xl:table-cell text-xs sm:text-sm">{group.room}</TableCell>
                          <TableCell className="text-xs sm:text-sm">
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {group.current_students}/{group.max_students}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {group.max_students ? Math.round((group.current_students / group.max_students) * 100) : 0}% bandlik
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={group.status === 'active' ? 'default' : 'secondary'} className="text-[10px] sm:text-xs">
                              {group.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel className="text-xs">Amallar</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => setLocation(`/admin/groups/${group.id}`)} className="text-xs">Tafsilotlar</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEdit(group)} className="text-xs">Tahrirlash</DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive text-xs" onClick={() => handleDelete(group)}>
                                  O'chirish
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

function StatCard({ title, value, note, accent }: { title: string; value: number | string; note: string; accent?: string }) {
  return (
    <Card>
      <CardHeader className="pb-2 p-4 sm:p-6">
        <CardTitle className="text-xs sm:text-sm text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0">
        <p className={`text-xl sm:text-2xl font-bold break-words ${accent || ''}`}>{value}</p>
        <p className="text-xs text-muted-foreground mt-1 sm:mt-2">{note}</p>
      </CardContent>
    </Card>
  );
}

export default function AdminGroupsPage() {
  return (
    <ProtectedRoute>
      <GroupsContent />
    </ProtectedRoute>
  );
}


