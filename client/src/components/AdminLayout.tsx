import { useLocation } from 'wouter';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import {
  BookOpen,
  Users,
  Calendar,
  FileText,
  Trophy,
  LogOut,
  LayoutDashboard,
  Tag,
  Quote,
  Clock,
  GraduationCap,
  UsersRound,
  Globe,
  Building2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';
import { adminApi } from '@/lib/adminApi';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [location, setLocation] = useLocation();
  const { signOut } = useAuth();
  const [stats, setStats] = useState({
    courses: 0,
    teachers: 0,
    events: 0,
    applications: 0,
    achievements: 0,
    students: 0,
    groups: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [coursesRes, teachersRes, eventsRes, applicationsRes, achievementsRes, snapshot] = await Promise.all([
        supabase.from('courses').select('id', { count: 'exact' }),
        supabase.from('teachers').select('id', { count: 'exact' }),
        supabase.from('events').select('id', { count: 'exact' }),
        supabase.from('applications').select('id', { count: 'exact' }),
        supabase.from('achievements').select('id', { count: 'exact' }),
        adminApi.getDashboardSnapshot(),
      ]);

      setStats({
        courses: coursesRes.count || 0,
        teachers: teachersRes.count || 0,
        events: eventsRes.count || 0,
        applications: applicationsRes.count || 0,
        achievements: achievementsRes.count || 0,
        students: snapshot.studentCount,
        groups: snapshot.groupCount,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setLocation('/admin/login');
  };

  const menuGroups = useMemo(
    () => [
      {
        label: 'Asosiy',
        icon: LayoutDashboard,
        items: [
          { title: 'Dashboard', icon: LayoutDashboard, path: '/admin', count: null },
        ],
      },
      {
        label: 'CRM Tizimi',
        icon: Building2,
        items: [
          { title: 'Talabalar', icon: GraduationCap, path: '/admin/students', count: stats.students },
          { title: 'Guruhlar', icon: UsersRound, path: '/admin/groups', count: stats.groups },
          { title: "O'qituvchilar", icon: Users, path: '/admin/teachers', count: stats.teachers },
          { title: "Arizalar", icon: FileText, path: '/admin/applications', count: stats.applications },
        ],
      },
      {
        label: 'Websayt Kontenti',
        icon: Globe,
        items: [
          { title: 'Kurslar', icon: BookOpen, path: '/admin/courses', count: stats.courses },
          { title: 'Tadbirlar', icon: Calendar, path: '/admin/events', count: stats.events },
          { title: 'Yutuqlar', icon: Trophy, path: '/admin/achievements', count: stats.achievements },
          { title: 'Jadval', icon: Clock, path: '/admin/schedule', count: null },
          { title: 'Fikrlar', icon: Quote, path: '/admin/testimonials', count: null },
          { title: 'Sozlamalar', icon: Tag, path: '/admin/categories', count: null },
        ],
      },
    ],
    [stats]
  );

  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen w-full">
        <Sidebar collapsible="offcanvas" className="bg-gradient-to-b from-background to-muted/30 transition-all duration-300">
          <SidebarContent className="overflow-y-auto">
            <div className="px-2 sm:px-3 md:px-4 py-3 sm:py-4 md:py-5 animate-fade-in-down">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="h-7 w-7 sm:h-8 sm:w-8 md:h-10 md:w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-semibold transition-all duration-300 hover:bg-primary/20 flex-shrink-0 text-[10px] sm:text-xs md:text-sm">
                  A+
                </div>
                <div className="min-w-0 flex-1 hidden sm:block">
                  <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground truncate">A+ Academy</p>
                  <p className="font-semibold leading-tight text-foreground text-[10px] sm:text-xs md:text-sm truncate">
                    Control Center
                  </p>
                </div>
                <SidebarTrigger className="ml-auto lg:hidden transition-opacity duration-200 hover:opacity-80 flex-shrink-0 h-7 w-7 sm:h-8 sm:w-8" />
              </div>
            </div>
            {menuGroups.map((group) => (
              <SidebarGroup key={group.label}>
                <SidebarGroupLabel className="text-[9px] sm:text-[10px] md:text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 px-2">
                  {group.label}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.items.map((item, index) => {
                      const Icon = item.icon;
                      const isActive = location === item.path || (item.path === '/admin' && location === '/admin');
                      return (
                        <SidebarMenuItem key={item.path} className="stagger-item" style={{ animationDelay: `${index * 0.03}s` }}>
                          <SidebarMenuButton 
                            onClick={() => setLocation(item.path)} 
                            isActive={isActive} 
                            tooltip={item.title}
                            className="transition-all duration-200 hover:translate-x-1 text-[11px] sm:text-xs md:text-sm px-2 sm:px-3"
                          >
                            <Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 transition-colors duration-200 flex-shrink-0" />
                            <span className="truncate">{item.title}</span>
                            {item.count !== null && (
                              <Badge variant="outline" className="ml-auto rounded-full text-[9px] sm:text-[10px] md:text-xs px-1 sm:px-1.5 md:px-2 py-0 transition-all duration-200 group-hover:bg-primary/10 group-hover:border-primary/30 flex-shrink-0">
                                {item.count}
                              </Badge>
                            )}
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
          </SidebarContent>
          <Separator />
          <div className="p-2 sm:p-3 md:p-4 space-y-2">
            <div className="flex items-center justify-between px-2">
              <span className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">Tema</span>
              <ThemeToggle />
            </div>
            <Button
              variant="outline"
              className="w-full justify-start text-[11px] sm:text-xs md:text-sm h-8 sm:h-9 md:h-10"
              onClick={handleSignOut}
            >
              <LogOut className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 mr-1.5 sm:mr-2" />
              Chiqish
            </Button>
          </div>
        </Sidebar>
        <main className="flex-1 flex flex-col min-w-0 w-full">
          <div className="border-b p-3 sm:p-4 backdrop-blur bg-background/70 sticky top-0 z-10 transition-all duration-300">
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4 animate-fade-in-down">
              <SidebarTrigger className="lg:hidden transition-opacity duration-200 hover:opacity-80 flex-shrink-0 h-8 w-8 sm:h-9 sm:w-9" />
              <div className="min-w-0 flex-1">
                <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-foreground truncate">
                  A+ Academy Admin
                </h1>
                <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground hidden sm:block">Monitoring va boshqaruv</p>
              </div>
            </div>
          </div>
          <div className="flex-1 p-2 sm:p-3 md:p-4 lg:p-6 animate-fade-in overflow-x-hidden w-full max-w-full">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}

