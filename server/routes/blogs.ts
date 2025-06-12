import { Router } from "express";
import { db } from "../db";
import { blogs, users } from "@shared/schema";
import { eq } from "drizzle-orm";

const router = Router();

// Haal alle gepubliceerde blogs op
router.get("/", async (req, res) => {
  try {
    const allBlogs = await db.query.blogs.findMany({
      where: eq(blogs.published, true),
      with: {
        author: {
          columns: {
            displayName: true
          }
        }
      },
      orderBy: blogs.createdAt
    });

    // Transformeer de data naar het juiste formaat
    const formattedBlogs = allBlogs.map(blog => ({
      id: blog.id,
      title: blog.title,
      content: blog.content,
      image_url: blog.imageUrl,
      created_at: blog.createdAt,
      author: {
        display_name: blog.author.displayName
      }
    }));

    res.json(formattedBlogs);
  } catch (error) {
    console.error("Error fetching blogs:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Haal een specifieke blog op
router.get("/:id", async (req, res) => {
  try {
    const blog = await db.query.blogs.findFirst({
      where: eq(blogs.id, parseInt(req.params.id)),
      with: {
        author: {
          columns: {
            displayName: true
          }
        }
      }
    });

    if (!blog) {
      return res.status(404).json({ error: "Blog niet gevonden" });
    }

    // Transformeer de data naar het juiste formaat
    const formattedBlog = {
      id: blog.id,
      title: blog.title,
      content: blog.content,
      image_url: blog.imageUrl,
      created_at: blog.createdAt,
      author: {
        display_name: blog.author.displayName
      }
    };

    res.json(formattedBlog);
  } catch (error) {
    console.error("Error fetching blog:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router; 