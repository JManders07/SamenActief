import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { storage } from "../storage";

export function isAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "U moet ingelogd zijn om deze functie te gebruiken" });
  }

  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: "U heeft geen toegang tot deze functie" });
  }

  next();
}

export function isCenterAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "U moet ingelogd zijn om deze functie te gebruiken" });
  }

  if (req.user?.role !== 'center_admin') {
    return res.status(403).json({ message: "U heeft geen toegang tot deze functie" });
  }

  next();
}

export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "U moet ingelogd zijn om deze functie te gebruiken" });
  }

  next();
}

export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Geen token gevonden" });
  }

  jwt.verify(token, process.env.JWT_SECRET || "your-secret-key", async (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ message: "Ongeldige token" });
    }

    const dbUser = await storage.getUser(user.id);
    if (!dbUser) {
      return res.status(403).json({ message: "Gebruiker niet gevonden" });
    }

    req.user = dbUser;
    next();
  });
} 