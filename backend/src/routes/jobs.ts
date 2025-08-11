import express from "express";
import { prisma } from "../prisma.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// Helper functions for JSON parsing
function parseSkills(skillsString: string): string[] {
  try {
    return JSON.parse(skillsString || "[]");
  } catch {
    return [];
  }
}

function parseTags(tagsString: string): string[] {
  try {
    return JSON.parse(tagsString || "[]");
  } catch {
    return [];
  }
}

// Simple validation
function validateJobData(data: any) {
  const errors: string[] = [];

  if (!data.title?.trim()) errors.push("Title is required");
  if (!data.description?.trim()) errors.push("Description is required");
  if (!data.location?.trim()) errors.push("Location is required");
  if (!data.workMode?.trim()) errors.push("Work mode is required");
  if (!["remote", "hybrid", "onsite"].includes(data.workMode?.toLowerCase())) {
    errors.push("Work mode must be: remote, hybrid, or onsite");
  }

  return { isValid: errors.length === 0, errors };
}

// Get all jobs with filtering
router.get("/", async (req, res) => {
  try {
    const { search, skills, location, workMode, tags } = req.query;

    let jobs = await prisma.job.findMany({
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Parse skills and tags for each job
    jobs = jobs.map((job) => ({
      ...job,
      skills: parseSkills(job.skills),
      tags: parseTags(job.tags),
    }));

    // Simple filtering
    if (search) {
      const searchLower = (search as string).toLowerCase();
      jobs = jobs.filter(
        (job) =>
          job.title.toLowerCase().includes(searchLower) ||
          job.description.toLowerCase().includes(searchLower) ||
          job.location.toLowerCase().includes(searchLower) ||
          job.skills.some((skill) => skill.toLowerCase().includes(searchLower))
      );
    }

    if (skills) {
      const skillsArray = (skills as string)
        .split(",")
        .map((s) => s.trim().toLowerCase());
      jobs = jobs.filter((job) =>
        job.skills.some((jobSkill) =>
          skillsArray.some((searchSkill) =>
            jobSkill.toLowerCase().includes(searchSkill)
          )
        )
      );
    }

    if (location) {
      jobs = jobs.filter((job) =>
        job.location.toLowerCase().includes((location as string).toLowerCase())
      );
    }

    if (workMode) {
      jobs = jobs.filter(
        (job) =>
          job.workMode.toLowerCase() === (workMode as string).toLowerCase()
      );
    }

    if (tags) {
      const tagsArray = (tags as string)
        .split(",")
        .map((t) => t.trim().toLowerCase());
      jobs = jobs.filter((job) =>
        job.tags.some((jobTag) =>
          tagsArray.some((searchTag) =>
            jobTag.toLowerCase().includes(searchTag)
          )
        )
      );
    }

    res.json({ jobs, total: jobs.length });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get single job
router.get("/:id", async (req, res) => {
  try {
    const job = await prisma.job.findUnique({
      where: { id: req.params.id },
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
    });

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.json({
      ...job,
      skills: parseSkills(job.skills),
      tags: parseTags(job.tags),
    });
  } catch (error) {
    console.error("Error fetching job:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Create job (authenticated)
router.post("/", authMiddleware, async (req, res) => {
  try {
    const validation = validateJobData(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        message: "Validation failed",
        errors: validation.errors,
      });
    }

    const { title, description, skills, budget, workMode, location, tags } =
      req.body;

    const job = await prisma.job.create({
      data: {
        title,
        description,
        skills: JSON.stringify(skills || []),
        budget,
        workMode,
        location,
        tags: JSON.stringify(tags || []),
        userId: req.user!.sub,
      },
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
    });

    res.status(201).json({
      ...job,
      skills: parseSkills(job.skills),
      tags: parseTags(job.tags),
    });
  } catch (error) {
    console.error("Error creating job:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update job (authenticated, owner only)
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const job = await prisma.job.findUnique({
      where: { id: req.params.id },
    });

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.userId !== req.user!.sub) {
      return res.status(403).json({ message: "Access denied" });
    }

    const validation = validateJobData(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        message: "Validation failed",
        errors: validation.errors,
      });
    }

    const { title, description, skills, budget, workMode, location, tags } =
      req.body;

    const updatedJob = await prisma.job.update({
      where: { id: req.params.id },
      data: {
        title,
        description,
        skills: JSON.stringify(skills || []),
        budget,
        workMode,
        location,
        tags: JSON.stringify(tags || []),
      },
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
    });

    res.json({
      ...updatedJob,
      skills: parseSkills(updatedJob.skills),
      tags: parseTags(updatedJob.tags),
    });
  } catch (error) {
    console.error("Error updating job:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Delete job (authenticated, owner only)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const job = await prisma.job.findUnique({
      where: { id: req.params.id },
    });

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.userId !== req.user!.sub) {
      return res.status(403).json({ message: "Access denied" });
    }

    await prisma.job.delete({
      where: { id: req.params.id },
    });

    res.json({ message: "Job deleted successfully" });
  } catch (error) {
    console.error("Error deleting job:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get user's jobs
router.get("/my/jobs", authMiddleware, async (req, res) => {
  try {
    let jobs = await prisma.job.findMany({
      where: { userId: req.user!.sub },
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    jobs = jobs.map((job) => ({
      ...job,
      skills: parseSkills(job.skills),
      tags: parseTags(job.tags),
    }));

    res.json(jobs);
  } catch (error) {
    console.error("Error fetching user jobs:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
