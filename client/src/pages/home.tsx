import { useQuery } from "@tanstack/react-query";
import { CenterCard } from "@/components/center-card";
import { OnboardingGuide } from "@/components/onboarding-guide";
import { LocationMap } from "@/components/location-map";
import type { Center } from "@shared/schema";
import { useState } from "react";

export default function Home() {
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);

  const { data: centers, isLoading } = useQuery<Center[]>({
    queryKey: ["/api/centers"],
  });

  // Filter centers op basis van geselecteerde locatie
  const filteredCenters = centers?.filter(center => {
    if (!selectedLocation || !center.latitude || !center.longitude) return true;
    
    const centerLat = parseFloat(center.latitude);
    const centerLng = parseFloat(center.longitude);
    
    // Bereken afstand tussen twee punten met de Haversine formule
    const R = 6371; // Aardradius in km
    const dLat = (centerLat - selectedLocation.lat) * Math.PI / 180;
    const dLng = (centerLng - selectedLocation.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(selectedLocation.lat * Math.PI / 180) * Math.cos(centerLat * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    return distance <= 5; // 5km radius
  });

  if (isLoading) {
    return (
      <div className="space-y-8">
        <h1 className="text-4xl font-bold">Activiteitencentra</h1>
        <div className="grid gap-6 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-96 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <OnboardingGuide />
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">Activiteitencentra</h1>
        <LocationMap onLocationSelect={(lat, lng) => setSelectedLocation({ lat, lng })} />
      </div>
      {filteredCenters && filteredCenters.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {filteredCenters.map((center) => (
            <CenterCard key={center.id} center={center} />
          ))}
        </div>
      ) : (
        <p className="text-xl text-muted-foreground">
          {selectedLocation 
            ? "Geen buurthuizen gevonden in de geselecteerde radius."
            : "Er zijn momenteel geen buurthuizen beschikbaar."}
        </p>
      )}
    </div>
  );
}