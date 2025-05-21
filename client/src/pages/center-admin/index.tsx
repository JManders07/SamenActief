import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Center, Activity } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { CalendarDays, Building2, PlusCircle, Users } from "lucide-react";

export default function CenterAdminDashboard() {
  const { user } = useAuth();

  const { data: center, isLoading: isLoadingCenter } = useQuery<Center>({
    queryKey: [`/api/centers/my-center`],
    enabled: !!user?.id && user?.role === 'center_admin',
  });

  const { data: activities, isLoading: isLoadingActivities } = useQuery<Activity[]>({
    queryKey: [`/api/activities`, { centerId: center?.id }],
    enabled: !!center?.id,
  });

  if (isLoadingCenter || isLoadingActivities) {
    return <div>Laden...</div>;
  }

  if (!user || user.role !== 'center_admin') {
    return <div>Geen toegang</div>;
  }

  const upcomingActivities = activities?.filter(activity => 
    new Date(activity.date) > new Date()
  ) || [];

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold">Beheer Dashboard</h1>
          <p className="mt-2 text-xl text-muted-foreground">
            Welkom bij het beheer van {center?.name}
          </p>
        </div>
        <Button asChild>
          <Link to="/center-admin/activities/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Nieuwe Activiteit
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aankomende Activiteiten</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingActivities.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totaal Activiteiten</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activities?.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overzicht</TabsTrigger>
          <TabsTrigger value="activities">Activiteiten</TabsTrigger>
          <TabsTrigger value="center">Buurthuis</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {upcomingActivities.slice(0, 3).map((activity) => (
              <Card key={activity.id}>
                <CardHeader>
                  <CardTitle>{activity.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {new Date(activity.date).toLocaleDateString('nl-NL')}
                  </p>
                  <p className="mt-2">{activity.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="activities">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {activities?.map((activity) => (
              <Card key={activity.id}>
                <CardHeader>
                  <CardTitle>{activity.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {new Date(activity.date).toLocaleDateString('nl-NL')}
                  </p>
                  <p className="mt-2">{activity.description}</p>
                  <div className="mt-4 flex space-x-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/center-admin/activities/${activity.id}/edit`}>
                        Bewerken
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="center">
          <Card>
            <CardHeader>
              <CardTitle>Buurthuis Informatie</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Naam</h3>
                  <p className="text-muted-foreground">{center?.name}</p>
                </div>
                <div>
                  <h3 className="font-medium">Adres</h3>
                  <p className="text-muted-foreground">{center?.address}</p>
                </div>
                <div>
                  <h3 className="font-medium">Beschrijving</h3>
                  <p className="text-muted-foreground">{center?.description}</p>
                </div>
                <Button asChild>
                  <Link to="/center-admin/center/edit">
                    Buurthuis Bewerken
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 