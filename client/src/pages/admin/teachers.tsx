import { useEffect, useMemo, useState } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import type { Teacher, InsertTeacher } from '@shared/schema';
import { ImageUpload } from '@/components/ImageUpload';
import { BriefcaseBusiness, Phone, Plus, Pencil, Trash2, Eye, Star } from 'lucide-react';

function TeachersContent() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [detailsTeacher, setDetailsTeacher] = useState<Teacher | null>(null);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [formData, setFormData] = useState<InsertTeacher>({
    name: '',
    specialty: '',
    specialty_uz: '',
    specialty_ru: '',
    specialty_en: '',
    experience: 0,
    bio: '',
    bio_uz: '',
    bio_ru: '',
    bio_en: '',
    image_url: null,
    linked_in: null,
    telegram: null,
    instagram: null,
    featured: false,
  });
  const { toast } = useToast();

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTeachers(data || []);
    } catch (error: any) {
      toast({ title: 'Xatolik', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      if (editingTeacher) {
        const { error } = await supabase
          .from('teachers')
          .update(formData)
          .eq('id', editingTeacher.id);

        if (error) throw error;
        toast({ title: 'Yangilandi', description: 'O\'qituvchi ma\'lumotlari yangilandi' });
      } else {
        const { error } = await supabase
          .from('teachers')
          .insert([formData]);

        if (error) throw error;
        toast({ title: 'Qo\'shildi', description: 'Yangi o\'qituvchi qo\'shildi' });
      }
      setIsDialogOpen(false);
      resetForm();
      loadTeachers();
    } catch (error: any) {
      console.error(error);
      toast({ title: 'Xatolik', description: error.message || 'Ma\'lumotlarni saqlashda muammo', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('O\'qituvchini o\'chirishni tasdiqlaysizmi?')) return;
    try {
      const { error } = await supabase
        .from('teachers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: 'O\'chirildi', description: 'O\'qituvchi muvaffaqiyatli o\'chirildi' });
      loadTeachers();
    } catch (error: any) {
      toast({ title: 'Xatolik', description: error.message, variant: 'destructive' });
    }
  };

  const handleToggleFeatured = async (teacher: Teacher) => {
    try {
      const { error } = await supabase
        .from('teachers')
        .update({ featured: !teacher.featured })
        .eq('id', teacher.id);

      if (error) throw error;
      toast({ 
        title: 'Muvaffaqiyatli', 
        description: teacher.featured ? 'Yulduzcha olib tashlandi' : 'Yulduzcha qo\'shildi' 
      });
      loadTeachers();
    } catch (error: any) {
      toast({ title: 'Xatolik', description: error.message, variant: 'destructive' });
    }
  };

  const handleEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      name: teacher.name,
      specialty: teacher.specialty,
      specialty_uz: teacher.specialty_uz,
      specialty_ru: teacher.specialty_ru,
      specialty_en: teacher.specialty_en,
      experience: teacher.experience,
      bio: teacher.bio,
      bio_uz: teacher.bio_uz,
      bio_ru: teacher.bio_ru,
      bio_en: teacher.bio_en,
      image_url: teacher.image_url,
      linked_in: teacher.linked_in,
      telegram: teacher.telegram,
      instagram: teacher.instagram,
      featured: teacher.featured || false,
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingTeacher(null);
    setFormData({
      name: '',
      specialty: '',
      specialty_uz: '',
      specialty_ru: '',
      specialty_en: '',
      experience: 0,
      bio: '',
      bio_uz: '',
      bio_ru: '',
      bio_en: '',
      image_url: null,
      linked_in: null,
      telegram: null,
      instagram: null,
      featured: false,
    });
  };

  const metrics = useMemo(() => {
    const featured = teachers.filter((teacher) => teacher.featured);
    return { total: teachers.length, featured: featured.length };
  }, [teachers]);

  return (
    <AdminLayout>
      <div className="space-y-4 sm:space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in-down">
          <div className="min-w-0">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              O'qituvchilar
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">O'qituvchilarni boshqaring</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="w-full sm:w-auto text-sm">
                <Plus className="mr-2 h-4 w-4" />
                Yangi o'qituvchi
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[95vh] overflow-y-auto p-4 sm:p-6">
              <DialogHeader>
                <DialogTitle>{editingTeacher ? 'O\'qituvchini tahrirlash' : 'Yangi o\'qituvchi qo\'shish'}</DialogTitle>
                <DialogDescription>Instruktor ma\'lumotlarini to\'ldiring</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>F.I.Sh</Label>
                    <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Fan / yo'nalish (UZ)</Label>
                    <Input value={formData.specialty_uz} onChange={(e) => setFormData({ ...formData, specialty_uz: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Fan / yo'nalish (RU)</Label>
                    <Input value={formData.specialty_ru} onChange={(e) => setFormData({ ...formData, specialty_ru: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Fan / yo'nalish (EN)</Label>
                    <Input value={formData.specialty_en} onChange={(e) => setFormData({ ...formData, specialty_en: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Tajriba (yil)</Label>
                    <Input type="number" value={formData.experience} onChange={(e) => setFormData({ ...formData, experience: Number(e.target.value) })} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Asosiy fan</Label>
                    <Input value={formData.specialty} onChange={(e) => setFormData({ ...formData, specialty: e.target.value })} required />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <ImageUpload
                      value={formData.image_url}
                      onChange={(url) => setFormData({ ...formData, image_url: url })}
                      folder="teachers"
                      label="Profil surati"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Bio (UZ)</Label>
                    <Textarea rows={3} value={formData.bio_uz} onChange={(e) => setFormData({ ...formData, bio_uz: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Bio (RU)</Label>
                    <Textarea rows={3} value={formData.bio_ru} onChange={(e) => setFormData({ ...formData, bio_ru: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Bio (EN)</Label>
                    <Textarea rows={3} value={formData.bio_en} onChange={(e) => setFormData({ ...formData, bio_en: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Asosiy bio</Label>
                    <Textarea rows={3} value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label>LinkedIn</Label>
                    <Input value={formData.linked_in || ''} onChange={(e) => setFormData({ ...formData, linked_in: e.target.value || null })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Telegram</Label>
                    <Input value={formData.telegram || ''} onChange={(e) => setFormData({ ...formData, telegram: e.target.value || null })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Instagram</Label>
                    <Input value={formData.instagram || ''} onChange={(e) => setFormData({ ...formData, instagram: e.target.value || null })} />
                  </div>
                  <div className="space-y-2 flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="featured" className="cursor-pointer">Asosiy sahifada ko'rsatish (Featured)</Label>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Bekor qilish
                  </Button>
                  <Button type="submit">
                    {editingTeacher ? 'Yangilash' : 'Qo\'shish'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="stagger-item">
            <MetricCard title="Jami o'qituvchilar" value={metrics.total} subtitle="A+ Academy faculty" />
          </div>
          <div className="stagger-item">
            <MetricCard title="Featured" value={metrics.featured} subtitle="Asosiy sahifada ko'rsatiladiganlar" accent="bg-emerald-500/10 text-emerald-600" />
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
          <Card className="xl:col-span-2">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">O'qituvchilar ro'yxati</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto p-4 sm:p-6 pt-0">
              {loading ? (
                <div className="text-center py-8">Yuklanmoqda...</div>
              ) : teachers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">Hozircha o'qituvchilar yo'q</div>
              ) : (
                <div className="min-w-[600px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs sm:text-sm">Ism</TableHead>
                        <TableHead className="text-xs sm:text-sm hidden md:table-cell">Yo'nalish</TableHead>
                        <TableHead className="text-xs sm:text-sm hidden lg:table-cell">Tajriba</TableHead>
                        <TableHead className="text-xs sm:text-sm">Featured</TableHead>
                        <TableHead className="text-right text-xs sm:text-sm">Amallar</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {teachers.map((teacher, index) => (
                        <TableRow key={teacher.id} className="table-row-hover stagger-item" style={{ animationDelay: `${index * 0.02}s` }}>
                          <TableCell className="flex items-center gap-2 sm:gap-3">
                            <Avatar className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0">
                              <AvatarImage src={teacher.image_url || undefined} />
                              <AvatarFallback className="text-xs">{teacher.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-xs sm:text-sm truncate">{teacher.name}</p>
                              <p className="text-xs text-muted-foreground truncate">{teacher.bio_uz || '—'}</p>
                              <div className="md:hidden mt-1">
                                <p className="text-xs">{teacher.specialty_uz}</p>
                                <p className="text-xs text-muted-foreground">{teacher.experience} yil</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-xs sm:text-sm">{teacher.specialty_uz}</TableCell>
                          <TableCell className="hidden lg:table-cell text-xs sm:text-sm">{teacher.experience} yil</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleFeatured(teacher)}
                              className={`h-8 w-8 p-0 ${teacher.featured ? 'text-yellow-500' : ''}`}
                            >
                              <Star className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${teacher.featured ? 'fill-yellow-500' : ''}`} />
                            </Button>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-1 sm:gap-2 justify-end">
                              <Button variant="ghost" size="sm" onClick={() => setDetailsTeacher(teacher)} className="h-8 w-8 p-0">
                                <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleEdit(teacher)} className="h-8 w-8 p-0">
                                <Pencil className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDelete(teacher.id)} className="h-8 w-8 p-0">
                                <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">Team spotlight</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
              {teachers.slice(0, 4).map((teacher, index) => (
                <div 
                  key={teacher.id} 
                  className="stagger-item rounded-lg border p-3 flex items-center gap-3 hover:bg-muted/50"
                  style={{ animationDelay: `${index * 0.02}s` }}
                >
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={teacher.image_url || undefined} />
                    <AvatarFallback>{teacher.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold">{teacher.name}</p>
                    <p className="text-xs text-muted-foreground">{teacher.specialty_uz}</p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1"><BriefcaseBusiness className="h-3 w-3" /> {teacher.experience} yil</span>
                    </div>
                  </div>
                  <Badge variant={teacher.featured ? 'default' : 'outline'}>
                    {teacher.featured ? 'Featured' : '—'}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
      <Dialog open={!!detailsTeacher} onOpenChange={(open) => !open && setDetailsTeacher(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{detailsTeacher?.name}</DialogTitle>
            <DialogDescription>Ustoz tafsilotlari</DialogDescription>
          </DialogHeader>
          {detailsTeacher && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Yo'nalish</p>
                <p className="font-semibold">{detailsTeacher.specialty_uz}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tajriba</p>
                <p className="font-semibold">{detailsTeacher.experience} yil</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Bio</p>
                <p className="text-sm">{detailsTeacher.bio_uz}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Featured</p>
                <Badge variant={detailsTeacher.featured ? 'default' : 'secondary'}>
                  {detailsTeacher.featured ? 'Ha' : 'Yo\'q'}
                </Badge>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

const MetricCard = ({ title, value, subtitle, accent }: { title: string; value: number | string; subtitle: string; accent?: string }) => (
  <Card>
    <CardHeader className="pb-2 p-4 sm:p-6">
      <CardTitle className="text-xs sm:text-sm text-muted-foreground">{title}</CardTitle>
    </CardHeader>
    <CardContent className="p-4 sm:p-6 pt-0">
      <p className="text-xl sm:text-2xl font-bold break-words">{value}</p>
      <p className={`text-xs sm:text-sm mt-1 sm:mt-2 ${accent || 'text-muted-foreground'}`}>{subtitle}</p>
    </CardContent>
  </Card>
);

export default function AdminTeachers() {
  return (
    <ProtectedRoute>
      <TeachersContent />
    </ProtectedRoute>
  );
}


