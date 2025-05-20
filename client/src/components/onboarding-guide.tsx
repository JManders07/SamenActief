import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { Building2, Calendar, User, Eye, X } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";

export function OnboardingGuide() {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [showGuide, setShowGuide] = useState(true);

  const updateOnboardingStatus = useMutation({
    mutationFn: async () => {
      if (!user?.id) return;
      const res = await apiRequest("PATCH", `/api/users/${user.id}`, {
        hasSeenOnboarding: true
      });
      if (!res.ok) {
        throw new Error("Kon onboarding status niet bijwerken");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}`] });
    }
  });

  if (!showGuide || !user || user.hasSeenOnboarding) return null;

  const steps = [
    {
      title: "Welkom bij de SamenActief App",
      description: "Wij helpen u graag om deel te nemen aan activiteiten in uw buurt. Deze app is speciaal ontwikkeld om u gemakkelijk de weg te wijzen. U hoeft geen ervaring met computers te hebben - wij leggen alles stap voor stap uit.",
      icon: Building2,
    },
    {
      title: "Activiteiten in Uw Buurt Vinden",
      description: "Klik op de grote knop 'Activiteitencentra' bovenaan de pagina om alle buurthuizen in uw omgeving te zien. Hier vindt u een overzicht van alle activiteiten die worden georganiseerd. Alles is duidelijk leesbaar en met grote knoppen te bedienen.",
      icon: Calendar,
    },
    {
      title: "Uw Persoonlijke Pagina",
      description: "Via 'Mijn Profiel' kunt u uw gegevens bekijken en aanpassen. Hier ziet u ook aan welke activiteiten u zich heeft aangemeld. Alles staat overzichtelijk bij elkaar, zodat u gemakkelijk uw planning kunt bijhouden.",
      icon: User,
    },
    {
      title: "Tekst Groter of Kleiner Maken",
      description: "Rechtsboven in het scherm ziet u een knop met een oog-icoontje. Als u hierop klikt, wordt alle tekst groter en beter leesbaar. U kunt dit altijd aan- en uitzetten wanneer u maar wilt. Probeer het gerust uit!",
      icon: Eye,
    },
  ];

  // De huidige stap ophalen
  const currentStepData = steps[currentStep];
  // Het icoon component toewijzen aan een variabele
  const IconComponent = currentStepData.icon;

  const handleClose = () => {
    setShowGuide(false);
    updateOnboardingStatus.mutate();
  };

  return (
    <Card className="mb-8">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-3xl">Uitleg {currentStep + 1} van {steps.length}</CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClose}
          aria-label="Uitleg sluiten"
        >
          <X className="h-6 w-6" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="flex items-center gap-6">
          <IconComponent className="h-16 w-16 text-primary shrink-0" />
          <div>
            <h3 className="text-2xl font-semibold">{currentStepData.title}</h3>
            <p className="mt-4 text-xl text-muted-foreground leading-relaxed">
              {currentStepData.description}
            </p>
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <Button
            onClick={() => setCurrentStep(current => Math.max(0, current - 1))}
            disabled={currentStep === 0}
            size="lg"
            className="text-lg px-6"
          >
            Vorige
          </Button>
          {currentStep < steps.length - 1 ? (
            <Button
              onClick={() => setCurrentStep(current => current + 1)}
              size="lg"
              className="text-lg px-6"
            >
              Volgende
            </Button>
          ) : (
            <Button
              onClick={handleClose}
              size="lg"
              className="text-lg px-6"
            >
              Afronden
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}