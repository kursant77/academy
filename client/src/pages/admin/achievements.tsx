import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AdminLayout } from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import type { Achievement, InsertAchievement, Course } from '@shared/schema';
import { ImageUpload } from '@/components/ImageUpload';
import { Plus, Pencil, Trash2 } from 'lucide-react';

function AchievementsContent() {
  const [achievements, setAchievements] = useState<(Achievement & { course?: Course })[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null);
  const [formData, setFormData] = useState<InsertAchievement>({
    title: '',
    title_uz: '',
    title_ru: '',
    title_en: '',
    description: '',
    description_uz: '',
    description_ru: '',
    description_en: '',
    image_url: null,
    student_name: '',
    student_name_uz: '',
    student_name_ru: '',
    student_name_en: '',
    course_id: null,
  });
  const { toast } = useToast();

  useEffect(() => {
    loadAchievements();
    loadCourses();
  }, []);

  const loadAchievements = async () => {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*, courses(*)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAchievements(data || []);
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

  const loadCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('id, name_uz')
        .order('name_uz');

      if (error) throw error;
      setCourses(data || []);
    } catch (error: any) {
      console.error('Error loading courses:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAchievement) {
        const { error } = await supabase
          .from('achievements')
          .update(formData)
          .eq('id', editingAchievement.id);

        if (error) throw error;
        toast({
          title: 'Muvaffaqiyatli',
          description: 'Yutuq yangilandi',
        });
      } else {
        const { error } = await supabase.from('achievements').insert([formData]);

        if (error) throw error;
        toast({
          title: 'Muvaffaqiyatli',
          description: 'Yutuq qo\'shildi',
        });
      }

      setIsDialogOpen(false);
      resetForm();
      loadAchievements();
    } catch (error: any) {
      toast({
        title: 'Xatolik',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu yutuqni o\'chirishni xohlaysizmi?')) return;

    try {
      const { error } = await supabase.from('achievements').delete().eq('id', id);

      if (error) throw error;
      toast({
        title: 'Muvaffaqiyatli',
        description: 'Yutuq o\'chirildi',
      });
      loadAchievements();
    } catch (error: any) {
      toast({
        title: 'Xatolik',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (achievement: Achievement) => {
    setEditingAchievement(achievement);
    setFormData({
      title: achievement.title,
      title_uz: achievement.title_uz,
      title_ru: achievement.title_ru,
      title_en: achievement.title_en,
      description: achievement.description,
      description_uz: achievement.description_uz,
      description_ru: achievement.description_ru,
      description_en: achievement.description_en,
      image_url: achievement.image_url,
      student_name: achievement.student_name,
      student_name_uz: achievement.student_name_uz,
      student_name_ru: achievement.student_name_ru,
      student_name_en: achievement.student_name_en,
      course_id: achievement.course_id,
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingAchievement(null);
    setFormData({
      title: '',
      title_uz: '',
      title_ru: '',
      title_en: '',
      description: '',
      description_uz: '',
      description_ru: '',
      description_en: '',
      image_url: null,
      student_name: '',
      student_name_uz: '',
      student_name_ru: '',
      student_name_en: '',
      course_id: null,
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Yutuqlar boshqaruvi</h2>
            <p className="text-muted-foreground">
              Talabalar erishgan natijalarni qo'shing va tahrirlang
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Yangi yutuq
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingAchievement ? 'Yutuqni tahrirlash' : 'Yangi yutuq qo\'shish'}
                </DialogTitle>
                <DialogDescription>
                  Yutuq ma'lumotlarini to'ldiring
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Sarlavha (UZ)</Label>
                    <Input
                      value={formData.title_uz}
                      onChange={(e) => setFormData({ ...formData, title_uz: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Sarlavha (RU)</Label>
                    <Input
                      value={formData.title_ru}
                      onChange={(e) => setFormData({ ...formData, title_ru: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Sarlavha (EN)</Label>
                    <Input
                      value={formData.title_en}
                      onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>O'quvchi ismi (UZ)</Label>
                    <Input
                      value={formData.student_name_uz}
                      onChange={(e) => setFormData({ ...formData, student_name_uz: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>O'quvchi ismi (RU)</Label>
                    <Input
                      value={formData.student_name_ru}
                      onChange={(e) => setFormData({ ...formData, student_name_ru: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>O'quvchi ismi (EN)</Label>
                    <Input
                      value={formData.student_name_en}
                      onChange={(e) => setFormData({ ...formData, student_name_en: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Kurs</Label>
                    <Select
                      value={formData.course_id || undefined}
                      onValueChange={(value) => {
                        if (value === 'none') {
                          setFormData({ ...formData, course_id: null });
                        } else {
                          setFormData({ ...formData, course_id: value || null });
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Kurs tanlang (ixtiyoriy)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Kurs yo'q</SelectItem>
                        {courses.length === 0 ? (
                          <SelectItem value="no-courses" disabled>
                            Kurslar topilmadi
                          </SelectItem>
                        ) : (
                          courses.map((course) => (
                            <SelectItem key={course.id} value={course.id}>
                              {course.name_uz || course.name || 'Kurs'}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <ImageUpload
                      value={formData.image_url}
                      onChange={(url) => setFormData({ ...formData, image_url: url })}
                      folder="achievements"
                      label="Yutuq rasmi"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Tavsif (UZ)</Label>
                  <Textarea
                    value={formData.description_uz}
                    onChange={(e) => setFormData({ ...formData, description_uz: e.target.value })}
                    required
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tavsif (RU)</Label>
                  <Textarea
                    value={formData.description_ru}
                    onChange={(e) => setFormData({ ...formData, description_ru: e.target.value })}
                    required
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tavsif (EN)</Label>
                  <Textarea
                    value={formData.description_en}
                    onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                    required
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Bekor qilish
                  </Button>
                  <Button type="submit">
                    {editingAchievement ? 'Yangilash' : 'Qo\'shish'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Yutuqlar ro'yxati</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Yuklanmoqda...</div>
            ) : achievements.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Hozircha yutuqlar yo'q
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sarlavha</TableHead>
                    <TableHead>O'quvchi</TableHead>
                    <TableHead>Kurs</TableHead>
                    <TableHead>Amallar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {achievements.map((achievement) => (
                    <TableRow key={achievement.id}>
                      <TableCell>{achievement.title_uz}</TableCell>
                      <TableCell>{achievement.student_name_uz}</TableCell>
                      <TableCell>{(achievement.course as any)?.name_uz || 'Kurs yo\'q'}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(achievement)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(achievement.id)}
                          >
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

export default function AdminAchievements() {
  return (
    <ProtectedRoute>
      <AchievementsContent />
    </ProtectedRoute>
  );
}

