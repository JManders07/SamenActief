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
import { Plus, Search, Mail, Edit, Trash } from "lucide-react";

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  type: string;
  lastModified: string;
  status: string;
}

export default function AdminEmailTemplates() {
  const { data: templates } = useQuery<EmailTemplate[]>({
    queryKey: ["/api/admin/email-templates"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">E-mail Templates</h1>
            <p className="text-muted-foreground">
              Beheer alle e-mail templates
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nieuw Template
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Alle Templates</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Zoek templates..." className="pl-8" />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Naam</TableHead>
                  <TableHead>Onderwerp</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Laatst Gewijzigd</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Acties</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates?.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell>{template.name}</TableCell>
                    <TableCell>{template.subject}</TableCell>
                    <TableCell>{template.type}</TableCell>
                    <TableCell>{new Date(template.lastModified).toLocaleString()}</TableCell>
                    <TableCell>{template.status}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
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
              <CardTitle>Standaard Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>Welkom E-mail</span>
                  </div>
                  <Button variant="outline" size="sm">
                    Bewerken
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>Activiteit Bevestiging</span>
                  </div>
                  <Button variant="outline" size="sm">
                    Bewerken
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>Wachtwoord Reset</span>
                  </div>
                  <Button variant="outline" size="sm">
                    Bewerken
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Template Variabelen</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Beschikbare variabelen voor gebruik in templates:
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <code className="rounded bg-muted px-2 py-1">{"{{user.name}}"}</code>
                  <code className="rounded bg-muted px-2 py-1">{"{{user.email}}"}</code>
                  <code className="rounded bg-muted px-2 py-1">{"{{activity.title}}"}</code>
                  <code className="rounded bg-muted px-2 py-1">{"{{activity.date}}"}</code>
                  <code className="rounded bg-muted px-2 py-1">{"{{center.name}}"}</code>
                  <code className="rounded bg-muted px-2 py-1">{"{{center.address}}"}</code>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
} 