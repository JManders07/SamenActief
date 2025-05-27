import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { db } from "../db/schema";
import { eq } from "drizzle-orm";

export async function authenticateAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
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
    
    if (user.role !== "admin") {
      return res.status(403).json({ error: "Geen toegang" });
    }
    
    // Voeg user toe aan request object
    (req as any).user = user;
    
    next();
  } catch (error) {
    res.status(401).json({ error: "Ongeldige token" });
  }
} 