import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { ThemeProvider } from "@/hooks/use-theme";
import { ErrorBoundary } from "@/components/error-boundary";
import NotFound from "@/pages/not-found";
import Index from "@/pages/index";
import Home from "@/pages/home";
import Center from "@/pages/center";
import Activity from "@/pages/activity";
import Profile from "@/pages/profile";
import Auth from "@/pages/auth";
import CenterAdminDashboard from "@/pages/center-admin/dashboard";
import CenterAdminCenter from "@/pages/center-admin/center";
import CenterAdminActivities from "@/pages/center-admin/activities";
import CenterAdminRegistrations from "@/pages/center-admin/registrations";
import ActivityStats from "@/pages/activity-stats";
import Help from "@/pages/help";
import Contact from "@/pages/contact";
import About from "@/pages/about";
import Navigation from "@/components/navigation";
import ResetPasswordPage from "@/pages/reset-password";
import ResetPassword from '@/pages/ResetPassword';
import TestRegistration from '@/pages/test-registration';
import AdminDashboard from "@/pages/admin/dashboard";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Index} />
      <Route path="/home" component={Home} />
      <Route path="/centers/:id" component={Center} />
      <Route path="/activities/:id" component={Activity} />
      <Route path="/profile" component={Profile} />
      <Route path="/auth" component={Auth} />
      <Route path="/test" component={TestRegistration} />
      <Route path="/reset-password" component={ResetPasswordPage} />
      <Route path="/reset-password/:token" component={ResetPassword} />
      <Route path="/center-admin" component={CenterAdminDashboard} />
      <Route path="/center-admin/center" component={CenterAdminCenter} />
      <Route path="/center-admin/activities" component={CenterAdminActivities} />
      <Route path="/center-admin/registrations" component={CenterAdminRegistrations} />
      <Route path="/activity-stats" component={ActivityStats} />
      <Route path="/help" component={Help} />
      <Route path="/contact" component={Contact} />
      <Route path="/about" component={About} />
      <Route path="/admin" component={AdminDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ThemeProvider>
            <div className="min-h-screen bg-background">
              <Navigation />
              <main className="container mx-auto px-4 py-8">
                <Router />
              </main>
            </div>
            <Toaster />
          </ThemeProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;