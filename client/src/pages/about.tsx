import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye } from "lucide-react";

export default function AboutPage() {
  const { theme, toggleAccessibilityMode } = useTheme();
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold">Over SamenActief</h1>
        {!theme.isAccessibilityMode && (
          <Button variant="outline" onClick={toggleAccessibilityMode} className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            <span>Activeer grotere letters</span>
          </Button>
        )}
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Onze Missie</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg">
              SamenActief is opgericht met één doel: het verbinden van mensen door middel van sport en activiteiten. 
              Wij geloven dat iedereen de kans moet krijgen om actief te zijn en nieuwe mensen te ontmoeten, 
              ongeacht leeftijd, achtergrond of fysieke mogelijkheden.
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Oprichters */}
          <Card>
            <CardHeader>
              <CardTitle>Naam Oprichter 1</CardTitle>
              <CardDescription>Functie</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-square w-full bg-muted rounded-lg mb-4"></div>
              <p>Beschrijving van de oprichter en hun rol binnen SamenActief.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Naam Oprichter 2</CardTitle>
              <CardDescription>Functie</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-square w-full bg-muted rounded-lg mb-4"></div>
              <p>Beschrijving van de oprichter en hun rol binnen SamenActief.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Naam Oprichter 3</CardTitle>
              <CardDescription>Functie</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-square w-full bg-muted rounded-lg mb-4"></div>
              <p>Beschrijving van de oprichter en hun rol binnen SamenActief.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Naam Oprichter 4</CardTitle>
              <CardDescription>Functie</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-square w-full bg-muted rounded-lg mb-4"></div>
              <p>Beschrijving van de oprichter en hun rol binnen SamenActief.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Naam Oprichter 5</CardTitle>
              <CardDescription>Functie</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-square w-full bg-muted rounded-lg mb-4"></div>
              <p>Beschrijving van de oprichter en hun rol binnen SamenActief.</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Onze Visie</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg">
              Bij SamenActief streven we ernaar om een inclusieve gemeenschap te creëren waar iedereen zich welkom voelt. 
              Door sport en activiteiten als middel te gebruiken, willen we mensen verbinden en bijdragen aan een gezondere 
              en gelukkigere samenleving. Onze platform maakt het gemakkelijk om activiteiten te vinden, te organiseren en 
              nieuwe mensen te ontmoeten die dezelfde interesses delen.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 