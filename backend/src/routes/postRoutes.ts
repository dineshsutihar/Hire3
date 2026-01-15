import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import { prisma } from "../prisma.js";
import multer from "multer";
import sharp from "sharp";

const router = Router();

// Multer memory storage for image processing
const upload = multer();

// Image upload middleware with compression
const processPostImage = async (
  file: Express.Multer.File | undefined
): Promise<string | null> => {
  if (!file) return null;

  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  if (!allowedTypes.includes(file.mimetype)) {
    throw new Error("Invalid image type. Only JPEG, PNG, GIF, WebP are allowed.");
  }

  // Check file size (10MB max)
  if (file.size > 10 * 1024 * 1024) {
    throw new Error("Image too large. Maximum size is 10MB.");
  }

  // Compress and resize image to max 1200px width
  const compressedBuffer = await sharp(file.buffer)
    .resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 85 })
    .toBuffer();

  const base64Image = compressedBuffer.toString("base64");
  return `data:image/jpeg;base64,${base64Image}`;
};

// Helpers
const parseArray = (raw: string) => {
  try {
    return JSON.parse(raw || "[]");
  } catch {
    return [];
  }
};
const toJson = (val: unknown) => JSON.stringify(val || []);

// GET /posts (public, basic filters: search, tag, type, userId)
router.get("/posts", async (req, res, next) => {
  try {
    const { search, tag, type, userId } = req.query as Record<string, string>;
    let posts = await prisma.post.findMany({ orderBy: { createdAt: "desc" } });
    posts = posts.filter((p: any) => {
      const tags = parseArray(p.tags) as string[];
      return (
        (!search ||
          p.title.toLowerCase().includes(search.toLowerCase()) ||
          p.content.toLowerCase().includes(search.toLowerCase())) &&
        (!tag ||
          tags.some((t) => t.toLowerCase().includes(tag.toLowerCase()))) &&
        (!type || p.type.toLowerCase() === type.toLowerCase()) &&
        (!userId || p.userId === userId)
      );
    });
    res.json(posts.map((p: any) => ({ ...p, tags: parseArray(p.tags) })));
  } catch (e) {
    next(e);
  }
});

// GET /posts/:id
router.get("/posts/:id", async (req, res, next) => {
  try {
    const post = await prisma.post.findUnique({ where: { id: req.params.id } });
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json({ ...post, tags: parseArray(post.tags) });
  } catch (e) {
    next(e);
  }
});

// POST /posts (auth) - supports both JSON and FormData with image upload
router.post(
  "/posts",
  authMiddleware,
  upload.single("image"),
  async (req, res, next) => {
    try {
      const { title, content, type } = req.body;
      
      // Parse tags - could be JSON string from FormData or array from JSON body
      let tags: string[] = [];
      try {
        if (typeof req.body.tags === "string") {
          tags = JSON.parse(req.body.tags);
        } else if (Array.isArray(req.body.tags)) {
          tags = req.body.tags;
        }
      } catch {
        tags = [];
      }

      if (!title || !content || !type) {
        return res
          .status(400)
          .json({ message: "title, content, type required" });
      }

      // Process image if uploaded
      let imageUrl: string | null = null;
      try {
        imageUrl = await processPostImage(req.file);
      } catch (err: any) {
        return res.status(400).json({ message: err.message });
      }

      const post = await prisma.post.create({
        data: {
          title,
          content,
          type,
          tags: toJson(tags),
          imageUrl,
          userId: req.user!.sub,
        },
      });
      res.status(201).json({ ...post, tags });
    } catch (e) {
      next(e);
    }
  }
);

// PUT /posts/:id (owner)
router.put("/posts/:id", authMiddleware, async (req, res, next) => {
  try {
    const existing = await prisma.post.findUnique({
      where: { id: req.params.id },
    });
    if (!existing) return res.status(404).json({ message: "Post not found" });
    if (existing.userId !== req.user!.sub)
      return res.status(403).json({ message: "Access denied" });
    const { title, content, type, tags } = req.body;
    const updated = await prisma.post.update({
      where: { id: req.params.id },
      data: {
        ...(title !== undefined ? { title } : {}),
        ...(content !== undefined ? { content } : {}),
        ...(type !== undefined ? { type } : {}),
        ...(tags !== undefined ? { tags: toJson(tags) } : {}),
      },
    });
    res.json({ ...updated, tags: parseArray(updated.tags) });
  } catch (e) {
    next(e);
  }
});

// DELETE /posts/:id (owner)
router.delete("/posts/:id", authMiddleware, async (req, res, next) => {
  try {
    const existing = await prisma.post.findUnique({
      where: { id: req.params.id },
    });
    if (!existing) return res.status(404).json({ message: "Post not found" });
    if (existing.userId !== req.user!.sub)
      return res.status(403).json({ message: "Access denied" });
    await prisma.post.delete({ where: { id: req.params.id } });
    res.json({ message: "Deleted" });
  } catch (e) {
    next(e);
  }
});

// GET /my-posts
router.get("/my-posts", authMiddleware, async (req, res, next) => {
  try {
    const posts = await prisma.post.findMany({
      where: { userId: req.user!.sub },
      orderBy: { createdAt: "desc" },
    });
    res.json(posts.map((p: any) => ({ ...p, tags: parseArray(p.tags) })));
  } catch (e) {
    next(e);
  }
});

export default router;
