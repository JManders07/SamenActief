import { Router } from "express";
import { storage } from "../storage";
import { isAdmin } from "../middleware/auth";

const router = Router();

// Middleware om te controleren of de gebruiker een admin is
router.use(isAdmin);

// Dashboard statistieken
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
    ] = await Promise.all([
      storage.getTotalUsers(),
      storage.getNewUsersThisMonth(),
      storage.getTotalCenters(),
      storage.getActiveCenters(),
      storage.getTotalActivities(),
      storage.getUpcomingActivities(),
      storage.getTotalRegistrations(),
      storage.getRegistrationsThisMonth(),
    ]);

    res.json({
      totalUsers,
      newUsersThisMonth,
      totalCenters,
      activeCenters,
      totalActivities,
      upcomingActivities,
      totalRegistrations,
      registrationsThisMonth,
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    res.status(500).json({ message: "Er is een fout opgetreden bij het ophalen van de statistieken" });
  }
});

// Gebruikers beheer
router.get("/users", async (req, res) => {
  try {
    const users = await storage.getAllUsers();
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Er is een fout opgetreden bij het ophalen van de gebruikers" });
  }
});

// Buurthuizen beheer
router.get("/centers", async (req, res) => {
  try {
    const centers = await storage.getAllCenters();
    res.json(centers);
  } catch (error) {
    console.error("Error fetching centers:", error);
    res.status(500).json({ message: "Er is een fout opgetreden bij het ophalen van de buurthuizen" });
  }
});

// Activiteiten beheer
router.get("/activities", async (req, res) => {
  try {
    const activities = await storage.getAllActivities();
    res.json(activities);
  } catch (error) {
    console.error("Error fetching activities:", error);
    res.status(500).json({ message: "Er is een fout opgetreden bij het ophalen van de activiteiten" });
  }
});

// Systeem logs
router.get("/logs", async (req, res) => {
  try {
    const logs = await storage.getSystemLogs();
    res.json(logs);
  } catch (error) {
    console.error("Error fetching logs:", error);
    res.status(500).json({ message: "Er is een fout opgetreden bij het ophalen van de logs" });
  }
});

// Systeem instellingen
router.get("/settings", async (req, res) => {
  try {
    const settings = await storage.getSystemSettings();
    res.json(settings);
  } catch (error) {
    console.error("Error fetching settings:", error);
    res.status(500).json({ message: "Er is een fout opgetreden bij het ophalen van de instellingen" });
  }
});

router.put("/settings", async (req, res) => {
  try {
    const settings = await storage.updateSystemSettings(req.body);
    res.json(settings);
  } catch (error) {
    console.error("Error updating settings:", error);
    res.status(500).json({ message: "Er is een fout opgetreden bij het bijwerken van de instellingen" });
  }
});

export default router; 