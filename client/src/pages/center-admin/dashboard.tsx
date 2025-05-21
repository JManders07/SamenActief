import { useQuery } from "@tanstack/react-query";
import { CenterAdminLayout } from "@/components/center-admin/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Center } from "@shared/schema";

interface ActivityWithRegistrations extends Activity {
  registrations?: { id: number }[];
}

export default function DashboardPage() {
  const { data: center } = useQuery<Center>({
    queryKey: [`/api/centers/my-center`],
  });

  const { data: activities } = useQuery<ActivityWithRegistrations[]>({
    queryKey: [`/api/activities`, { centerId: center?.id }],
    enabled: !!center?.id,
  });

  const upcomingActivities = activities?.filter(
    activity => new Date(activity.date) > new Date()
  ) || [];

  const pastActivities = activities?.filter(
    activity => new Date(activity.date) <= new Date()
  ) || [];

  return (
    <CenterAdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welkom bij het beheer van {center?.name}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Totaal Activiteiten
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activities?.length || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Komende Activiteiten
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingActivities.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Afgelopen Activiteiten
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pastActivities.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Gemiddelde Deelname
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {activities?.length
                  ? Math.round(
                      activities.reduce(
                        (acc, activity) => acc + (activity.registrations?.length || 0),
                        0
                      ) / activities.length
                    )
                  : 0}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Komende Activiteiten</CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingActivities.length > 0 ? (
                <div className="space-y-4">
                  {upcomingActivities.slice(0, 5).map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium">{activity.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(activity.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {activity.registrations?.length || 0} deelnemers
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  Geen komende activiteiten
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recente Activiteiten</CardTitle>
            </CardHeader>
            <CardContent>
              {pastActivities.length > 0 ? (
                <div className="space-y-4">
                  {pastActivities.slice(0, 5).map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium">{activity.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(activity.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {activity.registrations?.length || 0} deelnemers
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  Geen recente activiteiten
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </CenterAdminLayout>
  );
} 