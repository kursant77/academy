import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AdminLayout } from '@/components/AdminLayout';
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
import { adminApi } from '@/lib/adminApi';
import type { Application, Course } from '@shared/schema';
import { Download, UserPlus, Loader2 } from 'lucide-react';

// Default oylik to'lov summasi (so'mda)
const DEFAULT_MONTHLY_PAYMENT = 500000;

function ApplicationsContent() {
  const [applications, setApplications] = useState<(Application & { course?: Course })[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrollingId, setEnrollingId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      // Avval arizalarni yuklaymiz
      const { data: apps, error: appsError } = await supabase
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (appsError) throw appsError;

      // Keyin kurslarni yuklaymiz
      const { data: courses, error: coursesError } = await supabase
        .from('courses')
        .select('id, name_uz, name_ru, name_en, price, duration, schedule');

      if (coursesError) {
        console.warn('Kurslarni yuklashda xatolik:', coursesError);
      }

      console.log('Loaded courses:', courses);

      // Arizalarga kurs ma'lumotlarini qo'shamiz
      const appsWithCourses = (apps || []).map(app => {
        const course = courses?.find(c => c.id === app.course_id);
        console.log(`App ${app.full_name} course_id: ${app.course_id}, found course:`, course);
        return {
          ...app,
          courses: course || null
        };
      });

      console.log('Applications with courses:', appsWithCourses);
      setApplications(appsWithCourses);
    } catch (error: any) {
      toast({
        title: 'Xatolik',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // To'g'ridan-to'g'ri kursga qo'shish (dialogsiz)
  const handleEnrollStudent = async (app: Application & { courses?: any }) => {
    try {
      setEnrollingId(app.id);
      
      // Kurs ma'lumotlarini olish
      const courseData = app.courses;
      console.log('=== ENROLLMENT DEBUG ===');
      console.log('Full app data:', app);
      console.log('Course data from app:', courseData);
      console.log('Course ID:', app.course_id);
      
      const courseName = courseData?.name_uz || 'Noma\'lum';
      const courseSchedule = courseData?.schedule || '';
      let monthlyPayment = DEFAULT_MONTHLY_PAYMENT;
      
      // Kurs narxini olish
      if (courseData?.price) {
        const priceStr = String(courseData.price);
        console.log('Raw price value:', courseData.price, 'Type:', typeof courseData.price);
        // Narxdan raqamlarni ajratib olish (masalan: "500,000 so'm" -> 500000)
        const priceNumber = parseInt(priceStr.replace(/[^\d]/g, ''));
        console.log('Parsed price:', priceNumber, 'from string:', priceStr);
        if (!isNaN(priceNumber) && priceNumber > 0) {
          monthlyPayment = priceNumber;
        }
      } else {
        console.log('No price found in course data!');
      }

      const studentData = {
        fullName: app.full_name,
        groupId: null,
        parentName: app.full_name,
        parentContact: app.phone,
        monthlyPayment: monthlyPayment,
        paymentStatus: 'unpaid' as const,
        photoUrl: '',
        notes: `Yosh: ${app.age}\nQiziqishlar: ${app.interests}\nJadval: ${courseSchedule}`,
        courseName: courseName,
        history: [],
      };
      
      console.log('Creating student with data:', studentData);

      // O'quvchini yaratish
      await adminApi.createStudent(studentData);

      // Arizani o'chirish
      const { error: deleteError } = await supabase
        .from('applications')
        .delete()
        .eq('id', app.id);

      if (deleteError) {
        console.warn('Arizani o\'chirishda xatolik:', deleteError);
      }

      toast({
        title: 'Muvaffaqiyatli',
        description: `${app.full_name} o'quvchilar ro'yxatiga qo'shildi`,
      });

      loadApplications();
    } catch (error: any) {
      toast({
        title: 'Xatolik',
        description: error.message || 'O\'quvchini qo\'shishda xatolik yuz berdi',
        variant: 'destructive',
      });
    } finally {
      setEnrollingId(null);
    }
  };

  const exportToCSV = () => {
    const headers = ['Ism', 'Yosh', 'Telefon', 'Kurs', 'Narxi', 'Qiziqishlar', 'Sana'];
    const rows = applications.map((app) => [
      app.full_name,
      app.age.toString(),
      app.phone,
      (app as any).courses?.name_uz || 'Noma\'lum',
      (app as any).courses?.price || '',
      app.interests,
      new Date(app.created_at).toLocaleDateString(),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `applications_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <AdminLayout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-2xl sm:text-3xl font-bold">Ro'yxatdan o'tganlar</h2>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              Online forma orqali tushgan barcha arizalarni kuzating
            </p>
          </div>
          <Button onClick={exportToCSV} variant="outline" className="w-full sm:w-auto text-sm">
            <Download className="h-4 w-4 mr-2" />
            CSV yuklab olish
          </Button>
        </div>
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">O'quvchilar ro'yxati ({applications.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 overflow-x-auto">
            {loading ? (
              <div className="text-center py-8 text-sm">Yuklanmoqda...</div>
            ) : applications.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                Hozircha ro'yxatdan o'tganlar yo'q
              </div>
            ) : (
              <div className="min-w-[700px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs sm:text-sm">Ism</TableHead>
                      <TableHead className="text-xs sm:text-sm hidden md:table-cell">Yosh</TableHead>
                      <TableHead className="text-xs sm:text-sm">Telefon</TableHead>
                      <TableHead className="text-xs sm:text-sm hidden lg:table-cell">Kurs</TableHead>
                      <TableHead className="text-xs sm:text-sm hidden xl:table-cell">Qiziqishlar</TableHead>
                      <TableHead className="text-xs sm:text-sm">Sana</TableHead>
                      <TableHead className="text-xs sm:text-sm text-right">Amallar</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.map((app) => (
                      <TableRow key={app.id}>
                        <TableCell className="font-medium text-xs sm:text-sm">
                          <div>
                            <div>{app.full_name}</div>
                            <div className="md:hidden mt-1 text-xs text-muted-foreground">Yosh: {app.age}</div>
                            <div className="lg:hidden mt-1 text-xs text-muted-foreground">{(app as any).courses?.name_uz || 'Noma\'lum'}</div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-xs sm:text-sm">{app.age}</TableCell>
                        <TableCell className="text-xs sm:text-sm">{app.phone}</TableCell>
                        <TableCell className="hidden lg:table-cell text-xs sm:text-sm">
                          <div>
                            <div>{(app as any).courses?.name_uz || 'Noma\'lum'}</div>
                            <div className="text-xs text-muted-foreground">{(app as any).courses?.price ? `${(app as any).courses.price} so'm` : ''}</div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden xl:table-cell max-w-xs truncate text-xs sm:text-sm">{app.interests}</TableCell>
                        <TableCell className="text-xs sm:text-sm">{new Date(app.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            size="sm" 
                            onClick={() => handleEnrollStudent(app)}
                            disabled={enrollingId === app.id}
                            className="text-xs"
                          >
                            {enrollingId === app.id ? (
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            ) : (
                              <UserPlus className="h-3 w-3 mr-1" />
                            )}
                            Kursga qo'shish
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

export default function AdminApplications() {
  return (
    <ProtectedRoute>
      <ApplicationsContent />
    </ProtectedRoute>
  );
}
