import { storage } from "../server/storage";
import { hashPassword } from "../server/utils";
import readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function createAdmin() {
  try {
    console.log("Maak een nieuwe admin gebruiker aan:");
    
    const username = await question("Gebruikersnaam: ");
    const password = await question("Wachtwoord: ");
    const displayName = await question("Weergavenaam: ");
    const email = await question("E-mail: ");

    // Controleer of de gebruikersnaam al bestaat
    const existingUser = await storage.getUserByUsername(username);
    if (existingUser) {
      console.error("Deze gebruikersnaam bestaat al!");
      process.exit(1);
    }

    // Maak de admin gebruiker aan
    const admin = await storage.createAdminUser({
      username,
      password,
      displayName,
      email
    });

    console.log("\nAdmin gebruiker succesvol aangemaakt!");
    console.log("Gebruikersnaam:", admin.username);
    console.log("Weergavenaam:", admin.display_name);
    console.log("E-mail:", admin.email);
    console.log("Rol:", admin.role);

  } catch (error) {
    console.error("Er is een fout opgetreden:", error);
  } finally {
    rl.close();
  }
}

function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

createAdmin(); 