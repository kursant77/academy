import { useEffect, useMemo, useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AdminLayout } from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { adminApi } from '@/lib/adminApi';
import { supabase } from '@/lib/supabase';
import type { GroupProfile, StudentPayload, StudentProfile, MonthlyPaymentPayload } from '@/types/admin';
import { Loader2, MoreHorizontal, Plus, Filter, Calendar, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { format, addMonths, startOfMonth } from 'date-fns';
import { uz } from 'date-fns/locale';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';

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

// Oy nomini olish funksiyasi
const getMonthName = (month: string): string => {
  const [year, monthNum] = month.split('-');
  return `${monthNames[monthNum]} ${year}`;
};

// Oxirgi N oyni olish
const getLastNMonths = (n: number): string[] => {
  const months: string[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(date.toISOString().slice(0, 7));
  }
  return months;
};

function StudentsContent() {
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [groups, setGroups] = useState<GroupProfile[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [historyStudent, setHistoryStudent] = useState<StudentProfile | null>(null);
  const [paymentStudent, setPaymentStudent] = useState<StudentProfile | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7));
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'transfer'>('card');
  const [editingStudent, setEditingStudent] = useState<StudentProfile | null>(null);
  const [formData, setFormData] = useState<StudentPayload & { courseName?: string }>({
    fullName: '',
    groupId: null,
    parentName: '',
    parentContact: '',
    monthlyPayment: 1500000,
    paymentStatus: 'paid',
    photoUrl: '',
    notes: '',
    courseName: '',
  });
  const [groupFilter, setGroupFilter] = useState<'all' | string>('all');
  const [unpaidGroupFilter, setUnpaidGroupFilter] = useState<'all' | string>('all');
  const [showUnpaidOnly, setShowUnpaidOnly] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadStudents();
    loadGroups();
    loadCourses();
    // To'lov muddati o'tganlarni yangilash
    adminApi.updateExpiredPayments();
  }, []);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const data = await adminApi.listStudents();
      setStudents(data);
    } catch (error) {
      console.error(error);
      toast({ title: 'Xatolik', description: 'Talabalar ro\'yxatini yuklab bo\'lmadi', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const loadGroups = async () => {
    try {
      const data = await adminApi.listGroups();
      console.log('Loaded groups:', data);
      setGroups(data);
    } catch (error) {
      console.error('Error loading groups:', error);
      toast({ title: 'Xatolik', description: 'Guruhlarni yuklab bo\'lmadi', variant: 'destructive' });
    }
  };

  const loadCourses = async () => {
    try {
      const { data, error } = await supabase.from('courses').select('id, name_uz, price');
      if (error) throw error;
      console.log('Loaded courses:', data);
      setCourses(data || []);
    } catch (error) {
      console.error('Error loading courses:', error);
    }
  };

  // Kursga qarab filterlangan guruhlar
  const filteredGroupsForForm = useMemo(() => {
    if (!formData.courseName) return groups;
    // Guruhlarni kurs nomi bo'yicha filter qilish
    return groups.filter(g => {
      // Guruh nomida kurs nomi bormi tekshirish
      const groupNameLower = g.name.toLowerCase();
      const courseNameLower = formData.courseName?.toLowerCase() || '';
      return groupNameLower.includes(courseNameLower) || courseNameLower.includes(groupNameLower.split(' ')[0]);
    });
  }, [groups, formData.courseName]);

  const resetForm = () => {
    setEditingStudent(null);
    setFormData({
      fullName: '',
      groupId: null,
      parentName: '',
      parentContact: '',
      monthlyPayment: 0,
      paymentStatus: 'paid',
      photoUrl: '',
      notes: '',
      courseName: '',
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      setIsSubmitting(true);
      if (editingStudent) {
        await adminApi.updateStudent(editingStudent.id, formData);
        toast({ title: 'Yangilandi', description: 'Talaba ma\'lumotlari muvaffaqiyatli yangilandi' });
      } else {
        await adminApi.createStudent({ ...formData, history: [] });
        toast({ title: 'Qo\'shildi', description: 'Talaba muvaffaqiyatli qo\'shildi' });
      }
      setFormOpen(false);
      resetForm();
      loadStudents();
      loadGroups();
    } catch (error) {
      console.error(error);
      toast({ title: 'Xatolik', description: 'Saqlashda muammo yuz berdi', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (student: StudentProfile) => {
    setEditingStudent(student);
    setFormData({
      fullName: student.fullName,
      groupId: student.groupId,
      parentName: student.parentName,
      parentContact: student.parentContact,
      monthlyPayment: student.monthlyPayment,
      paymentStatus: student.paymentStatus,
      photoUrl: student.photoUrl,
      notes: student.notes,
      history: student.history,
      courseName: student.courseName || '',
    });
    setFormOpen(true);
  };

  const handleDelete = async (student: StudentProfile) => {
    if (!confirm(`${student.fullName} ma'lumotlarini o'chirishni tasdiqlaysizmi?`)) return;
    try {
      await adminApi.deleteStudent(student.id);
      toast({ title: 'O\'chirildi', description: 'Talaba o\'chirildi' });
      loadStudents();
      loadGroups();
    } catch (error) {
      console.error(error);
      toast({ title: 'Xatolik', description: 'Talabani o\'chirishda muammo', variant: 'destructive' });
    }
  };

  const handleOpenPaymentDialog = (student: StudentProfile) => {
    setPaymentStudent(student);
    setSelectedMonth(new Date().toISOString().slice(0, 7));
    setPaymentMethod('card');
  };

  const handleRecordPayment = async () => {
    if (!paymentStudent) return;
    try {
      setIsSubmitting(true);
      await adminApi.recordMonthlyPayment({
        studentId: paymentStudent.id,
        month: selectedMonth,
        amount: paymentStudent.monthlyPayment,
        method: paymentMethod,
        note: `${getMonthName(selectedMonth)} oyi uchun to'lov`,
      });
      toast({ 
        title: 'To\'lov qabul qilindi', 
        description: `${paymentStudent.fullName} uchun ${getMonthName(selectedMonth)} oyi to'lovi qo'shildi` 
      });
      setPaymentStudent(null);
      loadStudents();
    } catch (error) {
      console.error(error);
      toast({ title: 'Xatolik', description: 'To\'lovni yozib bo\'lmadi', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Talaba qaysi oylarni to'laganligini tekshirish
  const isMonthPaid = (student: StudentProfile, month: string): boolean => {
    return student.monthlyPayments?.some(p => p.month === month && p.status === 'paid') || false;
  };

  // To'lanmagan oylar sonini hisoblash
  const getUnpaidMonthsCount = (student: StudentProfile): number => {
    const lastMonths = getLastNMonths(3);
    return lastMonths.filter(m => !isMonthPaid(student, m)).length;
  };

  const stats = useMemo(() => {
    const total = students.length;
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    // Joriy oy uchun to'langan talabalar
    const paidThisMonth = students.filter((student) => 
      student.monthlyPayments?.some(p => p.month === currentMonth && p.status === 'paid') ||
      (student.paymentStatus === 'paid' && !student.isExpired)
    );
    
    const unpaid = total - paidThisMonth.length;
    const monthlyRevenue = paidThisMonth.reduce((sum, student) => sum + student.monthlyPayment, 0);
    
    // Muddati yaqinlashayotgan talabalar (3 kun qolgan)
    const expiringSoon = students.filter(s => s.daysRemaining && s.daysRemaining <= 3 && s.daysRemaining > 0).length;
    
    // Muddati o'tgan talabalar
    const expired = students.filter(s => s.isExpired).length;
    
    const perGroup = groups.map((group) => ({
      ...group,
      remaining: Math.max(group.maxStudents - group.currentStudents, 0),
    }));
    return { total, paid: paidThisMonth.length, unpaid, monthlyRevenue, expiringSoon, expired, perGroup };
  }, [students, groups]);

  const filteredStudents = useMemo(() => {
    let data = students.filter((student) => student.fullName.toLowerCase().includes(searchValue.toLowerCase()));
    if (groupFilter !== 'all') {
      data = data.filter((student) => student.groupId === groupFilter);
    }
    if (unpaidGroupFilter !== 'all') {
      data = data.filter(
        (student) => student.paymentStatus === 'unpaid' && student.groupId === unpaidGroupFilter
      );
    } else if (showUnpaidOnly) {
      data = data.filter((student) => student.paymentStatus === 'unpaid');
    }
    return data;
  }, [students, groupFilter, unpaidGroupFilter, showUnpaidOnly, searchValue]);

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 sm:mb-6 animate-fade-in-down">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Talabalar
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">Guruhlar, ota-onalar va to'lovlarni boshqaring</p>
        </div>
        <Dialog open={formOpen} onOpenChange={(open) => { setFormOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setFormOpen(true); }} className="w-full sm:w-auto text-sm">
              <Plus className="h-4 w-4 mr-2" />
              Yangi talaba
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] sm:max-w-3xl max-h-[95vh] overflow-y-auto p-3 sm:p-4 md:p-6">
            <DialogHeader className="space-y-1 sm:space-y-2">
              <DialogTitle className="text-sm sm:text-base md:text-lg">{editingStudent ? 'Talaba ma\'lumotlarini tahrirlash' : 'Yangi talaba qo\'shish'}</DialogTitle>
              <DialogDescription className="text-[11px] sm:text-xs md:text-sm">Ma\'lumotlarni to\'ldiring va saqlang.</DialogDescription>
            </DialogHeader>
            <form className="space-y-2 sm:space-y-3 md:space-y-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
                <div className="space-y-2">
                  <Label>F.I.Sh</Label>
                  <Input value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Fan/Kurs</Label>
                  <Select
                    value={formData.courseName || 'none'}
                    onValueChange={(value) => {
                      const selectedCourse = courses.find(c => c.name_uz === value);
                      const price = selectedCourse?.price ? parseInt(String(selectedCourse.price).replace(/[^\d]/g, '')) : 0;
                      setFormData({ 
                        ...formData, 
                        courseName: value === 'none' ? '' : value,
                        monthlyPayment: price || formData.monthlyPayment,
                        groupId: null // Kurs o'zgarganda guruhni reset qilish
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Kursni tanlang" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Kurs tanlanmagan</SelectItem>
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={course.name_uz}>
                          {course.name_uz} - {course.price} so'm
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Guruh {formData.courseName && <span className="text-xs text-muted-foreground">({formData.courseName} guruhlari)</span>}</Label>
                  <Select
                    value={formData.groupId || 'none'}
                    onValueChange={(value) => setFormData({ ...formData, groupId: value === 'none' ? null : value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Guruhni tanlang" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Guruhsiz</SelectItem>
                      {filteredGroupsForForm.length > 0 ? (
                        filteredGroupsForForm.map((group) => (
                          <SelectItem key={group.id} value={group.id}>
                            {group.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-groups" disabled>
                          {formData.courseName ? `"${formData.courseName}" uchun guruh topilmadi` : 'Guruhlar mavjud emas'}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Ota-ona ismi</Label>
                  <Input value={formData.parentName} onChange={(e) => setFormData({ ...formData, parentName: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Ota-ona kontakti</Label>
                  <Input value={formData.parentContact} onChange={(e) => setFormData({ ...formData, parentContact: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Oylik to'lov (so'm)</Label>
                  <Input
                    type="number"
                    value={formData.monthlyPayment}
                    onChange={(e) => setFormData({ ...formData, monthlyPayment: Number(e.target.value) })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Holat</Label>
                  <Select value={formData.paymentStatus} onValueChange={(value) => setFormData({ ...formData, paymentStatus: value as StudentPayload['paymentStatus'] })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Holat" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paid">To'langan</SelectItem>
                      <SelectItem value="unpaid">To'lanmagan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Profil surati (URL)</Label>
                  <Input value={formData.photoUrl || ''} onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Qo'shimcha eslatma</Label>
                  <Input value={formData.notes || ''} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                  Bekor qilish
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingStudent ? 'Yangilash' : 'Qo\'shish'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6 md:mb-8">
        <div className="stagger-item">
          <StatCard title="Jami talabalar" value={stats.total} description="Faol ro'yxat" />
        </div>
        <div className="stagger-item">
          <StatCard title="Joriy oy to'lagan" value={stats.paid} description="Bu oyda to'langan" accent="bg-emerald-500/10 text-emerald-600" />
        </div>
        <div className="stagger-item">
          <StatCard title="To'lamagan" value={stats.unpaid} description="To'lov kutilmoqda" accent="bg-amber-500/10 text-amber-600" />
        </div>
        <div className="stagger-item">
          <StatCard title="Muddati yaqin" value={stats.expiringSoon} description="3 kun ichida tugaydi" accent="bg-orange-500/10 text-orange-600" />
        </div>
        <div className="stagger-item">
          <StatCard title="Muddati o'tgan" value={stats.expired} description="To'lov eskirgan" accent="bg-red-500/10 text-red-600" />
        </div>
        <div className="stagger-item">
          <StatCard title="Oylik daromad" value={`${(stats.monthlyRevenue / 1000000).toFixed(1)}M`} description="So'm" />
        </div>
      </div>

      <Card>
        <CardHeader className="p-3 sm:p-4 md:p-6">
          <CardTitle className="text-sm sm:text-base md:text-lg">Guruh sig'imi</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3 md:gap-4 p-3 sm:p-4 md:p-6 pt-0">
          {stats.perGroup.length === 0 ? (
            <p className="text-sm text-muted-foreground">Guruh ma'lumotlari yo'q</p>
          ) : (
            stats.perGroup.map((group, index) => (
              <div 
                key={group.id} 
                className="stagger-item rounded-lg border p-4 hover:bg-muted/50"
                style={{ animationDelay: `${index * 0.02}s` }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{group.name}</p>
                    <p className="text-xs text-muted-foreground">{group.schedule}</p>
                  </div>
                  <Badge variant={group.status === 'active' ? 'default' : 'secondary'}>{group.status}</Badge>
                </div>
                <p className="text-2xl font-bold mt-3">
                  {group.currentStudents}/{group.maxStudents}
                </p>
                <p className="text-xs text-muted-foreground">Qolgan o'rinlar: {group.remaining}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-3 sm:p-4 md:p-6">
          <div className="flex flex-col gap-2 sm:gap-3">
            <CardTitle className="text-sm sm:text-base md:text-lg">Talabalar jadvallari</CardTitle>
            <div className="flex flex-col lg:flex-row gap-2 sm:gap-3">
              <div className="flex items-center gap-2">
                <Filter className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                <Input
                  placeholder="Ism bo'yicha qidirish..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="w-full sm:w-44 text-xs sm:text-sm"
                />
              </div>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                <Select value={groupFilter} onValueChange={(value) => setGroupFilter(value)}>
                  <SelectTrigger className="w-full sm:w-40 text-xs sm:text-sm">
                    <SelectValue placeholder="Guruh" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Barchasi</SelectItem>
                    {groups.map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={unpaidGroupFilter} onValueChange={(value) => setUnpaidGroupFilter(value)}>
                  <SelectTrigger className="w-full sm:w-48 text-xs sm:text-sm">
                    <SelectValue placeholder="Unpaid group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Unpaid filtri yo'q</SelectItem>
                    {groups.map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  <Switch id="unpaid-only" checked={showUnpaidOnly} onCheckedChange={(checked) => setShowUnpaidOnly(checked)} />
                  <Label htmlFor="unpaid-only" className="text-[11px] sm:text-xs md:text-sm">Faqat unpaid</Label>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto p-3 sm:p-4 md:p-6 pt-0">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
              <span className="text-xs sm:text-sm">Ma'lumotlar yuklanmoqda...</span>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-10 text-xs sm:text-sm text-muted-foreground">Talabalar topilmadi</div>
          ) : (
            <div className="min-w-[600px] sm:min-w-[700px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs sm:text-sm">Talaba</TableHead>
                    <TableHead className="text-xs sm:text-sm">Fan/Kurs</TableHead>
                    <TableHead className="text-xs sm:text-sm hidden md:table-cell">Ota-ona</TableHead>
                    <TableHead className="text-xs sm:text-sm hidden lg:table-cell">Telefon</TableHead>
                    <TableHead className="text-right text-xs sm:text-sm">Kurs puli</TableHead>
                    <TableHead className="text-xs sm:text-sm">Status</TableHead>
                    <TableHead className="text-right text-xs sm:text-sm">Amallar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student, index) => (
                    <TableRow key={student.id} className="table-row-hover stagger-item" style={{ animationDelay: `${index * 0.02}s` }}>
                      {/* Rasm va Ism */}
                      <TableCell className="flex items-center gap-2 sm:gap-3">
                        <Avatar className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0">
                          <AvatarImage src={student.photoUrl} alt={student.fullName} />
                          <AvatarFallback className="text-xs font-bold">{student.fullName.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-sm truncate">{student.fullName}</p>
                          <div className="md:hidden mt-1">
                            <p className="text-xs text-muted-foreground">{student.parentName}</p>
                            <p className="text-xs text-muted-foreground">{student.parentContact}</p>
                          </div>
                        </div>
                      </TableCell>
                      {/* Fan/Kurs */}
                      <TableCell>
                        <div className="flex flex-col">
                          {student.courseName ? (
                            <span className="text-xs sm:text-sm font-semibold text-primary">📚 {student.courseName}</span>
                          ) : (
                            <span className="text-xs sm:text-sm text-muted-foreground">Kurs belgilanmagan</span>
                          )}
                          {student.groupName && (
                            <span className="text-xs text-muted-foreground mt-1">Guruh: {student.groupName}</span>
                          )}
                        </div>
                      </TableCell>
                      {/* Ota-ona ismi */}
                      <TableCell className="hidden md:table-cell">
                        <span className="text-xs sm:text-sm font-medium">{student.parentName || '—'}</span>
                      </TableCell>
                      {/* Telefon */}
                      <TableCell className="hidden lg:table-cell">
                        <span className="text-xs sm:text-sm">{student.parentContact || '—'}</span>
                      </TableCell>
                      {/* Kurs puli */}
                      <TableCell className="text-right">
                        <span className="font-bold text-sm text-emerald-600">
                          {student.monthlyPayment.toLocaleString()} so'm
                        </span>
                      </TableCell>
                      {/* Status */}
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge variant={student.paymentStatus === 'paid' && !student.isExpired ? 'default' : 'secondary'} className={`text-[10px] sm:text-xs ${student.paymentStatus === 'paid' && !student.isExpired ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-amber-500/20 text-amber-600'}`}>
                            {student.paymentStatus === 'paid' && !student.isExpired ? "To'langan" : "To'lanmagan"}
                          </Badge>
                          {student.paymentValidUntil && !student.isExpired && (
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {student.daysRemaining} kun qoldi
                            </span>
                          )}
                          {student.lastPaidMonth && (
                            <span className="text-[10px] text-muted-foreground">
                              Oxirgi: {getMonthName(student.lastPaidMonth)}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      {/* Amallar */}
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel className="text-xs">Amallar</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleOpenPaymentDialog(student)} className="text-xs">
                              <Calendar className="h-3 w-3 mr-2" />
                              Oylik to'lov qo'shish
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setHistoryStudent(student)} className="text-xs">To'lov tarixi</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(student)} className="text-xs">Tahrirlash</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive text-xs" onClick={() => handleDelete(student)}>
                              O'chirish
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* To'lov tarixi dialog */}
      <Dialog open={!!historyStudent} onOpenChange={(open) => !open && setHistoryStudent(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>To'lov tarixi — {historyStudent?.fullName}</DialogTitle>
            <DialogDescription>Oylik to'lovlar va tranzaksiyalar</DialogDescription>
          </DialogHeader>
          
          {/* Oylik to'lov holati */}
          <div className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Oxirgi 6 oy to'lov holati
              </h4>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {getLastNMonths(6).map((month) => {
                  const isPaid = historyStudent?.monthlyPayments?.some(p => p.month === month && p.status === 'paid');
                  const payment = historyStudent?.monthlyPayments?.find(p => p.month === month);
                  return (
                    <div
                      key={month}
                      className={`rounded-lg p-2 text-center text-xs border ${
                        isPaid 
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700' 
                          : 'bg-amber-500/10 border-amber-500/30 text-amber-700'
                      }`}
                    >
                      <div className="font-semibold">{monthNames[month.slice(5, 7)]}</div>
                      <div className="text-[10px] opacity-75">{month.slice(0, 4)}</div>
                      <div className="mt-1">
                        {isPaid ? (
                          <CheckCircle2 className="h-4 w-4 mx-auto text-emerald-500" />
                        ) : (
                          <XCircle className="h-4 w-4 mx-auto text-amber-500" />
                        )}
                      </div>
                      {payment && (
                        <div className="text-[9px] mt-1 opacity-75">
                          {(payment.amount / 1000).toFixed(0)}K
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* To'lov muddati */}
            {historyStudent?.paymentValidUntil && (
              <div className={`rounded-lg p-3 flex items-center justify-between ${
                historyStudent.isExpired 
                  ? 'bg-red-500/10 border border-red-500/30' 
                  : 'bg-emerald-500/10 border border-emerald-500/30'
              }`}>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm font-medium">To'lov amal qilish muddati:</span>
                </div>
                <div className="text-sm">
                  {format(new Date(historyStudent.paymentValidUntil), 'dd MMMM yyyy', { locale: uz })}
                  {historyStudent.isExpired ? (
                    <Badge variant="destructive" className="ml-2 text-[10px]">Muddati o'tgan</Badge>
                  ) : (
                    <Badge variant="default" className="ml-2 text-[10px] bg-emerald-500">
                      {historyStudent.daysRemaining} kun qoldi
                    </Badge>
                  )}
                </div>
              </div>
            )}
            
            {/* Tranzaksiya tarixi */}
            <div>
              <h4 className="font-semibold mb-3">Tranzaksiyalar</h4>
              <div className="space-y-2 max-h-[30vh] overflow-y-auto pr-2">
                {historyStudent?.history.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">Tranzaksiya topilmadi</p>
                ) : (
                  historyStudent?.history.map((entry) => (
                    <div key={entry.id} className="rounded-lg border p-3 flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{entry.amount.toLocaleString()} so'm</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(entry.date), 'dd MMM yyyy, HH:mm')}
                          {entry.note && <span className="ml-2">• {entry.note}</span>}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px]">{entry.method}</Badge>
                        <Badge variant={entry.status === 'paid' ? 'default' : 'secondary'} className="text-[10px]">
                          {entry.status === 'paid' ? "To'langan" : "Kutilmoqda"}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Oylik to'lov qo'shish dialog */}
      <Dialog open={!!paymentStudent} onOpenChange={(open) => !open && setPaymentStudent(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Oylik to'lov qo'shish</DialogTitle>
            <DialogDescription>{paymentStudent?.fullName} uchun to'lov</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Talaba ma'lumotlari */}
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={paymentStudent?.photoUrl} />
                  <AvatarFallback>{paymentStudent?.fullName.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{paymentStudent?.fullName}</p>
                  <p className="text-sm text-muted-foreground">{paymentStudent?.courseName}</p>
                </div>
              </div>
            </div>
            
            {/* To'lanmagan oylar */}
            {paymentStudent && (
              <div className="space-y-2">
                <Label>To'lanmagan oylar</Label>
                <div className="grid grid-cols-3 gap-2">
                  {getLastNMonths(6).map((month) => {
                    const isPaid = paymentStudent.monthlyPayments?.some(p => p.month === month && p.status === 'paid');
                    const isSelected = selectedMonth === month;
                    return (
                      <Button
                        key={month}
                        variant={isSelected ? 'default' : isPaid ? 'ghost' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedMonth(month)}
                        disabled={isPaid}
                        className={`text-xs ${isPaid ? 'opacity-50' : ''}`}
                      >
                        {isPaid && <CheckCircle2 className="h-3 w-3 mr-1" />}
                        {getMonthName(month)}
                      </Button>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* To'lov miqdori */}
            <div className="space-y-2">
              <Label>To'lov miqdori</Label>
              <div className="text-2xl font-bold text-emerald-600">
                {paymentStudent?.monthlyPayment.toLocaleString()} so'm
              </div>
            </div>
            
            {/* To'lov usuli */}
            <div className="space-y-2">
              <Label>To'lov usuli</Label>
              <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="card">💳 Karta</SelectItem>
                  <SelectItem value="cash">💵 Naqd</SelectItem>
                  <SelectItem value="transfer">🏦 O'tkazma</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Amallar */}
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setPaymentStudent(null)}>
                Bekor qilish
              </Button>
              <Button onClick={handleRecordPayment} disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                To'lovni qabul qilish
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

type StatCardProps = {
  title: string;
  value: number | string;
  description: string;
  accent?: string;
};

function StatCard({ title, value, description, accent }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2 p-4 sm:p-6">
        <CardTitle className="text-xs sm:text-sm text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0">
        <p className={`text-xl sm:text-2xl font-bold break-words ${accent ?? ''}`}>{value}</p>
        <p className="text-xs text-muted-foreground mt-1 sm:mt-2">{description}</p>
      </CardContent>
    </Card>
  );
}

export default function AdminStudentsPage() {
  return (
    <ProtectedRoute>
      <StudentsContent />
    </ProtectedRoute>
  );
}


