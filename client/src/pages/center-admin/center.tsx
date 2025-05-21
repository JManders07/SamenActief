import { useQuery, useMutation } from "@tanstack/react-query";
import { CenterAdminLayout } from "@/components/center-admin/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/image-upload";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Center } from "@shared/schema";
import { useState } from "react";

export default function CenterPage() {
  const { toast } = useToast();
  const [selectedCenterImage, setSelectedCenterImage] = useState<File | null>(null);

  const { data: center, isLoading } = useQuery<Center>({
    queryKey: [`/api/centers/my-center`],
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

      // Upload nieuwe afbeelding als er een is geselecteerd
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
    return (
      <CenterAdminLayout>
        <div>Laden...</div>
      </CenterAdminLayout>
    );
  }

  return (
    <CenterAdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Buurthuis Beheren</h1>
          <p className="text-muted-foreground">
            Beheer de informatie van uw buurthuis
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Buurthuis Informatie</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Naam</label>
                <Input 
                  name="name" 
                  required 
                  defaultValue={center?.name || ""}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Beschrijving</label>
                <Textarea 
                  name="description" 
                  required 
                  defaultValue={center?.description || ""}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Adres</label>
                <Input 
                  name="address" 
                  required 
                  defaultValue={center?.address || ""}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Afbeelding</label>
                <ImageUpload
                  onImagesSelected={(files) => setSelectedCenterImage(files[0])}
                  preview={center?.imageUrl ? [center.imageUrl] : []}
                />
              </div>

              <Button type="submit" disabled={updateCenter.isPending}>
                {updateCenter.isPending ? "Bezig..." : "Buurthuis bijwerken"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </CenterAdminLayout>
  );
} 