import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Registration, Center } from "@shared/schema";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend
} from "recharts";
import { format, parseISO, subMonths, isWithinInterval } from "date-fns";
import { nl } from "date-fns/locale";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ActivityStatsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [timeRange, setTimeRange] = useState("3m"); // 3m, 6m, 1y, all

  // Haal eerst het buurthuis op voor de ingelogde admin
  const { data: center, isLoading: isLoadingCenter } = useQuery<Center>({
    queryKey: [`/api/centers/my-center`],
    enabled: !!user?.id && user?.role === 'center_admin',
  });

  // Haal alle activiteiten op van dit buurthuis
  const { data: activities, isLoading: isLoadingActivities } = useQuery<Activity[]>({
    queryKey: [`/api/activities`, { centerId: center?.id }],
    enabled: !!center?.id && !!user?.id && user?.role === 'center_admin',
  });

  // Haal alle registraties op voor deze activiteiten
  const { data: registrations, isLoading: isLoadingRegistrations } = useQuery<Registration[]>({
    queryKey: [`/api/activities/registrations`],
    enabled: !!activities?.length,
  });

  if (isLoadingActivities || isLoadingRegistrations || isLoadingCenter) {
    return (
      <div className="space-y-8">
        <div className="h-64 animate-pulse rounded-lg bg-muted" />
        <div className="grid gap-6 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-96 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'center_admin') {
    return (
      <div className="space-y-8">
        <h1 className="text-4xl font-bold">Geen toegang</h1>
        <p className="mt-2 text-xl text-muted-foreground">
          Deze pagina is alleen toegankelijk voor buurthuisbeheerders.
        </p>
      </div>
    );
  }

  // Filter activiteiten op basis van geselecteerde tijdsperiode
  const getFilteredActivities = () => {
    const now = new Date();
    let startDate: Date;

    switch (timeRange) {
      case "3m":
        startDate = subMonths(now, 3);
        break;
      case "6m":
        startDate = subMonths(now, 6);
        break;
      case "1y":
        startDate = subMonths(now, 12);
        break;
      default:
        return activities || [];
    }

    return (activities || []).filter(activity => 
      isWithinInterval(parseISO(activity.date.toString()), {
        start: startDate,
        end: now
      })
    );
  };

  const filteredActivities = getFilteredActivities();

  // Bereken statistieken
  const totalActivities = filteredActivities.length;
  const totalRegistrations = registrations?.filter(r => 
    filteredActivities.some(a => a.id === r.activityId)
  ).length || 0;
  const averageParticipants = totalActivities > 0 ? totalRegistrations / totalActivities : 0;

  // Bereken bezettingsgraad per activiteit
  const occupancyData = filteredActivities.map(activity => {
    const registrationsForActivity = registrations?.filter(r => r.activityId === activity.id).length || 0;
    return {
      name: activity.name,
      bezetting: (registrationsForActivity / activity.capacity) * 100,
      deelnemers: registrationsForActivity,
      capaciteit: activity.capacity
    };
  });

  // Bereken trend over tijd
  const trendData = filteredActivities
    .sort((a, b) => parseISO(a.date.toString()).getTime() - parseISO(b.date.toString()).getTime())
    .map(activity => {
      const registrationsForActivity = registrations?.filter(r => r.activityId === activity.id).length || 0;
      return {
        date: format(parseISO(activity.date.toString()), 'dd/MM'),
        deelnemers: registrationsForActivity,
        bezetting: (registrationsForActivity / activity.capacity) * 100
      };
    });

  // Bereken doelstelling voortgang
  const targetProgress = Math.min((totalActivities / 12) * 100, 100); // Doel: 12 activiteiten per jaar

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Activiteitenstatistieken</h1>
          <p className="text-muted-foreground">
            Bekijk de prestaties van {center?.name}
          </p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Selecteer periode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3m">Laatste 3 maanden</SelectItem>
            <SelectItem value="6m">Laatste 6 maanden</SelectItem>
            <SelectItem value="1y">Laatste jaar</SelectItem>
            <SelectItem value="all">Alle tijd</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overzicht kaarten */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="text-lg font-medium">Totaal Activiteiten</CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalActivities}</p>
            <p className="text-sm text-muted-foreground">Doel: 12 per jaar</p>
            <Progress value={targetProgress} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="text-lg font-medium">Totaal Inschrijvingen</CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalRegistrations}</p>
            <p className="text-sm text-muted-foreground">In geselecteerde periode</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="text-lg font-medium">Gemiddeld Aantal Deelnemers</CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{averageParticipants.toFixed(1)}</p>
            <p className="text-sm text-muted-foreground">Per activiteit</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="text-lg font-medium">Gemiddelde Bezettingsgraad</CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {occupancyData.length > 0
                ? (occupancyData.reduce((acc, curr) => acc + curr.bezetting, 0) / occupancyData.length).toFixed(1)
                : 0}%
            </p>
            <p className="text-sm text-muted-foreground">Van alle activiteiten</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overzicht" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overzicht">Overzicht</TabsTrigger>
          <TabsTrigger value="trend">Trend Analyse</TabsTrigger>
          <TabsTrigger value="activiteiten">Activiteiten Details</TabsTrigger>
        </TabsList>

        <TabsContent value="overzicht" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Belangrijkste Inzichten</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-lg bg-muted p-4">
                  <h3 className="font-medium">Top Activiteit</h3>
                  {occupancyData.length > 0 && (
                    <div className="mt-2">
                      <p className="text-lg font-semibold">
                        {occupancyData.sort((a, b) => b.bezetting - a.bezetting)[0].name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {occupancyData.sort((a, b) => b.bezetting - a.bezetting)[0].bezetting.toFixed(1)}% bezetting
                      </p>
                    </div>
                  )}
                </div>
                <div className="rounded-lg bg-muted p-4">
                  <h3 className="font-medium">Verbeterpunten</h3>
                  {occupancyData.length > 0 && (
                    <div className="mt-2">
                      <p className="text-lg font-semibold">
                        {occupancyData.sort((a, b) => a.bezetting - b.bezetting)[0].name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {occupancyData.sort((a, b) => a.bezetting - b.bezetting)[0].bezetting.toFixed(1)}% bezetting
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trend">
          <Card>
            <CardHeader>
              <CardTitle>Trend Analyse</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" label={{ value: 'Aantal deelnemers', angle: -90, position: 'insideLeft' }} />
                    <YAxis yAxisId="right" orientation="right" label={{ value: 'Bezettingsgraad (%)', angle: 90, position: 'insideRight' }} />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="deelnemers" stroke="#8884d8" name="Aantal deelnemers" />
                    <Line yAxisId="right" type="monotone" dataKey="bezetting" stroke="#82ca9d" name="Bezettingsgraad" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activiteiten">
          <Card>
            <CardHeader>
              <CardTitle>Activiteiten Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={occupancyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis label={{ value: 'Bezetting (%)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Bar dataKey="bezetting" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-4">
                {occupancyData.map((activity) => (
                  <div key={activity.name} className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <p className="font-medium">{activity.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {activity.deelnemers} / {activity.capaciteit} deelnemers
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{activity.bezetting.toFixed(1)}%</p>
                      <p className="text-sm text-muted-foreground">Bezettingsgraad</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}