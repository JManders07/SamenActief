import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const consent = localStorage.getItem("cookieConsent");
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const savePreferences = () => {
    localStorage.setItem("cookieConsent", JSON.stringify(preferences));
    setShowBanner(false);
    // Hier kunnen we eventueel de cookie-instellingen toepassen
  };

  const acceptAll = () => {
    setPreferences({
      necessary: true,
      analytics: true,
      marketing: true,
    });
    savePreferences();
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 z-50">
      <div className="container mx-auto max-w-4xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">Cookie-instellingen</h3>
            <p className="text-sm text-muted-foreground">
              Wij gebruiken cookies om uw ervaring te verbeteren. Kies welke cookies u wilt accepteren.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Instellingen aanpassen</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Cookie-instellingen</DialogTitle>
                  <DialogDescription>
                    Kies welke cookies u wilt accepteren. Noodzakelijke cookies kunnen niet worden uitgeschakeld.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="necessary"
                      checked={preferences.necessary}
                      disabled
                    />
                    <div className="space-y-1">
                      <Label htmlFor="necessary">Noodzakelijke cookies</Label>
                      <p className="text-sm text-muted-foreground">
                        Vereist voor de basis functionaliteit van de website.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="analytics"
                      checked={preferences.analytics}
                      onCheckedChange={(checked) =>
                        setPreferences({ ...preferences, analytics: checked as boolean })
                      }
                    />
                    <div className="space-y-1">
                      <Label htmlFor="analytics">Analytische cookies</Label>
                      <p className="text-sm text-muted-foreground">
                        Helpen ons de website te verbeteren door gebruik te analyseren.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="marketing"
                      checked={preferences.marketing}
                      onCheckedChange={(checked) =>
                        setPreferences({ ...preferences, marketing: checked as boolean })
                      }
                    />
                    <div className="space-y-1">
                      <Label htmlFor="marketing">Marketing cookies</Label>
                      <p className="text-sm text-muted-foreground">
                        Gebruikt voor gepersonaliseerde advertenties.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowBanner(false)}>
                    Annuleren
                  </Button>
                  <Button onClick={savePreferences}>Instellingen opslaan</Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button onClick={acceptAll}>Alles accepteren</Button>
          </div>
        </div>
      </div>
    </div>
  );
} 