import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Center } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/image-upload";
import { queryClient } from "@/lib/queryClient";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useNavigate } from "react-router-dom";

export default function EditCenterPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedCenterImage, setSelectedCenterImage] = useState<File | null>(null);

  const { data: center, isLoading } = useQuery<Center>({
    queryKey: [`/api/centers/my-center`],
    enabled: !!user?.id && user?.role === 'center_admin',
  });

  const updateCenter = useMutation({
    mutationFn: async (data: Partial<Center>) => {
      if (!center?.id) return;
      const res = await apiRequest("PUT", `/api/centers/${center.id}`, data);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Er is een fout opgetreden bij het bijwerken van het buurthuis");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/centers/my-center`] });
      toast({
        title: "Buurthuis bijgewerkt",
        description: "Het buurthuis is succesvol bijgewerkt.",
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
      let imageUrl = center?.imageUrl;

      if (selectedCenterImage) {
        const imageFormData = new FormData();
        imageFormData.append('file', selectedCenterImage);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: imageFormData
        });

        if (!response.ok) throw new Error('Kon afbeelding niet uploaden');
        const data = await response.json();
        imageUrl = data.url;
      }

      updateCenter.mutate({
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        address: formData.get('address') as string,
        imageUrl: imageUrl
      });
    } catch (error) {
      toast({
        title: "Bijwerken mislukt",
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
          <h1 className="text-4xl font-bold">Buurthuis Bewerken</h1>
          <p className="mt-2 text-xl text-muted-foreground">
            Pas de informatie van {center?.name} aan
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
                defaultValue={center?.name}
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
                defaultValue={center?.description}
                required
                className="mt-1"
              />
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium">
                Adres
              </label>
              <Input
                id="address"
                name="address"
                defaultValue={center?.address}
                required
                className="mt-1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Afbeelding
              </label>
              <ImageUpload
                onImageSelect={setSelectedCenterImage}
                currentImageUrl={center?.imageUrl}
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