import { useState, useEffect } from 'react';
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
  DialogHeader,
  DialogTitle,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';

// Types
interface SystemOption {
  id: string;
  option_type: string;
  option_key: string;
  name_uz: string;
  name_ru: string;
  name_en: string;
  sort_order: number;
  is_active: boolean;
}

// Kategoriya turlari
const optionTypes = [
  { key: 'course_level', name: 'Kurs darajalari' },
  { key: 'course_category', name: 'Kurs kategoriyalari' },
  { key: 'event_category', name: 'Tadbir kategoriyalari' },
];

function CategoriesContent() {
  const [options, setOptions] = useState<SystemOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOption, setEditingOption] = useState<SystemOption | null>(null);
  const [activeTab, setActiveTab] = useState('course_level');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteOption, setDeleteOption] = useState<SystemOption | null>(null);
  
  const [formData, setFormData] = useState({
    name_uz: '',
    name_ru: '',
    name_en: '',
  });
  
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('system_options')
        .select('*')
        .order('sort_order');

      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      setOptions(data || []);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error saving category:', errorMessage);
      console.error('Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter options by current tab
  const currentOptions = options.filter(o => o.option_type === activeTab);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      
      const data = {
        option_type: activeTab,
        option_key: formData.name_uz.toLowerCase().replace(/[^a-z0-9]/g, '_'),
        name_uz: formData.name_uz,
        name_ru: formData.name_ru || formData.name_uz,
        name_en: formData.name_en || formData.name_uz,
        sort_order: currentOptions.length + 1,
        is_active: true,
      };

      if (editingOption) {
        const { error } = await supabase
          .from('system_options')
          .update({
            name_uz: formData.name_uz,
            name_ru: formData.name_ru || formData.name_uz,
            name_en: formData.name_en || formData.name_uz,
          })
          .eq('id', editingOption.id);

        if (error) throw error;
        toast({ title: 'Yangilandi' });
      } else {
        const { error } = await supabase
          .from('system_options')
          .insert([data]);

        if (error) throw error;
        toast({ title: 'Qo\'shildi' });
      }

      setIsDialogOpen(false);
      resetForm();
      loadData();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error saving category:', errorMessage);
      toast({
        title: 'Xatolik',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (option: SystemOption) => {
    setDeleteOption(option);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteOption) return;

    try {
      const { error } = await supabase
        .from('system_options')
        .delete()
        .eq('id', deleteOption.id);

      if (error) throw error;
      toast({ title: 'O\'chirildi' });
      loadData();
      setDeleteDialogOpen(false);
      setDeleteOption(null);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error saving category:', errorMessage);
      toast({
        title: 'Xatolik',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (option: SystemOption) => {
    setEditingOption(option);
    setFormData({
      name_uz: option.name_uz,
      name_ru: option.name_ru,
      name_en: option.name_en,
    });
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingOption(null);
    setFormData({
      name_uz: '',
      name_ru: '',
      name_en: '',
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingOption(null);
    setFormData({
      name_uz: '',
      name_ru: '',
      name_en: '',
    });
  };
  
  const handleDialogClose = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    setIsDialogOpen(open);
  };

  return (
    <AdminLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">Kategoriyalar</h2>
            <p className="text-sm text-muted-foreground">
              Kurs darajalari, kurs kategoriyalari va tadbir kategoriyalari
            </p>
          </div>
          <Button onClick={handleAddNew} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Qo'shish
          </Button>
        </div>

        {/* Tabs */}
        <Card>
          <CardContent className="p-3 sm:p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="overflow-x-auto pb-2">
                <TabsList className="inline-flex w-max">
                  {optionTypes.map(type => (
                    <TabsTrigger key={type.key} value={type.key} className="text-xs sm:text-sm whitespace-nowrap">
                      {type.name}
                      <Badge variant="secondary" className="ml-1 text-[10px]">
                        {options.filter(o => o.option_type === type.key).length}
                      </Badge>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {optionTypes.map(type => (
                <TabsContent key={type.key} value={type.key} className="mt-4">
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : currentOptions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      Hali qiymatlar yo'q
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {currentOptions.map((option, index) => (
                        <div
                          key={option.id}
                          className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-muted-foreground text-sm w-6">{index + 1}.</span>
                            <div>
                              <div className="font-medium text-sm">{option.name_uz}</div>
                              <div className="text-xs text-muted-foreground">
                                {option.name_ru} / {option.name_en}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(option)}>
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeleteClick(option)}>
                              <Trash2 className="h-3 w-3 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        {/* Add/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>
                {editingOption ? 'Tahrirlash' : 'Yangi qiymat'}
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                {optionTypes.find(t => t.key === activeTab)?.name}
              </p>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Nomi (UZ) *</Label>
                <Input
                  value={formData.name_uz}
                  onChange={(e) => setFormData({ ...formData, name_uz: e.target.value })}
                  placeholder="O'zbekcha nomi"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label>Nomi (RU)</Label>
                <Input
                  value={formData.name_ru}
                  onChange={(e) => setFormData({ ...formData, name_ru: e.target.value })}
                  placeholder="Ruscha nomi"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Nomi (EN)</Label>
                <Input
                  value={formData.name_en}
                  onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                  placeholder="Inglizcha nomi"
                />
              </div>
              
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => handleDialogClose(false)}>
                  Bekor
                </Button>
                <Button type="submit" size="sm" disabled={isSubmitting || !formData.name_uz.trim()}>
                  {isSubmitting && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                  {editingOption ? 'Saqlash' : 'Qo\'shish'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>O'chirishni tasdiqlash</AlertDialogTitle>
              <AlertDialogDescription>
                {deleteOption && `"${deleteOption.name_uz}" ni o'chirishni xohlaysizmi? Bu amalni qaytarib bo'lmaydi.`}
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

export default function AdminCategories() {
  return (
    <ProtectedRoute>
      <CategoriesContent />
    </ProtectedRoute>
  );
}
