import { db } from "./db";
import { dataBreaches, affectedUsers, dataRetentionRules, dataRetentionLogs, users } from "@shared/schema";
import { sql } from "drizzle-orm";
import bcrypt from "bcrypt";

async function migrateAVG() {
  console.log("Starting AVG-related database migrations...");

  try {
    // Maak een admin gebruiker aan als deze nog niet bestaat
    const [existingAdmin] = await db.select().from(users).where(sql`role = 'center_admin'`).limit(1);
    
    let adminId: number;
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      const [admin] = await db.insert(users).values({
        username: "admin",
        password: hashedPassword,
        displayName: "Administrator",
        phone: "0612345678",
        village: "Eindhoven",
        neighborhood: "Centrum",
        role: "center_admin",
      }).returning();
      adminId = admin.id;
      console.log("Admin user created with ID:", adminId);
    } else {
      adminId = existingAdmin.id;
      console.log("Using existing admin user with ID:", adminId);
    }

    // Maak de datalekken tabel
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS data_breaches (
        id SERIAL PRIMARY KEY,
        description TEXT NOT NULL,
        affected_users INTEGER NOT NULL DEFAULT 0,
        severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
        detected_at TIMESTAMP NOT NULL,
        measures TEXT NOT NULL,
        reported_by INTEGER NOT NULL REFERENCES users(id),
        status TEXT NOT NULL DEFAULT 'reported' CHECK (status IN ('reported', 'investigating', 'contained', 'resolved')),
        resolution TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Maak de affected_users tabel
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS affected_users (
        id SERIAL PRIMARY KEY,
        breach_id INTEGER NOT NULL REFERENCES data_breaches(id),
        user_id INTEGER NOT NULL REFERENCES users(id),
        notified BOOLEAN NOT NULL DEFAULT FALSE,
        notified_at TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Maak de indexes voor datalekken
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_data_breaches_status ON data_breaches(status)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_data_breaches_severity ON data_breaches(severity)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_affected_users_breach ON affected_users(breach_id)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_affected_users_user ON affected_users(user_id)`);

    // Maak de data retention regels tabel
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS data_retention_rules (
        id SERIAL PRIMARY KEY,
        data_type TEXT NOT NULL,
        retention_period INTEGER NOT NULL,
        description TEXT NOT NULL,
        legal_basis TEXT NOT NULL,
        created_by INTEGER NOT NULL REFERENCES users(id),
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Maak de data retention logs tabel
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS data_retention_logs (
        id SERIAL PRIMARY KEY,
        rule_id INTEGER NOT NULL REFERENCES data_retention_rules(id),
        data_type TEXT NOT NULL,
        records_deleted INTEGER NOT NULL DEFAULT 0,
        execution_time TIMESTAMP NOT NULL
      )
    `);

    // Maak de indexes voor data retention
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_retention_rules_type ON data_retention_rules(data_type)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_retention_logs_time ON data_retention_logs(execution_time)`);

    // Voeg standaard retention regels toe
    await db.execute(sql`
      INSERT INTO data_retention_rules (data_type, retention_period, description, legal_basis, created_by)
      VALUES 
        ('user_activity', 365, 'Gebruikersactiviteit logs', 'Wettelijke verplichting voor boekhouding', ${adminId}),
        ('login_history', 90, 'Login geschiedenis', 'Beveiliging en fraudepreventie', ${adminId}),
        ('messages', 730, 'Gebruikersberichten', 'Consent van gebruiker', ${adminId})
      ON CONFLICT DO NOTHING
    `);

    console.log("AVG-related migrations completed successfully!");
  } catch (error) {
    console.error("AVG-related migrations failed:", error);
    throw error;
  }
}

// Voer de migraties uit
migrateAVG().catch(console.error); 