import { supabase } from './supabase';

export async function uploadImage(file: File, folder: string): Promise<string> {
  try {
    // Fayl nomini yaratish (timestamp + random)
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

    // Faylni Supabase Storage'ga yuklash
    const { data, error } = await supabase.storage
      .from('images')
      .upload(fileName, file, {
        cacheControl: '31536000', // 1 yil - uzun muddatli cache
        upsert: false,
        contentType: file.type || 'image/jpeg',
      });

    if (error) throw error;

    // Public URL olish
    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(data.path);

    return publicUrl;
  } catch (error: any) {
    console.error('Error uploading image:', error);
    throw new Error(error.message || 'Rasm yuklashda xatolik yuz berdi');
  }
}

export async function deleteImage(url: string): Promise<void> {
  try {
    // URL dan fayl path'ini olish
    const urlParts = url.split('/');
    const fileName = urlParts.slice(-2).join('/'); // folder/filename

    const { error } = await supabase.storage
      .from('images')
      .remove([fileName]);

    if (error) throw error;
  } catch (error: any) {
    console.error('Error deleting image:', error);
    // O'chirishda xatolik bo'lsa ham davom etadi
  }
}

