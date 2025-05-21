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
import { useNavigate } from "react-router-dom";

export default function NewActivityPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedImages, setSelectedImages] = useState<File[]>([]);

  const { data: center, isLoading } = useQuery<Center>({
    queryKey: [`/api/centers/my-center`],
    enabled: !!user?.id && user?.role === 'center_admin',
  });

  const createActivity = useMutation({
    mutationFn: async (data: Partial<Activity>) => {
      const res = await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Er is een fout opgetreden bij het aanmaken van de activiteit");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/activities`] });
      toast({
        title: "Activiteit aangemaakt",
        description: "De activiteit is succesvol aangemaakt.",
      });
      navigate("/center-admin");
    },
    onError: (error: Error) => {
      toast({
        title: "Aanmaken mislukt",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
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
        centerId: center?.id,
        imageUrl: imageUrls[0] || "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
        materialsNeeded: formData.get('materialsNeeded') || "",
        facilitiesAvailable: formData.get('facilitiesAvailable') || "",
        images: imageUrls.map((url, index) => ({
          imageUrl: url,
          order: index
        }))
      };

      createActivity.mutate(activityData);
    } catch (error) {
      toast({
        title: "Aanmaken mislukt",
        description: error instanceof Error ? error.message : "Er is een fout opgetreden",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div>Laden...</div>;
  }

  if (!user || user.role !== 'center_admin') {
    return <div>Geen toegang</div>;
  }

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold">Nieuwe Activiteit</h1>
          <p className="mt-2 text-xl text-muted-foreground">
            Maak een nieuwe activiteit aan voor {center?.name}
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
                defaultValue="10"
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
                className="mt-1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Afbeeldingen
              </label>
              <ImageUpload
                onImageSelect={setSelectedImages}
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
              Activiteit Aanmaken
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 