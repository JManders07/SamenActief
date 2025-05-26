import { Request, Response, NextFunction } from "express";

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