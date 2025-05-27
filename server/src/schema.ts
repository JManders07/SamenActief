import { pgTable, serial, text, integer, boolean, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  role: text("role").notNull().default("user"),
  village: text("village").notNull(),
  neighborhood: text("neighborhood").notNull(),
  anonymousParticipation: boolean("anonymous_participation").notNull().default(false),
  hasSeenOnboarding: boolean("has_seen_onboarding").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Centers table
export const centers = pgTable("centers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  address: text("address").notNull(),
  imageUrl: text("image_url").notNull(),
  adminId: integer("admin_id").notNull().references(() => users.id),
  village: text("village").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Activities table
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  date: timestamp("date").notNull(),
  capacity: integer("capacity").notNull().default(10),
  centerId: integer("center_id").notNull().references(() => centers.id),
  imageUrl: text("image_url").notNull(),
  materialsNeeded: text("materials_needed"),
  facilitiesAvailable: text("facilities_available"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Activity Images table
export const activityImages = pgTable("activity_images", {
  id: serial("id").primaryKey(),
  activityId: integer("activity_id").notNull().references(() => activities.id),
  imageUrl: text("image_url").notNull(),
  order: integer("order").notNull().default(0),
});

// Registrations table
export const registrations = pgTable("registrations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  activityId: integer("activity_id").notNull().references(() => activities.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Waitlist table
export const waitlist = pgTable("waitlist", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  activityId: integer("activity_id").notNull().references(() => activities.id),
  registrationDate: timestamp("registration_date").notNull().defaultNow(),
});

// Reminders table
export const reminders = pgTable("reminders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  activityId: integer("activity_id").notNull().references(() => activities.id),
  reminderDate: timestamp("reminder_date").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Password Reset table
export const passwordResets = pgTable("password_resets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Center = typeof centers.$inferSelect;
export type InsertCenter = typeof centers.$inferInsert;
export type Activity = typeof activities.$inferSelect;
export type InsertActivity = typeof activities.$inferInsert;
export type ActivityImage = typeof activityImages.$inferSelect;
export type InsertActivityImage = typeof activityImages.$inferInsert;
export type Registration = typeof registrations.$inferSelect;
export type InsertRegistration = typeof registrations.$inferInsert;
export type WaitlistEntry = typeof waitlist.$inferSelect;
export type InsertWaitlistEntry = typeof waitlist.$inferInsert;
export type Reminder = typeof reminders.$inferSelect;
export type InsertReminder = typeof reminders.$inferInsert;
export type PasswordReset = typeof passwordResets.$inferSelect;
export type InsertPasswordReset = typeof passwordResets.$inferInsert;

// Schemas
export const insertUserSchema = createInsertSchema(users);
export const insertCenterSchema = createInsertSchema(centers);
export const insertActivitySchema = createInsertSchema(activities).extend({
  date: z.string()
    .refine(str => !isNaN(Date.parse(str)), {
      message: "Invalid date format",
    })
    .transform(str => new Date(str)),
  images: z.array(z.object({
    imageUrl: z.string(),
    order: z.number()
  })).optional(),
  materialsNeeded: z.string().optional(),
  facilitiesAvailable: z.string().optional(),
});
export const insertRegistrationSchema = createInsertSchema(registrations);
export const insertWaitlistEntrySchema = createInsertSchema(waitlist);
export const insertReminderSchema = createInsertSchema(reminders);
export const insertPasswordResetSchema = createInsertSchema(passwordResets); 