import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
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
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import type { Application, Course } from '@shared/schema';
import { Download, Bell } from 'lucide-react';

function ApplicationsContent() {
  // Applications content component
  const [applications, setApplications] = useState<(Application & { course?: Course })[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [newApplicationsCount, setNewApplicationsCount] = useState(0);
  const [lastViewedTime, setLastViewedTime] = useState<Date | null>(null);
  const itemsPerPage = 20;
  const { toast } = useToast();
  const subscriptionRef = useRef<any>(null);
  const isResettingRef = useRef(false);

  const loadApplications = useCallback(async () => {
    try {
      // Avval arizalarni yuklaymiz (data maydonini ham olamiz)
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

      // Arizalarga kurs ma'lumotlarini qo'shamiz va data maydonini to'g'ri parse qilamiz
      const appsWithCourses = (apps || []).map(app => {
        const course = courses?.find(c => c.id === app.course_id);
        
        // data maydoni JSONB bo'lishi mumkin, uni to'g'ri parse qilamiz
        let parsedData: Record<string, any> | null = null;
        if (app.data) {
          if (typeof app.data === 'string') {
            try {
              parsedData = JSON.parse(app.data);
            } catch {
              // Agar parse qilishda xatolik bo'lsa, string sifatida qoldiramiz
              parsedData = { raw: app.data };
            }
          } else if (typeof app.data === 'object' && app.data !== null) {
            // Agar allaqachon object bo'lsa, to'g'ridan-to'g'ri ishlatamiz
            parsedData = app.data as Record<string, any>;
          }
        }
        
        return {
          ...app,
          data: parsedData,
          course: course || null
        };
      });

      setApplications(appsWithCourses);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: 'Xatolik',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Component mount bo'lganda, hozirgi vaqtni saqlaymiz va arizalarni yuklaymiz
  // Bildirishnoma kabi: sahifaga kirganda counter avtomatik yo'qoladi
  useEffect(() => {
    const now = new Date();
    // Avval counter'ni 0 ga tushirish (bildirishnoma yo'qoladi)
    setNewApplicationsCount(0);
    // Reset flag'ni o'rnatish
    isResettingRef.current = true;
    // lastViewedTime ni yangilash
    setLastViewedTime(now);
    // Arizalarni yuklash
    loadApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Faqat bir marta mount bo'lganda ishlaydi

  // Real-time subscription - faqat bir marta ochiladi
  useEffect(() => {
    // Real-time subscription ochish
    const channel = supabase
      .channel('applications-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'applications',
        },
        (payload) => {
          // Yangi ariza qo'shilganda
          const newApp = payload.new as Application;
          const appCreatedAt = new Date(newApp.created_at);
          
          // lastViewedTime ni olish
          setLastViewedTime(currentTime => {
            if (currentTime && appCreatedAt > currentTime) {
              // Counter'ni oshirish
              setNewApplicationsCount(prev => prev + 1);
              
              // Toast ko'rsatish
              toast({
                title: 'Yangi ariza',
                description: `${newApp.full_name} ro'yxatdan o'tdi`,
              });

              // Arizalarni yangilash
              loadApplications();
            } else if (!currentTime) {
              // Agar hali lastViewedTime bo'lmasa, yangilash
              loadApplications();
            }
            return currentTime; // lastViewedTime o'zgartirmaymiz
          });
        }
      )
      .subscribe();

    subscriptionRef.current = channel;

    // Component unmount bo'lganda subscription yopish
    return () => {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
        subscriptionRef.current = null;
      }
    };
  }, [toast, loadApplications]);

  // Arizalar yuklanganda, counter'ni yangilash
  // Faqat applications o'zgarganda
  useEffect(() => {
    // Agar reset qilish jarayonida bo'lsa (sahifaga kirganda), counter'ni 0 ga tushirish
    if (isResettingRef.current) {
      isResettingRef.current = false;
      setNewApplicationsCount(0); // Bildirishnoma yo'qoladi
      return;
    }
    
    if (!lastViewedTime) {
      return;
    }
    
    // Yangi arizalarni sanash - faqat lastViewedTime dan keyin qo'shilganlar
    // Bu faqat real-time subscription orqali yangi ariza kelganda ishlaydi
    const newCount = applications.filter(app => {
      const appCreatedAt = new Date(app.created_at);
      return appCreatedAt > lastViewedTime;
    }).length;
    
    setNewApplicationsCount(newCount);
  }, [applications, lastViewedTime]);

  // Pagination calculations
  const totalPages = Math.ceil(applications.length / itemsPerPage);
  const paginatedApplications = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return applications.slice(startIndex, endIndex);
  }, [applications, currentPage, itemsPerPage]);

  const exportToCSV = () => {
    const headers = ['Ism', 'Yosh', 'Telefon', 'Ota-ona telefon', 'Kurs', 'Narxi', 'Sana'];
    const rows = applications.map((app) => [
      app.full_name,
      app.age.toString(),
      app.phone,
      (() => {
        const parentPhone = app.data && typeof app.data === 'object' && 'parent_phone' in app.data
          ? (app.data as { parent_phone?: string }).parent_phone
          : null;
        return parentPhone || '';
      })(),
      (app.course?.name_uz as string) || 'Noma\'lum',
      (app.course?.price as string) || '',
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
            <div className="flex items-center gap-3">
              <h2 className="text-2xl sm:text-3xl font-bold">Ro'yxatdan o'tganlar</h2>
              {newApplicationsCount > 0 && (
                <Badge 
                  variant="default" 
                  className="bg-primary text-primary-foreground animate-pulse flex items-center gap-1.5"
                >
                  <Bell className="h-3.5 w-3.5" />
                  {newApplicationsCount} yangi
                </Badge>
              )}
            </div>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              Online forma orqali tushgan barcha arizalarni kuzating
            </p>
          </div>
          <div className="flex gap-2">
            {newApplicationsCount > 0 && (
              <Button 
                onClick={() => {
                  const now = new Date();
                  // Reset flag'ni o'rnatish
                  isResettingRef.current = true;
                  // Counter'ni 0 ga tushirish
                  setNewApplicationsCount(0);
                  // lastViewedTime ni yangilash - bu yangi arizalarni sanash uchun
                  setLastViewedTime(now);
                  // Arizalarni yangilash
                  loadApplications();
                }} 
                variant="default"
                className="w-full sm:w-auto text-sm"
              >
                <Bell className="h-4 w-4 mr-2" />
                Ko'rdim ({newApplicationsCount})
              </Button>
            )}
            <Button onClick={exportToCSV} variant="outline" className="w-full sm:w-auto text-sm">
              <Download className="h-4 w-4 mr-2" />
              CSV yuklab olish
            </Button>
          </div>
        </div>
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">
              O'quvchilar ro'yxati ({applications.length})
              {totalPages > 1 && (
                <span className="text-sm text-muted-foreground font-normal ml-2">
                  (Sahifa {currentPage} / {totalPages})
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 overflow-x-auto">
            {loading ? (
              <div className="text-center py-8 text-sm">Yuklanmoqda...</div>
            ) : applications.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                Hozircha ro'yxatdan o'tganlar yo'q
              </div>
            ) : (
              <>
                {/* Mobile Card View */}
                <div className="md:hidden space-y-3">
                  {paginatedApplications.map((app) => (
                    <Card key={app.id} className="border-2 border-border/50 hover:border-primary/30 transition-all hover:shadow-md">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div>
                            <h3 className="font-semibold text-sm mb-2">{app.full_name}</h3>
                            <div className="space-y-1.5 text-xs text-muted-foreground">
                              <div className="flex items-center justify-between">
                                <span>Yosh:</span>
                                <span className="font-medium text-foreground">{app.age}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span>Telefon:</span>
                                <span className="font-medium text-foreground">{app.phone}</span>
                              </div>
                              {(() => {
                                // data maydonini to'g'ri olish
                                const parentPhone = app.data && typeof app.data === 'object' && 'parent_phone' in app.data
                                  ? (app.data as { parent_phone?: string }).parent_phone
                                  : null;
                                return parentPhone ? (
                                  <div className="flex items-center justify-between">
                                    <span>Ota-ona telefon:</span>
                                    <span className="font-medium text-foreground">{parentPhone}</span>
                                  </div>
                                ) : null;
                              })()}
                              <div className="flex items-center justify-between">
                                <span>Kurs:</span>
                                <span className="font-medium text-foreground">{app.course?.name_uz || 'Noma\'lum'}</span>
                              </div>
                              {app.course?.price && (
                                <div className="flex items-center justify-between">
                                  <span>Narxi:</span>
                                  <span className="font-medium text-foreground">{app.course.price} so'm</span>
                                </div>
                              )}
                              <div className="flex items-center justify-between pt-1 border-t">
                                <span>Sana:</span>
                                <span className="font-medium text-foreground">{new Date(app.created_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block min-w-[700px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs sm:text-sm">Ism</TableHead>
                        <TableHead className="text-xs sm:text-sm">Yosh</TableHead>
                        <TableHead className="text-xs sm:text-sm">Telefon</TableHead>
                        <TableHead className="text-xs sm:text-sm hidden lg:table-cell">Ota-ona telefon</TableHead>
                        <TableHead className="text-xs sm:text-sm hidden lg:table-cell">Kurs</TableHead>
                        <TableHead className="text-xs sm:text-sm">Sana</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedApplications.map((app) => (
                        <TableRow key={app.id}>
                          <TableCell className="font-medium text-xs sm:text-sm">
                            {app.full_name}
                          </TableCell>
                          <TableCell className="text-xs sm:text-sm">{app.age}</TableCell>
                          <TableCell className="text-xs sm:text-sm">{app.phone}</TableCell>
                          <TableCell className="hidden lg:table-cell text-xs sm:text-sm">
                            {(() => {
                              // data maydonini to'g'ri olish
                              const parentPhone = app.data && typeof app.data === 'object' && 'parent_phone' in app.data
                                ? (app.data as { parent_phone?: string }).parent_phone
                                : null;
                              return parentPhone || '—';
                            })()}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-xs sm:text-sm">
                            <div>
                              <div>{app.course?.name_uz || 'Noma\'lum'}</div>
                              <div className="text-xs text-muted-foreground">{app.course?.price ? `${app.course.price} so'm` : ''}</div>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs sm:text-sm">{new Date(app.created_at).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                {totalPages > 1 && (
                  <div className="mt-4 flex justify-center">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                          />
                        </PaginationItem>
                        
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                          // Show first page, last page, current page, and pages around current
                          if (
                            page === 1 ||
                            page === totalPages ||
                            (page >= currentPage - 1 && page <= currentPage + 1)
                          ) {
                            return (
                              <PaginationItem key={page}>
                                <PaginationLink
                                  onClick={() => setCurrentPage(page)}
                                  isActive={currentPage === page}
                                  className="cursor-pointer"
                                >
                                  {page}
                                </PaginationLink>
                              </PaginationItem>
                            );
                          } else if (page === currentPage - 2 || page === currentPage + 2) {
                            return (
                              <PaginationItem key={page}>
                                <PaginationEllipsis />
                              </PaginationItem>
                            );
                          }
                          return null;
                        })}
                        
                        <PaginationItem>
                          <PaginationNext 
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
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
