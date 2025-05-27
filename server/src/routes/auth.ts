import { Router } from "express";
import { db } from "../db/schema";
import { eq } from "drizzle-orm";
import { hash, compare } from "bcrypt";
import jwt from "jsonwebtoken";

const router = Router();

// Login route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await db.query.users.findFirst({
      where: eq(db.users.email, email),
    });
    
    if (!user) {
      return res.status(401).json({ error: "Ongeldige inloggegevens" });
    }
    
    const validPassword = await compare(password, user.password);
    
    if (!validPassword) {
      return res.status(401).json({ error: "Ongeldige inloggegevens" });
    }
    
    // Update last login
    await db.update(db.users)
      .set({ lastLogin: new Date() })
      .where(eq(db.users.id, user.id));
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" }
    );
    
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Fout bij het inloggen" });
  }
});

// Register route
router.post("/register", async (req, res) => {
  try {
    const { email, password, name, phone, village, neighborhood, anonymousParticipation } = req.body;
    
    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(db.users.email, email),
    });
    
    if (existingUser) {
      return res.status(400).json({ error: "E-mailadres is al in gebruik" });
    }
    
    const hashedPassword = await hash(password, 10);
    
    const user = await db.insert(db.users).values({
      email,
      password: hashedPassword,
      name,
      phone,
      village,
      neighborhood,
      anonymousParticipation,
      role: "user",
    }).returning();
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user[0].id, email: user[0].email, role: user[0].role },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" }
    );
    
    res.json({
      token,
      user: {
        id: user[0].id,
        email: user[0].email,
        name: user[0].name,
        role: user[0].role,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Fout bij het registreren" });
  }
});

// Get current user route
router.get("/user", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    
    if (!token) {
      return res.status(401).json({ error: "Niet ingelogd" });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key") as {
      id: number;
      email: string;
      role: string;
    };
    
    const user = await db.query.users.findFirst({
      where: eq(db.users.id, decoded.id),
    });
    
    if (!user) {
      return res.status(401).json({ error: "Gebruiker niet gevonden" });
    }
    
    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
  } catch (error) {
    res.status(401).json({ error: "Ongeldige token" });
  }
});

// Logout route
router.post("/logout", async (req, res) => {
  res.json({ message: "Succesvol uitgelogd" });
});

// Reset password route
router.post("/reset-password", async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await db.query.users.findFirst({
      where: eq(db.users.email, email),
    });
    
    if (!user) {
      return res.status(404).json({ error: "Gebruiker niet gevonden" });
    }
    
    // Generate reset token
    const resetToken = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "1h" }
    );
    
    // TODO: Send reset email with token
    
    res.json({ message: "Reset link is verzonden naar uw e-mailadres" });
  } catch (error) {
    res.status(500).json({ error: "Fout bij het resetten van wachtwoord" });
  }
});

export default router; 