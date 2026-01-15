import { Router, Request, Response, NextFunction } from "express";
import multer from "multer";
import { getProfile, updateProfile, uploadAvatar } from "../controllers/profileController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

// Configure multer for memory storage (multer v2)
const upload = multer();

// Middleware to validate avatar upload
const validateAvatar = (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) {
    return next(); // Let controller handle missing file
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  if (!allowedTypes.includes(req.file.mimetype)) {
    return res.status(400).json({ message: "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed." });
  }

  if (req.file.size > 5 * 1024 * 1024) {
    return res.status(400).json({ message: "File too large. Maximum size is 5MB." });
  }

  next();
};

router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);
router.post("/profile/avatar", authMiddleware, upload.single("avatar"), validateAvatar, uploadAvatar);

export default router;
