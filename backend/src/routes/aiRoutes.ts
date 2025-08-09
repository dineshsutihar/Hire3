import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import multer from "multer";
import {
  extractTextFromFile,
  parseAndStoreSkills,
  findMatchingJobs,
} from "../services/ai.js";
import rateLimit from "express-rate-limit";
import path from "path";
import fs from "fs/promises";

const upload = multer({ dest: path.join(process.cwd(), "uploads") });

const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many AI requests, please try again later." },
});

const router = Router();

router.post(
  "/resume/parse",
  authMiddleware,
  aiLimiter,
  upload.single("resume"),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Resume file required" });
      }

      const text = await extractTextFromFile(req.file.path, req.file.mimetype);

      fs.unlink(req.file.path).catch(() => {});

      if (!text.trim()) {
        return res
          .status(400)
          .json({ message: "Failed to extract text from resume" });
      }

      const result = await parseAndStoreSkills(req.user!.sub, text);

      return res.json({ parsed: result.parsed, skills: result.skills });
    } catch (err) {
      if (req.file?.path) {
        fs.unlink(req.file.path).catch(() => {});
      }
      next(err);
    }
  }
);

router.get("/jobs/match", authMiddleware, aiLimiter, async (req, res, next) => {
  try {
    const matches = await findMatchingJobs(
      req.user!.sub,
      Number(req.query.limit) || 10
    );
    res.json({ matches });
  } catch (err) {
    next(err);
  }
});

export default router;
