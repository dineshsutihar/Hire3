import { prisma } from "../prisma.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

import { existsSync } from "fs";
import extract from "pdf-text-extract";

export async function extractTextFromFile(
  filePath: string,
  mimetype: string
): Promise<string> {
  if (!existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  if (mimetype !== "application/pdf") {
    throw new Error("Only PDF files are supported");
  }
  return new Promise((resolve, reject) => {
    extract(
      filePath,
      { splitPages: false },
      (err: any, text: string[] | string) => {
        if (err) return reject(err);
        if (Array.isArray(text)) {
          resolve(text.join(" "));
        } else {
          resolve(text);
        }
      }
    );
  });
}
export async function parseAndStoreSkills(userId: string, raw: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  let skills: string[] = [];
  let enrichment: any = {};

  if (apiKey) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      // console.log(raw);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `Extract a JSON object with these keys from the resume text:\nskills: string[] (unique, lower-case, deduped), headline: string|null, summary: string|null, experience_years: number|null, education: string|null, location: string|null. Only output JSON, no markdown.\nResume:\n${raw}\nEND`;

      let text = (await model.generateContent(prompt)).response.text().trim();

      if (text.startsWith("```"))
        text = text.replace(/^```[a-zA-Z]*\s*/, "").replace(/```\s*$/, "");
      const match = text.match(/\{[\s\S]*\}/);
      enrichment = match ? JSON.parse(match[0]) : JSON.parse(text);

      if (Array.isArray(enrichment.skills)) {
        skills = enrichment.skills
          .map((s: any) => String(s).trim().toLowerCase())
          .filter((s: string) => s.length > 1 && s.length <= 40);
      }
    } catch (err) {
      console.warn(
        "Gemini parse failed... Try again later",
        (err as Error).message
      );
    }
  }

  // Merge with existing user skills
  const user = await prisma.user.findUnique({ where: { id: userId } });
  let combined = skills;
  if (user) {
    const prev: string[] = user.skills || [];
    combined = Array.from(new Set([...prev, ...skills]));
  }

  // Update user with merged skills and enrichment fields
  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        skills: combined,
      } as any,
    });
  } catch (e) {
    console.warn("User enrichment update skipped:", (e as Error).message);
  }

  return { parsed: enrichment, skills: combined };
}

export async function findMatchingJobs(userId: string, limit: number) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return [];
  const userSkills: string[] = user.skills || [];
  if (!userSkills.length) return [];
  const jobs = await prisma.job.findMany({ orderBy: { createdAt: "desc" } });
  const scored = jobs
    .map((j: any) => {
      const jobSkills = parseJsonArray(j.skills);
      const overlap = jobSkills.filter((s: string) => userSkills.includes(s));
      return { job: j, score: overlap.length };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
  return scored.map((s) => ({ ...s.job, matchScore: s.score }));
}

function parseJsonArray(raw?: string | null) {
  if (!raw) return [] as string[];
  try {
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}
