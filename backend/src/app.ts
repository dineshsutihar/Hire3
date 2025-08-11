import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import jobsExtendedRoutes from "./routes/jobsExtendedRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { initPrismaShutdownHooks } from "./prisma.js";

dotenv.config();

const app = express();

app.use(
  cors({
    // origin: process.env.CORS_ORIGIN?.split(",") || "*",
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  })
);
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api", authRoutes);
app.use("/api", profileRoutes);
app.use("/api", jobRoutes);
app.use("/api", jobsExtendedRoutes);
app.use("/api", postRoutes);
app.use("/api/ai", aiRoutes);

// 404 fallback
app.use("/api", (_req, res) => {
  res.status(404).json({ message: "Not found" });
});

app.use(errorHandler);

initPrismaShutdownHooks();

export default app;
