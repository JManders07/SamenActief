import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import type { Center } from "@shared/schema";

export default function Index() {
  const { data: centers, isLoading } = useQuery<Center[]>({
    queryKey: ["/api/centers"],
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="text-center mb-12" aria-labelledby="welcome-title">
        <h1 id="welcome-title" className="text-5xl font-bold mb-4">
          Welkom bij Samen Actief
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Ontdek activiteiten in jouw buurt en kom in contact met anderen. 
          Samen maken we de buurt levendiger!
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button asChild size="lg" className="text-lg">
            <Link href="/home">Bekijk Activiteiten</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="text-lg">
            <Link href="/auth">Inloggen</Link>
          </Button>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-8 mb-12" aria-labelledby="features-title">
        <h2 id="features-title" className="sr-only">Kenmerken van Samen Actief</h2>
        <div className="p-6 rounded-lg bg-card border hover:shadow-lg transition-shadow">
          <h3 className="text-2xl font-semibold mb-3">Activiteiten</h3>
          <p className="text-muted-foreground text-lg">
            Ontdek een breed scala aan activiteiten in jouw buurt, van sport tot cultuur.
          </p>
        </div>
        <div className="p-6 rounded-lg bg-card border hover:shadow-lg transition-shadow">
          <h3 className="text-2xl font-semibold mb-3">Buurthuizen</h3>
          <p className="text-muted-foreground text-lg">
            Vind buurthuizen bij jou in de buurt en maak kennis met je buren.
          </p>
        </div>
        <div className="p-6 rounded-lg bg-card border hover:shadow-lg transition-shadow">
          <h3 className="text-2xl font-semibold mb-3">Samen Doen</h3>
          <p className="text-muted-foreground text-lg">
            Sluit je aan bij bestaande activiteiten of start zelf iets nieuws.
          </p>
        </div>
      </section>

      {!isLoading && centers && centers.length > 0 && (
        <section className="mb-12" aria-labelledby="popular-centers-title">
          <h2 id="popular-centers-title" className="text-3xl font-bold mb-6 text-center">
            Populaire Buurthuizen
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {centers.slice(0, 3).map((center) => (
              <div 
                key={center.id} 
                className="p-6 rounded-lg bg-card border hover:shadow-lg transition-shadow"
              >
                <h3 className="text-xl font-semibold mb-2">{center.name}</h3>
                <p className="text-muted-foreground mb-4 text-lg">{center.description}</p>
                <Button asChild variant="outline" className="text-lg">
                  <Link href={`/centers/${center.id}`}>Bekijk Activiteiten</Link>
                </Button>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="bg-muted p-8 rounded-lg text-center" aria-labelledby="help-title">
        <h2 id="help-title" className="text-2xl font-bold mb-4">Hulp nodig?</h2>
        <p className="text-lg mb-4">
          We helpen je graag op weg met Samen Actief. Bekijk onze handleiding of neem contact op.
        </p>
        <Button asChild variant="secondary" size="lg" className="text-lg">
          <Link href="/help">Bekijk Handleiding</Link>
        </Button>
      </section>
    </div>
  );
} 