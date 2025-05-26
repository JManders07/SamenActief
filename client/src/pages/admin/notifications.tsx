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
import { Plus, Search, Bell, Mail } from "lucide-react";

interface Notification {
  id: string;
  title: string;
  type: string;
  recipients: number;
  sentAt: string;
  status: string;
}

export default function AdminNotifications() {
  const { data: notifications } = useQuery<Notification[]>({
    queryKey: ["/api/admin/notifications"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Notificaties</h1>
            <p className="text-muted-foreground">
              Beheer alle notificaties en e-mails
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nieuwe Notificatie
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Alle Notificaties</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Zoek notificaties..." className="pl-8" />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titel</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Ontvangers</TableHead>
                  <TableHead>Verzonden</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Acties</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notifications?.map((notification) => (
                  <TableRow key={notification.id}>
                    <TableCell>{notification.title}</TableCell>
                    <TableCell>{notification.type}</TableCell>
                    <TableCell>{notification.recipients}</TableCell>
                    <TableCell>{new Date(notification.sentAt).toLocaleString()}</TableCell>
                    <TableCell>{notification.status}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        Bekijken
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Push Notificaties</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  <span>Push notificaties zijn ingeschakeld</span>
                </div>
                <Button variant="outline" className="w-full">
                  Push Notificatie Versturen
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>E-mail Notificaties</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>E-mail notificaties zijn ingeschakeld</span>
                </div>
                <Button variant="outline" className="w-full">
                  E-mail Versturen
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
} 