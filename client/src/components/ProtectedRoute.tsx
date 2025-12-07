import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { admin, loading, isAdmin } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!loading) {
      if (!admin || !isAdmin) {
        // Faqat login sahifasida bo'lmasa redirect qilamiz
        if (location !== '/admin/login') {
          setLocation('/admin/login');
        }
      }
    }
  }, [admin, loading, isAdmin, setLocation, location]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (!admin || !isAdmin) {
    // Loading ko'rsatamiz, chunki redirect bo'lishi kerak
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Qayta yo'naltirilmoqda...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

