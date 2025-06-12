import { Router } from "express";
import { db } from "../db";
import { blogs, users, blogComments } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

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

// Haal comments voor een blog op
router.get("/:id/comments", async (req, res) => {
  try {
    const comments = await db.query.blogComments.findMany({
      where: eq(blogComments.blogId, parseInt(req.params.id)),
      with: {
        user: {
          columns: {
            displayName: true,
          },
        },
      },
      orderBy: desc(blogComments.createdAt),
    });

    const formatted = comments.map((c) => ({
      id: c.id,
      content: c.content,
      created_at: c.createdAt,
      user: {
        display_name: c.user.displayName,
      },
    }));

    res.json(formatted);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Voeg een comment toe (auth vereist)
router.post("/:id/comments", async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Niet geautoriseerd" });
    }

    const user = req.user as any;
    const { content } = req.body;
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: "Content mag niet leeg zijn" });
    }

    const [inserted] = await db
      .insert(blogComments)
      .values({
        blogId: Number(req.params.id),
        userId: Number(user.id),
        content,
      })
      .returning();

    res.status(201).json({
      id: inserted.id,
      content: inserted.content,
      created_at: inserted.createdAt,
      user: {
        display_name: user.displayName,
      },
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router; 