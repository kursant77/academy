import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Admin } from '@shared/schema';

type AuthContextType = {
  admin: Admin | null;
  loading: boolean;
  signIn: (login: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check if admin is logged in (from localStorage)
    const checkAdminSession = async () => {
      try {
        const storedAdmin = localStorage.getItem('admin_session');
        if (storedAdmin) {
          try {
            const adminData = JSON.parse(storedAdmin);
            // Ma'lumotlarni tekshiramiz
            if (adminData && adminData.login) {
              setAdmin(adminData);
              setIsAdmin(true);
            } else {
              localStorage.removeItem('admin_session');
            }
          } catch (error) {
            console.error('Error parsing admin session:', error);
            localStorage.removeItem('admin_session');
          }
        }
      } catch (error) {
        console.error('Error checking admin session:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAdminSession();
  }, []);

  const signIn = async (login: string, password: string) => {
    try {
      // Admin jadvalidan to'g'ridan-to'g'ri tekshirish
      const { data, error } = await supabase
        .from('admins')
        .select('login, name, password')
        .eq('login', login)
        .single();

      if (error) {
        console.error('Admin query error:', error);
        // Agar jadval topilmasa, default admin bilan kirish
        if (error.code === 'PGRST116' || error.message?.includes('not found')) {
          // Default admin credentials
          if (login === 'admin' && password === 'admin123') {
            const adminData = {
              login: 'admin',
              name: 'Administrator',
              created_at: new Date().toISOString(),
            };
            localStorage.setItem('admin_session', JSON.stringify(adminData));
            setAdmin(adminData as Admin);
            setIsAdmin(true);
            return { error: null };
          }
        }
        return { error: { message: 'Login yoki parol noto\'g\'ri' } };
      }

      // Parolni tekshirish (oddiy text comparison)
      if (data && data.password === password) {
        const adminData = {
          login: data.login,
          name: data.name || 'Administrator',
          created_at: new Date().toISOString(),
        };
        localStorage.setItem('admin_session', JSON.stringify(adminData));
        setAdmin(adminData as Admin);
        setIsAdmin(true);
        return { error: null };
      } else {
        return { error: { message: 'Login yoki parol noto\'g\'ri' } };
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Sign in error:', errorMessage);
      // Xatolik bo'lsa ham default admin bilan kirish imkoniyati (faqat development'da)
      if (import.meta.env.DEV && login === 'admin' && password === 'admin123') {
        const adminData: Admin = {
          id: 'dev-admin',
          login: 'admin',
          name: 'Administrator',
          created_at: new Date().toISOString(),
        };
        localStorage.setItem('admin_session', JSON.stringify(adminData));
        setAdmin(adminData);
        setIsAdmin(true);
        return { error: null };
      }
      return { error: { message: errorMessage } };
    }
  };

  const signOut = async () => {
    localStorage.removeItem('admin_session');
    setAdmin(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ admin, loading, signIn, signOut, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

