import { useQuery, useMutation } from "@tanstack/react-query";
import { CenterAdminLayout } from "@/components/center-admin/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Center, User } from "@shared/schema";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ActivityWithRegistrations extends Activity {
  registrations?: {
    id: number;
    user: User;
  }[];
  waitlist?: {
    id: number;
    user: User;
    registrationDate: string;
  }[];
}

export default function RegistrationsPage() {
  const { toast } = useToast();

  const { data: center } = useQuery<Center>({
    queryKey: [`/api/centers/my-center`],
  });

  const { data: activities } = useQuery<ActivityWithRegistrations[]>({
    queryKey: [`/api/activities`, { centerId: center?.id }],
    enabled: !!center?.id,
  });

  const removeRegistration = useMutation({
    mutationFn: async ({ activityId, userId }: { activityId: number; userId: number }) => {
      const res = await apiRequest("DELETE", `/api/activities/${activityId}/register`, {
        userId
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Er is een fout opgetreden bij het verwijderen van de inschrijving");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/activities`] });
      toast({
        title: "Inschrijving verwijderd",
        description: "De inschrijving is succesvol verwijderd.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Verwijderen mislukt",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const removeFromWaitlist = useMutation({
    mutationFn: async ({ activityId, userId }: { activityId: number; userId: number }) => {
      const res = await apiRequest("DELETE", `/api/activities/${activityId}/waitlist`, {
        userId
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Er is een fout opgetreden bij het verwijderen van de wachtlijst");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/activities`] });
      toast({
        title: "Wachtlijst verwijderd",
        description: "De persoon is succesvol van de wachtlijst verwijderd.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Verwijderen mislukt",
        description: error.message,
        variant: "destructive",
      });
    },
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
                        <ul className="space-y-2">
                          {activity.registrations.map((registration) => (
                            <li key={registration.id} className="flex items-center justify-between text-sm">
                              <span>{registration.user.displayName}</span>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="destructive" size="sm">
                                    Verwijderen
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Inschrijving verwijderen</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Weet u zeker dat u de inschrijving van {registration.user.displayName} wilt verwijderen?
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Annuleren</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => removeRegistration.mutate({
                                        activityId: activity.id,
                                        userId: registration.user.id
                                      })}
                                    >
                                      Verwijderen
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Nog geen inschrijvingen
                      </p>
                    )}
                    {activity.waitlist && activity.waitlist.length > 0 && (
                      <div className="space-y-2">
                        <h3 className="font-medium">Wachtlijst:</h3>
                        <ul className="space-y-2">
                          {activity.waitlist.map((entry) => (
                            <li key={entry.id} className="flex items-center justify-between text-sm">
                              <span>{entry.user.displayName}</span>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="destructive" size="sm">
                                    Verwijderen
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Van wachtlijst verwijderen</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Weet u zeker dat u {entry.user.displayName} van de wachtlijst wilt verwijderen?
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Annuleren</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => removeFromWaitlist.mutate({
                                        activityId: activity.id,
                                        userId: entry.user.id
                                      })}
                                    >
                                      Verwijderen
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </li>
                          ))}
                        </ul>
                      </div>
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