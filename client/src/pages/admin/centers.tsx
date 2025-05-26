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
import { Plus, Search, MapPin } from "lucide-react";

interface Center {
  id: string;
  name: string;
  address: string;
  city: string;
  status: string;
  totalActivities: number;
  activeActivities: number;
}

export default function AdminCenters() {
  const { data: centers } = useQuery<Center[]>({
    queryKey: ["/api/admin/centers"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Buurthuizen</h1>
            <p className="text-muted-foreground">
              Beheer alle buurthuizen op het platform
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nieuw Buurthuis
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Alle Buurthuizen</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Zoek buurthuizen..." className="pl-8" />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Naam</TableHead>
                  <TableHead>Adres</TableHead>
                  <TableHead>Stad</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Activiteiten</TableHead>
                  <TableHead>Acties</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {centers?.map((center) => (
                  <TableRow key={center.id}>
                    <TableCell>{center.name}</TableCell>
                    <TableCell>{center.address}</TableCell>
                    <TableCell>{center.city}</TableCell>
                    <TableCell>{center.status}</TableCell>
                    <TableCell>
                      {center.activeActivities} / {center.totalActivities}
                    </TableCell>
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