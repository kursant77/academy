import { useEffect, useState, useMemo } from 'react';
import { useLocation, useRoute } from 'wouter';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AdminLayout } from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { adminApi } from '@/lib/adminApi';
import { Loader2, ArrowLeft, User, Phone, Mail, BriefcaseBusiness, Star, Users, DollarSign, BookOpen, Calendar, Linkedin, MessageCircle, Instagram, Award } from 'lucide-react';
import { format } from 'date-fns';
import { uz } from 'date-fns/locale';
import type { GroupProfile } from '@/types/admin';

interface TeacherDetails {
  id: string;
  fullName: string;
  subject: string;
  experience: number;
  phone: string;
  monthlySalary: number;
  calculatedSalary?: number; // Dinamik hisoblangan oylik
  status: 'active' | 'inactive';
  photoUrl?: string;
  bio?: string;
  groups?: GroupProfile[];
  courses?: Array<{ id: string; name_uz: string; name_ru: string; name_en: string }>;
  totalStudents?: number;
  totalRevenue?: number;
  specialty_uz?: string;
  specialty_ru?: string;
  specialty_en?: string;
  bio_uz?: string;
  bio_ru?: string;
  bio_en?: string;
  linked_in?: string | null;
  telegram?: string | null;
  instagram?: string | null;
  featured?: boolean;
  created_at?: string;
  updated_at?: string;
}

function TeacherDetailsContent({ teacherId }: { teacherId: string }) {
  const [, setLocation] = useLocation();
  const [teacher, setTeacher] = useState<TeacherDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [payoutRate, setPayoutRate] = useState<number>(0.35);

  // Payout rate'ni localStorage'dan yuklash
  useEffect(() => {
    try {
      const stored = localStorage.getItem('academy_payout_rate');
      if (stored) {
        const parsed = parseFloat(stored);
        if (!isNaN(parsed) && parsed >= 0.20 && parsed <= 0.60) {
          setPayoutRate(parsed);
        }
      }
    } catch (error) {
      console.error('Error reading payout rate:', error);
    }
  }, []);

  // Payout rate o'zgarganda teacher ma'lumotlarini qayta yuklash
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const fullTeacher = await adminApi.getTeacher(teacherId, payoutRate);
        if (fullTeacher) {
          setTeacher(fullTeacher as TeacherDetails);
        }
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('Error loading teacher:', error);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [teacherId, payoutRate]);

  // localStorage o'zgarishlarini kuzatish (dashboard'dan o'zgarishlar uchun)
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const stored = localStorage.getItem('academy_payout_rate');
        if (stored) {
          const parsed = parseFloat(stored);
          if (!isNaN(parsed) && parsed >= 0.20 && parsed <= 0.60) {
            setPayoutRate(parsed);
          }
        }
      } catch (error) {
        console.error('Error reading payout rate:', error);
      }
    };

    // Storage event'larni kuzatish (boshqa tab'lar uchun)
    window.addEventListener('storage', handleStorageChange);
    
    // Custom event kuzatish (o'z tab'i uchun)
    window.addEventListener('payoutRateChanged', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('payoutRateChanged', handleStorageChange);
    };
  }, []);

  const stats = useMemo(() => {
    if (!teacher) return null;

    const activeGroups = teacher.groups?.filter(g => g.status === 'active').length || 0;
    const closedGroups = teacher.groups?.filter(g => g.status === 'closed').length || 0;
    const totalGroups = teacher.groups?.length || 0;
    const totalStudents = teacher.totalStudents || 0;
    const totalRevenue = teacher.totalRevenue || 0;
    const avgStudentsPerGroup = totalGroups > 0 ? Math.round(totalStudents / totalGroups) : 0;

    return {
      activeGroups,
      closedGroups,
      totalGroups,
      totalStudents,
      totalRevenue,
      avgStudentsPerGroup,
    };
  }, [teacher]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Ma'lumotlar yuklanmoqda...
        </div>
      </AdminLayout>
    );
  }

  if (!teacher) {
    return (
      <AdminLayout>
        <div className="py-20 text-center text-muted-foreground">O'qituvchi topilmadi</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <Button variant="ghost" size="sm" onClick={() => setLocation('/admin/teachers')} className="mt-1">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Barcha o'qituvchilar
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold">{teacher.fullName}</h1>
                {teacher.featured && (
                  <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                )}
              </div>
              <p className="text-muted-foreground mt-1">{teacher.specialty_uz || teacher.subject}</p>
            </div>
          </div>
          <Badge 
            variant={teacher.status === 'active' ? 'default' : 'secondary'} 
            className={teacher.status === 'active' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-gray-500/20 text-gray-600'}
          >
            {teacher.status === 'active' ? 'Faol' : 'Nofaol'}
          </Badge>
        </div>

        {/* Asosiy ma'lumotlar */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <User className="h-4 w-4" />
                O'qituvchi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={teacher.photoUrl} />
                  <AvatarFallback>{teacher.fullName.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{teacher.fullName}</p>
                  <p className="text-xs text-muted-foreground">{teacher.experience} yil tajriba</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Kontakt
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-semibold">{teacher.phone || '—'}</p>
              <div className="flex gap-2 mt-2">
                {teacher.telegram && (
                  <a href={teacher.telegram} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600">
                    <MessageCircle className="h-4 w-4" />
                  </a>
                )}
                {teacher.instagram && (
                  <a href={teacher.instagram} target="_blank" rel="noopener noreferrer" className="text-pink-500 hover:text-pink-600">
                    <Instagram className="h-4 w-4" />
                  </a>
                )}
                {teacher.linked_in && (
                  <a href={teacher.linked_in} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">
                    <Linkedin className="h-4 w-4" />
                  </a>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Oylik maosh
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Dinamik hisoblangan oylik (groups daromadlari * ulush) */}
              {teacher.calculatedSalary !== undefined ? (
                <>
                  <p className="text-2xl font-bold text-emerald-600">{Math.round(teacher.calculatedSalary).toLocaleString()} so'm</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Groups daromadlari: {teacher.totalRevenue?.toLocaleString() || 0} so'm × {Math.round(payoutRate * 100)}%
                  </p>
                  {teacher.monthlySalary > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      (Belgilangan: {teacher.monthlySalary.toLocaleString()} so'm)
                    </p>
                  )}
                </>
              ) : (
                <>
                  <p className="text-2xl font-bold text-emerald-600">{teacher.monthlySalary.toLocaleString()} so'm</p>
                  <p className="text-xs text-muted-foreground mt-1">Oylik ish haqi</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Qo'shilgan sana
              </CardTitle>
            </CardHeader>
            <CardContent>
              {teacher.created_at ? (() => {
                try {
                  const date = new Date(teacher.created_at);
                  if (isNaN(date.getTime())) {
                    return <p className="text-muted-foreground">Ma'lumot yo'q</p>;
                  }
                  return (
                    <>
                      <p className="font-semibold">{format(date, 'dd MMMM yyyy', { locale: uz })}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(date, 'HH:mm', { locale: uz })}
                      </p>
                    </>
                  );
                } catch {
                  return <p className="text-muted-foreground">Ma'lumot yo'q</p>;
                }
              })() : (
                <p className="text-muted-foreground">Ma'lumot yo'q</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Statistika */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4" />
                Jami guruhlar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats?.totalGroups || 0}</p>
              <p className="text-xs text-muted-foreground">
                {stats?.activeGroups || 0} faol, {stats?.closedGroups || 0} yopilgan
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <User className="h-4 w-4 text-blue-500" />
                Jami o'quvchilar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-blue-600">{stats?.totalStudents || 0}</p>
              <p className="text-xs text-muted-foreground">
                {stats?.avgStudentsPerGroup || 0} o'rtacha guruh bo'yicha
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-emerald-500" />
                Jami daromad
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-emerald-600">{stats?.totalRevenue.toLocaleString() || 0} so'm</p>
              <p className="text-xs text-muted-foreground">Oylik daromad</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <Award className="h-4 w-4 text-amber-500" />
                Tajriba
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-amber-600">{teacher.experience} yil</p>
              <p className="text-xs text-muted-foreground">Ish tajribasi</p>
            </CardContent>
          </Card>
        </div>

        {/* Bio va ma'lumotlar */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Biografiya
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">O'zbekcha</p>
                <p className="text-sm whitespace-pre-wrap">{teacher.bio_uz || teacher.bio || '—'}</p>
              </div>
              {teacher.bio_ru && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Ruscha</p>
                  <p className="text-sm whitespace-pre-wrap">{teacher.bio_ru}</p>
                </div>
              )}
              {teacher.bio_en && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Inglizcha</p>
                  <p className="text-sm whitespace-pre-wrap">{teacher.bio_en}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BriefcaseBusiness className="h-4 w-4" />
                Qo'shimcha ma'lumotlar
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Yo'nalish (UZ)</p>
                <p className="font-semibold">{teacher.specialty_uz || '—'}</p>
              </div>
              {teacher.specialty_ru && (
                <div>
                  <p className="text-sm text-muted-foreground">Yo'nalish (RU)</p>
                  <p className="font-semibold">{teacher.specialty_ru}</p>
                </div>
              )}
              {teacher.specialty_en && (
                <div>
                  <p className="text-sm text-muted-foreground">Yo'nalish (EN)</p>
                  <p className="font-semibold">{teacher.specialty_en}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Holat</p>
                <Badge 
                  variant={teacher.status === 'active' ? 'default' : 'secondary'}
                  className={teacher.status === 'active' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-gray-500/20 text-gray-600'}
                >
                  {teacher.status === 'active' ? 'Faol' : 'Nofaol'}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Featured</p>
                <Badge variant={teacher.featured ? 'default' : 'outline'}>
                  {teacher.featured ? 'Ha' : 'Yo\'q'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Kurslar */}
        {teacher.courses && teacher.courses.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Kurslar</CardTitle>
              <CardDescription>O'qituvchi o'qitadigan kurslar</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {teacher.courses.map((course) => (
                  <div key={course.id} className="rounded-lg border p-3 hover:bg-muted/50">
                    <p className="font-semibold">{course.name_uz}</p>
                    {course.name_ru && (
                      <p className="text-xs text-muted-foreground">{course.name_ru}</p>
                    )}
                    {course.name_en && (
                      <p className="text-xs text-muted-foreground">{course.name_en}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Guruhlar */}
        {teacher.groups && teacher.groups.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Guruhlar</CardTitle>
              <CardDescription>O'qituvchining boshqaradigan guruhlari</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Guruh nomi</TableHead>
                      <TableHead>Kurs</TableHead>
                      <TableHead>Jadval</TableHead>
                      <TableHead>Xona</TableHead>
                      <TableHead>O'quvchilar</TableHead>
                      <TableHead>Holat</TableHead>
                      <TableHead>Oylik daromad</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teacher.groups.map((group) => (
                      <TableRow 
                        key={group.id}
                        className="cursor-pointer"
                        onClick={() => setLocation(`/admin/groups/${group.id}`)}
                      >
                        <TableCell className="font-semibold">{group.name}</TableCell>
                        <TableCell>{group.courseName || '—'}</TableCell>
                        <TableCell>{group.schedule || '—'}</TableCell>
                        <TableCell>{group.room || '—'}</TableCell>
                        <TableCell>
                          {group.currentStudents} / {group.maxStudents}
                        </TableCell>
                        <TableCell>
                          <Badge variant={group.status === 'active' ? 'default' : 'secondary'}>
                            {group.status === 'active' ? 'Faol' : 'Yopilgan'}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-semibold text-emerald-600">
                          {group.monthlyRevenue.toLocaleString()} so'm
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Agar guruhlar bo'lmasa */}
        {(!teacher.groups || teacher.groups.length === 0) && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Hozircha guruhlar yo'q
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}

function TeacherDetailsRoute() {
  const [match, params] = useRoute<{ id: string }>('/admin/teachers/:id');
  if (!match || !params?.id) {
    return (
      <AdminLayout>
        <div className="py-20 text-center text-muted-foreground">O'qituvchi topilmadi</div>
      </AdminLayout>
    );
  }
  return <TeacherDetailsContent teacherId={params.id} />;
}

export default function AdminTeacherDetailsPage() {
  return (
    <ProtectedRoute>
      <TeacherDetailsRoute />
    </ProtectedRoute>
  );
}

