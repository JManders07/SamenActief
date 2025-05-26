import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { Download, Trash2, Eye, Edit, Shield } from "lucide-react";

export function DataRightsPanel() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleDownloadData = async () => {
    try {
      setIsLoading(true);
      const response = await apiRequest("GET", `/api/users/${user?.id}/data`);
      const blob = new Blob([JSON.stringify(response, null, 2)], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `mijn-gegevens-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast({
        title: "Gegevens gedownload",
        description: "Uw gegevens zijn succesvol gedownload.",
      });
    } catch (error) {
      toast({
        title: "Fout bij downloaden",
        description: "Er is een fout opgetreden bij het downloaden van uw gegevens.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnonymizeData = async () => {
    try {
      setIsLoading(true);
      await apiRequest("PATCH", `/api/users/${user?.id}/anonymize`);
      toast({
        title: "Gegevens geanonimiseerd",
        description: "Uw gegevens zijn succesvol geanonimiseerd.",
      });
    } catch (error) {
      toast({
        title: "Fout bij anonimiseren",
        description: "Er is een fout opgetreden bij het anonimiseren van uw gegevens.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteData = async () => {
    try {
      setIsLoading(true);
      await apiRequest("DELETE", `/api/users/${user?.id}`);
      toast({
        title: "Account verwijderd",
        description: "Uw account en alle bijbehorende gegevens zijn succesvol verwijderd.",
      });
      // Redirect naar home pagina na verwijdering
      window.location.href = "/";
    } catch (error) {
      toast({
        title: "Fout bij verwijderen",
        description: "Er is een fout opgetreden bij het verwijderen van uw account.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Mijn Gegevens
        </CardTitle>
        <CardDescription>
          Beheer uw persoonsgegevens en privacy-instellingen
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <h4 className="font-medium">Gegevens downloaden</h4>
              <p className="text-sm text-muted-foreground">
                Download een kopie van al uw gegevens
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleDownloadData}
              disabled={isLoading}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <h4 className="font-medium">Gegevens anonimiseren</h4>
              <p className="text-sm text-muted-foreground">
                Maak uw gegevens anoniem maar behoud uw account
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" disabled={isLoading}>
                  <Eye className="h-4 w-4 mr-2" />
                  Anonimiseren
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Gegevens anonimiseren</AlertDialogTitle>
                  <AlertDialogDescription>
                    Weet u zeker dat u uw gegevens wilt anonimiseren? Dit kan niet ongedaan worden gemaakt.
                    Uw account blijft bestaan, maar uw persoonlijke gegevens worden verwijderd.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuleren</AlertDialogCancel>
                  <AlertDialogAction onClick={handleAnonymizeData}>
                    Bevestigen
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <h4 className="font-medium">Account verwijderen</h4>
              <p className="text-sm text-muted-foreground">
                Verwijder permanent uw account en alle bijbehorende gegevens
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={isLoading}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Verwijderen
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Account verwijderen</AlertDialogTitle>
                  <AlertDialogDescription>
                    Weet u zeker dat u uw account wilt verwijderen? Dit kan niet ongedaan worden gemaakt.
                    Alle uw gegevens worden permanent verwijderd.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuleren</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteData}>
                    Bevestigen
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 