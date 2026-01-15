import { prisma } from "../prisma.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { existsSync, readFileSync } from "fs";

export async function extractTextFromFile(
  filePath: string,
  mimetype: string
): Promise<string> {
  if (!existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  if (mimetype !== "application/pdf") {
    throw new Error(
      "Only PDF files are supported. Please upload a PDF resume."
    );
  }

  const dataBuffer = readFileSync(filePath);
  
  // Check if file is actually a PDF (magic bytes: %PDF)
  const header = dataBuffer.slice(0, 5).toString("utf-8");
  if (!header.startsWith("%PDF")) {
    throw new Error(
      "Invalid PDF file. The file doesn't appear to be a valid PDF document."
    );
  }

  try {
    // Use pdf-parse lib directly to avoid test file loading issue
    const pdfParse = (await import("pdf-parse/lib/pdf-parse.js")).default;
    
    // Suppress harmless TrueType font warnings from pdfjs
    const originalWarn = console.warn;
    console.warn = (...args: any[]) => {
      const msg = args[0]?.toString() || "";
      if (!msg.includes("TT: undefined function")) {
        originalWarn.apply(console, args);
      }
    };
    
    const result = await pdfParse(dataBuffer);
    
    // Restore console.warn
    console.warn = originalWarn;
    
    const trimmedText = result.text?.trim();
    
    if (!trimmedText) {
      throw new Error("No text content could be extracted from the PDF. The PDF may contain only images or scanned content.");
    }

    return trimmedText;
  } catch (err: any) {
    console.error("PDF parsing error details:", {
      message: err?.message,
      name: err?.name,
      stack: err?.stack?.split("\n").slice(0, 3)
    });
    
    // Provide more specific error messages
    if (err?.message?.includes("Invalid PDF")) {
      throw err;
    }
    if (err?.message?.includes("password")) {
      throw new Error("PDF file is password protected. Please upload an unprotected PDF.");
    }
    if (err?.message?.includes("No text")) {
      throw err;
    }
    
    throw new Error(
      "Failed to parse PDF file. Please ensure it's a valid, unprotected PDF document with text content (not scanned images)."
    );
  }
}

export async function parseAndStoreSkills(userId: string, raw: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  let skills: string[] = [];
  let enrichment: any = {};

  if (apiKey) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      // Use gemini-2.0-flash which is the current fast model
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
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

  type JobType = (typeof jobs)[0];
  interface ScoredJob {
    job: JobType;
    score: number;
  }

  const scored: ScoredJob[] = jobs
    .map((j: JobType): ScoredJob => {
      const jobSkills = parseJsonArray(j.skills);
      const overlap = jobSkills.filter((s: string) => userSkills.includes(s));
      return { job: j, score: overlap.length };
    })
    .filter((r: ScoredJob) => r.score > 0)
    .sort((a: ScoredJob, b: ScoredJob) => b.score - a.score)
    .slice(0, limit);

  return scored.map((s: ScoredJob) => ({ ...s.job, matchScore: s.score }));
}

function parseJsonArray(raw?: string | null) {
  if (!raw) return [] as string[];
  try {
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}
