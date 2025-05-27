import { AdminNavigation } from "./navigation";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Bell, Settings, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  if (!user || user.role !== 'admin') {
    setLocation("/auth");
    return null;
  }

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Uitgelogd",
        description: "U bent succesvol uitgelogd.",
      });
      setLocation("/auth");
    } catch (error) {
      toast({
        title: "Fout bij uitloggen",
        description: "Er is een fout opgetreden bij het uitloggen.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar */}
        <div className="hidden w-64 shrink-0 border-r bg-card lg:block">
          <div className="flex h-16 items-center border-b px-6">
            <h1 className="text-lg font-semibold">SamenActief Admin</h1>
          </div>
          <div className="p-4">
            <AdminNavigation />
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1">
          {/* Header */}
          <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
            <div className="flex-1" />
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
                <span className="sr-only">Notificaties</span>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                    <span className="sr-only">Gebruikersmenu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Mijn Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setLocation("/admin/settings")}>
                    <Settings className="mr-2 h-4 w-4" />
                    Instellingen
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    Uitloggen
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Page content */}
          <main className="p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
} 