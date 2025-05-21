import { useQuery } from "@tanstack/react-query";
import { CenterCard } from "@/components/center-card";
import { OnboardingGuide } from "@/components/onboarding-guide";
import type { Center, Activity } from "@shared/schema";

export default function Home() {
  const { data: centers, isLoading: isLoadingCenters } = useQuery<Center[]>({
    queryKey: ["/api/centers"],
  });

  // Haal alle activiteiten op
  const { data: activities, isLoading: isLoadingActivities } = useQuery<Activity[]>({
    queryKey: ["/api/activities"],
  });

  // Filter alleen toekomstige activiteiten
  const upcomingActivities = activities?.filter(
    activity => new Date(activity.date) > new Date()
  ) || [];

  if (isLoadingCenters || isLoadingActivities) {
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
      <h1 className="text-4xl font-bold">Activiteitencentra</h1>
      {centers && centers.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {centers.map((center) => (
            <CenterCard 
              key={center.id} 
              center={center} 
              upcomingActivities={upcomingActivities.filter(
                activity => activity.centerId === center.id
              )}
            />
          ))}
        </div>
      ) : (
        <p className="text-xl text-muted-foreground">
          Er zijn momenteel geen buurthuizen beschikbaar.
        </p>
      )}
    </div>
  );
}