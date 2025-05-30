import {
  users, centers, activities, registrations, reminders, waitlist, carpools, carpoolPassengers, activityImages,
  passwordResetTokens,
  type User, type Center, type Activity, type Registration, type Reminder, type Waitlist, type Carpool, type CarpoolPassenger,
  type InsertUser, type InsertCenter, type InsertActivity, type InsertRegistration, type InsertReminder, type InsertWaitlist,
  type InsertCarpool, type InsertCarpoolPassenger, type ActivityImage, type InsertActivityImage,
  type PasswordReset, type InsertPasswordReset
} from "@shared/schema";
import { db, pool } from "./db";
import { eq, and } from "drizzle-orm";
import { hashPassword } from "./auth";

export { db };

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User>;

  // Centers
  getCenters(village?: string): Promise<Center[]>;
  getCenter(id: number): Promise<Center | undefined>;
  createCenter(center: InsertCenter): Promise<Center>;
  updateCenter(id: number, data: Partial<Center>): Promise<Center>;
  getCentersByAdmin(adminId: number): Promise<Center[]>;

  // Activities 
  getActivities(centerId?: number): Promise<Activity[]>;
  getActivity(id: number): Promise<Activity | undefined>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  updateActivity(id: number, data: Partial<Activity>): Promise<Activity>;
  deleteActivity(id: number): Promise<void>;

  // Registrations
  getRegistrations(activityId: number): Promise<Registration[]>;
  getRegistrationsByUser(userId: number): Promise<Registration[]>;
  createRegistration(registration: InsertRegistration): Promise<Registration>;
  deleteRegistration(userId: number, activityId: number): Promise<void>;

  // Reminders
  getRemindersByUser(userId: number): Promise<Reminder[]>;
  createReminder(reminder: InsertReminder): Promise<Reminder>;
  updateReminder(id: number, data: Partial<Reminder>): Promise<Reminder>;
  deleteReminder(id: number): Promise<void>;
  getUpcomingReminders(userId: number): Promise<Reminder[]>;

  // Waitlist
  getWaitlist(activityId: number): Promise<Waitlist[]>;
  addToWaitlist(waitlistEntry: InsertWaitlist): Promise<Waitlist>;
  removeFromWaitlist(userId: number, activityId: number): Promise<void>;
  getWaitlistPosition(userId: number, activityId: number): Promise<number>;

  // Carpools
  getCarpools(activityId: number): Promise<Carpool[]>;
  createCarpool(carpool: InsertCarpool): Promise<Carpool>;
  updateCarpool(id: number, data: Partial<Carpool>): Promise<Carpool>;
  deleteCarpool(id: number): Promise<void>;

  // Carpool Passengers
  addPassenger(passenger: InsertCarpoolPassenger): Promise<CarpoolPassenger>;
  removePassenger(carpoolId: number, passengerId: number): Promise<void>;
  getCarpoolPassengers(carpoolId: number): Promise<User[]>;

  // Activity Images
  createActivityImage(image: InsertActivityImage): Promise<ActivityImage>;
  getActivityImages(activityId: number): Promise<ActivityImage[]>;
  deleteActivityImage(id: number): Promise<void>;

  // User data deletion
  deleteUserData(userId: number): Promise<void>;
  deleteUser(userId: number): Promise<void>;

  // Password Reset
  getUserByEmail(email: string): Promise<User | undefined>;
  createPasswordReset(reset: InsertPasswordReset): Promise<PasswordReset>;
  getPasswordReset(token: string): Promise<PasswordReset | undefined>;
  deletePasswordReset(token: string): Promise<void>;
  updateUserPassword(userId: number, hashedPassword: string): Promise<User>;
  markPasswordResetAsUsed(token: string): Promise<void>;

  // Admin statistieken
  getTotalUsers(): Promise<number>;
  getNewUsersThisMonth(): Promise<number>;
  getTotalCenters(): Promise<number>;
  getActiveCenters(): Promise<number>;
  getTotalActivities(): Promise<number>;
  getUpcomingActivities(): Promise<number>;
  getTotalRegistrations(): Promise<number>;
  getRegistrationsThisMonth(): Promise<number>;

  // Admin gebruikersbeheer
  getAllUsers(): Promise<User[]>;

  // Admin buurthuizen beheer
  getAllCenters(): Promise<Center[]>;

  // Admin activiteiten beheer
  getAllActivities(): Promise<Activity[]>;

  // Systeem logs
  getSystemLogs(): Promise<any[]>;

  // Systeem instellingen
  getSystemSettings(): Promise<any[]>;
  updateSystemSettings(settings: Record<string, any>): Promise<any[]>;

  // Admin gebruiker maken
  createAdminUser(data: {
    username: string;
    password: string;
    displayName: string;
    email: string;
  }): Promise<User>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user;
    } catch (error) {
      console.error('Error in getUser:', error);
      throw error;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.username, username));
      return user;
    } catch (error) {
      console.error('Error in getUserByUsername:', error);
      throw error;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const [user] = await db.insert(users).values(insertUser).returning();
      return user;
    } catch (error) {
      console.error('Error in createUser:', error);
      throw error;
    }
  }

  async getCenters(village?: string): Promise<Center[]> {
    try {
      if (village) {
        return await db.select().from(centers).where(eq(centers.village, village));
      }
      return await db.select().from(centers);
    } catch (error) {
      console.error('Error in getCenters:', error);
      throw error;
    }
  }

  async getCenter(id: number): Promise<Center | undefined> {
    try {
      const [center] = await db.select().from(centers).where(eq(centers.id, id));
      return center;
    } catch (error) {
      console.error('Error in getCenter:', error);
      throw error;
    }
  }

  async createCenter(insertCenter: InsertCenter): Promise<Center> {
    try {
      console.log('Creating center with data:', insertCenter);
      const [center] = await db.insert(centers).values(insertCenter).returning();
      console.log('Created center:', center);
      return center;
    } catch (error) {
      console.error('Error in createCenter:', error);
      throw error;
    }
  }

  async updateCenter(id: number, data: Partial<Center>): Promise<Center> {
    try {
      const [center] = await db
        .update(centers)
        .set(data)
        .where(eq(centers.id, id))
        .returning();
      return center;
    } catch (error) {
      console.error('Error in updateCenter:', error);
      throw error;
    }
  }

  async getCentersByAdmin(adminId: number): Promise<Center[]> {
    try {
      console.log('Getting centers for admin:', adminId);
      const results = await db.select().from(centers).where(eq(centers.adminId, adminId));
      console.log('Found centers:', results);
      return results;
    } catch (error) {
      console.error('Error in getCentersByAdmin:', error);
      throw error;
    }
  }

  async getActivities(centerId?: number): Promise<Activity[]> {
    try {
      if (centerId) {
        return await db.select().from(activities).where(eq(activities.centerId, centerId));
      }
      return await db.select().from(activities);
    } catch (error) {
      console.error('Error in getActivities:', error);
      throw error;
    }
  }

  async getActivity(id: number): Promise<Activity | undefined> {
    try {
      const [activity] = await db.select().from(activities).where(eq(activities.id, id));
      return activity;
    } catch (error) {
      console.error('Error in getActivity:', error);
      throw error;
    }
  }

  async createActivity(data: InsertActivity): Promise<Activity> {
    // Set default image if none provided
    if (data.imageUrl === "") {
      data.imageUrl = "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3";
    }

    try {
      const [activity] = await db.insert(activities).values(data).returning();
      return activity;
    } catch (error) {
      console.error('Error in createActivity:', error);
      throw error;
    }
  }

  async updateActivity(id: number, updates: Partial<Activity>): Promise<Activity> {
    try {
      // Ensure date is a proper Date object if it's included in updates
      const updatesWithFormattedDate = { ...updates };

      // Log for debugging
      console.log('Updating activity with data:', updatesWithFormattedDate);

      const result = await db.update(activities).set(updatesWithFormattedDate).where(eq(activities.id, id)).returning();
      return result[0];
    } catch (error) {
      console.error('Error in updateActivity:', error);
      throw error;
    }
  }

  async deleteActivity(id: number): Promise<void> {
    try {
      await db.delete(activities).where(eq(activities.id, id));
    } catch (error) {
      console.error('Error in deleteActivity:', error);
      throw error;
    }
  }

  async getRegistrations(activityId: number): Promise<Registration[]> {
    try {
      return await db.select().from(registrations).where(eq(registrations.activityId, activityId));
    } catch (error) {
      console.error('Error in getRegistrations:', error);
      throw error;
    }
  }

  async getRegistrationsByUser(userId: number): Promise<Registration[]> {
    try {
      return await db.select().from(registrations).where(eq(registrations.userId, userId));
    } catch (error) {
      console.error('Error in getRegistrationsByUser:', error);
      throw error;
    }
  }

  async createRegistration(insertRegistration: InsertRegistration): Promise<Registration> {
    try {
      const [registration] = await db.insert(registrations).values(insertRegistration).returning();
      return registration;
    } catch (error) {
      console.error('Error in createRegistration:', error);
      throw error;
    }
  }

  async deleteRegistration(userId: number, activityId: number): Promise<void> {
    try {
      await db.delete(registrations).where(
        and(
          eq(registrations.userId, userId),
          eq(registrations.activityId, activityId)
        )
      );
    } catch (error) {
      console.error('Error in deleteRegistration:', error);
      throw error;
    }
  }

  async updateUser(id: number, data: { 
    anonymousParticipation?: boolean,
    displayName?: string,
    phone?: string,
    village?: string,
    neighborhood?: string
  }): Promise<User> {
    try {
      const [user] = await db
        .update(users)
        .set(data)
        .where(eq(users.id, id))
        .returning();
      return user;
    } catch (error) {
      console.error('Error in updateUser:', error);
      throw error;
    }
  }

  // Reminder methods
  async getRemindersByUser(userId: number): Promise<Reminder[]> {
    try {
      return await db.select().from(reminders).where(eq(reminders.userId, userId));
    } catch (error) {
      console.error('Error in getRemindersByUser:', error);
      throw error;
    }
  }

  async createReminder(reminder: InsertReminder): Promise<Reminder> {
    try {
      const [newReminder] = await db.insert(reminders).values(reminder).returning();
      return newReminder;
    } catch (error) {
      console.error('Error in createReminder:', error);
      throw error;
    }
  }

  async updateReminder(id: number, data: Partial<Reminder>): Promise<Reminder> {
    try {
      const [updatedReminder] = await db
        .update(reminders)
        .set(data)
        .where(eq(reminders.id, id))
        .returning();
      return updatedReminder;
    } catch (error) {
      console.error('Error in updateReminder:', error);
      throw error;
    }
  }

  async deleteReminder(id: number): Promise<void> {
    try {
      await db.delete(reminders).where(eq(reminders.id, id));
    } catch (error) {
      console.error('Error in deleteReminder:', error);
      throw error;
    }
  }

  async getUpcomingReminders(userId: number): Promise<Reminder[]> {
    try {
      const now = new Date();
      return await db
        .select()
        .from(reminders)
        .where(
          and(
            eq(reminders.userId, userId),
            eq(reminders.isRead, false)
          )
        );
    } catch (error) {
      console.error('Error in getUpcomingReminders:', error);
      throw error;
    }
  }

  // Waitlist methods
  async getWaitlist(activityId: number): Promise<Waitlist[]> {
    try {
      return await db.select().from(waitlist).where(eq(waitlist.activityId, activityId));
    } catch (error) {
      console.error('Error in getWaitlist:', error);
      throw error;
    }
  }

  async addToWaitlist(waitlistEntry: InsertWaitlist): Promise<Waitlist> {
    try {
      const [entry] = await db.insert(waitlist).values(waitlistEntry).returning();
      return entry;
    } catch (error) {
      console.error('Error in addToWaitlist:', error);
      throw error;
    }
  }

  async removeFromWaitlist(userId: number, activityId: number): Promise<void> {
    try {
      await db.delete(waitlist).where(
        and(
          eq(waitlist.userId, userId),
          eq(waitlist.activityId, activityId)
        )
      );
    } catch (error) {
      console.error('Error in removeFromWaitlist:', error);
      throw error;
    }
  }

  async getWaitlistPosition(userId: number, activityId: number): Promise<number> {
    try {
      const waitlistEntries = await this.getWaitlist(activityId);
      const position = waitlistEntries.findIndex(entry => entry.userId === userId);
      return position === -1 ? -1 : position + 1;
    } catch (error) {
      console.error('Error in getWaitlistPosition:', error);
      throw error;
    }
  }

  // Carpool methods
  async getCarpools(activityId: number): Promise<Carpool[]> {
    try {
      return await db.select().from(carpools).where(eq(carpools.activityId, activityId));
    } catch (error) {
      console.error('Error in getCarpools:', error);
      throw error;
    }
  }

  async createCarpool(carpool: InsertCarpool): Promise<Carpool> {
    try {
      const [newCarpool] = await db.insert(carpools).values(carpool).returning();
      return newCarpool;
    } catch (error) {
      console.error('Error in createCarpool:', error);
      throw error;
    }
  }

  async updateCarpool(id: number, data: Partial<Carpool>): Promise<Carpool> {
    try {
      const [carpool] = await db
        .update(carpools)
        .set(data)
        .where(eq(carpools.id, id))
        .returning();
      return carpool;
    } catch (error) {
      console.error('Error in updateCarpool:', error);
      throw error;
    }
  }

  async deleteCarpool(id: number): Promise<void> {
    try {
      await db.delete(carpools).where(eq(carpools.id, id));
    } catch (error) {
      console.error('Error in deleteCarpool:', error);
      throw error;
    }
  }

  async addPassenger(passenger: InsertCarpoolPassenger): Promise<CarpoolPassenger> {
    try {
      const [newPassenger] = await db.insert(carpoolPassengers).values(passenger).returning();
      return newPassenger;
    } catch (error) {
      console.error('Error in addPassenger:', error);
      throw error;
    }
  }

  async removePassenger(carpoolId: number, passengerId: number): Promise<void> {
    try {
      await db.delete(carpoolPassengers).where(
        and(
          eq(carpoolPassengers.carpoolId, carpoolId),
          eq(carpoolPassengers.passengerId, passengerId)
        )
      );
    } catch (error) {
      console.error('Error in removePassenger:', error);
      throw error;
    }
  }

  async getCarpoolPassengers(carpoolId: number): Promise<User[]> {
    try {
      const passengers = await db.select().from(carpoolPassengers).where(eq(carpoolPassengers.carpoolId, carpoolId));
      const userIds = passengers.map(p => p.passengerId);
      const users = await Promise.all(userIds.map(id => this.getUser(id)));
      return users.filter((user): user is User => user !== undefined);
    } catch (error) {
      console.error('Error in getCarpoolPassengers:', error);
      throw error;
    }
  }

  // Activity Images methods
  async createActivityImage(image: InsertActivityImage): Promise<ActivityImage> {
    try {
      const [newImage] = await db.insert(activityImages).values(image).returning();
      return newImage;
    } catch (error) {
      console.error('Error in createActivityImage:', error);
      throw error;
    }
  }

  async getActivityImages(activityId: number): Promise<ActivityImage[]> {
    try {
      console.log('Fetching images for activity:', activityId);
      
      // Controleer eerst of de activiteit bestaat
      const activity = await this.getActivity(activityId);
      if (!activity) {
        console.log('Activity not found:', activityId);
        return [];
      }

      const images = await db
        .select()
        .from(activityImages)
        .where(eq(activityImages.activityId, activityId))
        .orderBy(activityImages.order);

      console.log('Found images:', images);
      return images;
    } catch (error) {
      console.error('Error in getActivityImages:', error);
      // In plaats van de error door te gooien, return een lege array
      return [];
    }
  }

  async deleteActivityImage(id: number): Promise<void> {
    try {
      await db.delete(activityImages).where(eq(activityImages.id, id));
    } catch (error) {
      console.error('Error in deleteActivityImage:', error);
      throw error;
    }
  }

  async deleteUserData(userId: number): Promise<void> {
    try {
      await db.transaction(async (tx) => {
        // Controleer eerst of de gebruiker een buurthuis beheerder is
        const userCenters: Center[] = await tx.select().from(centers).where(eq(centers.adminId, userId));
        
        // Als er een buurthuis is, verwijder eerst alle gerelateerde data van het buurthuis
        for (const center of userCenters) {
          // Verwijder alle activiteiten van het buurthuis
          const centerActivities: Activity[] = await tx.select().from(activities).where(eq(activities.centerId, center.id));
          for (const activity of centerActivities) {
            // Verwijder alle gerelateerde data voor deze activiteit
            await tx.delete(registrations).where(eq(registrations.activityId, activity.id));
            await tx.delete(waitlist).where(eq(waitlist.activityId, activity.id));
            await tx.delete(reminders).where(eq(reminders.activityId, activity.id));
            await tx.delete(carpools).where(eq(carpools.activityId, activity.id));
            await tx.delete(activityImages).where(eq(activityImages.activityId, activity.id));
            await tx.delete(activities).where(eq(activities.id, activity.id));
          }
          // Verwijder het buurthuis
          await tx.delete(centers).where(eq(centers.id, center.id));
        }
        
        // Verwijder alle gebruikersgerelateerde data
        await tx.delete(registrations).where(eq(registrations.userId, userId));
        await tx.delete(waitlist).where(eq(waitlist.userId, userId));
        await tx.delete(reminders).where(eq(reminders.userId, userId));
        await tx.delete(carpoolPassengers).where(eq(carpoolPassengers.passengerId, userId));
        await tx.delete(carpools).where(eq(carpools.driverId, userId));
      });
    } catch (error) {
      console.error('Error in deleteUserData:', error);
      throw error;
    }
  }

  async deleteUser(userId: number): Promise<void> {
    try {
      await db.delete(users).where(eq(users.id, userId));
    } catch (error) {
      console.error('Error in deleteUser:', error);
      throw error;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.username, email));
      return user;
    } catch (error) {
      console.error('Error in getUserByEmail:', error);
      throw error;
    }
  }

  async createPasswordReset(reset: InsertPasswordReset): Promise<PasswordReset> {
    try {
      const [passwordReset] = await db.insert(passwordResetTokens).values(reset).returning();
      return passwordReset;
    } catch (error) {
      console.error('Error in createPasswordReset:', error);
      throw error;
    }
  }

  async getPasswordReset(token: string): Promise<PasswordReset | undefined> {
    try {
      const [reset] = await db.select().from(passwordResetTokens).where(eq(passwordResetTokens.token, token));
      return reset;
    } catch (error) {
      console.error('Error in getPasswordReset:', error);
      throw error;
    }
  }

  async deletePasswordReset(token: string): Promise<void> {
    try {
      await db.delete(passwordResetTokens).where(eq(passwordResetTokens.token, token));
    } catch (error) {
      console.error('Error in deletePasswordReset:', error);
      throw error;
    }
  }

  async markPasswordResetAsUsed(token: string): Promise<void> {
    try {
      await db
        .update(passwordResetTokens)
        .set({ used: true })
        .where(eq(passwordResetTokens.token, token));
    } catch (error) {
      console.error('Error in markPasswordResetAsUsed:', error);
      throw error;
    }
  }

  async updateUserPassword(userId: number, hashedPassword: string): Promise<User> {
    try {
      const [user] = await db
        .update(users)
        .set({ password: hashedPassword })
        .where(eq(users.id, userId))
        .returning();
      return user;
    } catch (error) {
      console.error('Error in updateUserPassword:', error);
      throw error;
    }
  }

  // Admin statistieken
  async getTotalUsers(): Promise<number> {
    const result = await pool.query("SELECT COUNT(*) as count FROM users");
    return result.rows[0].count;
  }

  async getNewUsersThisMonth(): Promise<number> {
    const result = await pool.query(
      "SELECT COUNT(*) as count FROM users WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)"
    );
    return result.rows[0].count;
  }

  async getTotalCenters(): Promise<number> {
    const result = await pool.query("SELECT COUNT(*) as count FROM centers");
    return result.rows[0].count;
  }

  async getActiveCenters(): Promise<number> {
    const result = await pool.query(
      "SELECT COUNT(*) as count FROM centers WHERE status = 'active'"
    );
    return result.rows[0].count;
  }

  async getTotalActivities(): Promise<number> {
    const result = await pool.query("SELECT COUNT(*) as count FROM activities");
    return result.rows[0].count;
  }

  async getUpcomingActivities(): Promise<number> {
    const result = await pool.query(
      "SELECT COUNT(*) as count FROM activities WHERE start_date > CURRENT_DATE"
    );
    return result.rows[0].count;
  }

  async getTotalRegistrations(): Promise<number> {
    const result = await pool.query("SELECT COUNT(*) as count FROM registrations");
    return result.rows[0].count;
  }

  async getRegistrationsThisMonth(): Promise<number> {
    const result = await pool.query(
      "SELECT COUNT(*) as count FROM registrations WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)"
    );
    return result.rows[0].count;
  }

  // Admin gebruikersbeheer
  async getAllUsers(): Promise<User[]> {
    const result = await pool.query(`
      SELECT id, username, display_name, email, role, created_at, last_login
      FROM users
      ORDER BY created_at DESC
    `);
    return result.rows;
  }

  // Admin buurthuizen beheer
  async getAllCenters(): Promise<Center[]> {
    const result = await pool.query(`
      SELECT c.*, u.display_name as admin_name
      FROM centers c
      LEFT JOIN users u ON c.admin_id = u.id
      ORDER BY c.created_at DESC
    `);
    return result.rows;
  }

  // Admin activiteiten beheer
  async getAllActivities(): Promise<Activity[]> {
    const result = await pool.query(`
      SELECT a.*, c.name as center_name
      FROM activities a
      LEFT JOIN centers c ON a.center_id = c.id
      ORDER BY a.start_date DESC
    `);
    return result.rows;
  }

  // Systeem logs
  async getSystemLogs(): Promise<any[]> {
    const result = await pool.query(`
      SELECT *
      FROM system_logs
      ORDER BY created_at DESC
      LIMIT 1000
    `);
    return result.rows;
  }

  // Systeem instellingen
  async getSystemSettings(): Promise<any[]> {
    const result = await pool.query("SELECT * FROM system_settings");
    return result.rows;
  }

  async updateSystemSettings(settings: Record<string, any>): Promise<any[]> {
    const entries = Object.entries(settings);
    for (const [key, value] of entries) {
      await pool.query(
        "INSERT INTO system_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $3",
        [key, JSON.stringify(value), JSON.stringify(value)]
      );
    }
    return this.getSystemSettings();
  }

  // Admin gebruiker maken
  async createAdminUser(data: {
    username: string;
    password: string;
    displayName: string;
    email: string;
  }): Promise<User> {
    const hashedPassword = await hashPassword(data.password);
    
    const result = await pool.query(
      `INSERT INTO users (username, password, display_name, email, role)
       VALUES ($1, $2, $3, $4, 'admin')
       RETURNING id, username, display_name, email, role`,
      [data.username, hashedPassword, data.displayName, data.email]
    );

    return result.rows[0];
  }
}

export const storage = new DatabaseStorage();

export async function anonymizeUser(userId: number): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Anonimiseer gebruikersgegevens
    await client.query(
      `UPDATE users 
       SET display_name = 'Anonieme Gebruiker',
           email = $1,
           phone = NULL,
           village = 'Anoniem',
           neighborhood = 'Anoniem'
       WHERE id = $2`,
      [`deleted_${userId}@deleted.com`, userId]
    );

    // Anonimiseer gerelateerde activiteitsgegevens
    await client.query(
      `UPDATE activity_registrations 
       SET notes = NULL
       WHERE user_id = $1`,
      [userId]
    );

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function deleteUser(userId: number): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Verwijder gebruikersgegevens
    await client.query('DELETE FROM users WHERE id = $1', [userId]);

    // Verwijder gerelateerde gegevens
    await client.query('DELETE FROM activity_registrations WHERE user_id = $1', [userId]);
    await client.query('DELETE FROM user_sessions WHERE user_id = $1', [userId]);

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function logDataDeletion(data: {
  userId: number;
  timestamp: Date;
  reason: string;
  type: string;
}): Promise<void> {
  await pool.query(
    `INSERT INTO data_deletion_logs 
     (user_id, timestamp, reason, type)
     VALUES ($1, $2, $3, $4)`,
    [data.userId, data.timestamp, data.reason, data.type]
  );
}