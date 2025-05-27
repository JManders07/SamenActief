import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Link } from "wouter";
import type { Center, Activity } from "@shared/schema";
import { format } from "date-fns";
import { nl } from "date-fns/locale";

interface CenterCardProps {
  center: Center;
  upcomingActivities?: Activity[];
}

export function CenterCard({ center, upcomingActivities = [] }: CenterCardProps) {
  return (
    <Link href={`/centers/${center.id}`}>
      <a className="block transition-transform hover:scale-[1.02]">
        <Card className="overflow-hidden">
          <img
            src={`/api/proxy-image?url=${encodeURIComponent(center.imageUrl)}`}
            alt={center.name}
            className="h-48 w-full object-cover"
          />
          <CardHeader className="text-2xl font-bold">{center.name}</CardHeader>
          <CardContent>
            <p className="text-lg text-muted-foreground">{center.address}</p>
            <p className="mt-2 text-lg">{center.description}</p>
            
            {upcomingActivities.length > 0 && (
              <div className="mt-4 space-y-2">
                <h3 className="font-semibold">Komende activiteiten:</h3>
                <ul className="space-y-1">
                  {upcomingActivities.slice(0, 3).map((activity) => (
                    <li key={activity.id} className="text-sm">
                      {activity.name} - {format(new Date(activity.date), "d MMMM", { locale: nl })}
                    </li>
                  ))}
                  {upcomingActivities.length > 3 && (
                    <li className="text-sm text-muted-foreground">
                      +{upcomingActivities.length - 3} meer activiteiten
                    </li>
                  )}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </a>
    </Link>
  );
}
