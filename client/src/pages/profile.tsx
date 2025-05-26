import { useQuery, useMutation } from "@tanstack/react-query";
import { ActivityCard } from "@/components/activity-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Activity } from "@shared/schema";
import { Building2, MapPin, Edit, Save, X, Trash2, User, Mail, Phone, Calendar, Settings, Bell } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RemindersPanel } from "@/components/reminders-panel";
import AccessibilitySettings from "@/components/accessibility-settings";
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
import { useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    displayName: "",
    phone: "",
    village: "",
    neighborhood: "",
    username: ""
  });

  const { data: myActivities, isLoading: isLoadingActivities } = useQuery<Activity[]>({
    queryKey: [`/api/users/${user?.id}/activities`],
    enabled: !!user,
  });

  const updateAnonymous = useMutation({
    mutationFn: async (anonymous: boolean) => {
      if (!user) return;
      await apiRequest("PATCH", `/api/users/${user.id}`, {
        anonymousParticipation: anonymous,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Instellingen bijgewerkt",
        description: "Uw privacy-voorkeuren zijn opgeslagen.",
      });
    },
  });

  const unregister = useMutation({
    mutationFn: async (activityId: number) => {
      if (!user) return;
      await apiRequest("DELETE", `/api/activities/${activityId}/register`, {
        userId: user.id,
      });
    },
    onSuccess: () => {
      if (user) {
        queryClient.invalidateQueries({ queryKey: [`/api/users/${user.id}/activities`] });
      }
      toast({
        title: "Afmelding geslaagd",
        description: "U bent afgemeld voor deze activiteit.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Afmelding mislukt",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateProfile = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!user) return;
      await apiRequest("PATCH", `/api/users/${user.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      setIsEditing(false);
      toast({
        title: "Profiel bijgewerkt",
        description: "Uw profielgegevens zijn opgeslagen.",
      });
    },
  });

  const deleteAccount = useMutation({
    mutationFn: async () => {
      if (!user) return;
      await apiRequest("DELETE", `/api/users/${user.id}`);
    },
    onSuccess: () => {
      toast({
        title: "Account verwijderd",
        description: "Uw account is succesvol verwijderd.",
      });
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Fout bij verwijderen",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEditClick = () => {
    if (user) {
      setFormData({
        displayName: user.displayName,
        phone: user.phone,
        village: user.village,
        neighborhood: user.neighborhood,
        username: user.username
      });
      setIsEditing(true);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate(formData);
  };

  if (!user) return null;

  if (isLoadingActivities) {
    return (
      <div className="space-y-8">
        <Card>
          <CardHeader className="text-2xl font-bold">Mijn Profiel</CardHeader>
          <CardContent>
            <div className="h-32 animate-pulse rounded bg-muted" />
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Mijn Activiteiten</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-96 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="container mx-auto max-w-5xl space-y-8 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Mijn Profiel</h1>
          <p className="text-muted-foreground">Beheer uw persoonlijke gegevens en instellingen</p>
        </div>
        <div className="flex gap-2">
          {!isEditing ? (
            <Button variant="outline" onClick={handleEditClick}>
              <Edit className="mr-2 h-4 w-4" />
              Bewerken
            </Button>
          ) : null}
          <Button variant="outline" onClick={() => setLocation("/settings")}>
            <Settings className="mr-2 h-4 w-4" />
            Gegevensrechten
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Account verwijderen
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Account verwijderen</AlertDialogTitle>
                <AlertDialogDescription>
                  Weet u zeker dat u uw account wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.
                  Alle uw gegevens, inschrijvingen en activiteiten zullen permanent worden verwijderd.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuleren</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => deleteAccount.mutate()}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Account verwijderen
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Tabs defaultValue="profiel" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profiel">
            <User className="mr-2 h-4 w-4" />
            Profiel
          </TabsTrigger>
          <TabsTrigger value="activiteiten">
            <Calendar className="mr-2 h-4 w-4" />
            Activiteiten
          </TabsTrigger>
          <TabsTrigger value="instellingen">
            <Settings className="mr-2 h-4 w-4" />
            Instellingen
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profiel">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start space-x-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={`https://avatar.vercel.sh/${user.username}`} />
                  <AvatarFallback className="text-2xl">{getInitials(user.displayName)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-6">
                  {!isEditing ? (
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-muted-foreground">
                          <User className="h-4 w-4" />
                          <span>Naam</span>
                        </div>
                        <p className="text-lg font-medium">{user.displayName}</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-muted-foreground">
                          <Mail className="h-4 w-4" />
                          <span>E-mailadres</span>
                        </div>
                        <p className="text-lg font-medium">{user.username}</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          <span>Telefoonnummer</span>
                        </div>
                        <p className="text-lg font-medium">{user.phone}</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>Locatie</span>
                        </div>
                        <p className="text-lg font-medium">{user.village}, {user.neighborhood}</p>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="displayName">Naam</Label>
                          <Input
                            id="displayName"
                            value={formData.displayName}
                            onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="username">E-mailadres</Label>
                          <Input
                            id="username"
                            type="email"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Telefoonnummer</Label>
                          <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="village">Woonplaats</Label>
                          <Input
                            id="village"
                            value={formData.village}
                            onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="neighborhood">Wijk</Label>
                          <Input
                            id="neighborhood"
                            value={formData.neighborhood}
                            onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={handleCancelEdit}>
                          <X className="mr-2 h-4 w-4" />
                          Annuleren
                        </Button>
                        <Button type="submit">
                          <Save className="mr-2 h-4 w-4" />
                          Opslaan
                        </Button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5" />
                Privacy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="anonymous"
                  checked={user.anonymousParticipation}
                  onCheckedChange={(checked) => updateAnonymous.mutate(checked as boolean)}
                />
                <Label htmlFor="anonymous">
                  Anoniem deelnemen aan activiteiten
                </Label>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Als u deze optie inschakelt, wordt uw naam niet zichtbaar voor andere deelnemers.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activiteiten">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Mijn Activiteiten</h2>
                <p className="text-muted-foreground">
                  {myActivities?.length || 0} activiteiten waar u voor bent ingeschreven
                </p>
              </div>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {myActivities?.map((activity) => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  onRegister={() => unregister.mutate(activity.id)}
                />
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="instellingen">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="mr-2 h-5 w-5" />
                  Notificaties
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RemindersPanel userId={user.id} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="mr-2 h-5 w-5" />
                  Toegankelijkheid
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AccessibilitySettings />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}