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
import { Plus, Search, FileText, Download, Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Log {
  id: string;
  timestamp: string;
  level: string;
  category: string;
  message: string;
  user?: string;
  ip?: string;
}

export default function AdminLogs() {
  const { data: logs } = useQuery<Log[]>({
    queryKey: ["/api/admin/logs"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Logs</h1>
            <p className="text-muted-foreground">
              Bekijk en beheer alle systeem logs
            </p>
          </div>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Logs Downloaden
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Alle Logs</CardTitle>
              <div className="flex items-center gap-4">
                <Select defaultValue="all">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Selecteer niveau" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Niveaus</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                    <SelectItem value="warn">Warning</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="debug">Debug</SelectItem>
                  </SelectContent>
                </Select>
                <Select defaultValue="all">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Selecteer categorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Categorieën</SelectItem>
                    <SelectItem value="auth">Authenticatie</SelectItem>
                    <SelectItem value="activity">Activiteiten</SelectItem>
                    <SelectItem value="user">Gebruikers</SelectItem>
                    <SelectItem value="system">Systeem</SelectItem>
                  </SelectContent>
                </Select>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Zoek in logs..." className="pl-8" />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tijdstip</TableHead>
                  <TableHead>Niveau</TableHead>
                  <TableHead>Categorie</TableHead>
                  <TableHead>Bericht</TableHead>
                  <TableHead>Gebruiker</TableHead>
                  <TableHead>IP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs?.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          log.level === "error"
                            ? "bg-red-100 text-red-700"
                            : log.level === "warn"
                            ? "bg-yellow-100 text-yellow-700"
                            : log.level === "info"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {log.level.toUpperCase()}
                      </span>
                    </TableCell>
                    <TableCell>{log.category}</TableCell>
                    <TableCell>{log.message}</TableCell>
                    <TableCell>{log.user || "-"}</TableCell>
                    <TableCell>{log.ip || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Log Statistieken</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">Totaal aantal logs</div>
                  <div className="font-medium">1,234</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">Errors vandaag</div>
                  <div className="font-medium text-red-600">12</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">Warnings vandaag</div>
                  <div className="font-medium text-yellow-600">45</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">Laatste error</div>
                  <div className="font-medium">2 uur geleden</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Log Retentie</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">Huidige retentie periode</div>
                  <div className="font-medium">30 dagen</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">Opslag gebruikt</div>
                  <div className="font-medium">2.5 GB</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">Laatste backup</div>
                  <div className="font-medium">Vandaag 00:00</div>
                </div>
                <Button variant="outline" className="w-full">
                  Backup Nu Maken
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
} 