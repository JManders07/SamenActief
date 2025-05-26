import { Router } from "express";
import { db } from "../db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { authenticateAdmin } from "../middleware/auth";
import { hash } from "bcrypt";

const router = Router();

// Middleware om te controleren of de gebruiker een admin is
router.use(authenticateAdmin);

// Gebruikers routes
router.get("/users", async (req, res) => {
  try {
    const users = await db.query.users.findMany({
      orderBy: [desc(db.users.createdAt)],
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Fout bij het ophalen van gebruikers" });
  }
});

router.post("/users", async (req, res) => {
  try {
    const { email, password, name, role, phone, village, neighborhood } = req.body;
    const hashedPassword = await hash(password, 10);
    
    const user = await db.insert(db.users).values({
      email,
      password: hashedPassword,
      name,
      role,
      phone,
      village,
      neighborhood,
    }).returning();
    
    res.json(user[0]);
  } catch (error) {
    res.status(500).json({ error: "Fout bij het aanmaken van gebruiker" });
  }
});

// Buurthuizen routes
router.get("/centers", async (req, res) => {
  try {
    const centers = await db.query.centers.findMany({
      orderBy: [desc(db.centers.createdAt)],
    });
    res.json(centers);
  } catch (error) {
    res.status(500).json({ error: "Fout bij het ophalen van buurthuizen" });
  }
});

router.post("/centers", async (req, res) => {
  try {
    const center = await db.insert(db.centers).values(req.body).returning();
    res.json(center[0]);
  } catch (error) {
    res.status(500).json({ error: "Fout bij het aanmaken van buurthuis" });
  }
});

// Activiteiten routes
router.get("/activities", async (req, res) => {
  try {
    const activities = await db.query.activities.findMany({
      with: {
        center: true,
      },
      orderBy: [desc(db.activities.date)],
    });
    res.json(activities);
  } catch (error) {
    res.status(500).json({ error: "Fout bij het ophalen van activiteiten" });
  }
});

router.post("/activities", async (req, res) => {
  try {
    const activity = await db.insert(db.activities).values(req.body).returning();
    res.json(activity[0]);
  } catch (error) {
    res.status(500).json({ error: "Fout bij het aanmaken van activiteit" });
  }
});

// Statistieken route
router.get("/stats", async (req, res) => {
  try {
    const [
      totalUsers,
      newUsersThisMonth,
      totalCenters,
      activeCenters,
      totalActivities,
      upcomingActivities,
      totalRegistrations,
      registrationsThisMonth,
      popularActivities,
      popularCenters,
    ] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(db.users),
      db.select({ count: sql<number>`count(*)` })
        .from(db.users)
        .where(sql`created_at >= date_trunc('month', current_date)`),
      db.select({ count: sql<number>`count(*)` }).from(db.centers),
      db.select({ count: sql<number>`count(*)` })
        .from(db.centers)
        .where(eq(db.centers.status, "active")),
      db.select({ count: sql<number>`count(*)` }).from(db.activities),
      db.select({ count: sql<number>`count(*)` })
        .from(db.activities)
        .where(sql`date >= current_date`),
      db.select({ count: sql<number>`count(*)` }).from(db.registrations),
      db.select({ count: sql<number>`count(*)` })
        .from(db.registrations)
        .where(sql`created_at >= date_trunc('month', current_date)`),
      db.select({
        id: db.activities.id,
        title: db.activities.title,
        registrations: sql<number>`count(${db.registrations.id})`,
      })
        .from(db.activities)
        .leftJoin(db.registrations, eq(db.registrations.activityId, db.activities.id))
        .groupBy(db.activities.id)
        .orderBy(desc(sql`count(${db.registrations.id})`))
        .limit(5),
      db.select({
        id: db.centers.id,
        name: db.centers.name,
        activities: sql<number>`count(${db.activities.id})`,
      })
        .from(db.centers)
        .leftJoin(db.activities, eq(db.activities.centerId, db.centers.id))
        .groupBy(db.centers.id)
        .orderBy(desc(sql`count(${db.activities.id})`))
        .limit(5),
    ]);

    res.json({
      totalUsers: totalUsers[0].count,
      newUsersThisMonth: newUsersThisMonth[0].count,
      totalCenters: totalCenters[0].count,
      activeCenters: activeCenters[0].count,
      totalActivities: totalActivities[0].count,
      upcomingActivities: upcomingActivities[0].count,
      totalRegistrations: totalRegistrations[0].count,
      registrationsThisMonth: registrationsThisMonth[0].count,
      popularActivities,
      popularCenters,
    });
  } catch (error) {
    res.status(500).json({ error: "Fout bij het ophalen van statistieken" });
  }
});

// Notificaties routes
router.get("/notifications", async (req, res) => {
  try {
    const notifications = await db.query.notifications.findMany({
      orderBy: [desc(db.notifications.createdAt)],
    });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: "Fout bij het ophalen van notificaties" });
  }
});

router.post("/notifications", async (req, res) => {
  try {
    const notification = await db.insert(db.notifications).values(req.body).returning();
    res.json(notification[0]);
  } catch (error) {
    res.status(500).json({ error: "Fout bij het aanmaken van notificatie" });
  }
});

// E-mail templates routes
router.get("/email-templates", async (req, res) => {
  try {
    const templates = await db.query.emailTemplates.findMany({
      orderBy: [desc(db.emailTemplates.createdAt)],
    });
    res.json(templates);
  } catch (error) {
    res.status(500).json({ error: "Fout bij het ophalen van e-mail templates" });
  }
});

router.post("/email-templates", async (req, res) => {
  try {
    const template = await db.insert(db.emailTemplates).values(req.body).returning();
    res.json(template[0]);
  } catch (error) {
    res.status(500).json({ error: "Fout bij het aanmaken van e-mail template" });
  }
});

// Logs route
router.get("/logs", async (req, res) => {
  try {
    const { level, category, search } = req.query;
    
    let query = db.select().from(db.logs);
    
    if (level && level !== "all") {
      query = query.where(eq(db.logs.level, level as string));
    }
    
    if (category && category !== "all") {
      query = query.where(eq(db.logs.category, category as string));
    }
    
    if (search) {
      query = query.where(sql`message ILIKE ${`%${search}%`}`);
    }
    
    const logs = await query.orderBy(desc(db.logs.createdAt));
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: "Fout bij het ophalen van logs" });
  }
});

export default router; 