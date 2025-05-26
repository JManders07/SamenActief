import { Router } from "express";
import { z } from "zod";
import { db } from "../storage";
import { authenticateToken } from "../middleware/auth";
import { sendEmail } from "../lib/email";

const router = Router();

// Schema voor data retention regels
const retentionRuleSchema = z.object({
  dataType: z.string(),
  retentionPeriod: z.number(), // in dagen
  description: z.string(),
  legalBasis: z.string(),
});

// Endpoint voor het toevoegen van een retention regel
router.post("/rules", authenticateToken, async (req, res) => {
  try {
    const rule = retentionRuleSchema.parse(req.body);
    
    await db.query(
      `INSERT INTO data_retention_rules (
        data_type,
        retention_period,
        description,
        legal_basis,
        created_by
      ) VALUES (?, ?, ?, ?, ?)`,
      [
        rule.dataType,
        rule.retentionPeriod,
        rule.description,
        rule.legalBasis,
        req.user.id,
      ]
    );

    res.status(201).json({
      message: "Retention regel succesvol toegevoegd",
    });
  } catch (error) {
    console.error("Fout bij toevoegen retention regel:", error);
    res.status(400).json({
      error: "Ongeldige retention regel",
    });
  }
});

// Endpoint voor het ophalen van alle retention regels
router.get("/rules", authenticateToken, async (req, res) => {
  try {
    const rules = await db.query(
      `SELECT * FROM data_retention_rules ORDER BY data_type`
    );
    res.json(rules);
  } catch (error) {
    console.error("Fout bij ophalen retention regels:", error);
    res.status(500).json({
      error: "Fout bij ophalen retention regels",
    });
  }
});

// Functie voor het uitvoeren van data retention cleanup
async function performDataRetentionCleanup() {
  try {
    // Haal alle retention regels op
    const rules = await db.query("SELECT * FROM data_retention_rules");
    
    for (const rule of rules) {
      // Bereken de datum waarop data moet worden verwijderd
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - rule.retention_period);

      // Verwijder verouderde data op basis van het type
      switch (rule.data_type) {
        case "user_activity":
          await db.query(
            `DELETE FROM user_activity 
             WHERE created_at < ?`,
            [cutoffDate]
          );
          break;
        
        case "login_history":
          await db.query(
            `DELETE FROM login_history 
             WHERE login_time < ?`,
            [cutoffDate]
          );
          break;
        
        case "messages":
          await db.query(
            `DELETE FROM messages 
             WHERE created_at < ?`,
            [cutoffDate]
          );
          break;
        
        // Voeg hier meer data types toe indien nodig
      }

      // Log de cleanup actie
      await db.query(
        `INSERT INTO data_retention_logs (
          rule_id,
          data_type,
          records_deleted,
          execution_time
        ) VALUES (?, ?, ?, NOW())`,
        [rule.id, rule.data_type, 0] // TODO: Voeg aantal verwijderde records toe
      );
    }
  } catch (error) {
    console.error("Fout bij uitvoeren data retention cleanup:", error);
    // Stuur notificatie naar beheerders bij fouten
    const admins = await db.query(
      "SELECT email FROM users WHERE role = 'admin'"
    );

    for (const admin of admins) {
      await sendEmail({
        to: admin.email,
        subject: "Fout bij data retention cleanup",
        text: `Er is een fout opgetreden tijdens de data retention cleanup:\n\n${error.message}`,
      });
    }
  }
}

// Endpoint voor handmatige uitvoering van data retention cleanup
router.post("/cleanup", authenticateToken, async (req, res) => {
  try {
    // Controleer of gebruiker admin is
    if (req.user.role !== "admin") {
      return res.status(403).json({
        error: "Geen toegang tot deze functionaliteit",
      });
    }

    // Voer cleanup uit
    await performDataRetentionCleanup();

    res.json({
      message: "Data retention cleanup succesvol uitgevoerd",
    });
  } catch (error) {
    console.error("Fout bij handmatige cleanup:", error);
    res.status(500).json({
      error: "Fout bij uitvoeren cleanup",
    });
  }
});

// Endpoint voor het ophalen van cleanup logs
router.get("/logs", authenticateToken, async (req, res) => {
  try {
    const logs = await db.query(
      `SELECT 
        l.*,
        r.data_type,
        r.retention_period
      FROM data_retention_logs l
      JOIN data_retention_rules r ON l.rule_id = r.id
      ORDER BY l.execution_time DESC
      LIMIT 100`
    );
    res.json(logs);
  } catch (error) {
    console.error("Fout bij ophalen cleanup logs:", error);
    res.status(500).json({
      error: "Fout bij ophalen logs",
    });
  }
});

export default router; 