import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Center, Activity } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ActivityCard } from "@/components/activity-card";
import { queryClient } from "@/lib/queryClient";
import { useState } from "react";
import { ImageUpload } from "@/components/image-upload";
import { apiRequest } from "@/lib/queryClient";
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

export default function CenterAdminPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);

  const { data: center, isLoading: isLoadingCenter } = useQuery<Center>({
    queryKey: [`/api/centers/my-center`],
    enabled: !!user?.id && user?.role === 'center_admin',
  });

  const { data: activities, isLoading: isLoadingActivities } = useQuery<Activity[]>({
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

  const handleSubmitCenter = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!center?.id) return;

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      description: formData.get('description'),
      address: formData.get('address'),
      imageUrl: formData.get('imageUrl') || center.imageUrl
    };

    try {
      const response = await fetch(`/api/centers/${center.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Kon buurthuis niet bijwerken');
      }

      queryClient.invalidateQueries({ queryKey: [`/api/centers/my-center`] });
      toast({ title: "Buurthuis bijgewerkt" });
    } catch (error) {
      toast({ 
        title: "Fout",
        description: "Kon buurthuis niet bijwerken",
        variant: "destructive"
      });
    }
  };

  if (isLoadingCenter || isLoadingActivities) {
    return <div>Laden...</div>;
  }

  if (!user || user.role !== 'center_admin') {
    return <div>Geen toegang</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold">Beheer Buurthuis</h1>
        <p className="mt-2 text-xl text-muted-foreground">
          Beheer de informatie en activiteiten van {center?.name}
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Buurthuis Informatie</h2>
        <form onSubmit={handleSubmitCenter} className="space-y-4">
          <div>
            <label>Naam</label>
            <Input 
              name="name"
              defaultValue={center?.name}
              required 
            />
          </div>

          <div>
            <label>Adres</label>
            <Input 
              name="address"
              defaultValue={center?.address}
              required 
            />
          </div>

          <div>
            <label>Beschrijving</label>
            <Textarea 
              name="description"
              defaultValue={center?.description}
              required 
            />
          </div>

          <div>
            <label>Afbeelding URL</label>
            <Input 
              name="imageUrl"
              defaultValue={center?.imageUrl}
            />
          </div>

          <Button type="submit" className="w-full">
            Wijzigingen opslaan
          </Button>
        </form>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold">
          {editingActivity ? "Activiteit Bewerken" : "Nieuwe Activiteit"}
        </h2>
        <form onSubmit={handleSubmitActivity} className="space-y-4">
          <div>
            <label>Naam</label>
            <Input 
              name="name" 
              required 
              defaultValue={editingActivity?.name || ""}
            />
          </div>

          <div>
            <label>Beschrijving</label>
            <Textarea 
              name="description" 
              required 
              defaultValue={editingActivity?.description || ""}
            />
          </div>

          <div>
            <label>Datum en tijd</label>
            <Input 
              name="date" 
              type="datetime-local" 
              required 
              defaultValue={editingActivity?.date ? new Date(editingActivity.date).toISOString().slice(0, 16) : undefined}
            />
          </div>

          <div>
            <label>Capaciteit</label>
            <Input 
              name="capacity" 
              type="number" 
              defaultValue={editingActivity?.capacity || "10"} 
              required 
            />
          </div>

          <div>
            <label>Benodigde materialen</label>
            <Textarea 
              name="materialsNeeded" 
              defaultValue={editingActivity?.materialsNeeded || ""}
            />
          </div>

          <div>
            <label>Beschikbare faciliteiten</label>
            <Textarea 
              name="facilitiesAvailable" 
              defaultValue={editingActivity?.facilitiesAvailable || ""}
            />
          </div>

          {!editingActivity && (
            <div>
              <label>Foto's</label>
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
                onClick={() => setEditingActivity(null)}
              >
                Annuleren
              </Button>
            )}
          </div>
        </form>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Huidige Activiteiten</h2>
        <div className="grid gap-6 md:grid-cols-2">
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
  );
}