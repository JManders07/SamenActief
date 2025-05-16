import { Pool } from '@neondatabase/serverless';
import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Laad .env bestand
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
config({ path: path.resolve(__dirname, ".env") });

// Database connection
const DATABASE_URL = process.env.DATABASE_URL;

// Controleer of de DATABASE_URL is ingesteld
if (!DATABASE_URL) {
  throw new Error("DATABASE_URL moet worden ingesteld in het .env bestand");
}

const pool = new Pool({
  connectionString: DATABASE_URL,
});

async function createSessionsTable() {
  console.log("Aanmaken van de sessietabel...");
  
  try {
    const client = await pool.connect();
    
    try {
      // Create the session table based on https://github.com/voxpelli/node-connect-pg-simple#table-setup
      await client.query(`
        CREATE TABLE IF NOT EXISTS "user_sessions" (
          "sid" varchar NOT NULL COLLATE "default",
          "sess" json NOT NULL,
          "expire" timestamp(6) NOT NULL
        )
        WITH (OIDS=FALSE);
      `);
      
      await client.query(`
        ALTER TABLE "user_sessions" ADD CONSTRAINT "session_pkey" 
        PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;
      `);
      
      await client.query(`
        CREATE INDEX IF NOT EXISTS "IDX_session_expire" 
        ON "user_sessions" ("expire");
      `);

      console.log("Sessietabel succesvol aangemaakt!");
    } catch (error) {
      console.error("Fout bij aanmaken sessietabel:", error);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Database connectie fout:", error);
  } finally {
    await pool.end();
  }
}

// Voer de functie uit
createSessionsTable(); 