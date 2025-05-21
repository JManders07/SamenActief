import { useQuery } from "@tanstack/react-query";
import { CenterAdminLayout } from "@/components/center-admin/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Center, User } from "@shared/schema";
import { format } from "date-fns";
import { nl } from "date-fns/locale";

interface ActivityWithRegistrations extends Activity {
  registrations?: {
    id: number;
    user: User;
  }[];
}

export default function RegistrationsPage() {
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
          <h1 className="text-3xl font-bold">Inschrijvingen Beheren</h1>
          <p className="text-muted-foreground">
            Bekijk en beheer de inschrijvingen voor activiteiten van {center?.name}
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Komende Activiteiten</h2>
            {upcomingActivities.map((activity) => (
              <Card key={activity.id}>
                <CardHeader>
                  <CardTitle>{activity.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(activity.date), "EEEE d MMMM yyyy 'om' HH:mm", { locale: nl })}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span>Capaciteit:</span>
                      <span>{activity.registrations?.length || 0} / {activity.capacity}</span>
                    </div>
                    {activity.registrations && activity.registrations.length > 0 ? (
                      <div className="space-y-2">
                        <h3 className="font-medium">Ingeschreven deelnemers:</h3>
                        <ul className="space-y-1">
                          {activity.registrations.map((registration) => (
                            <li key={registration.id} className="text-sm">
                              {registration.user.displayName}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Nog geen inschrijvingen
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Afgelopen Activiteiten</h2>
            {pastActivities.map((activity) => (
              <Card key={activity.id}>
                <CardHeader>
                  <CardTitle>{activity.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(activity.date), "EEEE d MMMM yyyy 'om' HH:mm", { locale: nl })}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span>Aantal deelnemers:</span>
                      <span>{activity.registrations?.length || 0}</span>
                    </div>
                    {activity.registrations && activity.registrations.length > 0 ? (
                      <div className="space-y-2">
                        <h3 className="font-medium">Deelnemers:</h3>
                        <ul className="space-y-1">
                          {activity.registrations.map((registration) => (
                            <li key={registration.id} className="text-sm">
                              {registration.user.displayName}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Geen deelnemers
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </CenterAdminLayout>
  );
} 