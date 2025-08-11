import { Router } from "express";
import { prisma } from "../prisma.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

const parse = (raw?: string | null) => {
  if (!raw) return [] as string[];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
};
const toJson = (v: unknown) => JSON.stringify(v || []);

// Apply to a job
router.post("/jobs/:id/apply", authMiddleware, async (req, res, next) => {
  try {
    const jobId = req.params.id;
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) return res.status(404).json({ message: "Job not found" });
    const existing = await prisma.jobApplication.findUnique({
      where: { user_job_unique: { userId: req.user!.sub, jobId } },
    });
    if (existing) return res.json({ id: existing.id });
    const app = await prisma.jobApplication.create({
      data: { userId: req.user!.sub, jobId },
    });
    res.status(201).json({ id: app.id });
  } catch (e) {
    next(e);
  }
});

// Get job applicants (owner only)
router.get("/jobs/:id/applicants", authMiddleware, async (req, res, next) => {
  try {
    const job = await prisma.job.findUnique({ where: { id: req.params.id } });
    if (!job) return res.status(404).json({ message: "Job not found" });
    if (job.userId !== req.user!.sub)
      return res.status(403).json({ message: "Access denied" });
    const applications = await prisma.jobApplication.findMany({
      where: { jobId: job.id },
      include: {
        user: { select: { id: true, name: true, email: true, skills: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json({
      applicants: applications.map((a: any) => ({
        id: a.id,
        userId: a.userId,
        status: a.status,
        createdAt: a.createdAt,
        user: {
          id: a.user.id,
          name: a.user.name,
          email: a.user.email,
          skills: Array.isArray(a.user.skills) ? a.user.skills : [],
        },
      })),
    });
  } catch (e) {
    next(e);
  }
});

// Get user's applications
router.get("/applications", authMiddleware, async (req, res, next) => {
  try {
    const apps = await prisma.jobApplication.findMany({
      where: { userId: req.user!.sub },
      include: { job: true },
      orderBy: { createdAt: "desc" },
    });
    res.json({
      applications: apps.map((a: any) => ({
        id: a.id,
        jobId: a.jobId,
        status: a.status,
        createdAt: a.createdAt,
        job: {
          id: a.job.id,
          title: a.job.title,
          description: a.job.description,
          workMode: a.job.workMode,
          location: a.job.location,
          budget: a.job.budget,
          skills: parse(a.job.skills),
          tags: parse(a.job.tags),
          createdAt: a.job.createdAt,
          updatedAt: a.job.updatedAt,
        },
      })),
    });
  } catch (e) {
    next(e);
  }
});

// Update applicant status (accept/reject)
router.patch(
  "/jobs/:jobId/applicants/:applicantId/status",
  authMiddleware,
  async (req, res, next) => {
    try {
      // console.log("Updating applicant status");
      const { jobId, applicantId } = req.params;
      const { status } = req.body;
      if (!["applied", "accepted", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      const job = await prisma.job.findUnique({ where: { id: jobId } });
      if (!job) return res.status(404).json({ message: "Job not found" });
      if (job.userId !== req.user!.sub)
        return res.status(403).json({ message: "Access denied" });
      const app = await prisma.jobApplication.findUnique({
        where: { id: applicantId },
      });
      if (!app || app.jobId !== jobId)
        return res.status(404).json({ message: "Application not found" });
      await prisma.jobApplication.update({
        where: { id: applicantId },
        data: { status },
      });
      res.status(200).json({ message: "Status updated" });
    } catch (e) {
      next(e);
    }
  }
);

export default router;
