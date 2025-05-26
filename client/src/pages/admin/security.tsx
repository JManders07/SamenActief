import { AdminLayout } from "@/components/admin/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Shield, Lock, Key, AlertTriangle } from "lucide-react";

export default function AdminSecurity() {
  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Beveiliging</h1>
          <p className="text-muted-foreground">
            Beheer de beveiligingsinstellingen van het platform
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Algemene Beveiliging
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Two-Factor Authenticatie</Label>
                  <p className="text-sm text-muted-foreground">
                    Verplicht voor alle gebruikers
                  </p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Wachtwoord Beleid</Label>
                  <p className="text-sm text-muted-foreground">
                    Minimale lengte en complexiteit
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>IP Whitelist</Label>
                  <p className="text-sm text-muted-foreground">
                    Beperk toegang tot specifieke IP's
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Sessie Beheer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Sessie Timeout</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatisch uitloggen na inactiviteit
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Concurrente Sessies</Label>
                  <p className="text-sm text-muted-foreground">
                    Sta meerdere sessies toe
                  </p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Sessie Logging</Label>
                  <p className="text-sm text-muted-foreground">
                    Log alle gebruikerssessies
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                API Beveiliging
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Rate Limiting</Label>
                  <p className="text-sm text-muted-foreground">
                    Beperk API verzoeken per gebruiker
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>API Keys</Label>
                  <p className="text-sm text-muted-foreground">
                    Verplicht voor externe integraties
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Button variant="outline" className="w-full">
                API Keys Beheren
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Bedreigingsdetectie
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Brute Force Bescherming</Label>
                  <p className="text-sm text-muted-foreground">
                    Blokkeer na meerdere mislukte pogingen
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Verdachte IP Detectie</Label>
                  <p className="text-sm text-muted-foreground">
                    Waarschuw bij verdachte activiteit
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Button variant="outline" className="w-full">
                Bedreigingsrapport Bekijken
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
} 