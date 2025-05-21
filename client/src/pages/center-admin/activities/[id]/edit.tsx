import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Center, Activity } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/image-upload";
import { queryClient } from "@/lib/queryClient";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiRequest } from "@/lib/queryClient";

export default function EditActivityPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams();
  const [selectedImages, setSelectedImages] = useState<File[]>([]);

  const { data: activity, isLoading: isLoadingActivity } = useQuery<Activity>({
    queryKey: [`/api/activities/${id}`],
    enabled: !!id,
  });

  const { data: center, isLoading: isLoadingCenter } = useQuery<Center>({
    queryKey: [`/api/centers/my-center`],
    enabled: !!user?.id && user?.role === 'center_admin',
  });

  const updateActivity = useMutation({
    mutationFn: async (data: Partial<Activity>) => {
      if (!id) return;
      const res = await apiRequest("PUT", `/api/activities/${id}`, {
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
      toast({
        title: "Activiteit bijgewerkt",
        description: "De activiteit is succesvol bijgewerkt.",
      });
      navigate("/center-admin");
    },
    onError: (error: Error) => {
      toast({
        title: "Bijwerken mislukt",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      let imageUrls = activity?.images?.map(img => img.imageUrl) || [];

      if (selectedImages.length > 0) {
        const newImageUrls = await Promise.all(selectedImages.map(async (file) => {
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

        imageUrls = [...imageUrls, ...newImageUrls];
      }

      const activityData = {
        name: formData.get('name'),
        description: formData.get('description'),
        date: formData.get('date'),
        capacity: parseInt(formData.get('capacity') as string) || 10,
        materialsNeeded: formData.get('materialsNeeded') || "",
        facilitiesAvailable: formData.get('facilitiesAvailable') || "",
        imageUrl: imageUrls[0] || activity?.imageUrl,
        images: imageUrls.map((url, index) => ({
          imageUrl: url,
          order: index
        }))
      };

      updateActivity.mutate(activityData);
    } catch (error) {
      toast({
        title: "Bijwerken mislukt",
        description: error instanceof Error ? error.message : "Er is een fout opgetreden",
        variant: "destructive",
      });
    }
  };

  if (isLoadingActivity || isLoadingCenter) {
    return <div>Laden...</div>;
  }

  if (!user || user.role !== 'center_admin' || !activity) {
    return <div>Geen toegang</div>;
  }

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold">Activiteit Bewerken</h1>
          <p className="mt-2 text-xl text-muted-foreground">
            Pas de informatie van {activity.name} aan
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium">
                Naam
              </label>
              <Input
                id="name"
                name="name"
                defaultValue={activity.name}
                required
                className="mt-1"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium">
                Beschrijving
              </label>
              <Textarea
                id="description"
                name="description"
                defaultValue={activity.description}
                required
                className="mt-1"
              />
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-medium">
                Datum en Tijd
              </label>
              <Input
                id="date"
                name="date"
                type="datetime-local"
                defaultValue={new Date(activity.date).toISOString().slice(0, 16)}
                required
                className="mt-1"
              />
            </div>

            <div>
              <label htmlFor="capacity" className="block text-sm font-medium">
                Capaciteit
              </label>
              <Input
                id="capacity"
                name="capacity"
                type="number"
                min="1"
                defaultValue={activity.capacity}
                required
                className="mt-1"
              />
            </div>

            <div>
              <label htmlFor="materialsNeeded" className="block text-sm font-medium">
                Benodigde Materialen
              </label>
              <Textarea
                id="materialsNeeded"
                name="materialsNeeded"
                defaultValue={activity.materialsNeeded}
                className="mt-1"
              />
            </div>

            <div>
              <label htmlFor="facilitiesAvailable" className="block text-sm font-medium">
                Beschikbare Faciliteiten
              </label>
              <Textarea
                id="facilitiesAvailable"
                name="facilitiesAvailable"
                defaultValue={activity.facilitiesAvailable}
                className="mt-1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Afbeeldingen
              </label>
              <ImageUpload
                onImageSelect={setSelectedImages}
                currentImageUrl={activity.imageUrl}
                multiple
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/center-admin")}
            >
              Annuleren
            </Button>
            <Button type="submit">
              Opslaan
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 