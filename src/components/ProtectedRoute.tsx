import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { admin, loading, isAdmin } = useAuth();
  const [location, setLocation] = useLocation();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (!loading && !isRedirecting) {
      if (!admin || !isAdmin) {
        // Faqat login sahifasida bo'lmasa redirect qilamiz
        if (location !== '/admin/login') {
          setIsRedirecting(true);
          setLocation('/admin/login');
        }
      }
    }
  }, [admin, loading, isAdmin, setLocation, location, isRedirecting]);

  if (loading || isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">
            {loading ? 'Yuklanmoqda...' : 'Qayta yo\'naltirilmoqda...'}
          </p>
        </div>
      </div>
    );
  }

  if (!admin || !isAdmin) {
    // Agar hali ham admin bo'lmasa, loading ko'rsatamiz
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

