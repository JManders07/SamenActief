import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Building2, User, Eye, Settings, BarChart, HelpCircle, Home, Mail, Info, Newspaper } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "./ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function Navigation() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const { theme, toggleAccessibilityMode } = useTheme();

  const links = [
    { href: "/", label: "Startpagina", icon: Home },
    { href: "/blog", label: "Blog", icon: Newspaper },
    // Only show application link for logged in users
    ...(user ? [{ href: "/home", label: "Activiteitencentra", icon: Building2 }] : []),
    // Only show profile for regular users
    ...(user && user.role === 'user' ? [{ href: "/profile", label: "Mijn Profiel", icon: User }] : []),
    // Show admin page and stats for center admins
    ...(user?.role === 'center_admin' ? [
      { href: "/center-admin", label: "Beheer Buurthuis", icon: Settings },
      { href: "/activity-stats", label: "Statistieken", icon: BarChart },
    ] : []),
    // Show admin panel for admin users
    ...(user?.role === 'admin' ? [
      { href: "/admin", label: "Admin Panel", icon: Settings },
    ] : []),
    // Help page accessible only to regular users or when not logged in
    ...(!user?.role || user?.role === 'user' ? [
      { href: "/help", label: "Hulp", icon: HelpCircle },
      { href: "/contact", label: "Contact", icon: Mail },
      { href: "/about", label: "Over Ons", icon: Info }
    ] : []),
  ];

  return (
    <nav className="border-b bg-white">
      <div className="container mx-auto px-4">
        {/* Mobiele navigatie */}
        <div className="lg:hidden flex flex-col py-4">
          <div className="flex items-center justify-between mb-4">
            <Link href="/">
              <span className="text-xl font-bold cursor-pointer">SamenActief</span>
            </Link>
            <div className="flex items-center space-x-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={toggleAccessibilityMode}
                      aria-label={theme.isAccessibilityMode ? "Toegankelijkheidsmodus uitschakelen" : "Toegankelijkheidsmodus inschakelen"}
                    >
                      <Eye className={cn(
                        "h-5 w-5",
                        theme.isAccessibilityMode && "text-primary"
                      )} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {theme.isAccessibilityMode
                        ? "Toegankelijkheidsmodus uitschakelen"
                        : "Toegankelijkheidsmodus inschakelen"}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {user ? (
                <Button
                  variant="outline"
                  onClick={() => logout()}
                  className="w-full"
                  data-accessibility-mode={theme.isAccessibilityMode}
                >
                  Uitloggen
                </Button>
              ) : (
                <Link href="/auth">
                  <Button
                    className="w-full"
                    data-accessibility-mode={theme.isAccessibilityMode}
                  >
                    Inloggen
                  </Button>
                </Link>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {links.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href}>
                <div
                  className={cn(
                    "flex items-center space-x-2 p-3 rounded-lg transition-colors cursor-pointer",
                    location === href
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  )}
                  data-accessibility-mode={theme.isAccessibilityMode}
                >
                  <Icon className="h-5 w-5" />
                  <span>{label}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Desktop navigatie */}
        <div className="hidden lg:flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/">
              <span className="text-xl font-bold cursor-pointer mr-4">SamenActief</span>
            </Link>
            {links.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href}>
                <div
                  className={cn(
                    "flex items-center space-x-2 text-lg font-medium transition-colors hover:text-primary cursor-pointer",
                    location === href ? "text-primary" : "text-muted-foreground"
                  )}
                  data-accessibility-mode={theme.isAccessibilityMode}
                >
                  <Icon className="h-5 w-5" />
                  <span>{label}</span>
                </div>
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={toggleAccessibilityMode}
                    aria-label={theme.isAccessibilityMode ? "Toegankelijkheidsmodus uitschakelen" : "Toegankelijkheidsmodus inschakelen"}
                  >
                    <Eye className={cn(
                      "h-5 w-5",
                      theme.isAccessibilityMode && "text-primary"
                    )} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {theme.isAccessibilityMode
                      ? "Toegankelijkheidsmodus uitschakelen"
                      : "Toegankelijkheidsmodus inschakelen"}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {user ? (
              <Button
                variant="outline"
                onClick={() => logout()}
                data-accessibility-mode={theme.isAccessibilityMode}
              >
                Uitloggen
              </Button>
            ) : (
              <Link href="/auth">
                <Button data-accessibility-mode={theme.isAccessibilityMode}>
                  Inloggen
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}