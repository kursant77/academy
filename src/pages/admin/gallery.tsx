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
import type { GalleryItem, InsertGalleryItem } from '@shared/schema';
import { Plus, Pencil, Trash2 } from 'lucide-react';

function GalleryContent() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState<InsertGalleryItem>({
    title_uz: '',
    title_ru: '',
    title_en: '',
    description_uz: null,
    description_ru: null,
    description_en: null,
    image_url: '',
    category: null,
  });
  const { toast } = useToast();

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const { data, error } = await supabase
        .from('gallery_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error in gallery page:', errorMessage);
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
      if (editingItem) {
        const { error } = await supabase
          .from('gallery_items')
          .update(formData)
          .eq('id', editingItem.id);

        if (error) throw error;
        toast({
          title: 'Muvaffaqiyatli',
          description: 'Galereya elementi yangilandi',
        });
      } else {
        const { error } = await supabase.from('gallery_items').insert([formData]);

        if (error) throw error;
        toast({
          title: 'Muvaffaqiyatli',
          description: 'Galereya elementi qo\'shildi',
        });
      }

      setIsDialogOpen(false);
      resetForm();
      loadItems();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error in gallery page:', errorMessage);
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
      const { error } = await supabase.from('gallery_items').delete().eq('id', deleteId);

      if (error) throw error;
      toast({
        title: 'Muvaffaqiyatli',
        description: 'Galereya elementi o\'chirildi',
      });
      loadItems();
      setDeleteDialogOpen(false);
      setDeleteId(null);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error in gallery page:', errorMessage);
      toast({
        title: 'Xatolik',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (item: GalleryItem) => {
    setEditingItem(item);
    setFormData({
      title_uz: item.title_uz,
      title_ru: item.title_ru,
      title_en: item.title_en,
      description_uz: item.description_uz,
      description_ru: item.description_ru,
      description_en: item.description_en,
      image_url: item.image_url,
      category: item.category,
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingItem(null);
    setFormData({
      title_uz: '',
      title_ru: '',
      title_en: '',
      description_uz: null,
      description_ru: null,
      description_en: null,
      image_url: '',
      category: null,
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Galereya boshqaruvi</h2>
            <p className="text-muted-foreground">
              Saytdagi barcha galereya rasmlarini boshqaring
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Yangi rasm
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingItem ? 'Rasmni tahrirlash' : 'Yangi rasm qo\'shish'}
                </DialogTitle>
                <DialogDescription>
                  Rasm ma\'lumotlarini to\'ldiring
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
                    <Label>Kategoriya</Label>
                    <Input
                      value={formData.category || ''}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value || null })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Rasm URL</Label>
                  <Input
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tavsif (UZ)</Label>
                  <Textarea
                    value={formData.description_uz || ''}
                    onChange={(e) => setFormData({ ...formData, description_uz: e.target.value || null })}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tavsif (RU)</Label>
                  <Textarea
                    value={formData.description_ru || ''}
                    onChange={(e) => setFormData({ ...formData, description_ru: e.target.value || null })}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tavsif (EN)</Label>
                  <Textarea
                    value={formData.description_en || ''}
                    onChange={(e) => setFormData({ ...formData, description_en: e.target.value || null })}
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Bekor qilish
                  </Button>
                  <Button type="submit">
                    {editingItem ? 'Yangilash' : 'Qo\'shish'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Galereya elementlari</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Yuklanmoqda...</div>
            ) : items.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Hozircha rasmlar yo'q
              </div>
            ) : (
              <>
                {/* Mobile Card View */}
                <div className="md:hidden space-y-3">
                  {items.map((item) => (
                    <Card key={item.id} className="border-2 border-border/50 hover:border-primary/30 transition-all hover:shadow-md overflow-hidden">
                      <div className="aspect-video w-full overflow-hidden">
                        <img
                          src={item.image_url}
                          alt={item.title_uz}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div>
                            <h3 className="font-semibold text-sm mb-1">{item.title_uz}</h3>
                            {item.category && (
                              <Badge variant="outline" className="text-xs">{item.category}</Badge>
                            )}
                          </div>
                          <div className="flex gap-2 pt-2 border-t">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 h-8 text-xs"
                              onClick={() => handleEdit(item)}
                            >
                              <Pencil className="h-3 w-3 mr-1" />
                              Tahrirlash
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 h-8 text-xs text-destructive hover:text-destructive"
                              onClick={() => handleDeleteClick(item.id)}
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
                        <TableHead>Rasm</TableHead>
                        <TableHead>Amallar</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.title_uz}</TableCell>
                          <TableCell>{item.category || '-'}</TableCell>
                          <TableCell>
                            <a
                              href={item.image_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-primary underline hover:text-primary/80"
                            >
                              Ko'rish
                            </a>
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
                Bu elementni o'chirishni xohlaysizmi? Bu amalni qaytarib bo'lmaydi.
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

export default function AdminGallery() {
  return (
    <ProtectedRoute>
      <GalleryContent />
    </ProtectedRoute>
  );
}

