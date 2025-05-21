import { CenterAdminNavigation } from "./navigation";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";

interface CenterAdminLayoutProps {
  children: React.ReactNode;
}

export function CenterAdminLayout({ children }: CenterAdminLayoutProps) {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  if (!user || user.role !== 'center_admin') {
    setLocation("/auth");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar */}
        <div className="hidden w-64 shrink-0 border-r bg-card lg:block">
          <div className="flex h-16 items-center border-b px-6">
            <h1 className="text-lg font-semibold">Beheer Buurthuis</h1>
          </div>
          <div className="p-4">
            <CenterAdminNavigation />
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1">
          <main className="p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
} 