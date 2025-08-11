import { Request, Response } from "express";
import { prisma } from "../prisma.js";

export const getProfile = async (req: Request, res: Response) => {
  const userId = req.user?.sub;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return res.status(404).json({ message: "User not found" });
  const { password, skills, ...rest } = user as any;
  res.json({ ...rest, skills: skills || [] });
};

export const updateProfile = async (req: Request, res: Response) => {
  const userId = req.user?.sub;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });
  const { name, bio, linkedinUrl, skills, walletAddress } = req.body as {
    name?: string;
    bio?: string;
    linkedinUrl?: string;
    skills?: string[];
    walletAddress?: string;
  };
  try {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(bio !== undefined ? { bio } : {}),
        ...(linkedinUrl !== undefined ? { linkedinUrl } : {}),
        ...(skills !== undefined ? { skills } : {}),
        ...(walletAddress !== undefined ? { walletAddress } : {}),
      },
    });
    const { password, skills: rawSkills, ...rest } = updated as any;
    res.json({ ...rest, skills: rawSkills || [] });
  } catch (err: any) {
    if (err.code === "P2025") {
      return res.status(404).json({ message: "User not found" });
    }
    throw err;
  }
};
