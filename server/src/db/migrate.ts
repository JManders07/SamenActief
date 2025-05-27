import { sql } from "@vercel/postgres";
import { drizzle } from "drizzle-orm/vercel-postgres";
import { migrate } from "drizzle-orm/vercel-postgres/migrator";
import { config } from "dotenv";

config();

async function main() {
  const db = drizzle(sql);
  
  console.log("Start database migratie...");
  
  await migrate(db, { migrationsFolder: "drizzle" });
  
  console.log("Database migratie voltooid!");
  
  process.exit(0);
}

main().catch((err) => {
  console.error("Fout bij database migratie:", err);
  process.exit(1);
}); 