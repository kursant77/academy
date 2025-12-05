import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { uploadImage } from '@/lib/storage';

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Value o'zgarganda preview'ni yangilash
  useEffect(() => {
    setPreview(value || null);
  }, [value]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Fayl turini tekshirish
    if (!file.type.startsWith('image/')) {
      alert('Iltimos, faqat rasm faylini tanlang');
      return;
    }

    // Fayl hajmini tekshirish (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Rasm hajmi 5MB dan katta bo\'lmasligi kerak');
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
    } catch (error: any) {
      alert(error.message || 'Rasm yuklashda xatolik');
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
        {!preview && (
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full"
          >
            {uploading ? (
              <>
                <Upload className="mr-2 h-4 w-4 animate-spin" />
                Yuklanmoqda...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Rasm tanlash
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

