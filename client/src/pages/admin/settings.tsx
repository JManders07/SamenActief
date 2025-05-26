import { AdminLayout } from "@/components/admin/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings, Globe, Mail, Bell, Shield } from "lucide-react";

export default function AdminSettings() {
  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Instellingen</h1>
          <p className="text-muted-foreground">
            Beheer de algemene instellingen van het platform
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Algemene Instellingen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="siteName">Website Naam</Label>
                <Input id="siteName" defaultValue="SamenActief" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="siteDescription">Website Beschrijving</Label>
                <Input
                  id="siteDescription"
                  defaultValue="Verbinden van buurthuizen en activiteiten"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact E-mail</Label>
                <Input id="contactEmail" defaultValue="info@samenactief.nl" />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Onderhoudsmodus</Label>
                  <p className="text-sm text-muted-foreground">
                    Website tijdelijk offline voor onderhoud
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                E-mail Instellingen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="smtpHost">SMTP Host</Label>
                <Input id="smtpHost" defaultValue="smtp.gmail.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtpPort">SMTP Port</Label>
                <Input id="smtpPort" defaultValue="587" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtpUser">SMTP Gebruiker</Label>
                <Input id="smtpUser" defaultValue="noreply@samenactief.nl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtpPassword">SMTP Wachtwoord</Label>
                <Input id="smtpPassword" type="password" />
              </div>
              <Button variant="outline" className="w-full">
                E-mail Testen
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notificatie Instellingen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>E-mail Notificaties</Label>
                  <p className="text-sm text-muted-foreground">
                    Stuur e-mail notificaties naar gebruikers
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Push Notificaties</Label>
                  <p className="text-sm text-muted-foreground">
                    Stuur push notificaties naar gebruikers
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Activiteit Herinneringen</Label>
                  <p className="text-sm text-muted-foreground">
                    Stuur herinneringen voor activiteiten
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Nieuwsbrief</Label>
                  <p className="text-sm text-muted-foreground">
                    Stuur wekelijkse nieuwsbrief
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy Instellingen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Gebruikers Tracking</Label>
                  <p className="text-sm text-muted-foreground">
                    Verzamel gebruikersstatistieken
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Cookies</Label>
                  <p className="text-sm text-muted-foreground">
                    Gebruik cookies voor functionaliteit
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>GDPR Compliance</Label>
                  <p className="text-sm text-muted-foreground">
                    Voldoe aan GDPR richtlijnen
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Button variant="outline" className="w-full">
                Privacy Policy Bewerken
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-4">
          <Button variant="outline">Annuleren</Button>
          <Button>Opslaan</Button>
        </div>
      </div>
    </AdminLayout>
  );
} 