import { Request, Response } from "express";
import { prisma } from "../prisma.js";
import sharp from "sharp";

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

export const uploadAvatar = async (req: Request, res: Response) => {
  const userId = req.user?.sub;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  try {
    // Compress and resize image using sharp, then convert to base64
    const compressedBuffer = await sharp(req.file.buffer)
      .resize(200, 200, { fit: "cover" }) // Resize to 200x200
      .webp({ quality: 80 }) // Convert to WebP with 80% quality
      .toBuffer();

    // Create data URL for storing in DB
    const avatarUrl = `data:image/webp;base64,${compressedBuffer.toString("base64")}`;

    // Update user's avatar URL
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { avatarUrl },
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
