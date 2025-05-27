import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { formatDistanceToNow, format } from "date-fns";
import { nl } from "date-fns/locale";
import type { Activity, ActivityImage } from "@shared/schema";
import { Calendar, Users, Car, Package, Building2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ImageCarousel } from "@/components/image-carousel";

interface ActivityCardProps {
  activity: Activity;
  onRegister?: () => void;
  isRegistered?: boolean;
  onEditClick?: (activity: Activity) => void;
  onDelete?: () => void;
  waitlistPosition?: number;
  onWaitlist?: boolean;
  onJoinWaitlist?: () => void;
}

export function ActivityCard({ 
  activity, 
  onRegister, 
  isRegistered, 
  onEditClick,
  onDelete,
  waitlistPosition,
  onWaitlist,
  onJoinWaitlist
}: ActivityCardProps) {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const date = new Date(activity.date);
  const isAdmin = user && user.role === "center_admin";

  // Haal aantal aanmeldingen op
  const { data: attendees } = useQuery<number>({
    queryKey: [`/api/activities/${activity.id}/attendees/count`],
    enabled: !!activity.id,
  });

  const availableSpots = activity.capacity - (attendees || 0);
  const isFull = availableSpots <= 0;

  // Haal extra afbeeldingen op
  const { data: activityImages, isLoading: isLoadingImages } = useQuery<ActivityImage[]>({
    queryKey: [`/api/activities/${activity.id}/images`],
    enabled: !!activity.id,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    onError: (error) => {
      console.error('Error fetching activity images:', error);
    }
  });

  // Combineer hoofdfoto met extra afbeeldingen
  const allImages = [
    activity.imageUrl,
    ...(activityImages?.filter(img => img.imageUrl !== activity.imageUrl).map((img: ActivityImage) => img.imageUrl) || [])
  ].filter((url, index, self) => self.indexOf(url) === index); // Verwijder dubbele URLs

  console.log('Activity card images:', activityImages); // Debug logging
  console.log('Activity card all images:', allImages); // Debug logging

  if (isLoadingImages) {
    return (
      <Card className="overflow-hidden">
        <div className="relative h-48 overflow-hidden rounded-t-lg bg-muted animate-pulse" />
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="relative h-48 overflow-hidden rounded-t-lg">
        {allImages.length > 1 ? (
          <ImageCarousel images={allImages} />
        ) : (
          <img
            src={activity.imageUrl}
            alt={activity.name}
            className="h-full w-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 p-4">
          <h3 className="text-xl font-bold text-white">{activity.name}</h3>
          <p className="text-sm text-white/90">
            {format(new Date(activity.date), "PPP 'om' p", { locale: nl })}
          </p>
        </div>
        {isAdmin && (onEditClick || onDelete) && (
          <div className="absolute top-2 right-2 flex gap-2">
            {onEditClick && (
              <Button
                size="sm"
                variant="secondary"
                className="bg-white/90 hover:bg-white text-black"
                onClick={(e) => {
                  e.stopPropagation();
                  onEditClick(activity);
                }}
              >
                Bewerken
              </Button>
            )}
            {onDelete && (
              <Button
                size="sm"
                variant="destructive"
                className="bg-red-500 hover:bg-red-600 text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
              >
                Verwijderen
              </Button>
            )}
          </div>
        )}
      </div>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2 text-lg text-muted-foreground">
          <Calendar className="h-5 w-5" />
          <time dateTime={date.toISOString()}>
            {format(date, "EEEE, MMMM d 'om' HH:mm 'uur'", { locale: nl })}
          </time>
        </div>

        <p className="text-lg">{activity.description}</p>

        {/* Materialen en faciliteiten */}
        {(activity.materialsNeeded || activity.facilitiesAvailable) && (
          <div className="space-y-2">
            {activity.materialsNeeded && (
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-muted-foreground" />
                <p className="text-sm">Meenemen: {activity.materialsNeeded}</p>
              </div>
            )}
            {activity.facilitiesAvailable && (
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                <p className="text-sm">Beschikbaar: {activity.facilitiesAvailable}</p>
              </div>
            )}
          </div>
        )}

        {/* Capaciteit indicator */}
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {isFull ? "Vol" : `Nog ${availableSpots} plek${availableSpots === 1 ? '' : 'ken'} beschikbaar`}
          </span>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between">
        <Link href={`/activities/${activity.id}`}>
          <Button variant="outline">Details bekijken</Button>
        </Link>

        <div className="space-x-2">
          {/* Wachtlijst knop */}
          {isFull && !isRegistered && onJoinWaitlist && (
            <Button
              variant="secondary"
              onClick={onJoinWaitlist}
              disabled={onWaitlist}
            >
              {onWaitlist 
                ? `#${waitlistPosition} op wachtlijst` 
                : "Aanmelden voor wachtlijst"}
            </Button>
          )}

          {/* Registratie knop */}
          {onRegister && (
            <Button
              variant={isRegistered ? "secondary" : "default"}
              onClick={onRegister}
              disabled={isFull && !isRegistered}
            >
              {isRegistered ? "Afmelden" : "Aanmelden"}
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}