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
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import type { Testimonial, InsertTestimonial } from '@shared/schema';
import { Plus, Pencil, Trash2, Star } from 'lucide-react';

function TestimonialsContent() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Testimonial | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState<InsertTestimonial>({
    name: '',
    course: '',
    text_uz: '',
    text_ru: '',
    text_en: '',
    rating: 5,
  });
  const { toast } = useToast();

  useEffect(() => {
    loadTestimonials();
  }, []);

  const loadTestimonials = async () => {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTestimonials(data || []);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error in testimonials page:', errorMessage);
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
      if (editingItem) {
        const { error } = await supabase
          .from('testimonials')
          .update(formData)
          .eq('id', editingItem.id);

        if (error) throw error;
        toast({
          title: 'Muvaffaqiyatli',
          description: 'Fikr yangilandi',
        });
      } else {
        const { error } = await supabase.from('testimonials').insert([formData]);

        if (error) throw error;
        toast({
          title: 'Muvaffaqiyatli',
          description: 'Fikr qo\'shildi',
        });
      }

      setIsDialogOpen(false);
      resetForm();
      loadTestimonials();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error in testimonials page:', errorMessage);
      toast({
        title: 'Xatolik',
        description: errorMessage,
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
      const { error } = await supabase.from('testimonials').delete().eq('id', deleteId);

      if (error) throw error;
      toast({
        title: 'Muvaffaqiyatli',
        description: 'Fikr o\'chirildi',
      });
      loadTestimonials();
      setDeleteDialogOpen(false);
      setDeleteId(null);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error in testimonials page:', errorMessage);
      toast({
        title: 'Xatolik',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (item: Testimonial) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      course: item.course,
      text_uz: item.text_uz,
      text_ru: item.text_ru,
      text_en: item.text_en,
      rating: item.rating,
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      course: '',
      text_uz: '',
      text_ru: '',
      text_en: '',
      rating: 5,
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Testimonials boshqaruvi</h2>
            <p className="text-muted-foreground">
              Saytga chiqadigan barcha fikr va taassurotlarni boshqaring
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Yangi fikr
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] sm:max-w-2xl lg:max-w-3xl max-h-[95vh] overflow-y-auto p-4 sm:p-5 md:p-6">
              <DialogHeader className="space-y-1 sm:space-y-2 pb-2 sm:pb-3">
                <DialogTitle className="text-base sm:text-lg md:text-xl">
                  {editingItem ? 'Fikrni tahrirlash' : 'Yangi fikr qo\'shish'}
                </DialogTitle>
                <DialogDescription className="text-xs sm:text-sm">
                  Talaba yoki ota-onalarning real fikrlarini kiriting
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 md:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm sm:text-base font-medium">Ism *</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="h-11 sm:h-10 text-base sm:text-sm"
                      placeholder="To'liq ism"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm sm:text-base font-medium">Kurs *</Label>
                    <Input
                      value={formData.course}
                      onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                      required
                      className="h-11 sm:h-10 text-base sm:text-sm"
                      placeholder="Kurs nomi"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm sm:text-base font-medium">Matn (UZ) *</Label>
                    <Textarea
                      value={formData.text_uz}
                      onChange={(e) => setFormData({ ...formData, text_uz: e.target.value })}
                      required
                      rows={4}
                      className="text-base sm:text-sm min-h-[100px] resize-y"
                      placeholder="Fikr matni (O'zbekcha)"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm sm:text-base font-medium">Matn (RU) *</Label>
                    <Textarea
                      value={formData.text_ru}
                      onChange={(e) => setFormData({ ...formData, text_ru: e.target.value })}
                      required
                      rows={4}
                      className="text-base sm:text-sm min-h-[100px] resize-y"
                      placeholder="Fikr matni (Ruscha)"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                    <Label className="text-sm sm:text-base font-medium">Matn (EN) *</Label>
                    <Textarea
                      value={formData.text_en}
                      onChange={(e) => setFormData({ ...formData, text_en: e.target.value })}
                      required
                      rows={4}
                      className="text-base sm:text-sm min-h-[100px] resize-y"
                      placeholder="Fikr matni (Inglizcha)"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm sm:text-base font-medium">Reyting (1-5) *</Label>
                  <Input
                    type="number"
                    min={1}
                    max={5}
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                    className="h-11 sm:h-10 text-base sm:text-sm"
                    placeholder="1 dan 5 gacha"
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
                    {editingItem ? 'Yangilash' : 'Qo\'shish'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Fikrlar ro'yxati</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Yuklanmoqda...</div>
            ) : testimonials.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Hozircha fikrlar yo'q
              </div>
            ) : (
              <>
                {/* Mobile Card View */}
                <div className="md:hidden space-y-3">
                  {testimonials.map((testimonial) => (
                    <Card key={testimonial.id} className="border-2 border-border/50 hover:border-primary/30 transition-all hover:shadow-md">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div>
                            <h3 className="font-semibold text-sm mb-1">{testimonial.name}</h3>
                            <p className="text-xs text-muted-foreground mb-2">{testimonial.course}</p>
                            <div className="flex items-center gap-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3.5 w-3.5 ${
                                    i < testimonial.rating
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                              <span className="text-xs text-muted-foreground ml-1">({testimonial.rating}/5)</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{testimonial.text_uz}</p>
                          </div>
                          <div className="flex gap-2 pt-2 border-t">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 h-8 text-xs"
                              onClick={() => handleEdit(testimonial)}
                            >
                              <Pencil className="h-3 w-3 mr-1" />
                              Tahrirlash
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 h-8 text-xs text-destructive hover:text-destructive"
                              onClick={() => handleDeleteClick(testimonial.id)}
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
                        <TableHead>Ism</TableHead>
                        <TableHead>Kurs</TableHead>
                        <TableHead>Reyting</TableHead>
                        <TableHead>Amallar</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {testimonials.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.course}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < item.rating
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(item.id)}>
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
                Bu fikrni o'chirishni xohlaysizmi? Bu amalni qaytarib bo'lmaydi.
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

export default function AdminTestimonials() {
  return (
    <ProtectedRoute>
      <TestimonialsContent />
    </ProtectedRoute>
  );
}

