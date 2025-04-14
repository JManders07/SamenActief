var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express3 from "express";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  activities: () => activities,
  activityImages: () => activityImages,
  carpoolPassengers: () => carpoolPassengers,
  carpools: () => carpools,
  centers: () => centers,
  insertActivitySchema: () => insertActivitySchema,
  insertCarpoolPassengerSchema: () => insertCarpoolPassengerSchema,
  insertCarpoolSchema: () => insertCarpoolSchema,
  insertCenterSchema: () => insertCenterSchema,
  insertRegistrationSchema: () => insertRegistrationSchema,
  insertReminderSchema: () => insertReminderSchema,
  insertUserSchema: () => insertUserSchema,
  insertWaitlistSchema: () => insertWaitlistSchema,
  registrations: () => registrations,
  reminders: () => reminders,
  roleEnum: () => roleEnum,
  updateActivitySchema: () => updateActivitySchema,
  users: () => users,
  waitlist: () => waitlist
});
import { pgTable, text, serial, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var roleEnum = pgEnum("role", ["user", "center_admin"]);
var activityImages = pgTable("activity_images", {
  id: serial("id").primaryKey(),
  activityId: integer("activity_id").notNull(),
  imageUrl: text("image_url").notNull(),
  order: integer("order").notNull().default(0)
});
var updateActivitySchema = z.object({
  name: z.string().min(3),
  description: z.string().min(10),
  imageUrl: z.string().url(),
  date: z.string().refine((str) => !isNaN(Date.parse(str)), {
    message: "Invalid date format"
  }).transform((str) => new Date(str)),
  capacity: z.number().int().positive(),
  materialsNeeded: z.string().optional(),
  facilitiesAvailable: z.string().optional()
});
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name").notNull(),
  phone: text("phone").notNull(),
  village: text("village").notNull(),
  neighborhood: text("neighborhood").notNull(),
  anonymousParticipation: boolean("anonymous_participation").notNull().default(false),
  role: roleEnum("role").notNull().default("user")
});
var centers = pgTable("centers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  adminId: integer("admin_id").notNull(),
  village: text("village").notNull()
});
var activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  centerId: integer("center_id").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  date: timestamp("date").notNull(),
  capacity: integer("capacity").notNull(),
  materialsNeeded: text("materials_needed"),
  facilitiesAvailable: text("facilities_available")
});
var registrations = pgTable("registrations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  activityId: integer("activity_id").notNull()
});
var waitlist = pgTable("waitlist", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  activityId: integer("activity_id").notNull(),
  registrationDate: timestamp("registration_date").notNull().defaultNow()
});
var reminders = pgTable("reminders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  activityId: integer("activity_id").notNull(),
  reminderDate: timestamp("reminder_date").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").notNull().default(false)
});
var carpools = pgTable("carpools", {
  id: serial("id").primaryKey(),
  activityId: integer("activity_id").notNull(),
  driverId: integer("driver_id").notNull(),
  departureLocation: text("departure_location").notNull(),
  departureTime: timestamp("departure_time").notNull(),
  availableSeats: integer("available_seats").notNull()
});
var carpoolPassengers = pgTable("carpool_passengers", {
  id: serial("id").primaryKey(),
  carpoolId: integer("carpool_id").notNull(),
  passengerId: integer("passenger_id").notNull()
});
var insertReminderSchema = createInsertSchema(reminders);
var insertWaitlistSchema = createInsertSchema(waitlist);
var insertCarpoolSchema = createInsertSchema(carpools);
var insertCarpoolPassengerSchema = createInsertSchema(carpoolPassengers);
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  displayName: true,
  phone: true,
  village: true,
  neighborhood: true,
  anonymousParticipation: true,
  role: true
});
var insertCenterSchema = createInsertSchema(centers);
var insertActivitySchema = createInsertSchema(activities).extend({
  date: z.string().refine((str) => !isNaN(Date.parse(str)), {
    message: "Invalid date format"
  }).transform((str) => new Date(str)),
  images: z.array(z.object({
    imageUrl: z.string(),
    order: z.number()
  })).optional(),
  materialsNeeded: z.string().optional(),
  facilitiesAvailable: z.string().optional()
});
var insertRegistrationSchema = createInsertSchema(registrations);

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
config({ path: path.resolve(__dirname, "..", ".env") });
neonConfig.webSocketConstructor = ws;
var DATABASE_URL = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_hGLq6WZ1cRAb@ep-nameless-leaf-a9z0109h-pooler.gwc.azure.neon.tech/neondb?sslmode=require";
if (!DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({ connectionString: DATABASE_URL });
var db = drizzle(pool, { schema: schema_exports });

// server/storage.ts
import { eq, and } from "drizzle-orm";
var DatabaseStorage = class {
  async getUser(id) {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user;
    } catch (error) {
      console.error("Error in getUser:", error);
      throw error;
    }
  }
  async getUserByUsername(username) {
    try {
      const [user] = await db.select().from(users).where(eq(users.username, username));
      return user;
    } catch (error) {
      console.error("Error in getUserByUsername:", error);
      throw error;
    }
  }
  async createUser(insertUser) {
    try {
      const [user] = await db.insert(users).values(insertUser).returning();
      return user;
    } catch (error) {
      console.error("Error in createUser:", error);
      throw error;
    }
  }
  async getCenters(village) {
    try {
      if (village) {
        return await db.select().from(centers).where(eq(centers.village, village));
      }
      return await db.select().from(centers);
    } catch (error) {
      console.error("Error in getCenters:", error);
      throw error;
    }
  }
  async getCenter(id) {
    try {
      const [center] = await db.select().from(centers).where(eq(centers.id, id));
      return center;
    } catch (error) {
      console.error("Error in getCenter:", error);
      throw error;
    }
  }
  async createCenter(insertCenter) {
    try {
      console.log("Creating center with data:", insertCenter);
      const [center] = await db.insert(centers).values(insertCenter).returning();
      console.log("Created center:", center);
      return center;
    } catch (error) {
      console.error("Error in createCenter:", error);
      throw error;
    }
  }
  async updateCenter(id, data) {
    try {
      const [center] = await db.update(centers).set(data).where(eq(centers.id, id)).returning();
      return center;
    } catch (error) {
      console.error("Error in updateCenter:", error);
      throw error;
    }
  }
  async getCentersByAdmin(adminId) {
    try {
      console.log("Getting centers for admin:", adminId);
      const results = await db.select().from(centers).where(eq(centers.adminId, adminId));
      console.log("Found centers:", results);
      return results;
    } catch (error) {
      console.error("Error in getCentersByAdmin:", error);
      throw error;
    }
  }
  async getActivities(centerId) {
    try {
      if (centerId) {
        return await db.select().from(activities).where(eq(activities.centerId, centerId));
      }
      return await db.select().from(activities);
    } catch (error) {
      console.error("Error in getActivities:", error);
      throw error;
    }
  }
  async getActivity(id) {
    try {
      const [activity] = await db.select().from(activities).where(eq(activities.id, id));
      return activity;
    } catch (error) {
      console.error("Error in getActivity:", error);
      throw error;
    }
  }
  async createActivity(data) {
    if (data.imageUrl === "") {
      data.imageUrl = "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3";
    }
    try {
      const [activity] = await db.insert(activities).values(data).returning();
      return activity;
    } catch (error) {
      console.error("Error in createActivity:", error);
      throw error;
    }
  }
  async updateActivity(id, updates) {
    try {
      const updatesWithFormattedDate = { ...updates };
      console.log("Updating activity with data:", updatesWithFormattedDate);
      const result = await db.update(activities).set(updatesWithFormattedDate).where(eq(activities.id, id)).returning();
      return result[0];
    } catch (error) {
      console.error("Error in updateActivity:", error);
      throw error;
    }
  }
  async deleteActivity(id) {
    try {
      await db.delete(activities).where(eq(activities.id, id));
    } catch (error) {
      console.error("Error in deleteActivity:", error);
      throw error;
    }
  }
  async getRegistrations(activityId) {
    try {
      return await db.select().from(registrations).where(eq(registrations.activityId, activityId));
    } catch (error) {
      console.error("Error in getRegistrations:", error);
      throw error;
    }
  }
  async getRegistrationsByUser(userId) {
    try {
      return await db.select().from(registrations).where(eq(registrations.userId, userId));
    } catch (error) {
      console.error("Error in getRegistrationsByUser:", error);
      throw error;
    }
  }
  async createRegistration(insertRegistration) {
    try {
      const [registration] = await db.insert(registrations).values(insertRegistration).returning();
      return registration;
    } catch (error) {
      console.error("Error in createRegistration:", error);
      throw error;
    }
  }
  async deleteRegistration(userId, activityId) {
    try {
      await db.delete(registrations).where(
        and(
          eq(registrations.userId, userId),
          eq(registrations.activityId, activityId)
        )
      );
    } catch (error) {
      console.error("Error in deleteRegistration:", error);
      throw error;
    }
  }
  async updateUser(id, data) {
    try {
      const [user] = await db.update(users).set(data).where(eq(users.id, id)).returning();
      return user;
    } catch (error) {
      console.error("Error in updateUser:", error);
      throw error;
    }
  }
  // Reminder methods
  async getRemindersByUser(userId) {
    try {
      return await db.select().from(reminders).where(eq(reminders.userId, userId));
    } catch (error) {
      console.error("Error in getRemindersByUser:", error);
      throw error;
    }
  }
  async createReminder(reminder) {
    try {
      const [newReminder] = await db.insert(reminders).values(reminder).returning();
      return newReminder;
    } catch (error) {
      console.error("Error in createReminder:", error);
      throw error;
    }
  }
  async updateReminder(id, data) {
    try {
      const [updatedReminder] = await db.update(reminders).set(data).where(eq(reminders.id, id)).returning();
      return updatedReminder;
    } catch (error) {
      console.error("Error in updateReminder:", error);
      throw error;
    }
  }
  async deleteReminder(id) {
    try {
      await db.delete(reminders).where(eq(reminders.id, id));
    } catch (error) {
      console.error("Error in deleteReminder:", error);
      throw error;
    }
  }
  async getUpcomingReminders(userId) {
    try {
      const now = /* @__PURE__ */ new Date();
      return await db.select().from(reminders).where(
        and(
          eq(reminders.userId, userId),
          eq(reminders.isRead, false)
        )
      );
    } catch (error) {
      console.error("Error in getUpcomingReminders:", error);
      throw error;
    }
  }
  // Waitlist methods
  async getWaitlist(activityId) {
    try {
      return await db.select().from(waitlist).where(eq(waitlist.activityId, activityId));
    } catch (error) {
      console.error("Error in getWaitlist:", error);
      throw error;
    }
  }
  async addToWaitlist(waitlistEntry) {
    try {
      const [entry] = await db.insert(waitlist).values(waitlistEntry).returning();
      return entry;
    } catch (error) {
      console.error("Error in addToWaitlist:", error);
      throw error;
    }
  }
  async removeFromWaitlist(userId, activityId) {
    try {
      await db.delete(waitlist).where(
        and(
          eq(waitlist.userId, userId),
          eq(waitlist.activityId, activityId)
        )
      );
    } catch (error) {
      console.error("Error in removeFromWaitlist:", error);
      throw error;
    }
  }
  async getWaitlistPosition(userId, activityId) {
    try {
      const waitlistEntries = await this.getWaitlist(activityId);
      const position = waitlistEntries.findIndex((entry) => entry.userId === userId);
      return position === -1 ? -1 : position + 1;
    } catch (error) {
      console.error("Error in getWaitlistPosition:", error);
      throw error;
    }
  }
  // Carpool methods
  async getCarpools(activityId) {
    try {
      return await db.select().from(carpools).where(eq(carpools.activityId, activityId));
    } catch (error) {
      console.error("Error in getCarpools:", error);
      throw error;
    }
  }
  async createCarpool(carpool) {
    try {
      const [newCarpool] = await db.insert(carpools).values(carpool).returning();
      return newCarpool;
    } catch (error) {
      console.error("Error in createCarpool:", error);
      throw error;
    }
  }
  async updateCarpool(id, data) {
    try {
      const [carpool] = await db.update(carpools).set(data).where(eq(carpools.id, id)).returning();
      return carpool;
    } catch (error) {
      console.error("Error in updateCarpool:", error);
      throw error;
    }
  }
  async deleteCarpool(id) {
    try {
      await db.delete(carpools).where(eq(carpools.id, id));
    } catch (error) {
      console.error("Error in deleteCarpool:", error);
      throw error;
    }
  }
  async addPassenger(passenger) {
    try {
      const [newPassenger] = await db.insert(carpoolPassengers).values(passenger).returning();
      return newPassenger;
    } catch (error) {
      console.error("Error in addPassenger:", error);
      throw error;
    }
  }
  async removePassenger(carpoolId, passengerId) {
    try {
      await db.delete(carpoolPassengers).where(
        and(
          eq(carpoolPassengers.carpoolId, carpoolId),
          eq(carpoolPassengers.passengerId, passengerId)
        )
      );
    } catch (error) {
      console.error("Error in removePassenger:", error);
      throw error;
    }
  }
  async getCarpoolPassengers(carpoolId) {
    try {
      const passengers = await db.select().from(carpoolPassengers).where(eq(carpoolPassengers.carpoolId, carpoolId));
      const userIds = passengers.map((p) => p.passengerId);
      const users2 = await Promise.all(userIds.map((id) => this.getUser(id)));
      return users2.filter((user) => user !== void 0);
    } catch (error) {
      console.error("Error in getCarpoolPassengers:", error);
      throw error;
    }
  }
  // Activity Images methods
  async createActivityImage(image) {
    try {
      const [newImage] = await db.insert(activityImages).values(image).returning();
      return newImage;
    } catch (error) {
      console.error("Error in createActivityImage:", error);
      throw error;
    }
  }
  async getActivityImages(activityId) {
    try {
      return await db.select().from(activityImages).where(eq(activityImages.activityId, activityId)).orderBy(activityImages.order);
    } catch (error) {
      console.error("Error in getActivityImages:", error);
      throw error;
    }
  }
  async deleteActivityImage(id) {
    try {
      await db.delete(activityImages).where(eq(activityImages.id, id));
    } catch (error) {
      console.error("Error in deleteActivityImage:", error);
      throw error;
    }
  }
};
var storage = new DatabaseStorage();

// server/auth.ts
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import pgSession from "connect-pg-simple";
var scryptAsync = promisify(scrypt);
async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}
async function comparePasswords(supplied, stored) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = await scryptAsync(supplied, salt, 64);
  return timingSafeEqual(hashedBuf, suppliedBuf);
}
function setupAuth(app2) {
  const PgStore = pgSession(session);
  const sessionStore = new PgStore({
    pool,
    tableName: "user_sessions"
  });
  const sessionSettings = {
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60 * 1e3
      // 30 days
    }
  };
  app2.set("trust proxy", 1);
  app2.use(session(sessionSettings));
  app2.use(passport.initialize());
  app2.use(passport.session());
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !await comparePasswords(password, user.password)) {
          return done(null, false);
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
  app2.post("/api/register", async (req, res, next) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "Gebruikersnaam is al in gebruik" });
      }
      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password)
      });
      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (err) {
      next(err);
    }
  });
  app2.post("/api/login", passport.authenticate("local"), (req, res) => {
    res.json(req.user);
  });
  app2.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });
  app2.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });
}

// server/email.ts
import { MailService } from "@sendgrid/mail";
var mailService = new MailService();
var FROM_EMAIL = "w.kastelijn@student.fontys.nl";
function initializeEmailService(apiKey, fromEmail) {
  mailService.setApiKey(apiKey);
  if (fromEmail) {
    FROM_EMAIL = fromEmail;
  }
  console.log("Email service initialized with from address:", FROM_EMAIL);
  console.log("Testing SendGrid configuration...");
  if (!apiKey) {
    console.error("SendGrid API key is missing!");
    return;
  }
}
async function sendEmail(params) {
  try {
    console.log("Attempting to send email to:", params.to);
    console.log("From address:", FROM_EMAIL);
    const msg = {
      to: params.to,
      from: {
        email: FROM_EMAIL,
        name: "Activiteitencentrum"
      },
      subject: params.subject,
      text: params.text || "",
      html: params.html || ""
    };
    console.log("Sending email with configuration:", JSON.stringify(msg, null, 2));
    const response = await mailService.send(msg);
    console.log("SendGrid API Response:", response);
    console.log("Email sent successfully to:", params.to);
    return true;
  } catch (error) {
    console.error("SendGrid email error details:");
    console.error("Error message:", error.message);
    if (error.response) {
      console.error("SendGrid API error response:", {
        body: error.response.body,
        headers: error.response.headers,
        status: error.response.statusCode
      });
    }
    return false;
  }
}
async function sendWelcomeEmail(email, name) {
  console.log(`Sending welcome email to ${email} for ${name}`);
  return sendEmail({
    to: email,
    subject: "Welkom bij het Activiteitencentrum",
    html: `
      <h1>Welkom ${name}!</h1>
      <p>Bedankt voor het aanmaken van een account bij het Activiteitencentrum.</p>
      <p>U kunt nu deelnemen aan activiteiten en blijft op de hoogte van alles wat er gebeurt in uw buurt.</p>
      <p>Met vriendelijke groet,<br>Het Activiteitencentrum Team</p>
    `,
    text: `Welkom ${name}!

Bedankt voor het aanmaken van een account bij het Activiteitencentrum.

U kunt nu deelnemen aan activiteiten en blijft op de hoogte van alles wat er gebeurt in uw buurt.

Met vriendelijke groet,
Het Activiteitencentrum Team`
  });
}
async function sendActivityRegistrationEmail(email, name, activityName, activityDate, location) {
  console.log(`Sending activity registration email to ${email} for ${activityName}`);
  return sendEmail({
    to: email,
    subject: `Aanmelding bevestigd: ${activityName}`,
    html: `
      <h1>Aanmelding bevestigd</h1>
      <p>Beste ${name},</p>
      <p>U bent succesvol aangemeld voor de activiteit "${activityName}".</p>
      <p><strong>Details:</strong></p>
      <ul>
        <li>Datum: ${activityDate.toLocaleDateString("nl-NL", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })}</li>
        <li>Locatie: ${location}</li>
      </ul>
      <p>We kijken ernaar uit u te zien!</p>
      <p>Met vriendelijke groet,<br>Het Activiteitencentrum Team</p>
    `,
    text: `Aanmelding bevestigd

Beste ${name},

U bent succesvol aangemeld voor de activiteit "${activityName}".

Details:
- Datum: ${activityDate.toLocaleDateString("nl-NL")}
- Locatie: ${location}

We kijken ernaar uit u te zien!

Met vriendelijke groet,
Het Activiteitencentrum Team`
  });
}

// server/routes.ts
import multer from "multer";
import path2 from "path";
import { mkdir } from "fs/promises";
import express from "express";
function isCenterAdmin(req, res, next) {
  if (!req.isAuthenticated() || req.user?.role !== "center_admin") {
    return res.status(403).json({ message: "Alleen buurthuis beheerders hebben toegang tot deze functie" });
  }
  next();
}
var UPLOAD_DIR = path2.join(process.cwd(), "public", "uploads");
var storageMulter = multer.diskStorage({
  destination: async function(req, file, cb) {
    try {
      await mkdir(UPLOAD_DIR, { recursive: true });
      cb(null, UPLOAD_DIR);
    } catch (error) {
      console.error("Error creating upload directory:", error);
      cb(error, UPLOAD_DIR);
    }
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path2.extname(file.originalname));
  }
});
var upload = multer({ storage: storageMulter });
async function registerRoutes(app2) {
  const httpServer = createServer(app2);
  app2.get("/health", (req, res) => {
    res.json({ status: "ok" });
  });
  app2.use("/uploads", express.static(path2.join(process.cwd(), "public", "uploads")));
  app2.post("/api/upload", upload.single("file"), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "Geen bestand ge\xFCpload" });
    }
    console.log("File uploaded:", req.file);
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
  });
  app2.get("/api/centers/my-center", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        console.log("User not authenticated");
        return res.status(401).json({ message: "Niet ingelogd" });
      }
      if (req.user?.role !== "center_admin") {
        console.log("User not center admin:", req.user?.role);
        return res.status(403).json({ message: "Geen beheerder" });
      }
      console.log("Authenticated user:", req.user);
      const centers2 = await storage.getCentersByAdmin(req.user.id);
      console.log("Found centers:", centers2);
      if (centers2.length === 0) {
        const center = await storage.createCenter({
          name: req.user.displayName,
          address: `${req.user.neighborhood}, ${req.user.village}`,
          description: `Buurthuis ${req.user.displayName} in ${req.user.village}`,
          imageUrl: "https://images.unsplash.com/photo-1577495508048-b635879837f1?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
          adminId: req.user.id,
          village: req.user.village
        });
        console.log("Created new center:", center);
        return res.json(center);
      }
      res.json(centers2[0]);
    } catch (error) {
      console.error("Error in /api/centers/my-center:", error);
      res.status(500).json({ message: "Er is een fout opgetreden" });
    }
  });
  app2.get("/api/centers", async (req, res) => {
    const village = req.user?.village;
    const centers2 = await storage.getCenters(village);
    res.json(centers2);
  });
  app2.get("/api/centers/:id", async (req, res) => {
    const centerId = parseInt(req.params.id);
    if (isNaN(centerId)) {
      return res.status(400).json({ message: "Invalid center ID" });
    }
    const center = await storage.getCenter(centerId);
    if (!center) {
      return res.status(404).json({ message: "Buurthuis niet gevonden" });
    }
    res.json(center);
  });
  app2.post("/api/centers", isCenterAdmin, async (req, res) => {
    const result = insertCenterSchema.safeParse({
      ...req.body,
      adminId: req.user?.id,
      village: req.user?.village
    });
    if (!result.success) {
      return res.status(400).json({ message: "Ongeldige data voor buurthuis" });
    }
    const center = await storage.createCenter(result.data);
    res.status(201).json(center);
  });
  app2.put("/api/centers/:id", isCenterAdmin, async (req, res) => {
    const centerId = parseInt(req.params.id);
    if (isNaN(centerId)) {
      return res.status(400).json({ message: "Invalid center ID" });
    }
    const center = await storage.getCenter(centerId);
    if (!center) {
      return res.status(404).json({ message: "Buurthuis niet gevonden" });
    }
    if (center.adminId !== req.user?.id) {
      return res.status(403).json({ message: "U heeft geen rechten om dit buurthuis te bewerken" });
    }
    const updatedCenter = await storage.updateCenter(centerId, req.body);
    res.json(updatedCenter);
  });
  app2.get("/api/activities", async (req, res) => {
    try {
      const centerId = req.query.centerId ? parseInt(req.query.centerId) : void 0;
      if (!centerId || isNaN(centerId)) {
        return res.json([]);
      }
      const activities2 = await storage.getActivities(centerId);
      return res.json(activities2 || []);
    } catch (error) {
      console.error("Error in /api/activities:", error);
      return res.status(500).json({
        message: "Er is een fout opgetreden bij het ophalen van de activiteiten"
      });
    }
  });
  app2.post("/api/activities", isCenterAdmin, async (req, res) => {
    console.log("Received activity data:", req.body);
    const data = {
      ...req.body,
      materialsNeeded: req.body.materialsNeeded || null,
      facilitiesAvailable: req.body.facilitiesAvailable || null
    };
    const result = insertActivitySchema.safeParse(data);
    if (!result.success) {
      console.error("Validation errors:", result.error.errors);
      return res.status(400).json({
        message: "Ongeldige activiteit data",
        errors: result.error.errors
      });
    }
    const center = await storage.getCenter(result.data.centerId);
    if (!center || center.adminId !== req.user?.id) {
      return res.status(403).json({ message: "U heeft geen rechten om activiteiten toe te voegen aan dit buurthuis" });
    }
    try {
      const activity = await storage.createActivity({
        ...result.data,
        imageUrl: result.data.images?.[0]?.imageUrl || "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
      });
      if (result.data.images?.length) {
        for (const image of result.data.images) {
          await storage.createActivityImage({
            activityId: activity.id,
            imageUrl: image.imageUrl,
            order: image.order
          });
        }
      }
      console.log("Activity created successfully:", activity);
      res.status(201).json(activity);
    } catch (error) {
      console.error("Error creating activity:", error);
      res.status(500).json({ message: "Er is een fout opgetreden bij het aanmaken van de activiteit" });
    }
  });
  app2.put("/api/activities/:id", isCenterAdmin, async (req, res) => {
    const activityId = parseInt(req.params.id);
    if (isNaN(activityId)) {
      return res.status(400).json({ message: "Invalid activity ID" });
    }
    const activity = await storage.getActivity(activityId);
    if (!activity) {
      return res.status(404).json({ message: "Activiteit niet gevonden" });
    }
    const center = await storage.getCenter(activity.centerId);
    if (!center || center.adminId !== req.user?.id) {
      return res.status(403).json({ message: "U heeft geen rechten om deze activiteit te bewerken" });
    }
    const updateData = {
      ...req.body,
      date: req.body.date ? new Date(req.body.date) : void 0
    };
    const updatedActivity = await storage.updateActivity(activityId, updateData);
    res.json(updatedActivity);
  });
  app2.delete("/api/activities/:id", isCenterAdmin, async (req, res) => {
    const activityId = parseInt(req.params.id);
    if (isNaN(activityId)) {
      return res.status(400).json({ message: "Invalid activity ID" });
    }
    const activity = await storage.getActivity(activityId);
    if (!activity) {
      return res.status(404).json({ message: "Activiteit niet gevonden" });
    }
    const center = await storage.getCenter(activity.centerId);
    if (!center || center.adminId !== req.user?.id) {
      return res.status(403).json({ message: "U heeft geen rechten om deze activiteit te verwijderen" });
    }
    await storage.deleteActivity(activityId);
    res.status(204).send();
  });
  app2.get("/api/activities/:id", async (req, res) => {
    const activityId = parseInt(req.params.id);
    if (isNaN(activityId)) {
      return res.status(400).json({ message: "Ongeldige activiteit ID" });
    }
    const activity = await storage.getActivity(activityId);
    if (!activity) {
      return res.status(404).json({ message: "Activity not found" });
    }
    res.json(activity);
  });
  app2.get("/api/activities/:id/waitlist", async (req, res) => {
    try {
      const activityId = parseInt(req.params.id);
      if (isNaN(activityId)) {
        return res.status(400).json({ message: "Invalid activity ID" });
      }
      const waitlistEntries = await storage.getWaitlist(activityId);
      const users2 = await Promise.all(
        waitlistEntries.map((entry) => storage.getUser(entry.userId))
      );
      const filteredUsers = users2.filter((user) => user !== void 0).map((user) => {
        if (user.anonymousParticipation) {
          return {
            id: user.id,
            village: user.village,
            neighborhood: user.neighborhood,
            anonymousParticipation: true,
            position: waitlistEntries.findIndex((e) => e.userId === user.id) + 1
          };
        }
        return {
          id: user.id,
          displayName: user.displayName,
          village: user.village,
          neighborhood: user.neighborhood,
          anonymousParticipation: false,
          position: waitlistEntries.findIndex((e) => e.userId === user.id) + 1
        };
      });
      res.json(filteredUsers);
    } catch (error) {
      console.error("Error getting waitlist:", error);
      res.status(500).json({ message: "Er is een fout opgetreden" });
    }
  });
  app2.post("/api/activities/:id/waitlist", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "U moet eerst inloggen" });
      }
      const activityId = parseInt(req.params.id);
      if (isNaN(activityId)) {
        return res.status(400).json({ message: "Invalid activity ID" });
      }
      const userId = req.user.id;
      const activity = await storage.getActivity(activityId);
      if (!activity) {
        return res.status(404).json({ message: "Activiteit niet gevonden" });
      }
      const registrations2 = await storage.getRegistrations(activityId);
      if (registrations2.length < activity.capacity) {
        return res.status(400).json({ message: "Er zijn nog plekken beschikbaar" });
      }
      const waitlist2 = await storage.getWaitlist(activityId);
      if (waitlist2.some((entry) => entry.userId === userId)) {
        return res.status(400).json({ message: "U staat al op de wachtlijst" });
      }
      const waitlistEntry = await storage.addToWaitlist({
        userId,
        activityId,
        registrationDate: /* @__PURE__ */ new Date()
      });
      const position = await storage.getWaitlistPosition(userId, activityId);
      res.status(201).json({ ...waitlistEntry, position });
    } catch (error) {
      console.error("Error adding to waitlist:", error);
      res.status(500).json({ message: "Er is een fout opgetreden" });
    }
  });
  app2.delete("/api/activities/:id/waitlist", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "U moet eerst inloggen" });
      }
      const activityId = parseInt(req.params.id);
      if (isNaN(activityId)) {
        return res.status(400).json({ message: "Invalid activity ID" });
      }
      const userId = req.user.id;
      await storage.removeFromWaitlist(userId, activityId);
      res.status(204).send();
    } catch (error) {
      console.error("Error removing from waitlist:", error);
      res.status(500).json({ message: "Er is een fout opgetreden" });
    }
  });
  app2.post("/api/users", async (req, res) => {
    const result = insertUserSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid user data" });
    }
    const existingUser = await storage.getUserByUsername(result.data.username);
    if (existingUser) {
      return res.status(400).json({ message: "Username already taken" });
    }
    const user = await storage.createUser(result.data);
    res.status(201).json(user);
  });
  app2.get("/api/activities/:id/registrations", async (req, res) => {
    const activityId = parseInt(req.params.id);
    if (isNaN(activityId)) {
      return res.status(400).json({ message: "Invalid activity ID" });
    }
    const registrations2 = await storage.getRegistrations(activityId);
    const users2 = await Promise.all(
      registrations2.map((r) => storage.getUser(r.userId))
    );
    const filteredUsers = users2.filter((u) => u !== void 0).map((user) => {
      if (user?.anonymousParticipation) {
        return {
          id: user.id,
          village: user.village,
          neighborhood: user.neighborhood,
          anonymousParticipation: true
        };
      } else {
        return {
          id: user?.id,
          displayName: user?.displayName,
          village: user?.village,
          neighborhood: user?.neighborhood,
          anonymousParticipation: false
        };
      }
    });
    res.json(filteredUsers);
  });
  app2.post("/api/activities/:id/register", async (req, res) => {
    const activityId = parseInt(req.params.id);
    if (isNaN(activityId)) {
      return res.status(400).json({ message: "Invalid activity ID" });
    }
    const result = insertRegistrationSchema.safeParse({
      userId: req.body.userId,
      activityId
    });
    if (!result.success) {
      return res.status(400).json({ message: "Invalid registration data" });
    }
    const activity = await storage.getActivity(activityId);
    if (!activity) {
      return res.status(404).json({ message: "Activity not found" });
    }
    const registrations2 = await storage.getRegistrations(activityId);
    if (registrations2.length >= activity.capacity) {
      return res.status(400).json({ message: "Activity is full" });
    }
    const registration = await storage.createRegistration(result.data);
    const activityDate = new Date(activity.date);
    const dayBeforeActivity = new Date(activityDate);
    dayBeforeActivity.setDate(dayBeforeActivity.getDate() - 1);
    await storage.createReminder({
      userId: req.body.userId,
      activityId,
      reminderDate: dayBeforeActivity,
      title: `Herinnering: ${activity.name}`,
      message: `Morgen begint de activiteit "${activity.name}". Vergeet niet om hierbij aanwezig te zijn!`,
      isRead: false
    });
    if (process.env.SENDGRID_API_KEY) {
      const user = await storage.getUser(req.body.userId);
      const center = await storage.getCenter(activity.centerId);
      if (user && center) {
        await sendActivityRegistrationEmail(
          user.username,
          user.displayName,
          activity.name,
          new Date(activity.date),
          `${center.name}, ${center.address}`
        );
      }
    }
    res.status(201).json(registration);
  });
  app2.delete("/api/activities/:id/register", async (req, res) => {
    const activityId = parseInt(req.params.id);
    if (isNaN(activityId)) {
      return res.status(400).json({ message: "Invalid activity ID" });
    }
    const userId = req.body.userId;
    await storage.deleteRegistration(userId, activityId);
    const userReminders = await storage.getRemindersByUser(userId);
    const activityReminders = userReminders.filter((r) => r.activityId === activityId);
    for (const reminder of activityReminders) {
      await storage.deleteReminder(reminder.id);
    }
    res.status(204).send();
  });
  app2.get("/api/users/:id/activities", async (req, res) => {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    if (!req.isAuthenticated() || req.user?.id !== userId) {
      return res.status(401).json({ message: "Niet geautoriseerd" });
    }
    const registrations2 = await storage.getRegistrationsByUser(userId);
    const activities2 = await Promise.all(
      registrations2.map((r) => storage.getActivity(r.activityId))
    );
    res.json(activities2.filter((a) => a !== void 0));
  });
  app2.patch("/api/users/:id", async (req, res, next) => {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      if (!req.isAuthenticated() || req.user?.id !== userId) {
        return res.sendStatus(403);
      }
      const {
        anonymousParticipation,
        displayName,
        phone,
        village,
        neighborhood
      } = req.body;
      const updateData = {};
      if (anonymousParticipation !== void 0) {
        updateData.anonymousParticipation = anonymousParticipation;
      }
      if (displayName) {
        updateData.displayName = displayName;
      }
      if (phone) {
        updateData.phone = phone;
      }
      if (village) {
        updateData.village = village;
      }
      if (neighborhood) {
        updateData.neighborhood = neighborhood;
      }
      const user = await storage.updateUser(userId, updateData);
      res.json(user);
    } catch (err) {
      next(err);
    }
  });
  app2.get("/api/users/:id/reminders", async (req, res) => {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    if (!req.isAuthenticated() || req.user?.id !== userId) {
      return res.status(401).json({ message: "Niet geautoriseerd" });
    }
    const reminders2 = await storage.getRemindersByUser(userId);
    res.json(reminders2);
  });
  app2.get("/api/users/:id/upcoming-reminders", async (req, res) => {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    if (!req.isAuthenticated() || req.user?.id !== userId) {
      return res.status(401).json({ message: "Niet geautoriseerd" });
    }
    const reminders2 = await storage.getUpcomingReminders(userId);
    res.json(reminders2);
  });
  app2.patch("/api/reminders/:id", async (req, res) => {
    try {
      const reminderId = parseInt(req.params.id);
      if (isNaN(reminderId)) {
        return res.status(400).json({ message: "Invalid reminder ID" });
      }
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Niet geautoriseerd" });
      }
      const updated = await storage.updateReminder(reminderId, req.body);
      res.json(updated);
    } catch (error) {
      console.error("Error updating reminder:", error);
      res.status(500).json({ message: "Er is een fout opgetreden" });
    }
  });
  app2.post("/api/register", async (req, res, next) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "Gebruikersnaam is al in gebruik" });
      }
      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password)
      });
      if (process.env.SENDGRID_API_KEY) {
        await sendWelcomeEmail(user.username, user.displayName);
      }
      if (user.role === "center_admin") {
        const center = await storage.createCenter({
          name: user.displayName,
          address: `${user.neighborhood}, ${user.village}`,
          description: `Buurthuis ${user.displayName} in ${user.village}`,
          imageUrl: "https://images.unsplash.com/photo-1577495508048-b635879837f1?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
          adminId: user.id,
          village: user.village
        });
        console.log("Created center:", center);
      }
      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (err) {
      console.error("Error in register route:", err);
      next(err);
    }
  });
  app2.get("/api/activities/registrations", isCenterAdmin, async (req, res) => {
    try {
      const centers2 = await storage.getCentersByAdmin(req.user.id);
      if (centers2.length === 0) {
        return res.json([]);
      }
      const activities2 = await storage.getActivities(centers2[0].id);
      const allRegistrations = await Promise.all(
        activities2.map((activity) => storage.getRegistrations(activity.id))
      );
      const flattenedRegistrations = allRegistrations.flat();
      res.json(flattenedRegistrations);
    } catch (error) {
      console.error("Error getting registrations:", error);
      res.status(500).json({ message: "Er is een fout opgetreden" });
    }
  });
  return httpServer;
}

// server/vite.ts
import express2 from "express";
import fs from "fs";
import path4, { dirname as dirname2 } from "path";
import { fileURLToPath as fileURLToPath3 } from "url";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path3, { dirname } from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath as fileURLToPath2 } from "url";
var __filename2 = fileURLToPath2(import.meta.url);
var __dirname2 = dirname(__filename2);
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    themePlugin()
    // eventueel cartographer plugin handmatig toevoegen hier indien nodig
  ],
  resolve: {
    alias: {
      "@": path3.resolve(__dirname2, "./client/src"),
      "@shared": path3.resolve(__dirname2, "./shared")
    }
  },
  root: path3.resolve(__dirname2, "client"),
  build: {
    outDir: path3.resolve(__dirname2, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var __filename3 = fileURLToPath3(import.meta.url);
var __dirname3 = dirname2(__filename3);
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path4.resolve(
        __dirname3,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path4.resolve(__dirname3, "..", "dist", "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express2.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path4.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express3();
app.use(express3.json());
app.use(express3.urlencoded({ extended: false }));
app.get("/health", (req, res) => {
  res.send("ok");
});
if (!process.env.SENDGRID_API_KEY) {
  console.warn("Warning: SENDGRID_API_KEY not set. Email notifications will be disabled.");
} else {
  initializeEmailService(process.env.SENDGRID_API_KEY, "w.kastelijn@student.fontys.nl");
  log("Email service initialized");
}
app.use((req, res, next) => {
  const start = Date.now();
  const path5 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path5.startsWith("/api")) {
      let logLine = `${req.method} ${path5} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});
(async () => {
  try {
    log("Starting server setup...");
    setupAuth(app);
    log("Authentication setup complete");
    const server = await registerRoutes(app);
    log("Routes registered successfully");
    app.use((err, _req, res, _next) => {
      console.error("Server error:", err);
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      res.status(status).json({ message });
    });
    if (process.env.NODE_ENV === "development") {
      await setupVite(app, server);
      log("Vite setup complete");
    } else {
      serveStatic(app);
      log("Static serving setup complete");
    }
    const port = process.env.PORT || 5e3;
    server.listen(Number(port), () => {
      log(`Server started on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
})();
