import {
  users, centers, activities, registrations, reminders, waitlist, carpools, carpoolPassengers, activityImages,
  type User, type Center, type Activity, type Registration, type Reminder, type Waitlist, type Carpool, type CarpoolPassenger,
  type InsertUser, type InsertCenter, type InsertActivity, type InsertRegistration, type InsertReminder, type InsertWaitlist,
  type InsertCarpool, type InsertCarpoolPassenger, type ActivityImage, type InsertActivityImage, type InsertPasswordResetToken
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

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

  // Password reset tokens
  createPasswordResetToken(data: InsertPasswordResetToken): Promise<InsertPasswordResetToken>;
  getPasswordResetToken(token: string): Promise<InsertPasswordResetToken | undefined>;
  deletePasswordResetToken(token: string): Promise<void>;
  updateUserPassword(userId: number, hashedPassword: string): Promise<void>;
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
      return await db
        .select()
        .from(activityImages)
        .where(eq(activityImages.activityId, activityId))
        .orderBy(activityImages.order);
    } catch (error) {
      console.error('Error in getActivityImages:', error);
      throw error;
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

  async createPasswordResetToken(data: InsertPasswordResetToken) {
    const result = await db.insert(passwordResetTokens).values(data).returning();
    return result[0];
  }

  async getPasswordResetToken(token: string) {
    const result = await db
      .select()
export const storage = new DatabaseStorage();