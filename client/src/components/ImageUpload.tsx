import { useState, useRef, useEffect } from 'react';
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
import { Upload, X, Image as ImageIcon, FolderOpen, Search } from 'lucide-react';
import { uploadImage } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import type { GalleryItem } from '@shared/schema';

interface ImageUploadProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  folder: string;
  label?: string;
  required?: boolean;
}

export function ImageUpload({ value, onChange, folder, label = 'Rasm', required = false }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value || null);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [gallerySearch, setGallerySearch] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Value o'zgarganda preview'ni yangilash
  useEffect(() => {
    setPreview(value || null);
  }, [value]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Fayl turini tekshirish
    if (!file.type.startsWith('image/')) {
      toast({
        variant: 'destructive',
        title: 'Xatolik',
        description: 'Iltimos, faqat rasm faylini tanlang',
      });
      return;
    }

    // Fayl hajmini tekshirish (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: 'destructive',
        title: 'Xatolik',
        description: 'Rasm hajmi 5MB dan katta bo\'lmasligi kerak',
      });
      return;
    }

    // Preview yaratish
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Faylni yuklash
    setUploading(true);
    try {
      const url = await uploadImage(file, folder);
      onChange(url);
      toast({
        title: 'Muvaffaqiyatli',
        description: 'Rasm muvaffaqiyatli yuklandi',
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast({
        variant: 'destructive',
        title: 'Xatolik',
        description: error.message || 'Rasm yuklashda xatolik',
      });
      setPreview(null);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Galereyani yuklash
  const loadGallery = async () => {
    if (!galleryOpen) return;
    try {
      setGalleryLoading(true);
      const { data, error } = await supabase
        .from('gallery_items')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setGalleryItems(data || []);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast({
        variant: 'destructive',
        title: 'Xatolik',
        description: `Galereyani yuklashda xatolik: ${errorMessage}`,
      });
    } finally {
      setGalleryLoading(false);
    }
  };

  useEffect(() => {
    if (galleryOpen) {
      loadGallery();
    }
  }, [galleryOpen]);

  const handleSelectFromGallery = (imageUrl: string) => {
    onChange(imageUrl);
    setPreview(imageUrl);
    setGalleryOpen(false);
    toast({
      title: 'Muvaffaqiyatli',
      description: 'Rasm galereyadan tanlandi',
    });
  };

  // Filtered gallery items
  const filteredGalleryItems = galleryItems.filter(item => {
    if (!gallerySearch) return true;
    const searchLower = gallerySearch.toLowerCase();
    return (
      item.title_uz?.toLowerCase().includes(searchLower) ||
      item.title_ru?.toLowerCase().includes(searchLower) ||
      item.title_en?.toLowerCase().includes(searchLower) ||
      item.description_uz?.toLowerCase().includes(searchLower) ||
      item.description_ru?.toLowerCase().includes(searchLower) ||
      item.description_en?.toLowerCase().includes(searchLower)
    );
  });

  // Value o'zgarganda preview'ni yangilash
  useEffect(() => {
    if (value && value !== preview) {
      setPreview(value);
    } else if (!value && preview) {
      setPreview(null);
    }
  }, [value]);

  return (
    <div className="space-y-2">
      <Label>{label} {required && '*'}</Label>
      <div className="flex flex-col gap-4">
        {preview ? (
          <div className="relative w-full">
            <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
              <img
                src={preview}
                alt="Preview"
                className="h-full w-full object-cover"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute right-2 top-2"
                onClick={handleRemove}
                disabled={uploading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center w-full">
            <label
              htmlFor={`image-upload-${folder}`}
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <ImageIcon className="w-10 h-10 mb-3 text-muted-foreground" />
                <p className="mb-2 text-sm text-muted-foreground">
                  <span className="font-semibold">Rasm yuklash uchun bosing</span> yoki bu yerga sudrab tashlang
                </p>
                <p className="text-xs text-muted-foreground">PNG, JPG yoki WEBP (MAX. 5MB)</p>
              </div>
              <input
                ref={fileInputRef}
                id={`image-upload-${folder}`}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileSelect}
                disabled={uploading}
              />
            </label>
          </div>
        )}
        <div className="flex gap-2">
          {!preview && (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex-1"
              >
                {uploading ? (
                  <>
                    <Upload className="mr-2 h-4 w-4 animate-spin" />
                    Yuklanmoqda...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Kompyuterdan yuklash
                  </>
                )}
              </Button>
              <Dialog open={galleryOpen} onOpenChange={setGalleryOpen}>
                <DialogTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={uploading}
                    className="flex-1"
                  >
                    <FolderOpen className="mr-2 h-4 w-4" />
                    Galereyadan tanlash
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Galereyadan rasm tanlash</DialogTitle>
                    <DialogDescription>
                      Mavjud rasmlardan birini tanlang yoki yangi rasm yuklang
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Rasmlarni qidirish..."
                        value={gallerySearch}
                        onChange={(e) => setGallerySearch(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    {galleryLoading ? (
                      <div className="text-center py-8 text-sm text-muted-foreground">
                        Yuklanmoqda...
                      </div>
                    ) : filteredGalleryItems.length === 0 ? (
                      <div className="text-center py-8 text-sm text-muted-foreground">
                        {gallerySearch ? 'Rasmlar topilmadi' : 'Galereyada rasmlar yo\'q'}
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {filteredGalleryItems.map((item) => (
                          <div
                            key={item.id}
                            className="group relative aspect-video overflow-hidden rounded-lg border cursor-pointer hover:border-primary transition-all hover:shadow-lg"
                            onClick={() => handleSelectFromGallery(item.image_url)}
                          >
                            <img
                              src={item.image_url}
                              alt={item.title_uz || 'Gallery image'}
                              className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                            {item.title_uz && (
                              <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                <p className="text-xs text-white truncate">{item.title_uz}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

