import { useQuery, useMutation } from "@tanstack/react-query";
import { CenterAdminLayout } from "@/components/center-admin/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/image-upload";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Activity, Center } from "@shared/schema";
import { useState } from "react";
import { ActivityCard } from "@/components/activity-card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ActivityWithRegistrations extends Activity {
  registrations?: { id: number }[];
}

export default function ActivitiesPage() {
  const { toast } = useToast();
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);

  const { data: center } = useQuery<Center>({
    queryKey: [`/api/centers/my-center`],
  });

  const { data: activities } = useQuery<ActivityWithRegistrations[]>({
    queryKey: [`/api/activities`, { centerId: center?.id }],
    enabled: !!center?.id,
  });

  const updateActivity = useMutation({
    mutationFn: async (data: Partial<Activity>) => {
      if (!editingActivity) return;
      const res = await apiRequest("PUT", `/api/activities/${editingActivity.id}`, {
        ...data,
        date: data.date ? new Date(data.date).toISOString() : undefined
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Er is een fout opgetreden bij het bijwerken van de activiteit");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/activities`] });
      setEditingActivity(null);
      toast({
        title: "Activiteit bijgewerkt",
        description: "De activiteit is succesvol bijgewerkt.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Bijwerken mislukt",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteActivity = useMutation({
    mutationFn: async (activityId: number) => {
      const res = await apiRequest("DELETE", `/api/activities/${activityId}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Er is een fout opgetreden bij het verwijderen van de activiteit");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/activities`] });
      toast({
        title: "Activiteit verwijderd",
        description: "De activiteit is succesvol verwijderd.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Verwijderen mislukt",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmitActivity = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    if (editingActivity) {
      // Update bestaande activiteit
      const dateStr = formData.get("date") as string;
      updateActivity.mutate({
        name: formData.get("name") as string,
        description: formData.get("description") as string,
        date: new Date(dateStr),
        capacity: parseInt(formData.get("capacity") as string),
        materialsNeeded: formData.get("materialsNeeded") as string,
        facilitiesAvailable: formData.get("facilitiesAvailable") as string,
      });
    } else {
      // Maak nieuwe activiteit aan
      if (!center?.id) return;

      try {
        const imageUrls = await Promise.all(selectedImages.map(async (file) => {
          const imageFormData = new FormData();
          imageFormData.append('file', file);

          const response = await fetch('/api/upload', {
            method: 'POST',
            body: imageFormData
          });

          if (!response.ok) throw new Error('Kon afbeelding niet uploaden');
          const data = await response.json();
          return data.url;
        }));

        const activityData = {
          name: formData.get('name'),
          description: formData.get('description'),
          date: formData.get('date'),
          capacity: parseInt(formData.get('capacity') as string) || 10,
          centerId: center.id,
          imageUrl: imageUrls[0] || "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
          materialsNeeded: formData.get('materialsNeeded') || "",
          facilitiesAvailable: formData.get('facilitiesAvailable') || "",
          images: imageUrls.map((url, index) => ({
            imageUrl: url,
            order: index
          }))
        };

        console.log('Sending activity data:', activityData);
        const response = await fetch('/api/activities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(activityData)
        });

        const responseData = await response.json();

        if (!response.ok && responseData.message) {
          throw new Error(responseData.message);
        }

        queryClient.invalidateQueries({ queryKey: [`/api/activities`] });
        toast({ title: "Activiteit aangemaakt" });
        (e.target as HTMLFormElement).reset();
        setSelectedImages([]);
      } catch (error) {
        if (error instanceof Error && error.message) {
          toast({ 
            title: "Fout",
            description: error.message,
            variant: "destructive"
          });
        }
      }
    }
  };

  return (
    <CenterAdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Activiteiten Beheren</h1>
          <p className="text-muted-foreground">
            Beheer de activiteiten van {center?.name}
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>
                {editingActivity ? "Activiteit Bewerken" : "Nieuwe Activiteit"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitActivity} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Naam</label>
                  <Input 
                    name="name" 
                    required 
                    defaultValue={editingActivity?.name || ""}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Beschrijving</label>
                  <Textarea 
                    name="description" 
                    required 
                    defaultValue={editingActivity?.description || ""}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Datum en tijd</label>
                  <Input 
                    name="date" 
                    type="datetime-local" 
                    required 
                    defaultValue={editingActivity?.date ? new Date(editingActivity.date).toISOString().slice(0, 16) : undefined}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Capaciteit</label>
                  <Input 
                    name="capacity" 
                    type="number" 
                    defaultValue={editingActivity?.capacity || "10"} 
                    required 
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Benodigde Materialen</label>
                  <Textarea 
                    name="materialsNeeded" 
                    defaultValue={editingActivity?.materialsNeeded || ""}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Beschikbare Faciliteiten</label>
                  <Textarea 
                    name="facilitiesAvailable" 
                    defaultValue={editingActivity?.facilitiesAvailable || ""}
                  />
                </div>

                {!editingActivity && (
                  <div>
                    <label className="text-sm font-medium">Foto's</label>
                    <ImageUpload
                      onImagesSelected={(files) => setSelectedImages(files)}
                      onRemoveImage={(index) => {
                        setSelectedImages(prev => prev.filter((_, i) => i !== index));
                      }}
                    />
                  </div>
                )}

                <div className="flex gap-4">
                  <Button type="submit" className="flex-1">
                    {editingActivity ? "Activiteit bijwerken" : "Activiteit aanmaken"}
                  </Button>
                  {editingActivity && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setEditingActivity(null);
                        setSelectedImages([]);
                      }}
                    >
                      Annuleren
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Huidige Activiteiten</h2>
            <div className="grid gap-4">
              {activities?.map((activity) => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  onEditClick={() => setEditingActivity(activity)}
                  onDelete={() => {
                    if (window.confirm("Weet u zeker dat u deze activiteit wilt verwijderen?")) {
                      deleteActivity.mutate(activity.id);
                    }
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </CenterAdminLayout>
  );
} 