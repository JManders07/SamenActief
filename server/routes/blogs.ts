import { Router } from "express";
import { db } from "../db";

const router = Router();

// Haal alle gepubliceerde blogs op
router.get("/", async (req, res) => {
  try {
    const blogs = await db.query(`
      SELECT 
        b.*,
        json_build_object(
          'display_name', u.display_name
        ) as author
      FROM blogs b
      JOIN users u ON b.author_id = u.id
      WHERE b.published = true
      ORDER BY b.created_at DESC
    `);

    res.json(blogs.rows);
  } catch (error) {
    console.error("Error fetching blogs:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router; 