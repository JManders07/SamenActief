import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
}

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users");
      if (!response.ok) throw new Error("Fout bij ophalen gebruikers");
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      toast({
        title: "Fout",
        description: "Er is een fout opgetreden bij het ophalen van de gebruikers.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (userData: Partial<User>) => {
    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      if (!response.ok) throw new Error("Fout bij aanmaken gebruiker");
      await fetchUsers();
      toast({
        title: "Succes",
        description: "Gebruiker succesvol aangemaakt.",
      });
    } catch (error) {
      toast({
        title: "Fout",
        description: "Er is een fout opgetreden bij het aanmaken van de gebruiker.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateUser = async (id: string, userData: Partial<User>) => {
    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      if (!response.ok) throw new Error("Fout bij bijwerken gebruiker");
      await fetchUsers();
      toast({
        title: "Succes",
        description: "Gebruiker succesvol bijgewerkt.",
      });
    } catch (error) {
      toast({
        title: "Fout",
        description: "Er is een fout opgetreden bij het bijwerken van de gebruiker.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Weet je zeker dat je deze gebruiker wilt verwijderen?")) return;
    
    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Fout bij verwijderen gebruiker");
      await fetchUsers();
      toast({
        title: "Succes",
        description: "Gebruiker succesvol verwijderd.",
      });
    } catch (error) {
      toast({
        title: "Fout",
        description: "Er is een fout opgetreden bij het verwijderen van de gebruiker.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div>Laden...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gebruikersbeheer</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Nieuwe Gebruiker</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nieuwe Gebruiker Aanmaken</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleCreateUser({
                  email: formData.get("email") as string,
                  name: formData.get("name") as string,
                  role: formData.get("role") as string,
                });
              }}
              className="space-y-4"
            >
              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" name="email" type="email" required />
              </div>
              <div>
                <Label htmlFor="name">Naam</Label>
                <Input id="name" name="name" required />
              </div>
              <div>
                <Label htmlFor="role">Rol</Label>
                <Select name="role" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecteer een rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Gebruiker</SelectItem>
                    <SelectItem value="admin">Administrator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit">Aanmaken</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Naam</TableHead>
            <TableHead>E-mail</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead>Aangemaakt op</TableHead>
            <TableHead>Acties</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        Bewerken
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Gebruiker Bewerken</DialogTitle>
                      </DialogHeader>
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          const formData = new FormData(e.currentTarget);
                          handleUpdateUser(user.id, {
                            name: formData.get("name") as string,
                            role: formData.get("role") as string,
                          });
                        }}
                        className="space-y-4"
                      >
                        <div>
                          <Label htmlFor="name">Naam</Label>
                          <Input
                            id="name"
                            name="name"
                            defaultValue={user.name}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="role">Rol</Label>
                          <Select name="role" defaultValue={user.role} required>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">Gebruiker</SelectItem>
                              <SelectItem value="admin">Administrator</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button type="submit">Bijwerken</Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteUser(user.id)}
                  >
                    Verwijderen
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 