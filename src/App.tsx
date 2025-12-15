import { Switch, Route, useLocation } from "wouter";
import { Suspense, lazy } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Loader2 } from "lucide-react";

// Lazy load public pages
const Home = lazy(() => import("@/pages/home"));
const Courses = lazy(() => import("@/pages/courses"));
const Teachers = lazy(() => import("@/pages/teachers"));
const About = lazy(() => import("@/pages/about"));
const Events = lazy(() => import("@/pages/events"));
const Achievements = lazy(() => import("@/pages/gallery"));
const Contact = lazy(() => import("@/pages/contact"));
const Register = lazy(() => import("@/pages/register"));
const NotFound = lazy(() => import("@/pages/not-found"));

// Lazy load admin pages
const AdminLogin = lazy(() => import("@/pages/admin/login"));
const AdminDashboard = lazy(() => import("@/pages/admin/dashboard"));
const AdminCourses = lazy(() => import("@/pages/admin/courses"));
const AdminTeachers = lazy(() => import("@/pages/admin/teachers"));
const AdminEvents = lazy(() => import("@/pages/admin/events"));
const AdminApplications = lazy(() => import("@/pages/admin/applications"));
const AdminAchievements = lazy(() => import("@/pages/admin/achievements"));
const AdminCategories = lazy(() => import("@/pages/admin/categories"));
const AdminTestimonials = lazy(() => import("@/pages/admin/testimonials"));
const AdminSettings = lazy(() => import("@/pages/admin/settings"));

// Loading component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Yuklanmoqda...</p>
    </div>
  </div>
);

function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}

function Router() {
  const [location] = useLocation();
  const isAdminRoute = location.startsWith('/admin');

  if (isAdminRoute) {
    return (
      <Suspense fallback={<PageLoader />}>
        <Switch>
          <Route path="/admin/login" component={AdminLogin} />
          <Route path="/admin/courses" component={AdminCourses} />
          <Route path="/admin/teachers" component={AdminTeachers} />
          <Route path="/admin/events" component={AdminEvents} />
          <Route path="/admin/applications" component={AdminApplications} />
          <Route path="/admin/achievements" component={AdminAchievements} />
          <Route path="/admin/categories" component={AdminCategories} />
          <Route path="/admin/testimonials" component={AdminTestimonials} />
          <Route path="/admin/settings" component={AdminSettings} />
          <Route path="/admin" component={AdminDashboard} />
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    );
  }

  return (
    <PublicLayout>
      <Suspense fallback={<PageLoader />}>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/courses" component={Courses} />
          <Route path="/teachers" component={Teachers} />
          <Route path="/about" component={About} />
          <Route path="/events" component={Events} />
          <Route path="/achievements" component={Achievements} />
          <Route path="/contact" component={Contact} />
          <Route path="/register" component={Register} />
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </PublicLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <TooltipProvider>
            <div className="min-h-screen flex flex-col">
              <Router />
            </div>
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
