import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Laad .env bestand
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
config({ path: path.resolve(__dirname, "..", ".env") });

// Configure WebSocket for Neon serverless
neonConfig.webSocketConstructor = ws;

// Haal database URL uit environment variables
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error(
    "DATABASE_URL moet worden ingesteld in het .env bestand",
  );
}

// Create the connection pool
export const pool = new Pool({ connectionString: DATABASE_URL });

// Create the drizzle database instance
export const db = drizzle(pool, { schema });