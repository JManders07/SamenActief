import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Building2,
  Calendar,
  Settings,
  Shield,
  FileText,
  BarChart3,
  Bell,
  Mail,
} from "lucide-react";

const navigation = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    name: "Gebruikers",
    href: "/admin/users",
    icon: Users,
  },
  {
    name: "Buurthuizen",
    href: "/admin/centers",
    icon: Building2,
  },
  {
    name: "Activiteiten",
    href: "/admin/activities",
    icon: Calendar,
  },
  {
    name: "Statistieken",
    href: "/admin/stats",
    icon: BarChart3,
  },
  {
    name: "Notificaties",
    href: "/admin/notifications",
    icon: Bell,
  },
  {
    name: "E-mail Templates",
    href: "/admin/email-templates",
    icon: Mail,
  },
  {
    name: "Beveiliging",
    href: "/admin/security",
    icon: Shield,
  },
  {
    name: "Logs",
    href: "/admin/logs",
    icon: FileText,
  },
  {
    name: "Instellingen",
    href: "/admin/settings",
    icon: Settings,
  },
];

export function AdminNavigation() {
  const [location] = useLocation();

  return (
    <nav className="space-y-1">
      {navigation.map((item) => {
        const isActive = location === item.href;
        return (
          <a
            key={item.name}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
              isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.name}
          </a>
        );
      })}
    </nav>
  );
} 