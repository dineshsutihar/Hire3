import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import { prisma } from "../prisma.js";

const router = Router();

// GET /dashboard/stats - Get user's dashboard statistics
router.get("/dashboard/stats", authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user!.sub;

    // Get counts in parallel
    const [
      activeJobs,
      totalApplicants,
      myApplications,
      pendingReviews,
      recentJobs,
      recentApplications,
    ] = await Promise.all([
      // Count of user's active jobs
      prisma.job.count({
        where: { userId, status: "active" },
      }),
      // Count of total applicants to user's jobs
      prisma.jobApplication.count({
        where: {
          job: { userId },
        },
      }),
      // Count of user's own applications
      prisma.jobApplication.count({
        where: { userId },
      }),
      // Count of pending applications to review (for user's jobs)
      prisma.jobApplication.count({
        where: {
          job: { userId },
          status: "pending",
        },
      }),
      // Jobs created in last 7 days
      prisma.job.count({
        where: {
          userId,
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      // Applications received in last 7 days
      prisma.jobApplication.count({
        where: {
          job: { userId },
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    res.json({
      activeJobs,
      totalApplicants,
      myApplications,
      pendingReviews,
      recentJobs, // jobs created this week
      recentApplications, // applications received this week
    });
  } catch (e) {
    next(e);
  }
});

export default router;
