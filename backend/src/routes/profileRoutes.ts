import { Router, Request } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { getProfile, updateProfile, uploadAvatar } from "../controllers/profileController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

// Ensure uploads directory exists
const avatarDir = path.join(process.cwd(), "uploads", "avatars");
if (!fs.existsSync(avatarDir)) {
  fs.mkdirSync(avatarDir, { recursive: true });
}

// Configure multer for avatar uploads (multer v2 API)
const upload = multer({
  dest: avatarDir,
});

// Custom middleware to handle avatar upload with validation
const avatarUpload = async (req: Request, res: any, next: any) => {
  upload.single("avatar")(req, res, async (err: any) => {
    if (err) {
      return res.status(400).json({ message: err.message || "Upload failed" });
    }
    
    if (!req.file) {
      return next(); // No file, let controller handle it
    }
    
    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(req.file.mimetype)) {
      fs.unlink(req.file.path, () => {});
      return res.status(400).json({ message: "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed." });
    }
    
    // Validate file size (5MB)
    if (req.file.size > 5 * 1024 * 1024) {
      fs.unlink(req.file.path, () => {});
      return res.status(400).json({ message: "File too large. Maximum size is 5MB." });
    }
    
    // Rename file with proper extension
    const userId = req.user?.sub || "unknown";
    const ext = path.extname(req.file.originalname) || ".jpg";
    const newFilename = `${userId}-${Date.now()}${ext}`;
    const newPath = path.join(avatarDir, newFilename);
    
    try {
      fs.renameSync(req.file.path, newPath);
      req.file.filename = newFilename;
      req.file.path = newPath;
    } catch (e) {
      fs.unlink(req.file.path, () => {});
      return res.status(500).json({ message: "Failed to process upload" });
    }
    
    next();
  });
};

router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);
router.post("/profile/avatar", authMiddleware, avatarUpload, uploadAvatar);

export default router;
