import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import { prisma } from "../prisma.js";

const router = Router();

const parseArray = (raw?: string | null) => {
  if (!raw) return [] as string[];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
};
const toJson = (val: unknown) => JSON.stringify(val ?? []);

// List jobs with minimal filters
router.get("/jobs", async (req, res, next) => {
  try {
    const { search, skill, location, tag } = req.query as Record<
      string,
      string
    >;
    const jobs = (
      await prisma.job.findMany({ orderBy: { createdAt: "desc" } })
    ).filter((j: any) => {
      const skillsArr: string[] = parseArray(j.skills);
      const tagsArr: string[] = parseArray(j.tags);
      return (
        (!search ||
          j.title.toLowerCase().includes(search.toLowerCase()) ||
          j.description.toLowerCase().includes(search.toLowerCase()) ||
          (j.location || "").toLowerCase().includes(search.toLowerCase()) ||
          skillsArr.some((s: string) =>
            s.toLowerCase().includes(search.toLowerCase())
          )) &&
        (!skill ||
          skillsArr.some((s: string) =>
            s.toLowerCase().includes(skill.toLowerCase())
          )) &&
        (!location ||
          (j.location || "").toLowerCase().includes(location.toLowerCase())) &&
        (!tag ||
          tagsArr.some((t: string) =>
            t.toLowerCase().includes(tag.toLowerCase())
          ))
      );
    });
    res.json({
      jobs: jobs.map((j: any) => ({
        id: j.id,
        title: j.title,
        description: j.description,
        skills: parseArray(j.skills),
        budget: j.budget,
        workMode: j.workMode,
        location: j.location,
        tags: parseArray(j.tags),
        createdAt: j.createdAt,
        updatedAt: j.updatedAt,
        userId: j.userId,
      })),
      nextCursor: null,
    });
  } catch (e) {
    next(e);
  }
});

// Get single job
router.get("/jobs/:id", async (req, res, next) => {
  try {
    const job = await prisma.job.findUnique({ where: { id: req.params.id } });
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json({
      id: job.id,
      title: job.title,
      description: job.description,
      skills: parseArray(job.skills),
      budget: job.budget,
      workMode: job.workMode,
      location: job.location,
      tags: parseArray(job.tags),
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      userId: job.userId,
    });
  } catch (e) {
    next(e);
  }
});

// Create job
router.post("/jobs", authMiddleware, async (req, res, next) => {
  try {
    const {
      title,
      description,
      skills = [],
      budget,
      workMode,
      location,
      tags = [],
    } = req.body;
    if (!title || !description || !workMode || !location)
      return res
        .status(400)
        .json({ message: "title, description, workMode, location required" });
    const job = await prisma.job.create({
      data: {
        title,
        description,
        skills: toJson(skills),
        budget,
        workMode,
        location,
        tags: toJson(tags),
        userId: req.user!.sub,
      },
    });
    res.status(201).json({
      id: job.id,
      title: job.title,
      description: job.description,
      skills,
      budget: job.budget,
      workMode: job.workMode,
      location: job.location,
      tags,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      userId: job.userId,
    });
  } catch (e) {
    next(e);
  }
});

// Delete job
router.delete("/jobs/:id", authMiddleware, async (req, res, next) => {
  try {
    const existing = await prisma.job.findUnique({
      where: { id: req.params.id },
    });
    if (!existing) return res.status(404).json({ message: "Job not found" });
    if (existing.userId !== req.user!.sub)
      return res.status(403).json({ message: "Access denied" });
    await prisma.job.delete({ where: { id: req.params.id } });
    res.json({ message: "Deleted" });
  } catch (e) {
    next(e);
  }
});

// List current user's jobs
router.get("/my-jobs", authMiddleware, async (req, res, next) => {
  try {
    const jobs = await prisma.job.findMany({
      where: { userId: req.user!.sub },
      orderBy: { createdAt: "desc" },
    });
    res.json({
      jobs: jobs.map((j: any) => ({
        id: j.id,
        title: j.title,
        description: j.description,
        skills: parseArray(j.skills),
        budget: j.budget,
        workMode: j.workMode,
        location: j.location,
        tags: parseArray(j.tags),
        status: j.status,
        createdAt: j.createdAt,
        updatedAt: j.updatedAt,
        userId: j.userId,
      })),
    });
  } catch (e) {
    next(e);
  }
});

export default router;
