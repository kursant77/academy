import { useEffect, useState } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import type { Teacher } from '@shared/schema';
import { ImageUpload } from '@/components/ImageUpload';
import { Plus, Pencil, Trash2, Loader2, Star, User, Briefcase, Phone, Globe, Linkedin, Send, Instagram } from 'lucide-react';

function TeachersContent() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    specialty_uz: '',
    specialty_ru: '',
    specialty_en: '',
    experience: 0,
    bio_uz: '',
    bio_ru: '',
    bio_en: '',
    phone: '',
    image_url: '',
    linked_in: '',
    telegram: '',
    instagram: '',
    featured: false,
  });
  const { toast } = useToast();

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTeachers(data || []);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: 'Xatolik',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTeacher) {
        const { error } = await supabase
          .from('teachers')
          .update({
            name: formData.name,
            specialty: formData.specialty_uz,
            specialty_uz: formData.specialty_uz,
            specialty_ru: formData.specialty_ru,
            specialty_en: formData.specialty_en,
            experience: formData.experience,
            bio: formData.bio_uz,
            bio_uz: formData.bio_uz,
            bio_ru: formData.bio_ru,
            bio_en: formData.bio_en,
            phone: formData.phone || null,
            image_url: formData.image_url || null,
            linked_in: formData.linked_in || null,
            telegram: formData.telegram || null,
            instagram: formData.instagram || null,
            featured: formData.featured,
          })
          .eq('id', editingTeacher.id);

        if (error) throw error;
        toast({ title: 'Yangilandi' });
      } else {
        const { error } = await supabase.from('teachers').insert([{
          name: formData.name,
          specialty: formData.specialty_uz,
          specialty_uz: formData.specialty_uz,
          specialty_ru: formData.specialty_ru,
          specialty_en: formData.specialty_en,
          experience: formData.experience,
          bio: formData.bio_uz,
          bio_uz: formData.bio_uz,
          bio_ru: formData.bio_ru,
          bio_en: formData.bio_en,
          phone: formData.phone || null,
          image_url: formData.image_url || null,
          linked_in: formData.linked_in || null,
          telegram: formData.telegram || null,
          instagram: formData.instagram || null,
          featured: formData.featured,
        }]);

        if (error) throw error;
        toast({ title: 'Qo\'shildi' });
      }

      setIsDialogOpen(false);
      resetForm();
      loadTeachers();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: 'Xatolik',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const { error } = await supabase.from('teachers').delete().eq('id', deleteId);
      if (error) throw error;
      toast({ title: 'O\'chirildi' });
      setDeleteDialogOpen(false);
      setDeleteId(null);
      loadTeachers();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: 'Xatolik',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      name: teacher.name,
      specialty_uz: teacher.specialty_uz,
      specialty_ru: teacher.specialty_ru,
      specialty_en: teacher.specialty_en,
      experience: teacher.experience,
      bio_uz: teacher.bio_uz,
      bio_ru: teacher.bio_ru,
      bio_en: teacher.bio_en,
      phone: '',
      image_url: teacher.image_url || '',
      linked_in: teacher.linked_in || '',
      telegram: teacher.telegram || '',
      instagram: teacher.instagram || '',
      featured: teacher.featured || false,
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingTeacher(null);
    setFormData({
      name: '',
      specialty_uz: '',
      specialty_ru: '',
      specialty_en: '',
      experience: 0,
      bio_uz: '',
      bio_ru: '',
      bio_en: '',
      phone: '',
      image_url: '',
      linked_in: '',
      telegram: '',
      instagram: '',
      featured: false,
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-2xl sm:text-3xl font-bold">O'qituvchilar</h2>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              O'qituvchilarni boshqaring
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="w-full sm:w-auto text-sm">
                <Plus className="mr-2 h-4 w-4" />
                Yangi o'qituvchi
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] sm:max-w-2xl lg:max-w-3xl max-h-[95vh] overflow-y-auto p-4 sm:p-5 md:p-6">
              <DialogHeader className="space-y-1 sm:space-y-2 pb-2 sm:pb-3">
                <DialogTitle className="text-base sm:text-lg md:text-xl">
                  {editingTeacher ? 'O\'qituvchini tahrirlash' : 'Yangi o\'qituvchi qo\'shish'}
                </DialogTitle>
                <DialogDescription className="text-xs sm:text-sm">
                  O'qituvchi ma'lumotlarini to'liq kiriting
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 md:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm sm:text-base font-medium">
                      <User className="h-4 w-4 text-muted-foreground" />
                      Ism *
                    </Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="To'liq ism"
                      required
                      className="h-11 sm:h-10 text-base sm:text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm sm:text-base font-medium">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      Tajriba (yil) *
                    </Label>
                    <Input
                      type="number"
                      value={formData.experience}
                      onChange={(e) => setFormData({ ...formData, experience: parseInt(e.target.value) || 0 })}
                      placeholder="Masalan: 5"
                      required
                      min="0"
                      className="h-11 sm:h-10 text-base sm:text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm sm:text-base font-medium">Mutaxassislik (UZ) *</Label>
                    <Input
                      value={formData.specialty_uz}
                      onChange={(e) => setFormData({ ...formData, specialty_uz: e.target.value })}
                      placeholder="Masalan: Frontend Developer"
                      required
                      className="h-11 sm:h-10 text-base sm:text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm sm:text-base font-medium">Mutaxassislik (RU)</Label>
                    <Input
                      value={formData.specialty_ru}
                      onChange={(e) => setFormData({ ...formData, specialty_ru: e.target.value })}
                      placeholder="Например: Frontend Developer"
                      className="h-11 sm:h-10 text-base sm:text-sm"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                    <Label className="text-sm sm:text-base font-medium">Mutaxassislik (EN)</Label>
                    <Input
                      value={formData.specialty_en}
                      onChange={(e) => setFormData({ ...formData, specialty_en: e.target.value })}
                      placeholder="e.g. Frontend Developer"
                      className="h-11 sm:h-10 text-base sm:text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm sm:text-base font-medium">Bio (UZ) *</Label>
                    <Textarea
                      value={formData.bio_uz}
                      onChange={(e) => setFormData({ ...formData, bio_uz: e.target.value })}
                      placeholder="O'qituvchi haqida qisqacha ma'lumot..."
                      required
                      rows={4}
                      className="resize-y text-base sm:text-sm min-h-[100px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm sm:text-base font-medium">Bio (RU)</Label>
                    <Textarea
                      value={formData.bio_ru}
                      onChange={(e) => setFormData({ ...formData, bio_ru: e.target.value })}
                      placeholder="Краткая информация о преподавателе..."
                      rows={4}
                      className="resize-y text-base sm:text-sm min-h-[100px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm sm:text-base font-medium">Bio (EN)</Label>
                    <Textarea
                      value={formData.bio_en}
                      onChange={(e) => setFormData({ ...formData, bio_en: e.target.value })}
                      placeholder="Brief information about the teacher..."
                      rows={4}
                      className="resize-y text-base sm:text-sm min-h-[100px]"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <ImageUpload
                    value={formData.image_url}
                    onChange={(url) => setFormData({ ...formData, image_url: url || '' })}
                    folder="teachers"
                    label="O'qituvchi rasmi"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-sm sm:text-base font-medium">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        Telefon
                      </Label>
                      <Input
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+998 XX XXX XX XX"
                        className="h-11 sm:h-10 text-base sm:text-sm"
                        type="tel"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm sm:text-base font-medium">
                      <Linkedin className="h-4 w-4 text-muted-foreground" />
                      LinkedIn
                    </Label>
                    <Input
                      value={formData.linked_in}
                      onChange={(e) => setFormData({ ...formData, linked_in: e.target.value })}
                      placeholder="https://linkedin.com/..."
                      className="h-11 sm:h-10 text-base sm:text-sm"
                      type="url"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm sm:text-base font-medium">
                      <Send className="h-4 w-4 text-muted-foreground" />
                      Telegram
                    </Label>
                    <Input
                      value={formData.telegram}
                      onChange={(e) => setFormData({ ...formData, telegram: e.target.value })}
                      placeholder="https://t.me/..."
                      className="h-11 sm:h-10 text-base sm:text-sm"
                      type="url"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                    <Label className="flex items-center gap-2 text-sm sm:text-base font-medium">
                      <Instagram className="h-4 w-4 text-muted-foreground" />
                      Instagram
                    </Label>
                    <Input
                      value={formData.instagram}
                      onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                      placeholder="https://instagram.com/..."
                      className="h-11 sm:h-10 text-base sm:text-sm"
                      type="url"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
                  <div className="flex items-center gap-3">
                    <Star className="h-5 w-5 text-primary" />
                    <div>
                      <Label htmlFor="featured" className="cursor-pointer font-medium">
                        Asosiy sahifada ko'rsatish
                      </Label>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Featured o'qituvchi sifatida ko'rsatish
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="featured"
                    checked={formData.featured}
                    onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
                  />
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                    className="w-full sm:w-auto h-11 sm:h-10 text-base sm:text-sm"
                  >
                    Bekor
                  </Button>
                  <Button 
                    type="submit"
                    className="w-full sm:w-auto h-11 sm:h-10 text-base sm:text-sm"
                  >
                    {editingTeacher ? 'Saqlash' : 'Qo\'shish'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="border-2 border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="p-4 sm:p-6 border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg sm:text-xl font-bold">O'qituvchilar ro'yxati</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Jami: <span className="font-semibold text-foreground">{teachers.length}</span> ta o'qituvchi
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 overflow-x-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
                <p className="text-sm text-muted-foreground">Yuklanmoqda...</p>
              </div>
            ) : teachers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <User className="h-12 w-12 text-muted-foreground/50 mb-3" />
                <p className="text-sm font-medium text-foreground mb-1">Hozircha o'qituvchilar yo'q</p>
                <p className="text-xs text-muted-foreground">Yangi o'qituvchi qo'shish uchun yuqoridagi tugmani bosing</p>
              </div>
            ) : (
              <>
                {/* Mobile Card View */}
                <div className="md:hidden space-y-3">
                  {teachers.map((teacher) => (
                    <Card key={teacher.id} className="border-2 border-border/50 hover:border-primary/30 transition-all hover:shadow-md">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          {teacher.image_url ? (
                            <img
                              src={teacher.image_url}
                              alt={teacher.name}
                              className="h-14 w-14 rounded-full object-cover border-2 border-border flex-shrink-0"
                            />
                          ) : (
                            <div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center border-2 border-border flex-shrink-0">
                              <User className="h-7 w-7 text-primary" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-sm truncate">{teacher.name}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                  <Briefcase className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                                  <span className="text-xs text-muted-foreground truncate">{teacher.specialty_uz}</span>
                                </div>
                              </div>
                              {teacher.featured && (
                                <Badge variant="default" className="text-xs gap-1 flex-shrink-0">
                                  <Star className="h-3 w-3 fill-current" />
                                  Featured
                                </Badge>
                              )}
                            </div>
                            <div className="space-y-1.5 text-xs text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <Briefcase className="h-3 w-3" />
                                <span>Tajriba: {teacher.experience} yil</span>
                              </div>
                              {teacher.phone && (
                                <div className="flex items-center gap-2">
                                  <Phone className="h-3 w-3" />
                                  <span className="truncate">{teacher.phone}</span>
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2 mt-3 pt-3 border-t">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 h-8 text-xs"
                                onClick={() => handleEdit(teacher)}
                              >
                                <Pencil className="h-3 w-3 mr-1" />
                                Tahrirlash
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 h-8 text-xs text-destructive hover:text-destructive"
                                onClick={() => {
                                  setDeleteId(teacher.id);
                                  setDeleteDialogOpen(true);
                                }}
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
                <div className="hidden md:block min-w-[700px]">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="text-xs sm:text-sm font-semibold">O'qituvchi</TableHead>
                        <TableHead className="text-xs sm:text-sm font-semibold">Mutaxassislik</TableHead>
                        <TableHead className="text-xs sm:text-sm font-semibold hidden lg:table-cell">Tajriba</TableHead>
                        <TableHead className="text-xs sm:text-sm font-semibold hidden xl:table-cell">Telefon</TableHead>
                        <TableHead className="text-xs sm:text-sm font-semibold">Holat</TableHead>
                        <TableHead className="text-xs sm:text-sm font-semibold text-right">Amallar</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {teachers.map((teacher) => (
                        <TableRow key={teacher.id} className="hover:bg-muted/50 transition-colors">
                          <TableCell className="font-medium text-xs sm:text-sm">
                            <div className="flex items-center gap-3">
                              {teacher.image_url ? (
                                <img
                                  src={teacher.image_url}
                                  alt={teacher.name}
                                  className="h-10 w-10 rounded-full object-cover border-2 border-border"
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center border-2 border-border">
                                  <User className="h-5 w-5 text-primary" />
                                </div>
                              )}
                              <div>
                                <div className="font-semibold">{teacher.name}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs sm:text-sm">
                            <div className="flex items-center gap-2">
                              <Briefcase className="h-3 w-3 text-muted-foreground" />
                              {teacher.specialty_uz}
                            </div>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-xs sm:text-sm">
                            <Badge variant="outline" className="font-normal">
                              {teacher.experience} yil
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden xl:table-cell text-xs sm:text-sm">
                            {teacher.phone ? (
                              <div className="flex items-center gap-2">
                                <Phone className="h-3 w-3 text-muted-foreground" />
                                {teacher.phone}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {teacher.featured && (
                              <Badge variant="default" className="text-xs gap-1">
                                <Star className="h-3 w-3 fill-current" />
                                Featured
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                                onClick={() => handleEdit(teacher)}
                                title="Tahrirlash"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                                onClick={() => {
                                  setDeleteId(teacher.id);
                                  setDeleteDialogOpen(true);
                                }}
                                title="O'chirish"
                              >
                                <Trash2 className="h-4 w-4" />
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
                Bu o'qituvchini o'chirishni xohlaysizmi? Bu amalni qaytarib bo'lmaydi.
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
      </div>
    </AdminLayout>
  );
}

export default function AdminTeachers() {
  return (
    <ProtectedRoute>
      <TeachersContent />
    </ProtectedRoute>
  );
}

