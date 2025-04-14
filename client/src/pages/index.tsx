import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import type { Center } from "@shared/schema";

export default function Index() {
  const { data: centers, isLoading } = useQuery<Center[]>({
    queryKey: ["/api/centers"],
  });

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <div className="relative h-[600px] bg-gray-900">
        <div className="absolute inset-0">
          {/* Test met een bestaand SVG-bestand */}
          <img
            src="/hero-background.jpg"
            alt="Samen Actief Hero"
            className="w-full h-full object-cover opacity-50"
            onError={(e) => {
              console.error('Error loading image:', e);
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
        <div className="relative container mx-auto px-4 h-full flex flex-col justify-center items-center text-white text-center">
          <h1 className="text-6xl font-bold mb-6">SamenActief</h1>
          <p className="text-2xl mb-8 max-w-2xl">
            Ontdek activiteiten in jouw buurt en kom in contact met anderen.
            Samen maken we de buurt levendiger!
          </p>
          <Button asChild size="lg" className="text-lg bg-white text-gray-900 hover:bg-gray-100">
            <Link href="/home">Log in en bekijk activiteiten!</Link>
          </Button>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="relative group cursor-pointer">
            <div className="aspect-[4/3] mb-4">
              <img
                src="/activities-feature.jpg"
                alt="Activiteiten"
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            <h3 className="text-2xl font-bold mb-2">Activiteiten</h3>
            <p className="text-gray-600">
              Ontdek een breed scala aan activiteiten in jouw buurt, van sport tot cultuur.
            </p>
          </div>
          <div className="relative group cursor-pointer">
            <div className="aspect-[4/3] mb-4">
              <img
                src="/centers-feature.jpg"
                alt="Buurthuizen"
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            <h3 className="text-2xl font-bold mb-2">Buurthuizen</h3>
            <p className="text-gray-600">
              Vind buurthuizen bij jou in de buurt en maak kennis met je buren.
            </p>
          </div>
          <div className="relative group cursor-pointer">
            <div className="aspect-[4/3] mb-4">
              <img
                src="/together-feature.jpg"
                alt="Samen Doen"
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            <h3 className="text-2xl font-bold mb-2">Samen Doen</h3>
            <p className="text-gray-600">
              Sluit je aan bij bestaande activiteiten of start zelf iets nieuws.
            </p>
          </div>
        </div>
      </div>

      {/* Popular Centers Section */}
      {!isLoading && centers && centers.length > 0 && (
        <div className="bg-gray-100 py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold mb-8 text-center">Populaire Buurthuizen</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {centers.slice(0, 3).map((center) => (
                <div
                  key={center.id}
                  className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
                >
                  <h3 className="text-2xl font-bold mb-3">{center.name}</h3>
                  <p className="text-gray-600 mb-4">{center.description}</p>
                  <Button asChild variant="outline" className="w-full">
                    <Link href={`/centers/${center.id}`}>Bekijk Activiteiten</Link>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Help Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="bg-gray-900 text-white p-12 rounded-lg text-center">
          <h2 className="text-3xl font-bold mb-4">Hulp nodig?</h2>
          <p className="text-xl mb-6">
            We helpen je graag op weg met Samen Actief. Bekijk onze handleiding of neem contact op.
          </p>
          <Button asChild variant="secondary" size="lg" className="bg-white text-gray-900 hover:bg-gray-100">
            <Link href="/help">Bekijk Handleiding</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}