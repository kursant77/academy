import { useEffect, useState } from 'react';
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
      const { data, error } = await supabase
        .from('schedule_entries')
        .select('*')
        .order('day_of_week')
        .order('start_time');

      if (error) throw error;
      setEntries(data || []);
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

  const handleDelete = async (id: string) => {
    if (!confirm('Bu jadval elementini o\'chirishni xohlaysizmi?')) return;

    try {
      const { error } = await supabase.from('schedule_entries').delete().eq('id', id);

      if (error) throw error;
      toast({
        title: 'Muvaffaqiyatli',
        description: 'Jadval elementi o\'chirildi',
      });
      loadEntries();
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
                    <TableHead>O'qituvchi</TableHead>
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
                      <TableCell>{entry.teacher_name || '-'}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(entry)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(entry.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
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

