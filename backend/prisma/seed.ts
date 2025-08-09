import { prisma } from "../src/prisma.js";
import bcrypt from "bcryptjs";

async function run() {
  console.log("Seeding database...");
  await prisma.job.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("Password123!", 10);

  const alice = await prisma.user.create({
    data: {
      name: "Alice Recruiter",
      email: "alice@example.com",
      password: passwordHash,
      skills: ["react", "typescript", "node"],
    },
  });
  const bob = await prisma.user.create({
    data: {
      name: "Bob Developer",
      email: "bob@example.com",
      password: passwordHash,
      skills: ["rust", "solidity", "node", "docker"],
    },
  });

  const jobs = [
    {
      title: "Senior Full Stack Engineer",
      description:
        "Work on decentralised hiring platform. Build APIs and frontends.",
      skills: ["react", "typescript", "node", "postgres"],
      budget: "2500000",
      location: "Remote, India",
      tags: ["remote", "platform", "urgent"],
      workMode: "Remote",
    },
    {
      title: "Blockchain Engineer",
      description:
        "Design and implement smart contracts and off-chain services.",
      skills: ["solidity", "rust", "node", "docker"],
      budget: "3200000",
      location: "Bangalore, India",
      tags: ["blockchain", "defi", "smart-contracts"],
      workMode: "Hybrid",
    },
    {
      title: "Frontend Developer",
      description: "Develop beautiful UIs for our SaaS platform.",
      skills: ["react", "css", "html", "typescript"],
      budget: "1800000",
      location: "Delhi, India",
      tags: ["frontend", "ui", "saas"],
      workMode: "On-site",
    },
    {
      title: "Backend Developer",
      description: "API and microservices development for fintech apps.",
      skills: ["node", "express", "mongodb", "typescript"],
      budget: "2000000",
      location: "Mumbai, India",
      tags: ["backend", "api", "fintech"],
      workMode: "Remote",
    },
    {
      title: "DevOps Engineer",
      description: "Automate CI/CD and manage cloud infrastructure.",
      skills: ["aws", "docker", "kubernetes", "terraform"],
      budget: "2700000",
      location: "Remote, India",
      tags: ["devops", "cloud", "automation"],
      workMode: "Remote",
    },
    {
      title: "Mobile App Developer",
      description: "Build cross-platform mobile apps using React Native.",
      skills: ["react native", "android", "ios", "typescript"],
      budget: "2100000",
      location: "Pune, India",
      tags: ["mobile", "react-native", "cross-platform"],
      workMode: "Hybrid",
    },
    {
      title: "AI/ML Engineer",
      description: "Develop and deploy machine learning models for analytics.",
      skills: ["python", "tensorflow", "pandas", "scikit-learn"],
      budget: "3500000",
      location: "Bangalore, India",
      tags: ["ai", "ml", "analytics"],
      workMode: "On-site",
    },
    {
      title: "Product Manager",
      description: "Lead product development and manage agile teams.",
      skills: ["agile", "scrum", "roadmap", "communication"],
      budget: "4000000",
      location: "Remote, India",
      tags: ["product", "manager", "agile"],
      workMode: "Remote",
    },
    {
      title: "QA Engineer",
      description: "Manual and automated testing for web and mobile apps.",
      skills: ["selenium", "cypress", "jest", "manual testing"],
      budget: "1600000",
      location: "Chennai, India",
      tags: ["qa", "testing", "automation"],
      workMode: "On-site",
    },
    {
      title: "UI/UX Designer",
      description: "Design user-centric interfaces and experiences.",
      skills: ["figma", "adobe xd", "ux", "ui"],
      budget: "1900000",
      location: "Hyderabad, India",
      tags: ["ui", "ux", "design"],
      workMode: "Hybrid",
    },
    {
      title: "Data Engineer",
      description: "Build and maintain data pipelines and ETL processes.",
      skills: ["python", "sql", "airflow", "spark"],
      budget: "3000000",
      location: "Gurgaon, India",
      tags: ["data", "etl", "pipeline"],
      workMode: "Remote",
    },
    {
      title: "Support Engineer",
      description: "Provide technical support and resolve customer issues.",
      skills: ["communication", "troubleshooting", "sql", "linux"],
      budget: "1400000",
      location: "Ahmedabad, India",
      tags: ["support", "customer", "technical"],
      workMode: "On-site",
    },
  ];

  // Seed all jobs for Alice

  const createdJobs: Awaited<ReturnType<typeof prisma.job.create>>[] = [];
  for (const job of jobs) {
    const created = await prisma.job.create({
      data: {
        ...job,
        skills: JSON.stringify(job.skills),
        tags: JSON.stringify(job.tags),
        userId: alice.id,
      },
    });
    createdJobs.push(created);
  }

  // Bob applies to the first job
  // if (createdJobs.length > 0) {
  //   await prisma.jobApplication.create({
  //     data: { userId: bob.id, jobId: createdJobs[0].id },
  //   });
  // }

  console.log("Seed complete.");
}

run().catch((e) => {
  console.error(e);
  if (typeof process !== "undefined") process.exit(1);
});
