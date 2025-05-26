import { Router } from "express";
import { z } from "zod";
import { db } from "../storage";
import { authenticateToken } from "../middleware/auth";
import { sendEmail } from "../lib/email";

const router = Router();

// Schema voor datalek rapportage
const dataBreachSchema = z.object({
  description: z.string().min(10),
  affectedUsers: z.number().optional(),
  severity: z.enum(["low", "medium", "high", "critical"]),
  detectedAt: z.string().datetime(),
  measures: z.string().min(10),
});

// Endpoint voor het rapporteren van een datalek
router.post("/report", authenticateToken, async (req, res) => {
  try {
    const dataBreach = dataBreachSchema.parse(req.body);
    
    // Sla het datalek op in de database
    const result = await db.query(
      `INSERT INTO data_breaches (
        description,
        affected_users,
        severity,
        detected_at,
        measures,
        reported_by,
        status
      ) VALUES (?, ?, ?, ?, ?, ?, 'reported')`,
      [
        dataBreach.description,
        dataBreach.affectedUsers || 0,
        dataBreach.severity,
        dataBreach.detectedAt,
        dataBreach.measures,
        req.user.id,
      ]
    );

    // Stuur notificatie naar beheerders
    const admins = await db.query(
      "SELECT email FROM users WHERE role = 'admin'"
    );

    for (const admin of admins) {
      await sendEmail({
        to: admin.email,
        subject: "Datalek gerapporteerd",
        text: `Er is een nieuw datalek gerapporteerd:\n\n` +
          `Beschrijving: ${dataBreach.description}\n` +
          `Ernst: ${dataBreach.severity}\n` +
          `Aangetroffen op: ${dataBreach.detectedAt}\n` +
          `Getroffen maatregelen: ${dataBreach.measures}\n\n` +
          `Log in op het beheerderspaneel voor meer informatie.`,
      });
    }

    res.status(201).json({
      message: "Datalek succesvol gerapporteerd",
      id: result.insertId,
    });
  } catch (error) {
    console.error("Fout bij rapporteren datalek:", error);
    res.status(400).json({
      error: "Ongeldige datalek rapportage",
    });
  }
});

// Endpoint voor het ophalen van alle datalekken
router.get("/", authenticateToken, async (req, res) => {
  try {
    const dataBreaches = await db.query(
      `SELECT 
        db.*,
        u.email as reported_by_email
      FROM data_breaches db
      LEFT JOIN users u ON db.reported_by = u.id
      ORDER BY db.detected_at DESC`
    );

    res.json(dataBreaches);
  } catch (error) {
    console.error("Fout bij ophalen datalekken:", error);
    res.status(500).json({
      error: "Fout bij ophalen datalekken",
    });
  }
});

// Endpoint voor het bijwerken van de status van een datalek
router.patch("/:id/status", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, resolution } = req.body;

    if (!["investigating", "contained", "resolved"].includes(status)) {
      return res.status(400).json({
        error: "Ongeldige status",
      });
    }

    await db.query(
      `UPDATE data_breaches 
       SET status = ?, resolution = ?, updated_at = NOW()
       WHERE id = ?`,
      [status, resolution, id]
    );

    // Als het datalek is opgelost, stuur notificatie naar getroffen gebruikers
    if (status === "resolved") {
      const dataBreach = await db.query(
        "SELECT * FROM data_breaches WHERE id = ?",
        [id]
      );

      if (dataBreach.affectedUsers > 0) {
        const affectedUsers = await db.query(
          "SELECT email FROM users WHERE id IN (SELECT user_id FROM affected_users WHERE breach_id = ?)",
          [id]
        );

        for (const user of affectedUsers) {
          await sendEmail({
            to: user.email,
            subject: "Update over datalek",
            text: `Beste gebruiker,\n\n` +
              `We willen u informeren dat het eerder gerapporteerde datalek is opgelost.\n\n` +
              `Oplossing: ${resolution}\n\n` +
              `Als u nog vragen heeft, neem dan contact met ons op.\n\n` +
              `Met vriendelijke groet,\n` +
              `Het SamenActief Team`,
          });
        }
      }
    }

    res.json({
      message: "Status succesvol bijgewerkt",
    });
  } catch (error) {
    console.error("Fout bij bijwerken status:", error);
    res.status(500).json({
      error: "Fout bij bijwerken status",
    });
  }
});

export default router; 