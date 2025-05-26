import { AdminLayout } from "@/components/admin/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { Users, Building2, Calendar, Activity } from "lucide-react";

interface Stats {
  totalUsers: number;
  newUsersThisMonth: number;
  totalCenters: number;
  activeCenters: number;
  totalActivities: number;
  upcomingActivities: number;
  totalRegistrations: number;
  registrationsThisMonth: number;
  popularActivities: {
    id: string;
    title: string;
    registrations: number;
  }[];
  popularCenters: {
    id: string;
    name: string;
    activities: number;
  }[];
}

export default function AdminStats() {
  const { data: stats } = useQuery<Stats>({
    queryKey: ["/api/admin/stats"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Statistieken</h1>
          <p className="text-muted-foreground">
            Bekijk de belangrijkste statistieken van het platform
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Totaal Gebruikers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
              <p className="text-xs text-muted-foreground">
                +{stats?.newUsersThisMonth || 0} deze maand
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Buurthuizen</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalCenters || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.activeCenters || 0} actief
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Activiteiten</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalActivities || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.upcomingActivities || 0} gepland
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Deelnames</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalRegistrations || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.registrationsThisMonth || 0} deze maand
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Populaire Activiteiten</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.popularActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between">
                    <div className="font-medium">{activity.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {activity.registrations} deelnemers
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Populaire Buurthuizen</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.popularCenters.map((center) => (
                  <div key={center.id} className="flex items-center justify-between">
                    <div className="font-medium">{center.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {center.activities} activiteiten
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
} 