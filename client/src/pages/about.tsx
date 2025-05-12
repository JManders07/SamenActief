import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold">Over SamenActief</h1>
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
              <CardTitle>Jelle</CardTitle>
              <CardDescription>Oprichter en ontwikkelaar</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-square w-full mb-4 overflow-hidden rounded-lg">
                <img
                  src="/Jelle.png"
                  alt="Jelle"
                  className="w-full h-full object-cover"
                />
              </div>
              <p>Ontwikkelaar van SamenActief en gedreven om mensen samen te brengen.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Wessel</CardTitle>
              <CardDescription>Oprichter en ontwikkelaar</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-square w-full mb-4 overflow-hidden rounded-lg">
                <img
                  src="/Wessel.jpg"
                  alt="Wessel"
                  className="w-full h-full object-cover"
                />
              </div>
              <p>Ontwikkelaar van SamenActief.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Siem</CardTitle>
              <CardDescription>Oprichter en hoofd sales</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-square w-full mb-4 overflow-hidden rounded-lg">
                <img
                  src="/Siem.jpg"
                  alt="Siem"
                  className="w-full h-full object-cover"
                />
              </div>
              <p>Medeoprichter van SamenActief met focus op inclusieve sportactiviteiten.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ralf</CardTitle>
              <CardDescription>Oprichter en hoofd marketing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-square w-full mb-4 overflow-hidden rounded-lg">
                <img
                  src="/Ralf.jpg"
                  alt="Ralf"
                  className="w-full h-full object-cover"
                />
              </div>
              <p>Medeoprichter van SamenActief met expertise in sportorganisatie.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Bjorn</CardTitle>
              <CardDescription>Oprichter en hoofd financiën</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-square w-full mb-4 overflow-hidden rounded-lg">
                <img
                  src="/Bjorn.jpg"
                  alt="Bjorn"
                  className="w-full h-full object-cover"
                />
              </div>
              <p>Medeoprichter van SamenActief met toewijding aan community building.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 