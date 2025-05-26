import { Router } from "express";
import { prisma } from "../../lib/prisma";
import { requireAuth } from "../../middleware/auth";
import { requireAdmin } from "../../middleware/admin";

const router = Router();

// Alle gebruikers ophalen
router.get("/", requireAuth, requireAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });
    res.json(users);
  } catch (error) {
    console.error("Fout bij ophalen gebruikers:", error);
    res.status(500).json({ error: "Interne server fout" });
  }
});

// Nieuwe gebruiker aanmaken
router.post("/", requireAuth, requireAdmin, async (req, res) => {
  const { email, name, role } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: "E-mailadres is al in gebruik" });
    }

    const user = await prisma.user.create({
      data: {
        email,
        name,
        role,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    res.status(201).json(user);
  } catch (error) {
    console.error("Fout bij aanmaken gebruiker:", error);
    res.status(500).json({ error: "Interne server fout" });
  }
});

// Gebruiker bijwerken
router.put("/:id", requireAuth, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { name, role } = req.body;

  try {
    const user = await prisma.user.update({
      where: { id },
      data: {
        name,
        role,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    res.json(user);
  } catch (error) {
    console.error("Fout bij bijwerken gebruiker:", error);
    res.status(500).json({ error: "Interne server fout" });
  }
});

// Gebruiker verwijderen
router.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.user.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    console.error("Fout bij verwijderen gebruiker:", error);
    res.status(500).json({ error: "Interne server fout" });
  }
});

export default router; 