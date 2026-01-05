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
    // Check if admin is logged in (Supabase Auth va localStorage)
    const checkAdminSession = async () => {
      try {
        // Avval Supabase Auth session'ni tekshiramiz
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (session && !sessionError) {
          // Supabase Auth orqali kirilgan
          const user = session.user;
          const adminData = {
            login: user.email || user.id,
            name: user.user_metadata?.name || user.email?.split('@')[0] || 'Administrator',
            created_at: user.created_at || new Date().toISOString(),
          };
          setAdmin(adminData as Admin);
          setIsAdmin(true);
          localStorage.setItem('admin_session', JSON.stringify(adminData));
          setLoading(false);
          return;
        }

        // Agar Supabase Auth session bo'lmasa, localStorage'dan tekshiramiz
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

    // Supabase Auth o'zgarishlarini kuzatish
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        const user = session.user;
        const adminData = {
          login: user.email || user.id,
          name: user.user_metadata?.name || user.email?.split('@')[0] || 'Administrator',
          created_at: user.created_at || new Date().toISOString(),
        };
        setAdmin(adminData as Admin);
        setIsAdmin(true);
        localStorage.setItem('admin_session', JSON.stringify(adminData));
      } else {
        setAdmin(null);
        setIsAdmin(false);
        localStorage.removeItem('admin_session');
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (login: string, password: string) => {
    try {
      // Login va parolni trim qilish (bo'sh joylarni olib tashlash)
      const trimmedLogin = login.trim();
      const trimmedPassword = password.trim();

      if (!trimmedLogin || !trimmedPassword) {
        return { error: { message: 'Login va parol bo\'sh bo\'lmasligi kerak' } };
      }

      // 1. Avval Supabase Auth orqali sinab ko'ramiz (email/password)
      // Agar login email formatida bo'lsa
      const isEmail = trimmedLogin.includes('@');
      
      if (isEmail) {
        try {
          const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: trimmedLogin,
            password: trimmedPassword,
          });

          if (!authError && authData?.user) {
            // Supabase Auth orqali muvaffaqiyatli kirildi
            const user = authData.user;
            const adminData = {
              login: user.email || user.id,
              name: user.user_metadata?.name || user.email?.split('@')[0] || 'Administrator',
              created_at: user.created_at || new Date().toISOString(),
            };
            setAdmin(adminData as Admin);
            setIsAdmin(true);
            localStorage.setItem('admin_session', JSON.stringify(adminData));
            console.log('Muvaffaqiyatli kirildi (Supabase Auth):', user.email);
            return { error: null };
          }
        } catch (authErr) {
          // Supabase Auth xatosi, custom admins jadvaliga o'tamiz
          console.log('Supabase Auth xatosi, custom admins jadvaliga o\'tamiz:', authErr);
        }
      }

      // 2. Agar Supabase Auth ishlamasa, custom admins jadvalidan tekshiramiz
      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .eq('login', trimmedLogin)
        .maybeSingle();

      // Xatolarni boshqarish
      if (error) {
        console.error('Admin query error:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        });

        // 406 - Not Acceptable (RLS policy yoki jadval muammosi)
        if (error.code === 'PGRST301' || error.message?.includes('406')) {
          return { 
            error: { 
              message: 'Server sozlamalari xatosi. Iltimos, Supabase\'da admins jadvali va RLS policy\'larini tekshiring yoki Supabase Authentication ishlatishingizni tavsiya qilamiz.' 
            } 
          };
        }

        // PGRST116 - no rows returned (bu normal, admin topilmasa)
        if (error.code === 'PGRST116') {
          return { error: { message: 'Login yoki parol noto\'g\'ri' } };
        }

        // Boshqa xatolar
        return { 
          error: { 
            message: `Xatolik: ${error.message || 'Noma\'lum xatolik'}. Iltimos, qayta urinib ko\'ring.` 
          } 
        };
      }

      // Agar data null bo'lsa (admin topilmasa)
      if (!data) {
        console.log('Admin topilmadi:', trimmedLogin);
        return { error: { message: 'Login yoki parol noto\'g\'ri' } };
      }

      // Parolni tekshirish (oddiy text comparison)
      const storedPassword = data.password?.toString().trim() || '';
      if (storedPassword && storedPassword === trimmedPassword) {
        const adminData = {
          login: data.login,
          name: data.name || 'Administrator',
          created_at: data.created_at || new Date().toISOString(),
        };
        localStorage.setItem('admin_session', JSON.stringify(adminData));
        setAdmin(adminData as Admin);
        setIsAdmin(true);
        console.log('Muvaffaqiyatli kirildi (Custom admins):', data.login);
        return { error: null };
      } else {
        console.log('Parol noto\'g\'ri');
        return { error: { message: 'Login yoki parol noto\'g\'ri' } };
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Sign in error:', errorMessage, error);
      return { 
        error: { 
          message: `Xatolik yuz berdi: ${errorMessage}. Iltimos, qayta urinib ko\'ring.` 
        } 
      };
    }
  };

  const signOut = async () => {
    try {
      // Supabase Auth session'ni ham tozalash
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      localStorage.removeItem('admin_session');
      setAdmin(null);
      setIsAdmin(false);
    }
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

