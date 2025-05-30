import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { ActivityCard } from "@/components/activity-card";
import type { Center, Activity } from "@shared/schema";

export default function CenterPage() {
  const { id } = useParams();
  const centerId = parseInt(id || "0");

  console.log('Rendering CenterPage with centerId:', centerId); // Debug log

  const { data: center, isLoading: isLoadingCenter } = useQuery<Center>({
    queryKey: [`/api/centers/${centerId}`],
  });

  // Direct query for activities of this center
  const { data: activities, isLoading: isLoadingActivities } = useQuery<Activity[]>({
    queryKey: [`/api/activities`, { centerId: centerId }],
    enabled: !!centerId && centerId > 0,
  });

  // Filter alleen toekomstige activiteiten
  const upcomingActivities = activities?.filter(activity => {
    const activityDate = new Date(activity.date);
    const now = new Date();
    
    // Als de activiteit vandaag is, controleer dan de tijd
    if (activityDate.toDateString() === now.toDateString()) {
      return activityDate > now;
    }
    
    // Anders vergelijk alleen de datum
    return activityDate > now;
  }) || [];

  if (isLoadingCenter || isLoadingActivities) {
    return (
      <div className="space-y-8">
        <div className="h-64 animate-pulse rounded-lg bg-muted" />
        <div className="grid gap-6 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-96 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  if (!center) return null;

  console.log('Activities loaded:', activities); // Debug log

  return (
    <div className="space-y-8">
      <div className="relative h-64 overflow-hidden rounded-lg">
        <img
          src={`/api/proxy-image?url=${encodeURIComponent(center.imageUrl)}`}
          alt={center.name}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 p-8">
          <h1 className="text-4xl font-bold text-white">{center.name}</h1>
          <p className="mt-2 text-xl text-white/90">{center.address}</p>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-3xl font-bold">Aankomende Activiteiten</h2>
        {upcomingActivities && upcomingActivities.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            {upcomingActivities.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </div>
        ) : (
          <p className="text-xl text-muted-foreground">
            Er zijn momenteel geen activiteiten gepland voor dit buurthuis.
          </p>
        )}
      </div>
    </div>
  );
}