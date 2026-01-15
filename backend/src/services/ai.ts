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

  try {
    // Dynamic import to avoid issues at startup
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
    pdfjs.GlobalWorkerOptions.workerSrc = "";

    const dataBuffer = readFileSync(filePath);
    const data = new Uint8Array(dataBuffer);
    const pdf = await pdfjs.getDocument({ data, useSystemFonts: true }).promise;

    let fullText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(" ");
      fullText += pageText + "\n";
    }

    return fullText.trim();
  } catch (err) {
    console.error("PDF parsing error:", err);
    throw new Error(
      "Failed to parse PDF file. Please ensure it's a valid PDF document."
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
