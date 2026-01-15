import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import { prisma } from "../prisma.js";
import { getRequiredLamports } from "./paymentRoutes.js";

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
        companyName: j.companyName,
        role: j.role,
        industry: j.industry,
        salaryRange: j.salaryRange,
        experienceLevel: j.experienceLevel,
        companyType: j.companyType,
        skills: parseArray(j.skills),
        budget: j.budget,
        workMode: j.workMode,
        location: j.location,
        tags: parseArray(j.tags),
        viewCount: j.viewCount,
        status: j.status,
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
      companyName: job.companyName,
      role: job.role,
      industry: job.industry,
      salaryRange: job.salaryRange,
      experienceLevel: job.experienceLevel,
      companyType: job.companyType,
      skills: parseArray(job.skills),
      budget: job.budget,
      workMode: job.workMode,
      location: job.location,
      tags: parseArray(job.tags),
      viewCount: job.viewCount,
      status: job.status,
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
      companyName,
      role,
      industry,
      salaryRange,
      experienceLevel,
      companyType,
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
    
    // Enforce payment: must have a recent confirmed payment with enough lamports in last 24h
    // Skip payment check if platform fee is 0
    const required = getRequiredLamports();
    if (required > 0) {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const paid = await (prisma as any).payment.findFirst({
        where: {
          userId: req.user!.sub,
          status: "confirmed",
          amountLamports: { gte: required },
          createdAt: { gte: twentyFourHoursAgo },
        },
        orderBy: { createdAt: "desc" },
      });
      if (!paid) {
        return res.status(402).json({
          message:
            "Payment required: please pay platform fee before posting a job.",
        });
      }
    }

    const job = await prisma.job.create({
      data: {
        title,
        description,
        companyName,
        role,
        industry,
        salaryRange,
        experienceLevel,
        companyType,
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
      companyName: job.companyName,
      role: job.role,
      industry: job.industry,
      salaryRange: job.salaryRange,
      experienceLevel: job.experienceLevel,
      companyType: job.companyType,
      skills,
      budget: job.budget,
      workMode: job.workMode,
      location: job.location,
      tags,
      viewCount: job.viewCount,
      status: job.status,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      userId: job.userId,
    });
  } catch (e) {
    next(e);
  }
});

// Update job
router.put("/jobs/:id", authMiddleware, async (req, res, next) => {
  try {
    const existing = await prisma.job.findUnique({
      where: { id: req.params.id },
    });
    if (!existing) return res.status(404).json({ message: "Job not found" });
    if (existing.userId !== req.user!.sub)
      return res.status(403).json({ message: "Access denied" });

    const {
      title,
      description,
      companyName,
      role,
      industry,
      salaryRange,
      experienceLevel,
      companyType,
      skills,
      budget,
      workMode,
      location,
      tags,
      status,
    } = req.body;

    const job = await prisma.job.update({
      where: { id: req.params.id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(companyName !== undefined && { companyName }),
        ...(role !== undefined && { role }),
        ...(industry !== undefined && { industry }),
        ...(salaryRange !== undefined && { salaryRange }),
        ...(experienceLevel !== undefined && { experienceLevel }),
        ...(companyType !== undefined && { companyType }),
        ...(skills !== undefined && { skills: toJson(skills) }),
        ...(budget !== undefined && { budget }),
        ...(workMode !== undefined && { workMode }),
        ...(location !== undefined && { location }),
        ...(tags !== undefined && { tags: toJson(tags) }),
        ...(status !== undefined && { status }),
      },
    });

    res.json({
      id: job.id,
      title: job.title,
      description: job.description,
      companyName: job.companyName,
      role: job.role,
      industry: job.industry,
      salaryRange: job.salaryRange,
      experienceLevel: job.experienceLevel,
      companyType: job.companyType,
      skills: parseArray(job.skills),
      budget: job.budget,
      workMode: job.workMode,
      location: job.location,
      tags: parseArray(job.tags),
      viewCount: job.viewCount,
      status: job.status,
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
