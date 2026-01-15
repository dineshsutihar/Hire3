import { prisma } from "../src/prisma.js";
import bcrypt from "bcryptjs";

async function run() {
  console.log("Seeding database...");
  await prisma.job.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("password123", 10);

  const dinesh = await prisma.user.create({
    data: {
      name: "Dinesh Sutihar",
      email: "dinesh@dineshsutihar.me",
      password: passwordHash,
      skills: ["react", "typescript", "node"],
    },
  });

  const jobs = [
    {
      title: "Senior Full Stack Engineer",
      description:
        "Join our core engineering team to lead the development of a next-generation decentralized hiring platform. You will be responsible for architecting and building scalable APIs, designing highly interactive frontends, and ensuring seamless integration with blockchain payment systems. This role requires hands-on experience in modern frontend frameworks, backend development, and database optimization. You will collaborate closely with product managers, designers, and blockchain engineers to deliver secure, high-performance features that scale to thousands of global users. We value clean code, strong problem-solving skills, and the ability to mentor junior developers.",
      skills: ["react", "typescript", "node", "postgres", "graphql"],
      budget: "2500000",
      location: "Remote, India",
      tags: ["remote", "platform", "urgent", "full-stack"],
      workMode: "Remote",
    },
    {
      title: "Blockchain Engineer",
      description:
        "As a Blockchain Engineer, you will design and implement secure, efficient, and scalable smart contracts on Solana and Ethereum. You will work on integrating decentralized applications (dApps) with wallet providers like Phantom and MetaMask, optimizing gas fees, and ensuring contract security through audits and testing. Your responsibilities include building off-chain services for transaction validation, integrating decentralized storage solutions like IPFS, and contributing to protocol-level improvements. We are seeking someone with deep knowledge of blockchain architecture, cryptographic principles, and the ability to stay ahead of emerging trends in Web3 development.",
      skills: ["solidity", "rust", "node", "docker", "web3.js"],
      budget: "3200000",
      location: "Bangalore, India",
      tags: ["blockchain", "defi", "smart-contracts", "web3"],
      workMode: "Hybrid",
    },
    {
      title: "Frontend Developer",
      description:
        "We are looking for a creative and detail-oriented Frontend Developer to build beautiful, responsive user interfaces for our SaaS platform. You will work closely with UI/UX designers to translate wireframes into pixel-perfect implementations and ensure consistency across devices and browsers. The role will involve optimizing performance, improving accessibility, and implementing advanced features like real-time updates and interactive dashboards. You should have strong skills in modern frontend technologies and a passion for crafting experiences that delight users.",
      skills: ["react", "css", "html", "typescript", "tailwindcss"],
      budget: "1800000",
      location: "Delhi, India",
      tags: ["frontend", "ui", "saas", "design"],
      workMode: "On-site",
    },
    {
      title: "Backend Developer",
      description:
        "As a Backend Developer, you will design and maintain scalable microservices, implement secure REST and GraphQL APIs, and integrate payment and authentication systems for a fintech application. You will work on optimizing database queries, managing cloud deployments, and ensuring system reliability under high traffic. The role also involves collaborating with frontend developers to provide efficient data structures and endpoints, as well as maintaining proper documentation and unit tests for all services.",
      skills: ["node", "express", "mongodb", "typescript", "redis"],
      budget: "2000000",
      location: "Mumbai, India",
      tags: ["backend", "api", "fintech", "nodejs"],
      workMode: "Remote",
    },
    {
      title: "DevOps Engineer",
      description:
        "We are seeking a DevOps Engineer to build and manage automated CI/CD pipelines, monitor production systems, and maintain scalable cloud infrastructure. You will be responsible for ensuring high availability, implementing infrastructure-as-code with tools like Terraform, and managing containerized workloads in Kubernetes. This role requires deep knowledge of AWS services, cloud cost optimization, and incident response best practices. You will also collaborate with engineering teams to improve deployment efficiency and application reliability.",
      skills: ["aws", "docker", "kubernetes", "terraform", "ansible"],
      budget: "2700000",
      location: "Remote, India",
      tags: ["devops", "cloud", "automation", "infrastructure"],
      workMode: "Remote",
    },
    {
      title: "Mobile App Developer",
      description:
        "As a Mobile App Developer, you will be responsible for building high-performance, cross-platform mobile applications using React Native. You will implement API integrations, design smooth navigation flows, and ensure the apps are optimized for performance on both Android and iOS devices. The role involves collaborating with product and design teams to implement engaging user experiences, troubleshooting and fixing bugs, and keeping up to date with mobile development best practices.",
      skills: ["react native", "android", "ios", "typescript", "redux"],
      budget: "2100000",
      location: "Pune, India",
      tags: ["mobile", "react-native", "cross-platform", "app"],
      workMode: "Hybrid",
    },
    {
      title: "AI/ML Engineer",
      description:
        "We are looking for an AI/ML Engineer to design, develop, and deploy machine learning models that power predictive analytics and intelligent automation. Your work will include data preprocessing, feature engineering, model selection, and deployment of ML services to production environments. You will collaborate with data engineers to handle large-scale datasets, optimize model performance, and ensure results are explainable and interpretable. Familiarity with both supervised and unsupervised learning techniques is a must.",
      skills: ["python", "tensorflow", "pandas", "scikit-learn", "pytorch"],
      budget: "3500000",
      location: "Bangalore, India",
      tags: ["ai", "ml", "analytics", "machine-learning"],
      workMode: "On-site",
    },
    {
      title: "Product Manager",
      description:
        "As a Product Manager, you will define the product vision, create strategic roadmaps, and work closely with engineering, design, and marketing teams to deliver high-impact features. You will be responsible for gathering user feedback, analyzing market trends, and prioritizing product development initiatives. The role requires excellent communication skills, strong analytical thinking, and a passion for building products that solve real-world problems.",
      skills: ["agile", "scrum", "roadmap", "communication", "analytics"],
      budget: "4000000",
      location: "Remote, India",
      tags: ["product", "manager", "agile", "leadership"],
      workMode: "Remote",
    },
    {
      title: "QA Engineer",
      description:
        "Join our QA team to ensure the delivery of high-quality web and mobile applications. You will be responsible for designing test plans, executing manual and automated tests, identifying and tracking bugs, and working with developers to resolve issues. This role involves building and maintaining test automation frameworks, performing regression testing, and contributing to continuous integration pipelines.",
      skills: ["selenium", "cypress", "jest", "manual testing", "playwright"],
      budget: "1600000",
      location: "Chennai, India",
      tags: ["qa", "testing", "automation", "quality"],
      workMode: "On-site",
    },
    {
      title: "UI/UX Designer",
      description:
        "We are seeking a creative UI/UX Designer to craft intuitive and visually engaging experiences for our digital products. You will be involved in user research, creating wireframes and interactive prototypes, and developing design systems that maintain consistency across platforms. This role requires strong collaboration with developers to ensure the designs are implemented accurately and meet performance standards.",
      skills: ["figma", "adobe xd", "ux", "ui", "design-thinking"],
      budget: "1900000",
      location: "Hyderabad, India",
      tags: ["ui", "ux", "design", "creative"],
      workMode: "Hybrid",
    },
  ];

  // Seed all jobs for Dinesh

  const createdJobs: Awaited<ReturnType<typeof prisma.job.create>>[] = [];
  for (const job of jobs) {
    const created = await prisma.job.create({
      data: {
        ...job,
        skills: JSON.stringify(job.skills),
        tags: JSON.stringify(job.tags),
        userId: dinesh.id,
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
