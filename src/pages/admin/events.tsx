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
import { useOptions, OPTION_TYPES } from '@/hooks/use-options';
import { supabase } from '@/lib/supabase';
import type { Event, InsertEvent } from '@shared/schema';
import { ImageUpload } from '@/components/ImageUpload';
import { Plus, Pencil, Trash2, Star } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

function EventsContent() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  
  // System options dan kategoriyalarni olish
  const { options: categories } = useOptions(OPTION_TYPES.EVENT_CATEGORY);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState<InsertEvent>({
    title: '',
    title_uz: '',
    title_ru: '',
    title_en: '',
    description: '',
    description_uz: '',
    description_ru: '',
    description_en: '',
    date: new Date().toISOString(),
    image_url: null,
    category: '',
    featured: false,
    is_published: true,
  });
  const { toast } = useToast();

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error in events page:', errorMessage);
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
      if (editingEvent) {
        const { error } = await supabase
          .from('events')
          .update(formData)
          .eq('id', editingEvent.id);

        if (error) throw error;
        toast({
          title: 'Muvaffaqiyatli',
          description: 'Tadbir yangilandi',
        });
      } else {
        const { error } = await supabase.from('events').insert([formData]);

        if (error) throw error;
        toast({
          title: 'Muvaffaqiyatli',
          description: 'Tadbir qo\'shildi',
        });
      }

      setIsDialogOpen(false);
      resetForm();
      loadEvents();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error in events page:', errorMessage);
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
      const { error } = await supabase.from('events').delete().eq('id', deleteId);

      if (error) throw error;
      toast({
        title: 'Muvaffaqiyatli',
        description: 'Tadbir o\'chirildi',
      });
      loadEvents();
      setDeleteDialogOpen(false);
      setDeleteId(null);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error in events page:', errorMessage);
      toast({
        title: 'Xatolik',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      title_uz: event.title_uz,
      title_ru: event.title_ru,
      title_en: event.title_en,
      description: event.description,
      description_uz: event.description_uz,
      description_ru: event.description_ru,
      description_en: event.description_en,
      date: event.date,
      image_url: event.image_url,
      category: event.category,
      featured: event.featured || false,
      is_published: event.is_published !== undefined ? event.is_published : true,
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingEvent(null);
    setFormData({
      title: '',
      title_uz: '',
      title_ru: '',
      title_en: '',
      description: '',
      description_uz: '',
      description_ru: '',
      description_en: '',
      date: new Date().toISOString(),
      image_url: null,
      category: '',
      featured: false,
      is_published: true,
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between animate-fade-in-down">
          <div>
            <h2 className="text-3xl font-bold text-foreground">
              Tadbirlar
            </h2>
            <p className="text-muted-foreground mt-2">
              Tadbirlarni boshqaring
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Yangi tadbir
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] sm:max-w-2xl lg:max-w-3xl max-h-[95vh] overflow-y-auto p-4 sm:p-5 md:p-6">
              <DialogHeader className="space-y-1 sm:space-y-2 pb-2 sm:pb-3">
                <DialogTitle className="text-base sm:text-lg md:text-xl">
                  {editingEvent ? 'Tadbirni tahrirlash' : 'Yangi tadbir qo\'shish'}
                </DialogTitle>
                <DialogDescription className="text-xs sm:text-sm">
                  Tadbir ma'lumotlarini to'ldiring
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 md:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm sm:text-base font-medium">Sarlavha (UZ) *</Label>
                    <Input
                      value={formData.title_uz}
                      onChange={(e) => setFormData({ ...formData, title_uz: e.target.value })}
                      required
                      placeholder="Tadbir sarlavhasi (O'zbekcha)"
                      className="h-11 sm:h-10 text-base sm:text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm sm:text-base font-medium">Sarlavha (RU) *</Label>
                    <Input
                      value={formData.title_ru}
                      onChange={(e) => setFormData({ ...formData, title_ru: e.target.value })}
                      required
                      placeholder="Tadbir sarlavhasi (Ruscha)"
                      className="h-11 sm:h-10 text-base sm:text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm sm:text-base font-medium">Sarlavha (EN) *</Label>
                    <Input
                      value={formData.title_en}
                      onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                      required
                      placeholder="Tadbir sarlavhasi (Inglizcha)"
                      className="h-11 sm:h-10 text-base sm:text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm sm:text-base font-medium">Kategoriya</Label>
                    <Select
                      value={formData.category || undefined}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger className="h-11 sm:h-10 text-base sm:text-sm">
                        <SelectValue placeholder="Kategoriya tanlang" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.length === 0 ? (
                          <SelectItem value="no-categories" disabled>
                            Kategoriyalar → Tadbir kategoriyalari dan qo'shing
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
                    <Label className="text-sm sm:text-base font-medium">Sana va vaqt *</Label>
                    <Input
                      type="datetime-local"
                      value={formData.date ? new Date(formData.date).toISOString().slice(0, 16) : ''}
                      onChange={(e) => setFormData({ ...formData, date: new Date(e.target.value).toISOString() })}
                      required
                      className="h-11 sm:h-10 text-base sm:text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <ImageUpload
                      value={formData.image_url}
                      onChange={(url) => setFormData({ ...formData, image_url: url })}
                      folder="events"
                      label="Tadbir rasmi"
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
                    placeholder="Tadbir haqida batafsil ma'lumot (O'zbekcha)"
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
                    placeholder="Tadbir haqida batafsil ma'lumot (Ruscha)"
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
                    placeholder="Tadbir haqida batafsil ma'lumot (Inglizcha)"
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
                    {editingEvent ? 'Yangilash' : 'Qo\'shish'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Tadbirlar ro'yxati</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 animate-pulse">Yuklanmoqda...</div>
            ) : events.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Hozircha tadbirlar yo'q
              </div>
            ) : (
              <>
                {/* Mobile Card View */}
                <div className="md:hidden space-y-3">
                  {events.map((event) => (
                    <Card key={event.id} className="border-2 border-border/50 hover:border-primary/30 transition-all hover:shadow-md">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div>
                            <h3 className="font-semibold text-sm mb-1">
                              {event.title_uz || event.title_ru || event.title_en || event.title || 'Sarlavha yo\'q'}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2 text-xs">
                              <Badge variant="outline" className="text-xs">{event.category}</Badge>
                              {event.featured && (
                                <Badge variant="default" className="text-xs gap-1">
                                  <Star className="h-3 w-3 fill-current" />
                                  Featured
                                </Badge>
                              )}
                              <span className="text-xs text-muted-foreground">
                                {new Date(event.date).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2 pt-2 border-t">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 h-8 text-xs"
                              onClick={() => handleEdit(event)}
                            >
                              <Pencil className="h-3 w-3 mr-1" />
                              Tahrirlash
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 h-8 text-xs text-destructive hover:text-destructive"
                              onClick={() => handleDeleteClick(event.id)}
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
                        <TableHead>Kategoriya</TableHead>
                        <TableHead>Sana</TableHead>
                        <TableHead>Featured</TableHead>
                        <TableHead>Amallar</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {events.map((event, index) => (
                        <TableRow key={event.id} className="table-row-hover stagger-item" style={{ animationDelay: `${index * 0.02}s` }}>
                          <TableCell className="font-medium">
                            {event.title_uz || event.title_ru || event.title_en || event.title || 'Sarlavha yo\'q'}
                          </TableCell>
                          <TableCell>{event.category}</TableCell>
                          <TableCell>{new Date(event.date).toLocaleDateString()}</TableCell>
                          <TableCell>
                            {event.featured && (
                              <Badge variant="default" className="text-xs gap-1">
                                <Star className="h-3 w-3 fill-current" />
                                Featured
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(event)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteClick(event.id)}
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
                Bu tadbirni o'chirishni xohlaysizmi? Bu amalni qaytarib bo'lmaydi.
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

export default function AdminEvents() {
  return (
    <ProtectedRoute>
      <EventsContent />
    </ProtectedRoute>
  );
}

