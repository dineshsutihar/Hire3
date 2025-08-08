import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../prisma.js";
import { signUserToken } from "../utils/jwt.js";

const SALT_ROUNDS = 10;

export const register = async (req: Request, res: Response) => {
  const { name, email, password } = req.body as {
    name: string;
    email: string;
    password: string;
  };
  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ message: "Name, email, and password are required" });
  }
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    return res.status(409).json({ message: "Email already registered" });
  }

  const hashed = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await prisma.user.create({
    data: { name, email, password: hashed, skills: [] },
  });

  const token = signUserToken(user);
  const { password: _pw, ...safeUser } = user as any;

  return res.status(201).json({ token, user: safeUser });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body as { email: string; password: string };

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = signUserToken(user);
  const { password: _pw, ...safeUser } = user;
  return res.json({ token, user: safeUser });
};
