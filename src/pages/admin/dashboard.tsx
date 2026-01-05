import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'wouter';
import { format, subDays, subMonths, startOfDay, startOfMonth, startOfWeek } from 'date-fns';
import { eachDayOfInterval, eachMonthOfInterval, eachWeekOfInterval } from 'date-fns';
// Recharts - faqat admin dashboard'da ishlatiladi, shuning uchun bu sahifa lazy load qilinadi
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
  const [dashboardConfig, setDashboardConfig] = useState<DashboardConfig>(() => {
    // localStorage'dan payout rate'ni olish
    const storedPayoutRate = typeof window !== 'undefined' ? localStorage.getItem('academy_payout_rate') : null;
    const initialPayoutRate = storedPayoutRate ? parseFloat(storedPayoutRate) : 0.35;

    return {
      timeRange: '30d',
      currency: 'UZS',
      payoutRate: initialPayoutRate >= 0.20 && initialPayoutRate <= 0.60 ? initialPayoutRate : 0.35,
      showTeacherPayouts: true,
    };
  });

  useEffect(() => {
    loadStats();
    loadRecentData();
    loadFeaturedSets();
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
            course_name: (item.courses as { name_uz?: string } | null)?.name_uz,
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
      <CardHeader className="p-3 sm:p-4 md:p-6">
        <CardTitle className="text-sm sm:text-base md:text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
        {items || (
          <div className="text-center py-6 text-[11px] sm:text-xs md:text-sm text-muted-foreground">
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
    setDashboardConfig((prev) => {
      const newConfig = {
        ...prev,
        [key]: value,
      };

      // Agar payoutRate o'zgarsa, localStorage'ga saqlash va event yuborish
      if (key === 'payoutRate' && typeof value === 'number') {
        try {
          localStorage.setItem('academy_payout_rate', value.toString());
          // Custom event yuborish (o'z tab'i uchun)
          window.dispatchEvent(new CustomEvent('payoutRateChanged'));
        } catch (error) {
          console.error('Error saving payout rate:', error);
        }
      }

      return newConfig;
    });
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
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Card
                key={item.path}
                className="card-hover stagger-item cursor-pointer"
                onClick={() => setLocation(item.path)}
                style={{ animationDelay: `${index * 0.02}s` }}
              >
                <CardHeader className="p-3 sm:p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div className="p-2 sm:p-2.5 md:p-3 bg-primary/10 rounded-lg">
                      <Icon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-primary" />
                    </div>
                    <span className="text-lg sm:text-xl md:text-2xl font-bold text-primary">{item.count}</span>
                  </div>
                  <CardTitle className="mt-2 sm:mt-3 md:mt-4 text-sm sm:text-base md:text-lg">{item.title}</CardTitle>
                  <CardDescription className="text-[11px] sm:text-xs md:text-sm">{item.description}</CardDescription>
                </CardHeader>
                <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
                  <Button variant="ghost" className="w-full justify-between text-[11px] sm:text-xs md:text-sm h-8 sm:h-9 md:h-10">
                    Boshqarish
                    <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          <Card className="lg:col-span-2">
            <CardHeader className="p-3 sm:p-4 md:p-6">
              <CardTitle className="text-sm sm:text-base md:text-lg">So'nggi arizalar</CardTitle>
              <CardDescription className="text-[11px] sm:text-xs md:text-sm">Oxirgi 5ta ro'yxatdan o'tish</CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 md:p-6 pt-0 overflow-x-auto">
              {recentApplications.length === 0 ? (
                <div className="text-center text-xs sm:text-sm md:text-base text-muted-foreground py-6">
                  Hozircha arizalar yo'q
                </div>
              ) : (
                <div className="min-w-[400px] sm:min-w-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-[11px] sm:text-xs md:text-sm">Ism</TableHead>
                        <TableHead className="text-[11px] sm:text-xs md:text-sm hidden sm:table-cell">Kurs</TableHead>
                        <TableHead className="text-[11px] sm:text-xs md:text-sm">Telefon</TableHead>
                        <TableHead className="text-[11px] sm:text-xs md:text-sm">Sana</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentApplications.map((app, index) => (
                        <TableRow key={app.id} className="table-row-hover stagger-item" style={{ animationDelay: `${index * 0.02}s` }}>
                          <TableCell className="font-medium text-[11px] sm:text-xs md:text-sm">
                            <div>
                              <div>{app.full_name}</div>
                              <div className="text-muted-foreground sm:hidden text-[10px] mt-1">{app.course_name || 'Noma\'lum'}</div>
                            </div>
                          </TableCell>
                          <TableCell className="text-[11px] sm:text-xs md:text-sm hidden sm:table-cell">{app.course_name || 'Noma\'lum'}</TableCell>
                          <TableCell className="text-[11px] sm:text-xs md:text-sm">{app.phone}</TableCell>
                          <TableCell className="text-[11px] sm:text-xs md:text-sm">
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
            <CardHeader className="p-3 sm:p-4 md:p-6">
              <CardTitle className="text-sm sm:text-base md:text-lg">Yangi kurslar</CardTitle>
              <CardDescription className="text-[11px] sm:text-xs md:text-sm">Oxirgi qo'shilgan 5 ta kurs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 sm:space-y-3 md:space-y-4 p-3 sm:p-4 md:p-6 pt-0">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          {renderFeaturedCard(
            'Featured kurslar',
            featuredCourses.length ? (
              <div className="space-y-2 sm:space-y-3">
                {featuredCourses.map((course) => (
                  <div key={course.id} className="flex items-center justify-between rounded border p-2 sm:p-2.5 md:p-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-[11px] sm:text-xs md:text-sm truncate">{course.name_uz}</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{course.category}</p>
                    </div>
                    <Badge className="ml-2 flex-shrink-0 text-[9px] sm:text-[10px] md:text-xs">
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

  // O'qituvchilar revenue'larini kurs daromadlaridan hisoblash

  const teacherAggregate = new Map<
    string,
    { name?: string; specialty?: string; totalRevenue: number; courses: number }
  >();

  base.courseFinancials.forEach((course) => {
    // Kurs daromadlarini hisoblash
    if (course.id) {
      const teacherId = course.teacherId;
      if (teacherId) {
        const entry = teacherAggregate.get(teacherId) || {
          name: course.teacherName,
          specialty: course.teacherSpecialty,
          totalRevenue: 0,
          courses: 0,
        };
        entry.name = course.teacherName || entry.name;
        entry.specialty = course.teacherSpecialty || entry.specialty;
        entry.totalRevenue += course.revenue; // Kurs daromadlari
        entry.courses += 1;
        teacherAggregate.set(teacherId, entry);
      }
    } else if (course.teacherId) {
      // Oddiy courses
      const entry = teacherAggregate.get(course.teacherId) || {
        name: course.teacherName,
        specialty: course.teacherSpecialty,
        totalRevenue: 0,
        courses: 0,
      };
      entry.name = course.teacherName || entry.name;
      entry.specialty = course.teacherSpecialty || entry.specialty;
      // Kurs daromadlarini qo'shamiz
      // Aks holda course revenue'ni qo'shamiz
      if (!entry.totalRevenue || course.revenue > entry.totalRevenue) {
        entry.totalRevenue = Math.max(entry.totalRevenue, course.revenue);
      }
      entry.courses += 1;
      teacherAggregate.set(course.teacherId, entry);
    }
  });

  const teacherSummaries: TeacherFinancial[] = Array.from(teacherAggregate.entries())
    .map(([id, data]) => ({
      id,
      name: data.name || t('admin.dashboard.unknownTeacher') || 'Unknown',
      specialty: data.specialty || '',
      totalRevenue: data.totalRevenue,
      payout: data.totalRevenue * payoutRate, // Kurs daromadlari × payoutRate
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
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4 md:p-6">
        <CardTitle className="text-[11px] sm:text-xs md:text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-muted-foreground flex-shrink-0" />
      </CardHeader>
      <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
        <div className="text-lg sm:text-xl md:text-2xl font-bold break-words">{value}</div>
        {subLabel && <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 sm:mt-2">{subLabel}</p>}
        {typeof trend === 'number' && (
          <p className={`mt-1 sm:mt-2 text-[10px] sm:text-xs font-medium ${trend >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
            {trend >= 0 ? '+' : ''}
            {trend.toFixed(1)}% o'zgarish
          </p>
        )}
      </CardContent>
    </Card>
  );
}


