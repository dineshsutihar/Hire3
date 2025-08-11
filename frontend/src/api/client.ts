/// <reference types="vite/client" />
import type { UserProfile } from "../types";

const API_BASE = import.meta.env.VITE_API_BASE;

export interface ApiError {
  status: number;
  message: string;
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const headers: Record<string, string> = {
    ...((options.headers as Record<string, string>) || {}),
  };
  const isFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData;
  if (!isFormData && !headers["Content-Type"])
    headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    let message = res.statusText;
    try {
      const data = await res.json();
      if (data?.message) message = data.message;
    } catch {}
    throw { status: res.status, message } as ApiError;
  }
  if (res.status === 204) return undefined as unknown as T;
  return res.json() as Promise<T>;
}

interface AuthResponse {
  token: string;
  user: BackendUser;
}
interface BackendUser {
  id?: string;
  name: string;
  email: string;
  bio?: string | null;
  linkedinUrl?: string | null;
  skills: string[];
  walletAddress?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

const mapUser = (u: BackendUser): UserProfile => ({
  name: u.name,
  email: u.email,
  bio: u.bio ?? undefined,
  linkedin: u.linkedinUrl ?? undefined,
  skills: u.skills || [],
  wallet: u.walletAddress ?? undefined,
});

export async function registerUser(input: {
  name: string;
  email: string;
  password: string;
}): Promise<{ token: string; user: UserProfile }> {
  const data = await request<AuthResponse>("/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return { token: data.token, user: mapUser(data.user) };
}

export async function loginUser(input: {
  email: string;
  password: string;
}): Promise<{ token: string; user: UserProfile }> {
  const data = await request<AuthResponse>("/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return { token: data.token, user: mapUser(data.user) };
}

interface ProfileUpdateInput {
  name?: string;
  bio?: string;
  linkedin?: string;
  skills?: string[];
  wallet?: string;
  education?: string;
}

export async function getProfile(token: string): Promise<UserProfile> {
  const data = await request<BackendUser>("/profile", {}, token);
  return mapUser(data);
}

export async function updateProfile(
  token: string,
  input: ProfileUpdateInput
): Promise<UserProfile> {
  const payload: Record<string, unknown> = { ...input };
  if (input.linkedin !== undefined) payload.linkedinUrl = input.linkedin;
  if (input.wallet !== undefined) payload.walletAddress = input.wallet;
  delete (payload as any).linkedin;
  delete (payload as any).wallet;
  const data = await request<BackendUser>(
    "/profile",
    { method: "PUT", body: JSON.stringify(payload) },
    token
  );
  return mapUser(data);
}

// AI endpoints
export interface ResumeParseResponse {
  parsed: Record<string, unknown> & {
    technical_skills?: string[];
    soft_skills?: string[];
    languages?: string[];
    tools?: string[];
  };
  skills: string[];
}

export async function parseResume(
  token: string,
  file: File
): Promise<ResumeParseResponse> {
  const fd = new FormData();
  fd.append("resume", file);
  return request<ResumeParseResponse>(
    "/ai/resume/parse",
    { method: "POST", body: fd },
    token
  );
}

export interface JobMatch {
  id: string;
  title: string;
  companyName?: string | null;
  matchScore?: number;
}
export interface JobMatchResponse {
  matches: JobMatch[];
}

export async function getJobMatches(
  token: string,
  limit = 10
): Promise<JobMatch[]> {
  const data = await request<JobMatchResponse>(
    `/ai/jobs/match?limit=${limit}`,
    {},
    token
  );
  return data.matches.map((m) => ({ ...m }));
}

// Job feed & posting
export interface JobInput {
  title: string;
  description: string;
  companyName?: string;
  technicalSkills?: string[];
  role?: string;
  workMode?: string;
  location?: string;
  salaryRange?: string;
  tags?: string[];
}

export interface Job extends JobInput {
  id: string;
  status?: string;
  applicantCount?: number;
  viewCount?: number;
  skills?: string[];
  matchScore?: number;
  createdAt?: string;
  updatedAt?: string;
}
interface JobListResponse {
  jobs: Job[];
  nextCursor: string | null;
}

export interface JobAnalytics {
  applications: number;
  views?: number;
}

export async function listJobs(
  limit = 25,
  cursor?: string,
  opts?: {
    search?: string;
    role?: string;
    workMode?: string;
    experienceLevel?: string;
    location?: string;
    industry?: string;
    salaryRange?: string;
    companyType?: string;
    education?: string;
  }
): Promise<JobListResponse> {
  const q = new URLSearchParams();
  q.set("limit", String(limit));
  if (cursor) q.set("cursor", cursor);
  if (opts?.search) q.set("search", opts.search);
  if (opts?.role) q.set("role", opts.role);
  if (opts?.workMode) q.set("workMode", opts.workMode);
  if (opts?.experienceLevel) q.set("experienceLevel", opts.experienceLevel);
  if (opts?.location) q.set("location", opts.location);
  if (opts?.industry) q.set("industry", opts.industry);
  if (opts?.salaryRange) q.set("salaryRange", opts.salaryRange);
  if (opts?.companyType) q.set("companyType", opts.companyType);
  if (opts?.education) q.set("education", opts.education);
  return request<JobListResponse>(`/jobs?${q.toString()}`);
}

export async function createJob(token: string, input: JobInput): Promise<Job> {
  return request<Job>(
    `/jobs`,
    { method: "POST", body: JSON.stringify(input) },
    token
  );
}

export async function updateJob(
  token: string,
  jobId: string,
  input: Partial<JobInput>
): Promise<Job> {
  return request<Job>(
    `/jobs/${jobId}`,
    { method: "PUT", body: JSON.stringify(input) },
    token
  );
}

export async function applyToJob(
  token: string,
  jobId: string
): Promise<{ id: string }> {
  return request<{ id: string }>(
    `/jobs/${jobId}/apply`,
    { method: "POST" },
    token
  );
}

export async function getJobAnalytics(
  token: string,
  jobId: string
): Promise<JobAnalytics> {
  return request<JobAnalytics>(`/jobs/${jobId}/analytics`, {}, token);
}

// Get user's applications
export async function getUserApplications(token: string): Promise<{
  applications: Array<{
    id: string;
    jobId: string;
    status: string;
    createdAt: string;
    job: Job;
  }>;
}> {
  return request<{
    applications: Array<{
      id: string;
      jobId: string;
      status: string;
      createdAt: string;
      job: Job;
    }>;
  }>("/applications", {}, token);
}

// Get user's posted jobs
export async function getUserJobs(token: string): Promise<{
  jobs: Job[];
}> {
  return request<{ jobs: Job[] }>("/my-jobs", {}, token);
}

// Get applicants for a job
export async function getJobApplicants(
  token: string,
  jobId: string
): Promise<{
  applicants: Array<{
    id: string;
    userId: string;
    status: string;
    createdAt: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  }>;
}> {
  return request<{
    applicants: Array<{
      id: string;
      userId: string;
      status: string;
      createdAt: string;
      user: {
        id: string;
        name: string;
        email: string;
      };
    }>;
  }>(`/jobs/${jobId}/applicants`, {}, token);
}

export async function updateApplicantStatus(
  token: string,
  jobId: string,
  applicantId: string,
  status: "applied" | "accepted" | "rejected"
): Promise<void> {
  await request<{ message: string }>(
    `/jobs/${jobId}/applicants/${applicantId}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    },
    token
  );
}

export const api = {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  parseResume,
  getJobMatches,
  listJobs,
  createJob,
  updateJob,
  applyToJob,
  getJobAnalytics,
  getUserApplications,
  getUserJobs,
  getJobApplicants,
  updateApplicantStatus,
};

export default api;
