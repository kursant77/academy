import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import Home from "@/pages/home";
import Courses from "@/pages/courses";
import Teachers from "@/pages/teachers";
import About from "@/pages/about";
import Events from "@/pages/events";
import Schedule from "@/pages/schedule";
import Achievements from "@/pages/gallery";
import Contact from "@/pages/contact";
import Register from "@/pages/register";
import NotFound from "@/pages/not-found";
import AdminLogin from "@/pages/admin/login";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminCourses from "@/pages/admin/courses";
import AdminTeachers from "@/pages/admin/teachers";
import AdminEvents from "@/pages/admin/events";
import AdminApplications from "@/pages/admin/applications";
import AdminAchievements from "@/pages/admin/achievements";
import AdminCategories from "@/pages/admin/categories";
import AdminTestimonials from "@/pages/admin/testimonials";
import AdminSchedule from "@/pages/admin/schedule";
import AdminStudentsPage from "@/pages/admin/students";
import AdminGroupsPage from "@/pages/admin/groups";
import AdminGroupDetailsPage from "@/pages/admin/group-details";

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
      <Switch>
        <Route path="/admin/login" component={AdminLogin} />
        <Route path="/admin/groups/:id" component={AdminGroupDetailsPage} />
        <Route path="/admin/courses" component={AdminCourses} />
        <Route path="/admin/teachers" component={AdminTeachers} />
        <Route path="/admin/groups" component={AdminGroupsPage} />
        <Route path="/admin/students" component={AdminStudentsPage} />
        <Route path="/admin/events" component={AdminEvents} />
        <Route path="/admin/applications" component={AdminApplications} />
        <Route path="/admin/achievements" component={AdminAchievements} />
        <Route path="/admin/categories" component={AdminCategories} />
        <Route path="/admin/testimonials" component={AdminTestimonials} />
        <Route path="/admin/schedule" component={AdminSchedule} />
        <Route path="/admin" component={AdminDashboard} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  return (
    <PublicLayout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/courses" component={Courses} />
        <Route path="/teachers" component={Teachers} />
        <Route path="/about" component={About} />
        <Route path="/events" component={Events} />
        <Route path="/schedule" component={Schedule} />
        <Route path="/achievements" component={Achievements} />
        <Route path="/contact" component={Contact} />
        <Route path="/register" component={Register} />
        <Route component={NotFound} />
      </Switch>
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
