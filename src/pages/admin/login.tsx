import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { LogIn } from 'lucide-react';

export default function AdminLogin() {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, isAdmin, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Redirect if already logged in
  useEffect(() => {
    if (isAdmin && !authLoading) {
      // Kichik kechikish bilan redirect qilamiz
      const timer = setTimeout(() => {
        setLocation('/admin');
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isAdmin, setLocation, authLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signIn(login, password);

    if (error) {
      toast({
        title: 'Xatolik',
        description: error.message || 'Login yoki parol noto\'g\'ri',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Muvaffaqiyatli',
        description: 'Admin panelga kirildi',
      });
      setLocation('/admin');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-3 sm:p-4 md:p-6">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-2 sm:space-y-3 p-4 sm:p-6">
          <div className="flex items-center justify-center mb-2 sm:mb-4">
            <div className="p-3 sm:p-4 bg-primary/10 rounded-lg">
              <LogIn className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
            </div>
          </div>
          <CardTitle className="text-xl sm:text-2xl md:text-3xl text-center">Admin Panel</CardTitle>
          <CardDescription className="text-center text-xs sm:text-sm">
            Tizimga kirish uchun ma'lumotlaringizni kiriting
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div className="space-y-2">
              <Label htmlFor="login" className="text-sm sm:text-base font-medium">Login</Label>
              <Input
                id="login"
                type="text"
                placeholder="Login kiriting"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                required
                disabled={loading}
                autoComplete="username"
                className="h-12 sm:h-11 md:h-10 text-base sm:text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm sm:text-base font-medium">Parol</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                autoComplete="current-password"
                className="h-12 sm:h-11 md:h-10 text-base sm:text-sm"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full h-12 sm:h-11 md:h-10 text-base sm:text-sm font-medium" 
              disabled={loading}
            >
              {loading ? 'Kirilmoqda...' : 'Kirish'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

