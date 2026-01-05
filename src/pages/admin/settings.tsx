import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AdminLayout } from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Save, Loader2, MapPin, Phone, Mail, Clock, Facebook, Instagram, Send, Youtube, Linkedin, Twitter } from 'lucide-react';

interface ContentBlock {
  id?: string;
  section: string;
  content_key: string;
  locale: string;
  value: string;
}

function SettingsContent() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('contact');

  // Contact ma'lumotlari
  const [contactData, setContactData] = useState({
    address_uz: '',
    address_ru: '',
    address_en: '',
    phone: '',
    email: '',
    hours_week: '',
    hours_sat: '',
    hours_sun_uz: '',
    hours_sun_ru: '',
    hours_sun_en: '',
  });

  // Ijtimoiy tarmoq linklari
  const [socialData, setSocialData] = useState({
    facebook: '',
    instagram: '',
    telegram: '',
    youtube: '',
    linkedin: '',
    twitter: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Contact ma'lumotlarini yuklash
      const { data: contactBlocks, error: contactError } = await supabase
        .from('content_blocks')
        .select('*')
        .eq('section', 'contact');

      if (contactError && contactError.code !== 'PGRST116') {
        throw contactError;
      }

      // Ma'lumotlarni to'ldirish
      const contactObj: any = {};
      if (contactBlocks) {
        contactBlocks.forEach((block) => {
          const key = `${block.content_key}_${block.locale}`;
          contactObj[key] = block.value;
        });
      }

      setContactData({
        address_uz: contactObj.address_uz || '',
        address_ru: contactObj.address_ru || '',
        address_en: contactObj.address_en || '',
        phone: contactObj.phone_uz || contactObj.phone || '',
        email: contactObj.email_uz || contactObj.email || '',
        hours_week: contactObj.hours_week_uz || contactObj.hours_week_ru || contactObj.hours_week_en || '',
        hours_sat: contactObj.hours_sat_uz || contactObj.hours_sat_ru || contactObj.hours_sat_en || '',
        hours_sun_uz: contactObj.hours_sun_uz || '',
        hours_sun_ru: contactObj.hours_sun_ru || '',
        hours_sun_en: contactObj.hours_sun_en || '',
      });

      // Ijtimoiy tarmoq linklarini yuklash
      const { data: socialBlocks, error: socialError } = await supabase
        .from('content_blocks')
        .select('*')
        .eq('section', 'social');

      if (socialError && socialError.code !== 'PGRST116') {
        throw socialError;
      }

      const socialObj: any = {};
      if (socialBlocks) {
        socialBlocks.forEach((block) => {
          socialObj[block.content_key] = block.value;
        });
      }

      setSocialData({
        facebook: socialObj.facebook || '',
        instagram: socialObj.instagram || '',
        telegram: socialObj.telegram || '',
        youtube: socialObj.youtube || '',
        linkedin: socialObj.linkedin || '',
        twitter: socialObj.twitter || '',
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error loading settings:', errorMessage);
      toast({
        title: 'Xatolik',
        description: 'Ma\'lumotlarni yuklashda xatolik yuz berdi',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const saveContentBlock = async (section: string, contentKey: string, locale: string, value: string) => {
    // Avval mavjud bo'lsa o'chirish
    const { error: deleteError } = await supabase
      .from('content_blocks')
      .delete()
      .eq('section', section)
      .eq('content_key', contentKey)
      .eq('locale', locale);

    if (deleteError && deleteError.code !== 'PGRST116') {
      throw deleteError;
    }

    // Yangi qo'shish
    if (value.trim()) {
      const { error: insertError } = await supabase
        .from('content_blocks')
        .insert({
          section,
          content_key: contentKey,
          locale,
          value: value.trim(),
        });

      if (insertError) {
        throw insertError;
      }
    }
  };

  const handleSaveContact = async () => {
    try {
      setSaving(true);

      // Address
      await saveContentBlock('contact', 'address', 'uz', contactData.address_uz);
      await saveContentBlock('contact', 'address', 'ru', contactData.address_ru);
      await saveContentBlock('contact', 'address', 'en', contactData.address_en);

      // Phone (umumiy, barcha tillar uchun bir xil)
      await saveContentBlock('contact', 'phone', 'uz', contactData.phone);
      await saveContentBlock('contact', 'phone', 'ru', contactData.phone);
      await saveContentBlock('contact', 'phone', 'en', contactData.phone);

      // Email (umumiy, barcha tillar uchun bir xil)
      await saveContentBlock('contact', 'email', 'uz', contactData.email);
      await saveContentBlock('contact', 'email', 'ru', contactData.email);
      await saveContentBlock('contact', 'email', 'en', contactData.email);

      // Hours (week va sat barcha tillar uchun bir xil, faqat sun har xil)
      await saveContentBlock('contact', 'hours_week', 'uz', contactData.hours_week);
      await saveContentBlock('contact', 'hours_week', 'ru', contactData.hours_week);
      await saveContentBlock('contact', 'hours_week', 'en', contactData.hours_week);

      await saveContentBlock('contact', 'hours_sat', 'uz', contactData.hours_sat);
      await saveContentBlock('contact', 'hours_sat', 'ru', contactData.hours_sat);
      await saveContentBlock('contact', 'hours_sat', 'en', contactData.hours_sat);

      await saveContentBlock('contact', 'hours_sun', 'uz', contactData.hours_sun_uz);
      await saveContentBlock('contact', 'hours_sun', 'ru', contactData.hours_sun_ru);
      await saveContentBlock('contact', 'hours_sun', 'en', contactData.hours_sun_en);

      toast({
        title: 'Muvaffaqiyatli',
        description: 'Contact ma\'lumotlari saqlandi',
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error saving contact:', errorMessage);
      toast({
        title: 'Xatolik',
        description: 'Ma\'lumotlarni saqlashda xatolik yuz berdi',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSocial = async () => {
    try {
      setSaving(true);

      // Ijtimoiy tarmoq linklarini saqlash (locale yo'q, faqat key)
      const socialKeys = ['facebook', 'instagram', 'telegram', 'youtube', 'linkedin', 'twitter'];

      for (const key of socialKeys) {
        const value = socialData[key as keyof typeof socialData];

        // Avval mavjud bo'lsa o'chirish
        await supabase
          .from('content_blocks')
          .delete()
          .eq('section', 'social')
          .eq('content_key', key);

        // Yangi qo'shish (agar value bo'lsa)
        if (value.trim()) {
          await supabase
            .from('content_blocks')
            .insert({
              section: 'social',
              content_key: key,
              locale: 'uz', // Default locale
              value: value.trim(),
            });
        }
      }

      toast({
        title: 'Muvaffaqiyatli',
        description: 'Ijtimoiy tarmoq linklari saqlandi',
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error saving social:', errorMessage);
      toast({
        title: 'Xatolik',
        description: 'Ma\'lumotlarni saqlashda xatolik yuz berdi',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-2xl sm:text-3xl font-bold">Sozlamalar</h2>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              Contact ma'lumotlari va ijtimoiy tarmoq linklarini boshqarish
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="contact">Contact Ma'lumotlari</TabsTrigger>
            <TabsTrigger value="social">Ijtimoiy Tarmoqlar</TabsTrigger>
          </TabsList>

          {/* Contact Ma'lumotlari */}
          <TabsContent value="contact" className="space-y-4 sm:space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Contact Ma'lumotlari
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                {/* Address */}
                <div className="space-y-4">
                  <Label className="text-base sm:text-lg font-semibold">Manzil</Label>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm sm:text-base font-medium">O'zbekcha</Label>
                      <Input
                        value={contactData.address_uz}
                        onChange={(e) => setContactData({ ...contactData, address_uz: e.target.value })}
                        placeholder="Masalan: Tashkent, Chilonzor district, Bunyodkor Avenue 12"
                        className="h-11 sm:h-10 text-base sm:text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm sm:text-base font-medium">Ruscha</Label>
                      <Input
                        value={contactData.address_ru}
                        onChange={(e) => setContactData({ ...contactData, address_ru: e.target.value })}
                        placeholder="Например: Ташкент, Чилонзор район, проспект Бунёдкор 12"
                        className="h-11 sm:h-10 text-base sm:text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm sm:text-base font-medium">Inglizcha</Label>
                      <Input
                        value={contactData.address_en}
                        onChange={(e) => setContactData({ ...contactData, address_en: e.target.value })}
                        placeholder="For example: Tashkent, Chilonzor district, Bunyodkor Avenue 12"
                        className="h-11 sm:h-10 text-base sm:text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Phone & Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm sm:text-base font-medium flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Telefon raqami
                    </Label>
                    <Input
                      value={contactData.phone}
                      onChange={(e) => setContactData({ ...contactData, phone: e.target.value })}
                      placeholder="+998 90 123 45 67"
                      className="h-11 sm:h-10 text-base sm:text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm sm:text-base font-medium flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email manzil
                    </Label>
                    <Input
                      type="email"
                      value={contactData.email}
                      onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
                      placeholder="info@aplus.uz"
                      className="h-11 sm:h-10 text-base sm:text-sm"
                    />
                  </div>
                </div>

                {/* Working Hours */}
                <div className="space-y-4 pt-4 border-t">
                  <Label className="text-base sm:text-lg font-semibold flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Ish vaqti
                  </Label>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm sm:text-base font-medium">Dushanba - Juma</Label>
                      <Input
                        value={contactData.hours_week}
                        onChange={(e) => setContactData({ ...contactData, hours_week: e.target.value })}
                        placeholder="09:00 - 18:00"
                        className="h-11 sm:h-10 text-base sm:text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm sm:text-base font-medium">Shanba</Label>
                      <Input
                        value={contactData.hours_sat}
                        onChange={(e) => setContactData({ ...contactData, hours_sat: e.target.value })}
                        placeholder="09:00 - 14:00"
                        className="h-11 sm:h-10 text-base sm:text-sm"
                      />
                    </div>
                  </div>

                  {/* Yakshanba - 3 ta tilda */}
                  <div className="space-y-4 pt-2">
                    <Label className="text-base sm:text-lg font-medium">Yakshanba</Label>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm sm:text-base font-medium">O'zbekcha</Label>
                        <Input
                          value={contactData.hours_sun_uz}
                          onChange={(e) => setContactData({ ...contactData, hours_sun_uz: e.target.value })}
                          placeholder="Dam olish kuni"
                          className="h-11 sm:h-10 text-base sm:text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm sm:text-base font-medium">Ruscha</Label>
                        <Input
                          value={contactData.hours_sun_ru}
                          onChange={(e) => setContactData({ ...contactData, hours_sun_ru: e.target.value })}
                          placeholder="Выходной"
                          className="h-11 sm:h-10 text-base sm:text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm sm:text-base font-medium">Inglizcha</Label>
                        <Input
                          value={contactData.hours_sun_en}
                          onChange={(e) => setContactData({ ...contactData, hours_sun_en: e.target.value })}
                          placeholder="Closed"
                          className="h-11 sm:h-10 text-base sm:text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleSaveContact}
                  disabled={saving}
                  className="w-full sm:w-auto h-11 sm:h-10"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saqlanmoqda...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Saqlash
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Ijtimoiy Tarmoqlar */}
          <TabsContent value="social" className="space-y-4 sm:space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Facebook className="h-5 w-5" />
                  Ijtimoiy Tarmoq Linklari
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm sm:text-base font-medium flex items-center gap-2">
                      <Facebook className="h-4 w-4 text-blue-600" />
                      Facebook
                    </Label>
                    <Input
                      type="url"
                      value={socialData.facebook}
                      onChange={(e) => setSocialData({ ...socialData, facebook: e.target.value })}
                      placeholder="https://facebook.com/yourpage"
                      className="h-11 sm:h-10 text-base sm:text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm sm:text-base font-medium flex items-center gap-2">
                      <Instagram className="h-4 w-4 text-pink-600" />
                      Instagram
                    </Label>
                    <Input
                      type="url"
                      value={socialData.instagram}
                      onChange={(e) => setSocialData({ ...socialData, instagram: e.target.value })}
                      placeholder="https://instagram.com/yourpage"
                      className="h-11 sm:h-10 text-base sm:text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm sm:text-base font-medium flex items-center gap-2">
                      <Send className="h-4 w-4 text-blue-500" />
                      Telegram
                    </Label>
                    <Input
                      type="url"
                      value={socialData.telegram}
                      onChange={(e) => setSocialData({ ...socialData, telegram: e.target.value })}
                      placeholder="https://t.me/yourchannel"
                      className="h-11 sm:h-10 text-base sm:text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm sm:text-base font-medium flex items-center gap-2">
                      <Youtube className="h-4 w-4 text-red-600" />
                      YouTube
                    </Label>
                    <Input
                      type="url"
                      value={socialData.youtube}
                      onChange={(e) => setSocialData({ ...socialData, youtube: e.target.value })}
                      placeholder="https://youtube.com/@yourchannel"
                      className="h-11 sm:h-10 text-base sm:text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm sm:text-base font-medium flex items-center gap-2">
                      <Linkedin className="h-4 w-4 text-blue-700" />
                      LinkedIn
                    </Label>
                    <Input
                      type="url"
                      value={socialData.linkedin}
                      onChange={(e) => setSocialData({ ...socialData, linkedin: e.target.value })}
                      placeholder="https://linkedin.com/company/yourcompany"
                      className="h-11 sm:h-10 text-base sm:text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm sm:text-base font-medium flex items-center gap-2">
                      <Twitter className="h-4 w-4 text-blue-400" />
                      Twitter / X
                    </Label>
                    <Input
                      type="url"
                      value={socialData.twitter}
                      onChange={(e) => setSocialData({ ...socialData, twitter: e.target.value })}
                      placeholder="https://twitter.com/yourhandle"
                      className="h-11 sm:h-10 text-base sm:text-sm"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleSaveSocial}
                  disabled={saving}
                  className="w-full sm:w-auto h-11 sm:h-10"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saqlanmoqda...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Saqlash
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}

export default function Settings() {
  return (
    <ProtectedRoute>
      <SettingsContent />
    </ProtectedRoute>
  );
}

