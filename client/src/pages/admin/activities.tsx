import { AdminLayout } from "@/components/admin/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { Plus, Search, Calendar, Users } from "lucide-react";

interface Activity {
  id: string;
  title: string;
  center: string;
  date: string;
  time: string;
  maxParticipants: number;
  currentParticipants: number;
  status: string;
}

export default function AdminActivities() {
  const { data: activities } = useQuery<Activity[]>({
    queryKey: ["/api/admin/activities"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Activiteiten</h1>
            <p className="text-muted-foreground">
              Beheer alle activiteiten op het platform
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nieuwe Activiteit
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Alle Activiteiten</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Zoek activiteiten..." className="pl-8" />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titel</TableHead>
                  <TableHead>Buurthuis</TableHead>
                  <TableHead>Datum</TableHead>
                  <TableHead>Tijd</TableHead>
                  <TableHead>Deelnemers</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Acties</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activities?.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell>{activity.title}</TableCell>
                    <TableCell>{activity.center}</TableCell>
                    <TableCell>{new Date(activity.date).toLocaleDateString()}</TableCell>
                    <TableCell>{activity.time}</TableCell>
                    <TableCell>
                      {activity.currentParticipants} / {activity.maxParticipants}
                    </TableCell>
                    <TableCell>{activity.status}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        Bewerken
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
} 