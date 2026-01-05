import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AdminLayout } from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { useMultipleOptions, OPTION_TYPES } from '@/hooks/use-options';
import { supabase } from '@/lib/supabase';
import type { Course, InsertCourse } from '@shared/schema';
import { ImageUpload } from '@/components/ImageUpload';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

function CoursesContent() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null);
  const [formData, setFormData] = useState<InsertCourse>({
    name: '',
    name_uz: '',
    name_ru: '',
    name_en: '',
    description: '',
    description_uz: '',
    description_ru: '',
    description_en: '',
    category: '',
    category_id: null,
    duration: '',
    price: '',
    level: '',
    teacher_id: '',
    schedule: '',
    image_url: null,
    featured: false,
    is_published: true,
  });
  const { toast } = useToast();
  
  // System options dan kategoriya va darajalarni olish
  const { options } = useMultipleOptions([OPTION_TYPES.COURSE_CATEGORY, OPTION_TYPES.COURSE_LEVEL]);
  const categories = options[OPTION_TYPES.COURSE_CATEGORY] || [];
  const levels = options[OPTION_TYPES.COURSE_LEVEL] || [];

  useEffect(() => {
    loadCourses();
    loadTeachers();
  }, []);

  const loadCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCourses(data || []);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error loading courses:', errorMessage);
      toast({
        title: 'Xatolik',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadTeachers = async () => {
    try {
      const { data, error } = await supabase
        .from('teachers')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setTeachers(data || []);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error loading courses:', errorMessage);
      console.error('Error loading teachers:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Ma'lumotlarni tozalash - faqat kerakli maydonlarni yuborish
      const submitData: any = {
        name: formData.name || '',
        name_uz: formData.name_uz || '',
        name_ru: formData.name_ru || '',
        name_en: formData.name_en || '',
        description: formData.description || '',
        description_uz: formData.description_uz || '',
        description_ru: formData.description_ru || '',
        description_en: formData.description_en || '',
        category: formData.category || '',
        duration: formData.duration || '',
        price: formData.price || '',
        level: formData.level || '',
        schedule: formData.schedule || '',
        is_published: formData.is_published !== undefined ? formData.is_published : true,
        featured: formData.featured || false,
      };

      // Required maydonlar
      if (formData.teacher_id && formData.teacher_id.trim() !== '') {
        submitData.teacher_id = formData.teacher_id;
      } else {
        throw new Error('O\'qituvchi tanlash majburiy');
      }

      // Ixtiyoriy maydonlar - category_id ni olib tashlash
      // Agar category_id ustuni jadvalda mavjud bo'lmasa, uni yubormaymiz
      // Faqat category (text) maydonini ishlatamiz
      // if (formData.category_id) {
      //   submitData.category_id = formData.category_id;
      // }
      
      if (formData.image_url) {
        submitData.image_url = formData.image_url;
      }

      if (editingCourse) {
        const { error } = await supabase
          .from('courses')
          .update(submitData)
          .eq('id', editingCourse.id);

        if (error) {
          console.error('Update error:', error);
          throw error;
        }
        toast({
          title: 'Muvaffaqiyatli',
          description: 'Kurs yangilandi',
        });
      } else {
        const { error } = await supabase.from('courses').insert([submitData]);

        if (error) {
          console.error('Insert error:', error);
          throw error;
        }
        toast({
          title: 'Muvaffaqiyatli',
          description: 'Kurs qo\'shildi va websaytda ko\'rinadi',
        });
      }

      setIsDialogOpen(false);
      resetForm();
      loadCourses();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error loading courses:', errorMessage);
      console.error('Submit error:', error);
      toast({
        title: 'Xatolik',
        description: error.message || 'Kurs qo\'shishda xatolik yuz berdi',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteClick = (id: string) => {
    setCourseToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!courseToDelete) return;
    try {
      const { error } = await supabase.from('courses').delete().eq('id', courseToDelete);

      if (error) throw error;
      toast({
        title: 'Muvaffaqiyatli',
        description: 'Kurs o\'chirildi',
      });
      loadCourses();
      setDeleteDialogOpen(false);
      setCourseToDelete(null);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error loading courses:', errorMessage);
      toast({
        title: 'Xatolik',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      name: course.name,
      name_uz: course.name_uz,
      name_ru: course.name_ru,
      name_en: course.name_en,
      description: course.description,
      description_uz: course.description_uz,
      description_ru: course.description_ru,
      description_en: course.description_en,
      category: course.category,
      category_id: course.category_id,
      duration: course.duration,
      price: course.price,
      level: course.level,
      teacher_id: course.teacher_id,
      schedule: course.schedule,
      image_url: course.image_url,
      featured: course.featured || false,
      is_published: course.is_published !== undefined ? course.is_published : true,
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingCourse(null);
    setFormData({
      name: '',
      name_uz: '',
      name_ru: '',
      name_en: '',
      description: '',
      description_uz: '',
      description_ru: '',
      description_en: '',
      category: '',
      category_id: null,
      duration: '',
      price: '',
      level: '',
      teacher_id: '',
      schedule: '',
      image_url: null,
      featured: false,
      is_published: true,
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-2xl sm:text-3xl font-bold">Kurslar boshqaruvi</h2>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              Kurslarni qo'shish, tahrirlash va o'chirish
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="w-full sm:w-auto text-sm">
                <Plus className="h-4 w-4 mr-2" />
                Yangi kurs
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] sm:max-w-2xl lg:max-w-3xl max-h-[95vh] overflow-y-auto p-4 sm:p-5 md:p-6">
              <DialogHeader className="space-y-1 sm:space-y-2 pb-2 sm:pb-3">
                <DialogTitle className="text-base sm:text-lg md:text-xl">
                  {editingCourse ? 'Kursni tahrirlash' : 'Yangi kurs qo\'shish'}
                </DialogTitle>
                <DialogDescription className="text-xs sm:text-sm">
                  Kurs ma'lumotlarini to'ldiring
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 md:space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm sm:text-base font-medium">Nomi (UZ) *</Label>
                    <Input
                      value={formData.name_uz}
                      onChange={(e) => setFormData({ ...formData, name_uz: e.target.value })}
                      required
                      className="h-11 sm:h-10 text-base sm:text-sm"
                      placeholder="Kurs nomi (O'zbekcha)"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm sm:text-base font-medium">Nomi (RU) *</Label>
                    <Input
                      value={formData.name_ru}
                      onChange={(e) => setFormData({ ...formData, name_ru: e.target.value })}
                      required
                      className="h-11 sm:h-10 text-base sm:text-sm"
                      placeholder="Kurs nomi (Ruscha)"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm sm:text-base font-medium">Nomi (EN) *</Label>
                    <Input
                      value={formData.name_en}
                      onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                      required
                      className="h-11 sm:h-10 text-base sm:text-sm"
                      placeholder="Kurs nomi (Inglizcha)"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm sm:text-base font-medium">Kategoriya</Label>
                    <Select
                      value={formData.category || undefined}
                      onValueChange={(value) => {
                        setFormData({ ...formData, category: value === 'none' ? '' : value });
                      }}
                    >
                      <SelectTrigger className="h-11 sm:h-10 text-base sm:text-sm">
                        <SelectValue placeholder="Kategoriya tanlang" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Kategoriya yo'q</SelectItem>
                        {categories.length === 0 ? (
                          <SelectItem value="no-categories" disabled>
                            Kategoriyalar → Kurs kategoriyalari dan qo'shing
                          </SelectItem>
                        ) : (
                          categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.name_uz}>
                              {cat.name_uz}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm sm:text-base font-medium">Davomiyligi *</Label>
                    <Input
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      required
                      className="h-11 sm:h-10 text-base sm:text-sm"
                      placeholder="Masalan: 3 oy"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm sm:text-base font-medium">Narxi *</Label>
                    <Input
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                      className="h-11 sm:h-10 text-base sm:text-sm"
                      placeholder="Masalan: 500000 so'm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm sm:text-base font-medium">Daraja</Label>
                    <Select
                      value={formData.level || undefined}
                      onValueChange={(value) => setFormData({ ...formData, level: value })}
                    >
                      <SelectTrigger className="h-11 sm:h-10 text-base sm:text-sm">
                        <SelectValue placeholder="Daraja tanlang" />
                      </SelectTrigger>
                      <SelectContent>
                        {levels.length === 0 ? (
                          <SelectItem value="no-levels" disabled>
                            Kategoriyalar → Kurs darajalari dan qo'shing
                          </SelectItem>
                        ) : (
                          levels.map((level) => (
                            <SelectItem key={level.id} value={level.name_uz}>
                              {level.name_uz}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm sm:text-base font-medium">O'qituvchi *</Label>
                    <Select
                      value={formData.teacher_id}
                      onValueChange={(value) => setFormData({ ...formData, teacher_id: value })}
                      required
                    >
                      <SelectTrigger className="h-11 sm:h-10 text-base sm:text-sm">
                        <SelectValue placeholder="O'qituvchi tanlang" />
                      </SelectTrigger>
                      <SelectContent>
                        {teachers.map((teacher) => (
                          <SelectItem key={teacher.id} value={teacher.id}>
                            {teacher.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm sm:text-base font-medium">Jadval *</Label>
                    <Input
                      value={formData.schedule}
                      onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                      required
                      className="h-11 sm:h-10 text-base sm:text-sm"
                      placeholder="Masalan: 14:00-16:00"
                    />
                  </div>
                  <div className="space-y-2">
                    <ImageUpload
                      value={formData.image_url}
                      onChange={(url) => setFormData({ ...formData, image_url: url })}
                      folder="courses"
                      label="Kurs rasmi"
                    />
                  </div>
                  <div className="space-y-2 flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={formData.featured || false}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="h-4 w-4 sm:h-5 sm:w-5"
                    />
                    <Label htmlFor="featured" className="cursor-pointer text-sm sm:text-base">Featured (Asosiy sahifada ko'rsatish)</Label>
                  </div>
                  <div className="space-y-2 flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="is_published"
                      checked={formData.is_published !== undefined ? formData.is_published : true}
                      onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                      className="h-4 w-4 sm:h-5 sm:w-5"
                    />
                    <Label htmlFor="is_published" className="cursor-pointer text-sm sm:text-base">Published (Nashr qilish)</Label>
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
                    placeholder="Kurs haqida batafsil ma'lumot (O'zbekcha)"
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
                    placeholder="Kurs haqida batafsil ma'lumot (Ruscha)"
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
                    placeholder="Kurs haqida batafsil ma'lumot (Inglizcha)"
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
                    {editingCourse ? 'Yangilash' : 'Qo\'shish'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">Kurslar ro'yxati</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 overflow-x-auto">
            {loading ? (
              <div className="text-center py-8 text-sm">Yuklanmoqda...</div>
            ) : courses.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                Hozircha kurslar yo'q
              </div>
            ) : (
              <>
                {/* Mobile Card View */}
                <div className="md:hidden space-y-3">
                  {courses.map((course) => (
                    <Card key={course.id} className="border-2 border-border/50 hover:border-primary/30 transition-all hover:shadow-md">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div>
                            <h3 className="font-semibold text-sm mb-1">{course.name_uz}</h3>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                              <Badge variant="outline" className="text-xs">{course.category}</Badge>
                              <Badge variant="outline" className="text-xs">{course.level}</Badge>
                            </div>
                          </div>
                          <div className="flex items-center justify-between pt-2 border-t">
                            <div>
                              <p className="text-xs text-muted-foreground">Narxi</p>
                              <p className="font-semibold text-sm">{course.price}</p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 text-xs"
                                onClick={() => handleEdit(course)}
                              >
                                <Pencil className="h-3 w-3 mr-1" />
                                Tahrirlash
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 text-xs text-destructive hover:text-destructive"
                                onClick={() => handleDeleteClick(course.id)}
                              >
                                <Trash2 className="h-3 w-3 mr-1" />
                                O'chirish
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block min-w-[600px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs sm:text-sm">Nomi</TableHead>
                        <TableHead className="text-xs sm:text-sm">Kategoriya</TableHead>
                        <TableHead className="text-xs sm:text-sm">Narxi</TableHead>
                        <TableHead className="text-xs sm:text-sm hidden lg:table-cell">Daraja</TableHead>
                        <TableHead className="text-xs sm:text-sm text-right">Amallar</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {courses.map((course) => (
                        <TableRow key={course.id}>
                          <TableCell className="font-medium text-xs sm:text-sm">
                            {course.name_uz}
                          </TableCell>
                          <TableCell className="text-xs sm:text-sm">{course.category}</TableCell>
                          <TableCell className="text-xs sm:text-sm">{course.price}</TableCell>
                          <TableCell className="text-xs sm:text-sm hidden lg:table-cell">{course.level}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-1 sm:gap-2 justify-end">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(course)}
                                className="h-8 w-8 p-0"
                              >
                                <Pencil className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteClick(course.id)}
                                className="h-8 w-8 p-0"
                              >
                                <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-destructive" />
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
      </div>
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kursni o'chirish</AlertDialogTitle>
            <AlertDialogDescription>
              Bu kursni o'chirishni xohlaysizmi? Bu amalni qaytarib bo'lmaydi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              O'chirish
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}

export default function AdminCourses() {
  return (
    <ProtectedRoute>
      <CoursesContent />
    </ProtectedRoute>
  );
}

