import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Center, Activity } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ActivityCard } from "@/components/activity-card";
import { queryClient } from "@/lib/queryClient";
import { useState, useEffect } from "react";
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
  const [selectedCenterImage, setSelectedCenterImage] = useState<File | null>(null);
  const [isRecurring, setIsRecurring] = useState(false);

  useEffect(() => {
    const handleRecurringChange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const recurrenceOptions = document.getElementById('recurrenceOptions');
      if (recurrenceOptions) {
        recurrenceOptions.classList.toggle('hidden', !target.checked);
      }
    };

    const isRecurringCheckbox = document.getElementById('isRecurring');
    if (isRecurringCheckbox) {
      isRecurringCheckbox.addEventListener('change', handleRecurringChange);
    }

    return () => {
      if (isRecurringCheckbox) {
        isRecurringCheckbox.removeEventListener('change', handleRecurringChange);
      }
    };
  }, [editingActivity]);

  useEffect(() => {
    if (editingActivity) {
      setIsRecurring(editingActivity.isRecurring);
    } else {
      setIsRecurring(false);
    }
  }, [editingActivity]);

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
        isRecurring: formData.get("isRecurring") === "on",
        recurrencePattern: formData.get("isRecurring") === "on" ? {
          frequency: formData.get("recurrenceFrequency") as "weekly" | "monthly" | "yearly",
          interval: parseInt(formData.get("recurrenceInterval") as string),
          endDate: formData.get("recurrenceEndDate") ? new Date(formData.get("recurrenceEndDate") as string) : undefined
        } : undefined
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
          })),
          isRecurring: formData.get("isRecurring") === "on",
          recurrencePattern: formData.get("isRecurring") === "on" ? {
            frequency: formData.get("recurrenceFrequency") as "weekly" | "monthly" | "yearly",
            interval: parseInt(formData.get("recurrenceInterval") as string),
            endDate: formData.get("recurrenceEndDate") ? new Date(formData.get("recurrenceEndDate") as string) : undefined
          } : undefined
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
              required 
              defaultValue={center?.name || ""}
            />
          </div>

          <div>
            <label>Beschrijving</label>
            <Textarea 
              name="description" 
              required 
              defaultValue={center?.description || ""}
            />
          </div>

          <div>
            <label>Adres</label>
            <Input 
              name="address" 
              required 
              defaultValue={center?.address || ""}
            />
          </div>

          <div>
            <label>Afbeelding</label>
            <ImageUpload
              onImagesSelected={(files) => setSelectedCenterImage(files[0])}
              preview={center?.imageUrl ? [center.imageUrl] : []}
            />
          </div>

          <Button type="submit" disabled={updateCenter.isPending}>
            {updateCenter.isPending ? "Bezig..." : "Buurthuis bijwerken"}
          </Button>
        </form>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold">
          {editingActivity ? "Activiteit Bewerken" : "Nieuwe Activiteit"}
        </h2>
        {editingActivity ? (
          <form onSubmit={handleSubmitActivity} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Naam
              </label>
              <input
                type="text"
                id="name"
                name="name"
                defaultValue={editingActivity.name}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Beschrijving
              </label>
              <textarea
                id="description"
                name="description"
                defaultValue={editingActivity.description}
                required
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                Datum
              </label>
              <input
                type="datetime-local"
                id="date"
                name="date"
                defaultValue={new Date(editingActivity.date).toISOString().slice(0, 16)}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="capacity" className="block text-sm font-medium text-gray-700">
                Capaciteit
              </label>
              <input
                type="number"
                id="capacity"
                name="capacity"
                defaultValue={editingActivity.capacity}
                min="1"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="materialsNeeded" className="block text-sm font-medium text-gray-700">
                Benodigde materialen
              </label>
              <textarea
                id="materialsNeeded"
                name="materialsNeeded"
                defaultValue={editingActivity.materialsNeeded}
                rows={2}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="facilitiesAvailable" className="block text-sm font-medium text-gray-700">
                Beschikbare faciliteiten
              </label>
              <textarea
                id="facilitiesAvailable"
                name="facilitiesAvailable"
                defaultValue={editingActivity.facilitiesAvailable}
                rows={2}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isRecurring"
                name="isRecurring"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="isRecurring" className="ml-2 block text-sm text-gray-900">
                Terugkerende activiteit
              </label>
            </div>

            {editingActivity.isRecurring && (
              <div className="space-y-4 rounded-md border border-gray-200 p-4">
                <div>
                  <label htmlFor="recurrenceFrequency" className="block text-sm font-medium text-gray-700">
                    Frequentie
                  </label>
                  <select
                    id="recurrenceFrequency"
                    name="recurrenceFrequency"
                    defaultValue={editingActivity.recurrencePattern?.frequency || "weekly"}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="weekly">Wekelijks</option>
                    <option value="monthly">Maandelijks</option>
                    <option value="yearly">Jaarlijks</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="recurrenceInterval" className="block text-sm font-medium text-gray-700">
                    Interval
                  </label>
                  <input
                    type="number"
                    id="recurrenceInterval"
                    name="recurrenceInterval"
                    defaultValue={editingActivity.recurrencePattern?.interval || 1}
                    min="1"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="recurrenceEndDate" className="block text-sm font-medium text-gray-700">
                    Einddatum (optioneel)
                  </label>
                  <input
                    type="date"
                    id="recurrenceEndDate"
                    name="recurrenceEndDate"
                    defaultValue={editingActivity.recurrencePattern?.endDate ? new Date(editingActivity.recurrencePattern.endDate).toISOString().slice(0, 10) : undefined}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setEditingActivity(null)}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Annuleren
              </button>
              <button
                type="submit"
                className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Bijwerken
              </button>
            </div>
          </form>
        ) : (
          <form id="activityForm" onSubmit={handleSubmitActivity} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Naam
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Beschrijving
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                Datum
              </label>
              <input
                type="datetime-local"
                id="date"
                name="date"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="capacity" className="block text-sm font-medium text-gray-700">
                Capaciteit
              </label>
              <input
                type="number"
                id="capacity"
                name="capacity"
                defaultValue={10}
                min="1"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="materialsNeeded" className="block text-sm font-medium text-gray-700">
                Benodigde materialen
              </label>
              <textarea
                id="materialsNeeded"
                name="materialsNeeded"
                rows={2}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="facilitiesAvailable" className="block text-sm font-medium text-gray-700">
                Beschikbare faciliteiten
              </label>
              <textarea
                id="facilitiesAvailable"
                name="facilitiesAvailable"
                rows={2}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isRecurring"
                name="isRecurring"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="isRecurring" className="ml-2 block text-sm text-gray-900">
                Terugkerende activiteit
              </label>
            </div>

            <div id="recurrenceOptions" className={`space-y-4 rounded-md border border-gray-200 p-4 ${isRecurring ? '' : 'hidden'}`}>
              <div>
                <label htmlFor="recurrenceFrequency" className="block text-sm font-medium text-gray-700">
                  Frequentie
                </label>
                <select
                  id="recurrenceFrequency"
                  name="recurrenceFrequency"
                  defaultValue="weekly"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="weekly">Wekelijks</option>
                  <option value="monthly">Maandelijks</option>
                  <option value="yearly">Jaarlijks</option>
                </select>
              </div>

              <div>
                <label htmlFor="recurrenceInterval" className="block text-sm font-medium text-gray-700">
                  Interval
                </label>
                <input
                  type="number"
                  id="recurrenceInterval"
                  name="recurrenceInterval"
                  defaultValue={1}
                  min="1"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="recurrenceEndDate" className="block text-sm font-medium text-gray-700">
                  Einddatum (optioneel)
                </label>
                <input
                  type="date"
                  id="recurrenceEndDate"
                  name="recurrenceEndDate"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Afbeeldingen</label>
              <div className="mt-1 flex justify-center rounded-md border-2 border-dashed border-gray-300 px-6 pt-5 pb-6">
                <div className="space-y-1 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer rounded-md bg-white font-medium text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 hover:text-blue-500"
                    >
                      <span>Upload een bestand</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        multiple
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          setSelectedImages(files);
                        }}
                      />
                    </label>
                    <p className="pl-1">of sleep en laat los</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF tot 10MB</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  (document.getElementById('activityForm') as HTMLFormElement).reset();
                  setSelectedImages([]);
                }}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Annuleren
              </button>
              <button
                type="submit"
                className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Toevoegen
              </button>
            </div>
          </form>
        )}
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

<script dangerouslySetInnerHTML={{
  __html: `
    document.addEventListener('DOMContentLoaded', function() {
      const isRecurringCheckbox = document.getElementById('isRecurring');
      const recurrenceOptions = document.getElementById('recurrenceOptions');
      
      function toggleRecurrenceOptions() {
        recurrenceOptions.classList.toggle('hidden', !isRecurringCheckbox.checked);
      }
      
      isRecurringCheckbox.addEventListener('change', toggleRecurrenceOptions);
      toggleRecurrenceOptions(); // Initial state
    });
  `
}} />