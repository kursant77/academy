import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { X, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { uploadImage } from '@/lib/storage';

interface ImageUploadProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  folder: string;
  label?: string;
  required?: boolean;
}

export function ImageUpload({ value, onChange, folder, label = 'Rasm', required = false }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(value || null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Value o'zgarganda preview'ni yangilash
  useEffect(() => {
    setPreview(value || null);
  }, [value]);

  const handleRemove = () => {
    setPreview(null);
    onChange(null);
  };

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
        description: errorMessage || 'Rasm yuklashda xatolik',
      });
      setPreview(null);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Value o'zgarganda preview'ni yangilash
  useEffect(() => {
    if (value && value !== preview) {
      setPreview(value);
    } else if (!value && preview) {
      setPreview(null);
    }
  }, [value, preview]);

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
                loading="lazy"
                decoding="async"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute right-2 top-2 z-10"
                onClick={handleRemove}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center w-full min-h-[120px] sm:min-h-[150px] border-2 border-dashed border-muted-foreground/25 rounded-lg bg-muted/20">
            <div className="text-center p-4">
              <Upload className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm sm:text-base text-muted-foreground mb-1">
                Rasm tanlanmagan
              </p>
              <p className="text-xs text-muted-foreground/80">
                Qurilmaning fayllaridan rasm yuklang
              </p>
            </div>
          </div>
        )}
        <div className="flex gap-2 sm:gap-3">
          <Button
            type="button"
            variant="default"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full sm:w-auto flex-1 sm:flex-initial"
          >
            {uploading ? (
              <>
                <Upload className="mr-2 h-4 w-4 animate-spin" />
                <span className="text-sm sm:text-base">Yuklanmoqda...</span>
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                <span className="text-sm sm:text-base">Qurilmadan yuklash</span>
              </>
            )}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={uploading}
          />
        </div>
      </div>
    </div>
  );
}
