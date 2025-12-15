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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
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
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error in achievements page:', errorMessage);
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
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error in achievements page:', errorMessage);
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
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error in achievements page:', errorMessage);
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
      const { error } = await supabase.from('achievements').delete().eq('id', deleteId);

      if (error) throw error;
      toast({
        title: 'Muvaffaqiyatli',
        description: 'Yutuq o\'chirildi',
      });
      loadAchievements();
      setDeleteDialogOpen(false);
      setDeleteId(null);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error in achievements page:', errorMessage);
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
            <DialogContent className="max-w-[95vw] sm:max-w-2xl lg:max-w-3xl max-h-[95vh] overflow-y-auto p-4 sm:p-5 md:p-6">
              <DialogHeader className="space-y-1 sm:space-y-2 pb-2 sm:pb-3">
                <DialogTitle className="text-base sm:text-lg md:text-xl">
                  {editingAchievement ? 'Yutuqni tahrirlash' : 'Yangi yutuq qo\'shish'}
                </DialogTitle>
                <DialogDescription className="text-xs sm:text-sm">
                  Yutuq ma'lumotlarini to'ldiring
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 md:space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm sm:text-base font-medium">Sarlavha (UZ) *</Label>
                    <Input
                      value={formData.title_uz}
                      onChange={(e) => setFormData({ ...formData, title_uz: e.target.value })}
                      required
                      className="h-11 sm:h-10 text-base sm:text-sm"
                      placeholder="Yutuq sarlavhasi (O'zbekcha)"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm sm:text-base font-medium">Sarlavha (RU) *</Label>
                    <Input
                      value={formData.title_ru}
                      onChange={(e) => setFormData({ ...formData, title_ru: e.target.value })}
                      required
                      className="h-11 sm:h-10 text-base sm:text-sm"
                      placeholder="Yutuq sarlavhasi (Ruscha)"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm sm:text-base font-medium">Sarlavha (EN) *</Label>
                    <Input
                      value={formData.title_en}
                      onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                      required
                      className="h-11 sm:h-10 text-base sm:text-sm"
                      placeholder="Yutuq sarlavhasi (Inglizcha)"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm sm:text-base font-medium">O'quvchi ismi (UZ) *</Label>
                    <Input
                      value={formData.student_name_uz}
                      onChange={(e) => setFormData({ ...formData, student_name_uz: e.target.value })}
                      required
                      className="h-11 sm:h-10 text-base sm:text-sm"
                      placeholder="O'quvchi to'liq ismi (O'zbekcha)"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm sm:text-base font-medium">O'quvchi ismi (RU) *</Label>
                    <Input
                      value={formData.student_name_ru}
                      onChange={(e) => setFormData({ ...formData, student_name_ru: e.target.value })}
                      required
                      className="h-11 sm:h-10 text-base sm:text-sm"
                      placeholder="O'quvchi to'liq ismi (Ruscha)"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm sm:text-base font-medium">O'quvchi ismi (EN) *</Label>
                    <Input
                      value={formData.student_name_en}
                      onChange={(e) => setFormData({ ...formData, student_name_en: e.target.value })}
                      required
                      className="h-11 sm:h-10 text-base sm:text-sm"
                      placeholder="O'quvchi to'liq ismi (Inglizcha)"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm sm:text-base font-medium">Kurs</Label>
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
                      <SelectTrigger className="h-11 sm:h-10 text-base sm:text-sm">
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
                  <Label className="text-sm sm:text-base font-medium">Tavsif (UZ) *</Label>
                  <Textarea
                    value={formData.description_uz}
                    onChange={(e) => setFormData({ ...formData, description_uz: e.target.value })}
                    required
                    rows={4}
                    className="text-base sm:text-sm min-h-[100px] resize-y"
                    placeholder="Yutuq haqida batafsil ma'lumot (O'zbekcha)"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm sm:text-base font-medium">Tavsif (RU) *</Label>
                  <Textarea
                    value={formData.description_ru}
                    onChange={(e) => setFormData({ ...formData, description_ru: e.target.value })}
                    required
                    rows={4}
                    className="text-base sm:text-sm min-h-[100px] resize-y"
                    placeholder="Yutuq haqida batafsil ma'lumot (Ruscha)"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm sm:text-base font-medium">Tavsif (EN) *</Label>
                  <Textarea
                    value={formData.description_en}
                    onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                    required
                    rows={4}
                    className="text-base sm:text-sm min-h-[100px] resize-y"
                    placeholder="Yutuq haqida batafsil ma'lumot (Inglizcha)"
                  />
                </div>
                <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                    className="w-full sm:w-auto h-11 sm:h-10 text-base sm:text-sm"
                  >
                    Bekor qilish
                  </Button>
                  <Button 
                    type="submit"
                    className="w-full sm:w-auto h-11 sm:h-10 text-base sm:text-sm"
                  >
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
              <>
                {/* Mobile Card View */}
                <div className="md:hidden space-y-3">
                  {achievements.map((achievement) => (
                    <Card key={achievement.id} className="border-2 border-border/50 hover:border-primary/30 transition-all hover:shadow-md">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          {achievement.image_url && (
                            <div className="aspect-video w-full overflow-hidden rounded-lg">
                              <img
                                src={achievement.image_url}
                                alt={achievement.title_uz}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          )}
                          <div>
                            <h3 className="font-semibold text-sm mb-2">{achievement.title_uz}</h3>
                            <div className="space-y-1.5 text-xs text-muted-foreground">
                              <div className="flex items-center justify-between">
                                <span>O'quvchi:</span>
                                <span className="font-medium text-foreground">{achievement.student_name_uz}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span>Kurs:</span>
                                <span className="font-medium text-foreground">
                                  {(achievement.course as { name_uz?: string } | null)?.name_uz || 'Kurs yo\'q'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 pt-2 border-t">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 h-8 text-xs"
                              onClick={() => handleEdit(achievement)}
                            >
                              <Pencil className="h-3 w-3 mr-1" />
                              Tahrirlash
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 h-8 text-xs text-destructive hover:text-destructive"
                              onClick={() => handleDeleteClick(achievement.id)}
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              O'chirish
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block">
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
                          <TableCell>{(achievement.course as { name_uz?: string } | null)?.name_uz || 'Kurs yo\'q'}</TableCell>
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
                                onClick={() => handleDeleteClick(achievement.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>O'chirishni tasdiqlash</AlertDialogTitle>
              <AlertDialogDescription>
                Bu yutuqni o'chirishni xohlaysizmi? Bu amalni qaytarib bo'lmaydi.
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

export default function AdminAchievements() {
  return (
    <ProtectedRoute>
      <AchievementsContent />
    </ProtectedRoute>
  );
}

