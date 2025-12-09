import { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AdminLayout } from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import type { InsertScheduleEntry, ScheduleEntry } from '@shared/schema';
import { Plus, Pencil, Trash2 } from 'lucide-react';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function ScheduleContent() {
  const [entries, setEntries] = useState<ScheduleEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ScheduleEntry | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState<InsertScheduleEntry>({
    day_of_week: 'Monday',
    start_time: '09:00',
    end_time: '10:30',
    title_uz: '',
    title_ru: '',
    title_en: '',
    room: null,
    format: null,
    teacher_name: null,
  });
  const { toast } = useToast();

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      // Schedule entries va active groups ni olib kelish
      const [entriesRes, groupsRes] = await Promise.all([
        supabase
          .from('schedule_entries')
          .select('*')
          .order('day_of_week')
          .order('start_time'),
        supabase
          .from('groups')
          .select(`
            *,
            teachers:teacher_id (name),
            courses:course_id (name_uz, name_ru, name_en)
          `)
          .eq('status', 'active')
      ]);

      let allEntries: ScheduleEntry[] = entriesRes.data || [];

      // Groups dan schedule entries ga aylantirish
      if (!groupsRes.error && groupsRes.data) {
        groupsRes.data.forEach((group: any) => {
          const teacherName = group.teachers?.name || '';
          const courseName = group.courses?.name_uz || group.name;

          // Schedule stringdan kunlarni parse qilish
          const scheduleStr = group.schedule.toLowerCase();
          const dayMap: Record<string, string> = {
            'dushanba': 'Monday',
            'seshanba': 'Tuesday',
            'chorshanba': 'Wednesday',
            'payshanba': 'Thursday',
            'juma': 'Friday',
            'shanba': 'Saturday',
            'yakshanba': 'Sunday',
          };

          const days: string[] = [];
          for (const [uz, en] of Object.entries(dayMap)) {
            if (scheduleStr.includes(uz)) {
              days.push(en);
            }
          }

          // Vaqtni parse qilish
          const timeMatch = group.schedule.match(/(\d{1,2}:\d{2})\s*[-–—]\s*(\d{1,2}:\d{2})/);
          if (timeMatch && days.length > 0) {
            const startTime = timeMatch[1];
            const endTime = timeMatch[2];

            // Har bir kun uchun entry yaratish
            days.forEach(day => {
              allEntries.push({
                id: `group-${group.id}-${day}`,
                day_of_week: day,
                start_time: startTime,
                end_time: endTime,
                title_uz: courseName,
                title_ru: group.courses?.name_ru || courseName,
                title_en: group.courses?.name_en || courseName,
                room: group.room || null,
                format: 'offline',
                teacher_name: teacherName,
                created_at: group.created_at,
                updated_at: group.updated_at,
              });
            });
          }
        });
      }

      // Kunlar va vaqtlar bo'yicha tartiblash
      allEntries.sort((a, b) => {
        const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const dayDiff = dayOrder.indexOf(a.day_of_week) - dayOrder.indexOf(b.day_of_week);
        if (dayDiff !== 0) return dayDiff;
        return a.start_time.localeCompare(b.start_time);
      });

      setEntries(allEntries);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingEntry) {
        const { error } = await supabase
          .from('schedule_entries')
          .update(formData)
          .eq('id', editingEntry.id);

        if (error) throw error;
        toast({
          title: 'Muvaffaqiyatli',
          description: 'Jadval elementi yangilandi',
        });
      } else {
        const { error } = await supabase.from('schedule_entries').insert([formData]);

        if (error) throw error;
        toast({
          title: 'Muvaffaqiyatli',
          description: 'Jadval elementi qo\'shildi',
        });
      }

      setIsDialogOpen(false);
      resetForm();
      loadEntries();
    } catch (error: any) {
      toast({
        title: 'Xatolik',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;

    try {
      // Agar groups dan kelgan entry bo'lsa, schedule_entries dan o'chirish (guruh o'zgartirmaydi)
      if (deleteId.startsWith('group-')) {
        // Group ID va day ni extract qilish
        const parts = deleteId.replace('group-', '').split('-');
        const groupId = parts[0];
        const day = parts.slice(1).join('-');

        // Schedule_entries dan bu guruh va kun uchun entry ni topish va o'chirish
        const entry = entries.find(e => e.id === deleteId);
        if (entry) {
          const { error } = await supabase
            .from('schedule_entries')
            .delete()
            .eq('teacher_name', entry.teacher_name || '')
            .eq('title_uz', entry.title_uz)
            .eq('day_of_week', entry.day_of_week)
            .eq('start_time', entry.start_time)
            .eq('end_time', entry.end_time);

          if (error) throw error;
          toast({
            title: 'Muvaffaqiyatli',
            description: 'Jadval elementi o\'chirildi',
          });
        }
      } else {
        const { error } = await supabase.from('schedule_entries').delete().eq('id', deleteId);
        if (error) throw error;
        toast({
          title: 'Muvaffaqiyatli',
          description: 'Jadval elementi o\'chirildi',
        });
      }
      loadEntries();
      setDeleteDialogOpen(false);
      setDeleteId(null);
    } catch (error: any) {
      toast({
        title: 'Xatolik',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (entry: ScheduleEntry) => {
    setEditingEntry(entry);
    setFormData({
      day_of_week: entry.day_of_week,
      start_time: entry.start_time,
      end_time: entry.end_time,
      title_uz: entry.title_uz,
      title_ru: entry.title_ru,
      title_en: entry.title_en,
      room: entry.room,
      format: entry.format,
      teacher_name: entry.teacher_name,
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingEntry(null);
    setFormData({
      day_of_week: 'Monday',
      start_time: '09:00',
      end_time: '10:30',
      title_uz: '',
      title_ru: '',
      title_en: '',
      room: null,
      format: null,
      teacher_name: null,
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Dars jadvali boshqaruvi</h2>
            <p className="text-muted-foreground">
              Kunlar va vaqtlar bo'yicha barcha mashg'ulotlarni boshqaring
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Yangi mashg'ulot
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingEntry ? 'Mashg\'ulotni tahrirlash' : 'Yangi mashg\'ulot qo\'shish'}
                </DialogTitle>
                <DialogDescription>
                  Dars jadvali uchun kerakli ma'lumotlarni kiriting
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Hafta kuni</Label>
                    <select
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={formData.day_of_week}
                      onChange={(e) => setFormData({ ...formData, day_of_week: e.target.value })}
                    >
                      {days.map((day) => (
                        <option key={day} value={day}>
                          {day}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Format</Label>
                    <Input
                      value={formData.format || ''}
                      onChange={(e) => setFormData({ ...formData, format: e.target.value || null })}
                      placeholder="Online / Offline"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Boshlanish vaqti</Label>
                    <Input
                      value={formData.start_time}
                      onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tugash vaqti</Label>
                    <Input
                      value={formData.end_time}
                      onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Nomi (UZ)</Label>
                    <Input
                      value={formData.title_uz}
                      onChange={(e) => setFormData({ ...formData, title_uz: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Nomi (RU)</Label>
                    <Input
                      value={formData.title_ru}
                      onChange={(e) => setFormData({ ...formData, title_ru: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Nomi (EN)</Label>
                    <Input
                      value={formData.title_en}
                      onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Xona</Label>
                    <Input
                      value={formData.room || ''}
                      onChange={(e) => setFormData({ ...formData, room: e.target.value || null })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>O'qituvchi</Label>
                    <Input
                      value={formData.teacher_name || ''}
                      onChange={(e) => setFormData({ ...formData, teacher_name: e.target.value || null })}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Bekor qilish
                  </Button>
                  <Button type="submit">
                    {editingEntry ? 'Yangilash' : 'Qo\'shish'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Jadval elementlari</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Yuklanmoqda...</div>
            ) : entries.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Hozircha jadval ma'lumotlari yo'q
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kuni</TableHead>
                    <TableHead>Vaqt</TableHead>
                    <TableHead>Nomi</TableHead>
                    <TableHead>Xona</TableHead>
                    <TableHead>O'qituvchi</TableHead>
                    <TableHead>Manba</TableHead>
                    <TableHead>Amallar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>{entry.day_of_week}</TableCell>
                      <TableCell>
                        {entry.start_time} - {entry.end_time}
                      </TableCell>
                      <TableCell>{entry.title_uz}</TableCell>
                      <TableCell>{entry.room || '-'}</TableCell>
                      <TableCell>{entry.teacher_name || '-'}</TableCell>
                      <TableCell>
                        {entry.id.startsWith('group-') ? (
                          <Badge variant="secondary" className="text-xs">
                            Guruh
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            Qo'lda
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {!entry.id.startsWith('group-') && (
                            <>
                              <Button variant="ghost" size="sm" onClick={() => handleEdit(entry)} title="Tahrirlash">
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(entry.id)} title="O'chirish">
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </>
                          )}
                          {entry.id.startsWith('group-') && (
                            <>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleDeleteClick(entry.id)} 
                                title="O'chirish (faqat jadvaldan)"
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>O'chirishni tasdiqlash</AlertDialogTitle>
              <AlertDialogDescription>
                Bu jadval elementini o'chirishni xohlaysizmi? Bu amalni qaytarib bo'lmaydi.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                O'chirish
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
}

export default function AdminSchedule() {
  return (
    <ProtectedRoute>
      <ScheduleContent />
    </ProtectedRoute>
  );
}

