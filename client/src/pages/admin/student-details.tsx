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
import type { StudentProfile, MonthlyPayment } from '@/types/admin';
import { Loader2, ArrowLeft, Calendar, CheckCircle2, XCircle, Clock, User, Phone, Mail, DollarSign, FileText, TrendingUp } from 'lucide-react';
import { format, isValid } from 'date-fns';
import { uz } from 'date-fns/locale';
import { getMonthName, getMonthsFromEnrollment } from './students';

// Xavfsiz sana formatlash funksiyasi
const safeFormat = (date: string | Date | null | undefined, formatStr: string, fallback: string = '—'): string => {
  if (!date) return fallback;
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    if (!isValid(dateObj)) return fallback;
    return format(dateObj, formatStr, { locale: uz });
  } catch {
    return fallback;
  }
};

// Oy nomlari
const monthNames: Record<string, string> = {
  '01': 'Yanvar',
  '02': 'Fevral',
  '03': 'Mart',
  '04': 'Aprel',
  '05': 'May',
  '06': 'Iyun',
  '07': 'Iyul',
  '08': 'Avgust',
  '09': 'Sentabr',
  '10': 'Oktabr',
  '11': 'Noyabr',
  '12': 'Dekabr',
};

function StudentDetailsContent({ studentId }: { studentId: string }) {
  const [, setLocation] = useLocation();
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // To'liq ma'lumotlarni yuklash - payment history va monthly payments bilan
        const fullStudent = await adminApi.getStudent(studentId);
        if (fullStudent) {
          setStudent(fullStudent);
        }
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('Error loading student:', error);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [studentId]);

  const stats = useMemo(() => {
    if (!student) return null;

    const totalPayments = student.monthlyPayments?.length || 0;
    const paidPayments = student.monthlyPayments?.filter(p => p.status === 'paid').length || 0;
    const unpaidPayments = totalPayments - paidPayments;
    const totalPaid = student.monthlyPayments?.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0) || 0;
    
    let enrollmentDate: Date | null = null;
    let enrollmentMonth = 'Noma\'lum';
    if (student.createdAt) {
      try {
        const date = new Date(student.createdAt);
        if (isValid(date)) {
          enrollmentDate = date;
          enrollmentMonth = getMonthName(student.createdAt.slice(0, 7));
        }
      } catch {
        // Xatolik bo'lsa, default qiymatlarni qoldiramiz
      }
    }
    
    return {
      totalPayments,
      paidPayments,
      unpaidPayments,
      totalPaid,
      enrollmentMonth,
      enrollmentDate,
    };
  }, [student]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Ma'lumotlar yuklanmoqda...
        </div>
      </AdminLayout>
    );
  }

  if (!student) {
    return (
      <AdminLayout>
        <div className="py-20 text-center text-muted-foreground">O'quvchi topilmadi</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <Button variant="ghost" size="sm" onClick={() => setLocation('/admin/students')} className="mt-1">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Barcha talabalar
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{student.fullName}</h1>
              <p className="text-muted-foreground mt-1">{student.courseName || 'Kurs tanlanmagan'}</p>
            </div>
          </div>
          <Badge 
            variant={student.paymentStatus === 'paid' && !student.isExpired ? 'default' : 'secondary'} 
            className={student.paymentStatus === 'paid' && !student.isExpired ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-amber-500/20 text-amber-600'}
          >
            {student.paymentStatus === 'paid' && !student.isExpired ? "To'langan" : "To'lanmagan"}
          </Badge>
        </div>

        {/* Asosiy ma'lumotlar */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <User className="h-4 w-4" />
                O'quvchi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={student.photoUrl} />
                  <AvatarFallback>{student.fullName.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{student.fullName}</p>
                  <p className="text-xs text-muted-foreground">{student.groupName || 'Guruhsiz'}</p>
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
              <p className="font-semibold">{student.parentName}</p>
              <p className="text-sm text-muted-foreground">{student.parentContact}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Oylik to'lov
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-emerald-600">{student.monthlyPayment.toLocaleString()} so'm</p>
              {student.paymentValidUntil && (
                <p className="text-xs text-muted-foreground mt-1">
                  {student.isExpired ? (
                    <span className="text-red-600">Muddati o'tgan</span>
                  ) : (
                    <span>Muddati: {safeFormat(student.paymentValidUntil, 'dd MMMM yyyy')}</span>
                  )}
                </p>
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
              {student.createdAt ? (
                <>
                  <p className="font-semibold">{safeFormat(student.createdAt, 'dd MMMM yyyy')}</p>
                  <p className="text-xs text-muted-foreground">{stats?.enrollmentMonth}</p>
                </>
              ) : (
                <p className="text-muted-foreground">Ma'lumot yo'q</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Statistika */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Jami to'lovlar</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats?.totalPayments || 0}</p>
              <p className="text-xs text-muted-foreground">Oylik to'lovlar soni</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                To'langan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-emerald-600">{stats?.paidPayments || 0}</p>
              <p className="text-xs text-muted-foreground">To'langan oylar</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <XCircle className="h-4 w-4 text-amber-500" />
                To'lanmagan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-amber-600">{stats?.unpaidPayments || 0}</p>
              <p className="text-xs text-muted-foreground">To'lanmagan oylar</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                Jami summa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-blue-600">{stats?.totalPaid.toLocaleString() || 0} so'm</p>
              <p className="text-xs text-muted-foreground">To'langan jami summa</p>
            </CardContent>
          </Card>
        </div>

        {/* Oylik to'lovlar holati */}
        <Card>
          <CardHeader>
            <CardTitle>Oylik to'lovlar holati</CardTitle>
            <CardDescription>
              {student.createdAt && stats?.enrollmentDate && (
                <>O'quvchi {stats?.enrollmentMonth} oyida qo'shilgan. To'lovlar {(() => {
                  try {
                    const enrollment = stats.enrollmentDate;
                    if (!isValid(enrollment)) return 'Noma\'lum';
                    const firstPaymentMonth = new Date(enrollment.getFullYear(), enrollment.getMonth() + 1, 1);
                    if (!isValid(firstPaymentMonth)) return 'Noma\'lum';
                    return getMonthName(firstPaymentMonth.toISOString().slice(0, 7));
                  } catch {
                    return 'Noma\'lum';
                  }
                })()} oyidan boshlanadi.</>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {getMonthsFromEnrollment(student.createdAt, 12).map((month) => {
                const isPaid = student.monthlyPayments?.some(p => p.month === month && p.status === 'paid');
                const payment = student.monthlyPayments?.find(p => p.month === month);
                let isFutureMonth = false;
                try {
                  const monthDate = new Date(month + '-01');
                  if (isValid(monthDate)) {
                    const now = new Date();
                    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                    isFutureMonth = monthDate > currentMonth;
                  }
                } catch {
                  // Xatolik bo'lsa, default qiymat
                }
                
                return (
                  <div
                    key={month}
                    className={`rounded-lg p-3 text-center border ${
                      isPaid 
                        ? 'bg-emerald-500/10 border-emerald-500/30' 
                        : isFutureMonth
                        ? 'bg-blue-500/10 border-blue-500/30 border-dashed'
                        : 'bg-amber-500/10 border-amber-500/30'
                    }`}
                  >
                    <div className="font-semibold text-sm">{monthNames[month.slice(5, 7)]}</div>
                    <div className="text-xs text-muted-foreground">{month.slice(0, 4)}</div>
                    <div className="mt-2">
                      {isPaid ? (
                        <CheckCircle2 className="h-5 w-5 mx-auto text-emerald-500" />
                      ) : (
                        <XCircle className="h-5 w-5 mx-auto text-amber-500" />
                      )}
                    </div>
                    {payment && (
                      <div className="text-xs mt-1 text-muted-foreground">
                        {payment.amount.toLocaleString()} so'm
                      </div>
                    )}
                    {isFutureMonth && !isPaid && (
                      <div className="text-xs mt-1 text-muted-foreground">🔮</div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* To'lovlar tarixi */}
        {student.history && student.history.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>To'lovlar tarixi</CardTitle>
              <CardDescription>Barcha to'lov tranzaksiyalari</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sana</TableHead>
                      <TableHead>Summa</TableHead>
                      <TableHead>Usul</TableHead>
                      <TableHead>Holat</TableHead>
                      <TableHead>Eslatma</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {student.history.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>{safeFormat(entry.date, 'dd MMMM yyyy')}</TableCell>
                        <TableCell className="font-semibold">{entry.amount.toLocaleString()} so'm</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {entry.method === 'cash' ? '💵 Naqd' : entry.method === 'card' ? '💳 Karta' : '🏦 O\'tkazma'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={entry.status === 'paid' ? 'default' : 'secondary'}>
                            {entry.status === 'paid' ? 'To\'langan' : 'Kutilmoqda'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{entry.note || '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Qo'shimcha ma'lumotlar */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Qo'shimcha ma'lumotlar
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Guruh</p>
                <p className="font-semibold">{student.groupName || 'Guruhsiz'}</p>
                {student.groupSchedule && (
                  <p className="text-xs text-muted-foreground">{student.groupSchedule}</p>
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ustoz</p>
                <p className="font-semibold">{student.teacherName || 'Ustoz tanlanmagan'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Kurs</p>
                <p className="font-semibold">{student.courseName || 'Kurs tanlanmagan'}</p>
              </div>
              {student.notes && (
                <div>
                  <p className="text-sm text-muted-foreground">Eslatma</p>
                  <p className="text-sm whitespace-pre-wrap">{student.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                To'lov holati
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {student.paymentValidUntil && (
                <div>
                  <p className="text-sm text-muted-foreground">To'lov muddati</p>
                  <p className={`font-semibold ${student.isExpired ? 'text-red-600' : 'text-emerald-600'}`}>
                    {safeFormat(student.paymentValidUntil, 'dd MMMM yyyy')}
                  </p>
                  {!student.isExpired && student.daysRemaining && (
                    <p className="text-xs text-muted-foreground">{student.daysRemaining} kun qoldi</p>
                  )}
                </div>
              )}
              {student.lastPaidMonth && (
                <div>
                  <p className="text-sm text-muted-foreground">Oxirgi to'langan oy</p>
                  <p className="font-semibold">{getMonthName(student.lastPaidMonth)}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Joriy holat</p>
                <Badge 
                  variant={student.paymentStatus === 'paid' && !student.isExpired ? 'default' : 'secondary'}
                  className={student.paymentStatus === 'paid' && !student.isExpired ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-amber-500/20 text-amber-600'}
                >
                  {student.paymentStatus === 'paid' && !student.isExpired ? "To'langan" : "To'lanmagan"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}

function StudentDetailsRoute() {
  const [match, params] = useRoute<{ id: string }>('/admin/students/:id');
  if (!match || !params?.id) {
    return (
      <AdminLayout>
        <div className="py-20 text-center text-muted-foreground">O'quvchi topilmadi</div>
      </AdminLayout>
    );
  }
  return <StudentDetailsContent studentId={params.id} />;
}

export default function AdminStudentDetailsPage() {
  return (
    <ProtectedRoute>
      <StudentDetailsRoute />
    </ProtectedRoute>
  );
}

