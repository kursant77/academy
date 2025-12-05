import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'wouter';
import { format, subDays, subMonths, startOfDay, startOfMonth, startOfWeek } from 'date-fns';
import { eachDayOfInterval, eachMonthOfInterval, eachWeekOfInterval } from 'date-fns';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AdminLayout } from '@/components/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { adminApi } from '@/lib/adminApi';
import type { DashboardSnapshot } from '@/types/admin';
import { type LucideIcon, Star, TrendingUp, Wallet, Users, Calendar, BookOpen, FileText, Trophy, ArrowRight, FilePenLine, Clock, PiggyBank } from 'lucide-react';

type RecentApplication = {
  id: string;
  full_name: string;
  phone: string;
  created_at: string;
  course_name?: string;
};

type TimeRange = '7d' | '30d' | '90d' | '12m';

type CourseFinancial = {
  id: string;
  name: string;
  category: string;
  teacherId: string | null;
  teacherName?: string;
  teacherSpecialty?: string;
  revenue: number;
  enrollment: number;
};

type TrendPoint = {
  label: string;
  revenue: number;
  enrollment: number;
};

type TeacherFinancial = {
  id: string;
  name: string;
  specialty?: string;
  totalRevenue: number;
  payout: number;
  courses: number;
  status: 'ahead' | 'ontime' | 'delayed';
};

type FinancialOverview = {
  totalRevenue: number;
  avgTicket: number;
  totalEnrollments: number;
  outstandingPayouts: number;
  pipelineGrowth: number;
  revenueTrend: TrendPoint[];
  topCourses: CourseFinancial[];
  teacherSummaries: TeacherFinancial[];
};

type FinancialBase = {
  courseFinancials: CourseFinancial[];
  trendPoints: TrendPoint[];
  totalRevenue: number;
  totalEnrollments: number;
};

type DashboardConfig = {
  timeRange: TimeRange;
  currency: 'UZS' | 'USD' | 'EUR';
  payoutRate: number;
  showTeacherPayouts: boolean;
};

const emptyFinancialOverview: FinancialOverview = {
  totalRevenue: 0,
  avgTicket: 0,
  totalEnrollments: 0,
  outstandingPayouts: 0,
  pipelineGrowth: 0,
  revenueTrend: [],
  topCourses: [],
  teacherSummaries: [],
};

const currencyRates: Record<DashboardConfig['currency'], number> = {
  UZS: 1,
  USD: 0.000079,
  EUR: 0.000073,
};

const timeRangeOptions: { label: string; value: TimeRange }[] = [
  { label: 'Oxirgi 7 kun', value: '7d' },
  { label: 'Oxirgi 30 kun', value: '30d' },
  { label: 'Oxirgi 90 kun', value: '90d' },
  { label: 'Oxirgi 12 oy', value: '12m' },
];

function DashboardContent() {
  const [, setLocation] = useLocation();
  const [stats, setStats] = useState({
    courses: 0,
    teachers: 0,
    events: 0,
    applications: 0,
    achievements: 0,
  });
  const [recentApplications, setRecentApplications] = useState<RecentApplication[]>([]);
  const [recentCourses, setRecentCourses] = useState<
    { id: string; name_uz: string; category: string; created_at?: string }[]
  >([]);
  const [featuredCourses, setFeaturedCourses] = useState<
    { id: string; name_uz: string; category: string; featured: boolean }[]
  >([]);
  const [featuredTeachers, setFeaturedTeachers] = useState<
    { id: string; name: string; specialty_uz: string; featured: boolean }[]
  >([]);
  const [featuredEvents, setFeaturedEvents] = useState<
    { id: string; title_uz: string; category: string; date: string; featured: boolean }[]
  >([]);
  const [financialBase, setFinancialBase] = useState<FinancialBase | null>(null);
  const [financialOverview, setFinancialOverview] = useState<FinancialOverview>(emptyFinancialOverview);
  const [isFinancialLoading, setIsFinancialLoading] = useState(false);
  const [dashboardConfig, setDashboardConfig] = useState<DashboardConfig>({
    timeRange: '30d',
    currency: 'UZS',
    payoutRate: 0.35,
    showTeacherPayouts: true,
  });
  const [dashboardSnapshot, setDashboardSnapshot] = useState<DashboardSnapshot | null>(null);
  const [snapshotLoading, setSnapshotLoading] = useState(true);

  useEffect(() => {
    loadStats();
    loadRecentData();
    loadFeaturedSets();
  }, []);

  useEffect(() => {
    const loadSnapshot = async () => {
      try {
        setSnapshotLoading(true);
        const data = await adminApi.getDashboardSnapshot();
        setDashboardSnapshot(data);
      } catch (error) {
        console.error('Dashboard snapshot error', error);
      } finally {
        setSnapshotLoading(false);
      }
    };
    loadSnapshot();
  }, []);

  useEffect(() => {
    loadFinancialSnapshot(dashboardConfig.timeRange);
  }, [dashboardConfig.timeRange]);

  useEffect(() => {
    if (financialBase) {
      setFinancialOverview(buildFinancialOverview(financialBase, dashboardConfig.payoutRate));
    }
  }, [financialBase, dashboardConfig.payoutRate]);

  const loadStats = async () => {
    try {
      const [coursesRes, teachersRes, eventsRes, applicationsRes, achievementsRes] = await Promise.all([
        supabase.from('courses').select('id', { count: 'exact' }),
        supabase.from('teachers').select('id', { count: 'exact' }),
        supabase.from('events').select('id', { count: 'exact' }),
        supabase.from('applications').select('id', { count: 'exact' }),
        supabase.from('achievements').select('id', { count: 'exact' }),
      ]);

      setStats({
        courses: coursesRes.count || 0,
        teachers: teachersRes.count || 0,
        events: eventsRes.count || 0,
        applications: applicationsRes.count || 0,
        achievements: achievementsRes.count || 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadRecentData = async () => {
    try {
      const [applicationsRes, coursesRes] = await Promise.all([
        supabase
          .from('applications')
          .select('id, full_name, phone, created_at, courses(name_uz)')
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('courses')
          .select('id, name_uz, category, created_at')
          .order('created_at', { ascending: false })
          .limit(5),
      ]);

      if (!applicationsRes.error && applicationsRes.data) {
        setRecentApplications(
          applicationsRes.data.map((item) => ({
            id: item.id,
            full_name: item.full_name,
            phone: item.phone,
            created_at: item.created_at,
            course_name: (item as any).courses?.name_uz,
          }))
        );
      }

      if (!coursesRes.error && coursesRes.data) {
        setRecentCourses(coursesRes.data);
      }
    } catch (error) {
      console.error('Error loading recent data:', error);
    }
  };

  const loadFinancialSnapshot = async (range: TimeRange) => {
    setIsFinancialLoading(true);
    try {
      const since = getRangeStart(range);
      const [coursesRes, teachersRes, applicationsRes] = await Promise.all([
        supabase.from('courses').select('id, name_uz, category, price, teacher_id').eq('is_published', true),
        supabase.from('teachers').select('id, name, specialty_uz'),
        supabase
          .from('applications')
          .select('id, course_id, created_at')
          .gte('created_at', since.toISOString()),
      ]);

      if (coursesRes.error) throw coursesRes.error;
      if (teachersRes.error) throw teachersRes.error;
      if (applicationsRes.error) throw applicationsRes.error;

      const priceMap = new Map(
        (coursesRes.data || []).map((course) => [course.id, parseCurrencyValue(course.price)])
      );
      const teacherMap = new Map(
        (teachersRes.data || []).map((teacher) => [teacher.id, { name: teacher.name, specialty: teacher.specialty_uz }])
      );
      const enrollmentMap = new Map<string, number>();
      const filteredApplications = (applicationsRes.data || []).filter(
        (app) => app.course_id !== null && app.created_at
      );

      filteredApplications.forEach((app) => {
        if (!app.course_id) return;
        enrollmentMap.set(app.course_id, (enrollmentMap.get(app.course_id) || 0) + 1);
      });

      const courseFinancials: CourseFinancial[] = (coursesRes.data || []).map((course) => {
        const enrollment = enrollmentMap.get(course.id) || 0;
        const unitPrice = priceMap.get(course.id) || 0;
        const revenue = enrollment * unitPrice;
        const teacherDetails = course.teacher_id ? teacherMap.get(course.teacher_id) : undefined;
        return {
          id: course.id,
          name: course.name_uz,
          category: course.category,
          teacherId: course.teacher_id,
          teacherName: teacherDetails?.name,
          teacherSpecialty: teacherDetails?.specialty,
          revenue,
          enrollment,
        };
      });

      const totalRevenue = courseFinancials.reduce((sum, course) => sum + course.revenue, 0);
      const totalEnrollments = courseFinancials.reduce((sum, course) => sum + course.enrollment, 0);
      const trendPoints = createTrendPoints(range, filteredApplications, priceMap);

      setFinancialBase({
        courseFinancials,
        trendPoints,
        totalRevenue,
        totalEnrollments,
      });
    } catch (error) {
      console.error('Error loading financial snapshot', error);
      setFinancialBase({
        courseFinancials: [],
        trendPoints: [],
        totalRevenue: 0,
        totalEnrollments: 0,
      });
    } finally {
      setIsFinancialLoading(false);
    }
  };

  const loadFeaturedSets = async () => {
    try {
      const [coursesRes, teachersRes, eventsRes] = await Promise.all([
        supabase
          .from('courses')
          .select('id, name_uz, category, featured')
          .eq('featured', true)
          .eq('is_published', true)
          .order('updated_at', { ascending: false })
          .limit(6),
        supabase
          .from('teachers')
          .select('id, name, specialty_uz, featured')
          .eq('featured', true)
          .order('updated_at', { ascending: false })
          .limit(6),
        supabase
          .from('events')
          .select('id, title_uz, category, date, featured')
          .eq('featured', true)
          .eq('is_published', true)
          .order('date', { ascending: false })
          .limit(6),
      ]);

      if (!coursesRes.error && coursesRes.data) {
        setFeaturedCourses(coursesRes.data);
      } else if (coursesRes.error) {
        console.error('Courses error:', coursesRes.error);
        // Fallback: filterlarsiz qayta urinib ko'rish
        const { data: fallback } = await supabase
          .from('courses')
          .select('id, name_uz, category, featured')
          .order('updated_at', { ascending: false })
          .limit(6);
        if (fallback) setFeaturedCourses(fallback);
      }
      
      if (!teachersRes.error && teachersRes.data) {
        setFeaturedTeachers(teachersRes.data);
      } else if (teachersRes.error) {
        console.error('Teachers error:', teachersRes.error);
        // Fallback: filterlarsiz qayta urinib ko'rish
        const { data: fallback } = await supabase
          .from('teachers')
          .select('id, name, specialty_uz, featured')
          .order('updated_at', { ascending: false })
          .limit(6);
        if (fallback) setFeaturedTeachers(fallback);
      }
      
      if (!eventsRes.error && eventsRes.data) {
        setFeaturedEvents(eventsRes.data);
      } else if (eventsRes.error) {
        console.error('Events error:', eventsRes.error);
        // Fallback: filterlarsiz qayta urinib ko'rish
        const { data: fallback } = await supabase
          .from('events')
          .select('id, title_uz, category, date, featured')
          .order('date', { ascending: false })
          .limit(6);
        if (fallback) setFeaturedEvents(fallback);
      }
    } catch (error) {
      console.error('Error loading featured sets', error);
    }
  };

  const quickActions = useMemo(
    () => [
      { label: 'Yangi kurs', action: () => setLocation('/admin/courses') },
      { label: 'Yangi tadbir', action: () => setLocation('/admin/events') },
      { label: 'Yangi yutuq', action: () => setLocation('/admin/achievements') },
      { label: 'Kontent blok', action: () => setLocation('/admin/content') },
    ],
    [setLocation]
  );

  const renderFeaturedCard = (title: string, items: React.ReactNode, emptyLabel: string) => (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-base sm:text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0">
        {items || (
          <div className="text-center py-6 text-xs sm:text-sm text-muted-foreground">
            {emptyLabel}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const menuItems = [
    {
      title: 'Kurslar',
      description: 'Kurslarni boshqarish',
      icon: BookOpen,
      path: '/admin/courses',
      count: stats.courses,
    },
    {
      title: "O'qituvchilar",
      description: "O'qituvchilarni boshqarish",
      icon: Users,
      path: '/admin/teachers',
      count: stats.teachers,
    },
    {
      title: 'Tadbirlar',
      description: 'Tadbirlarni boshqarish',
      icon: Calendar,
      path: '/admin/events',
      count: stats.events,
    },
    {
      title: "Ro'yxatdan o'tganlar",
      description: "O'quvchilar ro'yxati",
      icon: FileText,
      path: '/admin/applications',
      count: stats.applications,
    },
    {
      title: 'Yutuqlar',
      description: 'Yutuqlarni boshqarish',
      icon: Trophy,
      path: '/admin/achievements',
      count: stats.achievements,
    },
  ];

  const formatCurrency = (value: number) => {
    const rate = currencyRates[dashboardConfig.currency] || 1;
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: dashboardConfig.currency,
      maximumFractionDigits: dashboardConfig.currency === 'UZS' ? 0 : 2,
    });
    return formatter.format(value * rate);
  };

  const chartConfig = {
    revenue: {
      label: 'Daromad',
      color: 'hsl(var(--primary))',
    },
    enrollment: {
      label: "Ro'yxatlar",
      color: '#8b5cf6',
    },
  };

  const handleDashboardConfigChange = (key: keyof DashboardConfig, value: string | number | boolean) => {
    setDashboardConfig((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const statusCopy: Record<TeacherFinancial['status'], { label: string; tone: string }> = {
    ahead: { label: 'Reja ortigʻi', tone: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' },
    ontime: { label: "Jadvalda", tone: 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300' },
    delayed: { label: 'Eʼtibor kerak', tone: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300' },
  };

  return (
    <AdminLayout>
      <div className="space-y-4 sm:space-y-6 animate-fade-in">
        <div className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-center lg:justify-between animate-fade-in-down">
          <div className="min-w-0">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              Boshqaruv paneli
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
              Kurslar, moliya va jamoani boshqaring
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action, index) => (
              <Button
                key={action.label}
                variant="outline"
                onClick={action.action}
                className="stagger-item text-xs sm:text-sm h-9 sm:h-10"
                style={{ animationDelay: `${index * 0.02}s` }}
              >
                <FilePenLine className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                <span className="hidden sm:inline">{action.label}</span>
                <span className="sm:hidden">{action.label.split(' ')[0]}</span>
              </Button>
            ))}
          </div>
        </div>

        <FinanceSnapshot snapshot={dashboardSnapshot} loading={snapshotLoading} currency={dashboardConfig.currency} />
        <GroupAnalytics snapshot={dashboardSnapshot} loading={snapshotLoading} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-2 xl:grid-cols-4">
          <div className="stagger-item">
            <InsightCard
              title="Umumiy daromad"
              icon={TrendingUp}
              value={formatCurrency(financialOverview.totalRevenue)}
              subLabel={`${financialOverview.totalEnrollments} ta qabul`}
              trend={financialOverview.pipelineGrowth}
            />
          </div>
          <div className="stagger-item">
            <InsightCard
              title="Oʻrtacha chek"
              icon={Wallet}
              value={formatCurrency(financialOverview.avgTicket)}
              subLabel="Bir o'quvchi uchun tushum"
            />
          </div>
          <div className="stagger-item">
            <InsightCard
              title="Faol kurslar"
              icon={BookOpen}
              value={stats.courses.toString()}
              subLabel="Barcha faol kurslar"
            />
          </div>
          <div className="stagger-item">
            <InsightCard
              title="Kutilayotgan to'lovlar"
              icon={PiggyBank}
              value={formatCurrency(financialOverview.outstandingPayouts)}
              subLabel="Ustozlarga bo'linadi"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Card
                key={item.path}
                className="card-hover stagger-item cursor-pointer"
                onClick={() => setLocation(item.path)}
                style={{ animationDelay: `${index * 0.02}s` }}
              >
                <CardHeader className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div className="p-2 sm:p-3 bg-primary/10 rounded-lg">
                      <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                    </div>
                    <span className="text-xl sm:text-2xl font-bold text-primary">{item.count}</span>
                  </div>
                  <CardTitle className="mt-3 sm:mt-4 text-base sm:text-lg">{item.title}</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">{item.description}</CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <Button variant="ghost" className="w-full justify-between text-xs sm:text-sm h-9 sm:h-10">
                    Boshqarish
                    <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-4 sm:gap-6 animate-fade-in-up">
          <Card className="col-span-1">
            <CardHeader className="flex flex-col gap-3 sm:gap-2 md:flex-row md:items-center md:justify-between p-4 sm:p-6">
              <div className="min-w-0">
                <CardTitle className="text-base sm:text-lg">Daromad dinamikasi</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Tanlangan davr uchun tushum va ro'yxatlar</CardDescription>
              </div>
              <Select
                value={dashboardConfig.timeRange}
                onValueChange={(value: TimeRange) => handleDashboardConfigChange('timeRange', value)}
              >
                <SelectTrigger className="w-full sm:w-[160px] transition-all duration-200 hover:border-primary/50">
                  <SelectValue placeholder="Davr" />
                </SelectTrigger>
                <SelectContent>
                  {timeRangeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              {isFinancialLoading ? (
                <div className="h-[240px] sm:h-[320px] animate-pulse rounded-lg bg-muted" />
              ) : financialOverview.revenueTrend.length === 0 ? (
                <div className="flex h-[240px] sm:h-[320px] items-center justify-center text-sm sm:text-base text-muted-foreground text-center px-4">
                  Tanlangan davr uchun moliyaviy maʼlumot topilmadi
                </div>
              ) : (
                <ChartContainer config={chartConfig} className="h-[240px] sm:h-[320px]">
                  <AreaChart data={financialOverview.revenueTrend}>
                    <defs>
                      <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
                      </linearGradient>
                      <linearGradient id="fillEnrollment" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" strokeOpacity={0.2} />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => (value >= 1000 ? `${Math.round(value / 1000)}k` : value)}
                      tick={{ fontSize: 12 }}
                    />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                    <Area
                      dataKey="revenue"
                      type="monotone"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      fill="url(#fillRevenue)"
                      name="Daromad"
                    />
                    <Area
                      dataKey="enrollment"
                      type="monotone"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      fill="url(#fillEnrollment)"
                      name="Ro'yxatlar"
                    />
                  </AreaChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">Panel sozlamalari</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Moliyaviy ko'rsatkichlarni moslash</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6 pt-0">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Valyuta format</span>
                  <span className="text-muted-foreground">{dashboardConfig.currency}</span>
                </div>
                <Select
                  value={dashboardConfig.currency}
                  onValueChange={(value: DashboardConfig['currency']) => handleDashboardConfigChange('currency', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Valyuta" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UZS">UZS (so'm)</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span>Ustozlarga ulush</span>
                  <span className="font-medium">{Math.round(dashboardConfig.payoutRate * 100)}%</span>
                </div>
                <Slider
                  min={20}
                  max={60}
                  step={1}
                  value={[Math.round(dashboardConfig.payoutRate * 100)]}
                  onValueChange={(value) => handleDashboardConfigChange('payoutRate', value[0] / 100)}
                />
                <p className="text-xs text-muted-foreground">
                  TailAdmin uslubidagi modul har bir ustoz to'lovini shu ulush asosida hisoblaydi.
                </p>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">O'qituvchi moliyasi</p>
                  <p className="text-xs text-muted-foreground">
                    Jadvaldan yashirish yoki ko'rsatish
                  </p>
                </div>
                <Switch
                  checked={dashboardConfig.showTeacherPayouts}
                  onCheckedChange={(checked) => handleDashboardConfigChange('showTeacherPayouts', checked)}
                />
              </div>

              <div className="rounded-lg bg-muted/60 p-4 text-sm">
                <p className="font-medium">Eslatma</p>
                <p className="text-muted-foreground">
                  Bu sozlamalar faqat UI darajasida saqlanadi. Haqiqiy moliyaviy formulalar uchun Supabase yoki
                  moliyaviy API bilan integratsiya qoʻshing.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
          <Card className="xl:col-span-2">
            <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between p-4 sm:p-6">
              <div className="min-w-0">
                <CardTitle className="text-base sm:text-lg">O'qituvchilar moliyaviy holati</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Ustozlar kesimidagi tushum va to'lovlar</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="overflow-x-auto p-4 sm:p-6 pt-0">
              {!dashboardConfig.showTeacherPayouts ? (
                <div className="py-10 text-center text-muted-foreground">
                  Moliyaviy jadval yashirilgan. Sozlamalardan qayta yoqing.
                </div>
              ) : financialOverview.teacherSummaries.length === 0 ? (
                <div className="py-10 text-center text-muted-foreground">
                  Hozircha ustozlar bo'yicha to'plangan moliyaviy ma'lumot yo'q.
                </div>
              ) : (
                <div className="min-w-[600px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs sm:text-sm">Ustoz</TableHead>
                        <TableHead className="text-xs sm:text-sm hidden sm:table-cell">Yo'nalish</TableHead>
                        <TableHead className="text-right text-xs sm:text-sm">Tushum</TableHead>
                        <TableHead className="text-right text-xs sm:text-sm">To'lov</TableHead>
                        <TableHead className="text-xs sm:text-sm">Holat</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {financialOverview.teacherSummaries.map((teacher, index) => (
                        <TableRow key={teacher.id} className="table-row-hover stagger-item" style={{ animationDelay: `${index * 0.02}s` }}>
                          <TableCell className="font-medium text-xs sm:text-sm">
                            <div>
                              <div>{teacher.name || 'Nomaʼlum'}</div>
                              <div className="text-muted-foreground sm:hidden text-xs mt-1">{teacher.specialty || '—'}</div>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-xs sm:text-sm hidden sm:table-cell">{teacher.specialty || '—'}</TableCell>
                          <TableCell className="text-right text-xs sm:text-sm">{formatCurrency(teacher.totalRevenue)}</TableCell>
                          <TableCell className="text-right text-xs sm:text-sm">{formatCurrency(teacher.payout)}</TableCell>
                          <TableCell>
                            <span className={`rounded-full px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium ${statusCopy[teacher.status].tone}`}>
                              {statusCopy[teacher.status].label}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">Eng daromadli kurslar</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Tanlangan davr ichidagi TOP kurslar</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
              {financialOverview.topCourses.length === 0 ? (
                <div className="py-10 text-center text-muted-foreground">
                  Kurs daromadlari hali shakllanmadi
                </div>
              ) : (
                financialOverview.topCourses.map((course, index) => (
                  <div
                    key={course.id}
                    className="stagger-item rounded-lg border p-3 hover:bg-muted/50"
                    style={{ animationDelay: `${index * 0.02}s` }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">
                          #{index + 1} {course.name || 'Nomaʼlum kurs'}
                        </p>
                        <p className="text-xs text-muted-foreground">{course.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{formatCurrency(course.revenue)}</p>
                        <p className="text-xs text-muted-foreground">{course.enrollment} o'quvchi</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <Card className="lg:col-span-2">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">So'nggi arizalar</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Oxirgi 5ta ro'yxatdan o'tish</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 overflow-x-auto">
              {recentApplications.length === 0 ? (
                <div className="text-center text-sm sm:text-base text-muted-foreground py-6">
                  Hozircha arizalar yo'q
                </div>
              ) : (
                <div className="min-w-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs sm:text-sm">Ism</TableHead>
                        <TableHead className="text-xs sm:text-sm hidden sm:table-cell">Kurs</TableHead>
                        <TableHead className="text-xs sm:text-sm">Telefon</TableHead>
                        <TableHead className="text-xs sm:text-sm">Sana</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentApplications.map((app, index) => (
                        <TableRow key={app.id} className="table-row-hover stagger-item" style={{ animationDelay: `${index * 0.02}s` }}>
                          <TableCell className="font-medium text-xs sm:text-sm">
                            <div>
                              <div>{app.full_name}</div>
                              <div className="text-muted-foreground sm:hidden text-xs mt-1">{app.course_name || 'Noma\'lum'}</div>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs sm:text-sm hidden sm:table-cell">{app.course_name || 'Noma\'lum'}</TableCell>
                          <TableCell className="text-xs sm:text-sm">{app.phone}</TableCell>
                          <TableCell className="text-xs sm:text-sm">
                            {new Date(app.created_at).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">Yangi kurslar</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Oxirgi qo'shilgan 5 ta kurs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
              {recentCourses.length === 0 ? (
                <div className="text-center text-muted-foreground py-6">
                  Kurslar topilmadi
                </div>
              ) : (
                recentCourses.map((course, index) => (
                  <div
                    key={course.id}
                    className="stagger-item rounded-lg border p-3 hover:bg-muted/50"
                    style={{ animationDelay: `${index * 0.02}s` }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{course.name_uz}</p>
                        <p className="text-sm text-muted-foreground">{course.category}</p>
                      </div>
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {renderFeaturedCard(
            'Featured kurslar',
            featuredCourses.length ? (
              <div className="space-y-2 sm:space-y-3">
                {featuredCourses.map((course) => (
                  <div key={course.id} className="flex items-center justify-between rounded border p-2 sm:p-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-xs sm:text-sm truncate">{course.name_uz}</p>
                      <p className="text-xs text-muted-foreground truncate">{course.category}</p>
                    </div>
                    <Badge className="ml-2 flex-shrink-0 text-[10px] sm:text-xs">
                      <Star className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
                      Featured
                    </Badge>
                  </div>
                ))}
              </div>
            ) : null,
            "Featured kurslar yo'q"
          )}

          {renderFeaturedCard(
            "Featured o'qituvchilar",
            featuredTeachers.length ? (
              <div className="space-y-3">
                {featuredTeachers.map((teacher) => (
                  <div key={teacher.id} className="rounded border p-3">
                    <p className="font-semibold">{teacher.name}</p>
                    <p className="text-sm text-muted-foreground">{teacher.specialty_uz}</p>
                  </div>
                ))}
              </div>
            ) : null,
            "Featured o'qituvchilar yo'q"
          )}

          {renderFeaturedCard(
            'Featured tadbirlar',
            featuredEvents.length ? (
              <div className="space-y-3">
                {featuredEvents.map((event) => (
                  <div key={event.id} className="rounded border p-3">
                    <p className="font-semibold">{event.title_uz}</p>
                    <p className="text-sm text-muted-foreground">{event.category}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(event.date).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : null,
            "Featured tadbirlar yo'q"
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

export default function AdminDashboard() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

function parseCurrencyValue(value?: string | null) {
  if (!value) return 0;
  const cleaned = value.toString().replace(/[^\d.,-]/g, '').replace(/\s/g, '').replace(',', '.');
  const parsed = parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

function getRangeStart(range: TimeRange) {
  const today = startOfDay(new Date());
  switch (range) {
    case '7d':
      return subDays(today, 6);
    case '30d':
      return subDays(today, 29);
    case '90d':
      return subDays(today, 89);
    case '12m':
      return startOfMonth(subMonths(today, 11));
    default:
      return subDays(today, 29);
  }
}

function createTrendPoints(
  range: TimeRange,
  applications: { course_id: string | null; created_at: string | null }[],
  priceMap: Map<string, number>
): TrendPoint[] {
  const now = new Date();
  const start = getRangeStart(range);

  if (applications.length === 0) {
    return [];
  }

  if (range === '12m') {
    const months = eachMonthOfInterval({ start, end: now });
    const bucketMap = new Map(
      months.map((month) => {
        const key = format(month, 'yyyy-MM');
        return [
          key,
          {
            key,
            label: format(month, 'MMM yy'),
            revenue: 0,
            enrollment: 0,
          },
        ];
      })
    );

    applications.forEach((application) => {
      if (!application.course_id || !application.created_at) return;
      const key = format(new Date(application.created_at), 'yyyy-MM');
      const bucket = bucketMap.get(key);
      if (!bucket) return;
      bucket.enrollment += 1;
      bucket.revenue += priceMap.get(application.course_id) || 0;
    });

    return Array.from(bucketMap.values());
  }

  if (range === '90d') {
    const weeks = eachWeekOfInterval({ start, end: now }, { weekStartsOn: 1 });
    const bucketMap = new Map(
      weeks.map((week) => {
        const key = format(week, 'yyyy-ww');
        return [
          key,
          {
            key,
            label: `Hafta ${format(week, 'w')}`,
            revenue: 0,
            enrollment: 0,
          },
        ];
      })
    );

    applications.forEach((application) => {
      if (!application.course_id || !application.created_at) return;
      const key = format(startOfWeek(new Date(application.created_at), { weekStartsOn: 1 }), 'yyyy-ww');
      const bucket = bucketMap.get(key);
      if (!bucket) return;
      bucket.enrollment += 1;
      bucket.revenue += priceMap.get(application.course_id) || 0;
    });

    return Array.from(bucketMap.values());
  }

  const days = eachDayOfInterval({ start, end: now });
  const bucketMap = new Map(
    days.map((day) => {
      const key = format(day, 'yyyy-MM-dd');
      return [
        key,
        {
          key,
          label: format(day, 'dd MMM'),
          revenue: 0,
          enrollment: 0,
        },
      ];
    })
  );

  applications.forEach((application) => {
    if (!application.course_id || !application.created_at) return;
    const key = format(startOfDay(new Date(application.created_at)), 'yyyy-MM-dd');
    const bucket = bucketMap.get(key);
    if (!bucket) return;
    bucket.enrollment += 1;
    bucket.revenue += priceMap.get(application.course_id) || 0;
  });

  return Array.from(bucketMap.values());
}

function buildFinancialOverview(base: FinancialBase | null, payoutRate: number): FinancialOverview {
  if (!base) {
    return emptyFinancialOverview;
  }

  const avgTicket = base.totalEnrollments ? base.totalRevenue / base.totalEnrollments : 0;

  const teacherAggregate = new Map<
    string,
    { name?: string; specialty?: string; totalRevenue: number; courses: number }
  >();

  base.courseFinancials.forEach((course) => {
    if (!course.teacherId) return;
    const entry = teacherAggregate.get(course.teacherId) || {
      name: course.teacherName,
      specialty: course.teacherSpecialty,
      totalRevenue: 0,
      courses: 0,
    };
    entry.name = course.teacherName || entry.name;
    entry.specialty = course.teacherSpecialty || entry.specialty;
    entry.totalRevenue += course.revenue;
    entry.courses += 1;
    teacherAggregate.set(course.teacherId, entry);
  });

  const teacherSummaries: TeacherFinancial[] = Array.from(teacherAggregate.entries())
    .map(([id, data]) => ({
      id,
      name: data.name,
      specialty: data.specialty,
      totalRevenue: data.totalRevenue,
      payout: data.totalRevenue * payoutRate,
      courses: data.courses,
      status: determineTeacherStatus(data.totalRevenue, base.totalRevenue, teacherAggregate.size),
    }))
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, 6);

  const outstandingPayouts = teacherSummaries
    .filter((teacher) => teacher.status === 'delayed')
    .reduce((sum, teacher) => sum + teacher.payout, 0);

  const midpoint = Math.floor(base.trendPoints.length / 2);
  const firstHalf = base.trendPoints.slice(0, midpoint).reduce((sum, point) => sum + point.revenue, 0);
  const secondHalf = base.trendPoints.slice(midpoint).reduce((sum, point) => sum + point.revenue, 0);
  const pipelineGrowth = firstHalf === 0 ? 0 : ((secondHalf - firstHalf) / firstHalf) * 100;

  return {
    totalRevenue: base.totalRevenue,
    avgTicket,
    totalEnrollments: base.totalEnrollments,
    outstandingPayouts,
    pipelineGrowth,
    revenueTrend: base.trendPoints,
    topCourses: [...base.courseFinancials].sort((a, b) => b.revenue - a.revenue).slice(0, 5),
    teacherSummaries,
  };
}

function determineTeacherStatus(totalRevenue: number, allRevenue: number, teacherCount: number): TeacherFinancial['status'] {
  if (!teacherCount || allRevenue === 0) {
    return 'ontime';
  }
  const averageShare = allRevenue / teacherCount;
  if (totalRevenue >= averageShare * 1.2) return 'ahead';
  if (totalRevenue <= averageShare * 0.6) return 'delayed';
  return 'ontime';
}

type InsightCardProps = {
  title: string;
  value: string;
  subLabel?: string;
  icon: LucideIcon;
  trend?: number;
};

function InsightCard({ title, value, subLabel, icon: Icon, trend }: InsightCardProps) {
  return (
    <Card className="card-hover">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
        <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0">
        <div className="text-xl sm:text-2xl font-bold break-words">{value}</div>
        {subLabel && <p className="text-xs text-muted-foreground mt-1 sm:mt-2">{subLabel}</p>}
        {typeof trend === 'number' && (
          <p className={`mt-1 sm:mt-2 text-xs font-medium ${trend >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
            {trend >= 0 ? '+' : ''}
            {trend.toFixed(1)}% o'zgarish
          </p>
        )}
      </CardContent>
    </Card>
  );
}

type FinanceSnapshotProps = {
  snapshot: DashboardSnapshot | null;
  loading: boolean;
  currency: DashboardConfig['currency'];
};

function FinanceSnapshot({ snapshot, loading, currency }: FinanceSnapshotProps) {

  const formatCurrencyLocal = (value: number) => {
    const rate = currencyRates[currency] || 1;
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: currency === 'UZS' ? 0 : 2,
    });
    return formatter.format(value * rate);
  };

  if (loading || !snapshot) {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle>Moliya paneli</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Moliya statistikasi yuklanmoqda...
        </CardContent>
      </Card>
    );
  }

  const revenueChartData = snapshot.revenueSeries.map((item) => ({
    month: new Date(`${item.month}-01`).toLocaleDateString('default', { month: 'short', year: '2-digit' }),
    value: item.revenue,
  }));

  const expenseChartData = snapshot.expenseSeries.map((item) => ({
    month: new Date(`${item.month}-01`).toLocaleDateString('default', { month: 'short', year: '2-digit' }),
    value: item.expense,
  }));

  const pieData = [
    { name: 'Net Profit', value: Math.max(snapshot.netProfit, 0) },
    { name: 'Expenses', value: snapshot.monthlyExpenses },
  ];

  const studentStatusData = snapshot.studentStatusSeries.map((item) => ({
    status: item.status === 'paid' ? 'Paid' : 'Unpaid',
    value: item.value,
  }));

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        <Card className="stagger-item" style={{ animationDelay: '0.02s' }}>
          <CardHeader className="pb-2 p-4 sm:p-6">
            <CardTitle className="text-xs sm:text-sm text-muted-foreground">Monthly revenue</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <p className="text-xl sm:text-2xl font-bold break-words">{formatCurrencyLocal(snapshot.monthlyRevenue)}</p>
            <p className="text-xs text-muted-foreground mt-1">Teachers: {snapshot.teacherCount}</p>
          </CardContent>
        </Card>
        <Card className="stagger-item" style={{ animationDelay: '0.04s' }}>
          <CardHeader className="pb-2 p-4 sm:p-6">
            <CardTitle className="text-xs sm:text-sm text-muted-foreground">Monthly expenses</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <p className="text-xl sm:text-2xl font-bold break-words">{formatCurrencyLocal(snapshot.monthlyExpenses)}</p>
            <p className="text-xs text-muted-foreground mt-1">Teacher salaries included</p>
          </CardContent>
        </Card>
        <Card className="stagger-item" style={{ animationDelay: '0.06s' }}>
          <CardHeader className="pb-2 p-4 sm:p-6">
            <CardTitle className="text-xs sm:text-sm text-muted-foreground">Net profit</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <p className="text-xl sm:text-2xl font-bold break-words">{formatCurrencyLocal(snapshot.netProfit)}</p>
            <p className="text-xs text-muted-foreground mt-1">{snapshot.netProfit >= 0 ? 'Positive month' : 'Loss month'}</p>
          </CardContent>
        </Card>
        <Card className="stagger-item" style={{ animationDelay: '0.08s' }}>
          <CardHeader className="pb-2 p-4 sm:p-6">
            <CardTitle className="text-xs sm:text-sm text-muted-foreground">Profit margin</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <p className="text-xl sm:text-2xl font-bold">{snapshot.profitMargin.toFixed(1)}%</p>
            <p className="text-xs text-muted-foreground mt-1">Paid students: {snapshot.paidStudents}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
        <Card className="xl:col-span-2">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">Monthly revenue line</CardTitle>
          </CardHeader>
          <CardContent className="h-[240px] sm:h-[300px] p-4 sm:p-6 pt-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueChartData}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={3} dot />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">Profit vs expenses</CardTitle>
          </CardHeader>
          <CardContent className="h-[240px] sm:h-[300px] flex items-center justify-center p-4 sm:p-6 pt-0">
            <PieChart width={240} height={240} className="sm:w-[280px] sm:h-[280px]">
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4}>
                {pieData.map((entry, index) => (
                  <Cell key={entry.name} fill={index === 0 ? '#16a34a' : '#f97316'} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">Monthly expense bar</CardTitle>
          </CardHeader>
          <CardContent className="h-[220px] sm:h-[260px] p-4 sm:p-6 pt-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={expenseChartData}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#6366f1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">Student payment status</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Paid vs unpaid o'quvchilar</CardDescription>
          </CardHeader>
          <CardContent className="h-[220px] sm:h-[260px] p-4 sm:p-6 pt-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={studentStatusData}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                <XAxis dataKey="status" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#f59e0b" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function GroupAnalytics({ snapshot, loading }: { snapshot: DashboardSnapshot | null; loading: boolean }) {
  if (loading || !snapshot) {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle>Guruh statistikasi</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">Guruh statistikasi yuklanmoqda...</CardContent>
      </Card>
    );
  }

  const topStudents = snapshot.topGroups.byStudents;
  const topRevenue = snapshot.topGroups.byRevenue;
  const topAttendance = snapshot.topGroups.byAttendance;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Guruhlar soni</CardTitle>
            <CardDescription>Faol va yopiq guruhlar</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{snapshot.groupCount}</p>
            <p className="text-sm text-muted-foreground">Jami A+ Academy bo'ylab</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>O'qituvchi boshiga guruhlar</CardTitle>
          </CardHeader>
          <CardContent className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={snapshot.teachersPerGroup}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                <XAxis dataKey="teacher" hide />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Talabalar soni</CardTitle>
          </CardHeader>
          <CardContent className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={snapshot.studentsPerGroup}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Sig'imdan foydalanish</CardTitle>
          </CardHeader>
          <CardContent className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={snapshot.capacityUsage}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                <XAxis dataKey="name" />
                <YAxis unit="%" />
                <Tooltip />
                <Bar dataKey="value" fill="#f97316" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top 5 guruhlar</CardTitle>
          <CardDescription>Talaba, revenue va attendance bo'yicha</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <TopGroupList title="Talabalar" items={topStudents} suffix="talaba" />
          <TopGroupList title="Revenue" items={topRevenue} suffix="so'm" formatter={(value) => value.toLocaleString()} />
          <TopGroupList title="Attendance" items={topAttendance} suffix="%" />
        </CardContent>
      </Card>
    </div>
  );
}

function TopGroupList({
  title,
  items,
  suffix,
  formatter,
}: {
  title: string;
  items: { id: string; name: string; value: number }[];
  suffix?: string;
  formatter?: (value: number) => string;
}) {
  return (
    <div>
      <p className="text-sm font-semibold">{title}</p>
      <div className="mt-3 space-y-2">
        {items.map((item, index) => (
          <div key={item.id} className="flex items-center justify-between rounded-lg border px-3 py-2">
            <div>
              <p className="font-semibold">
                #{index + 1} {item.name}
              </p>
            </div>
            <span className="text-sm text-muted-foreground">
              {formatter ? formatter(item.value) : item.value} {suffix}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
