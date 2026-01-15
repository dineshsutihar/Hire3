import { prisma } from "../src/prisma.js";
import bcrypt from "bcryptjs";

async function run() {
  console.log("🌱 Seeding database...\n");

  // Clean up existing data
  console.log("Clearing existing data...");
  await prisma.postLike.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.jobApplication.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.job.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("password123", 10);

  // ============================================
  // CREATE USERS
  // ============================================
  console.log("\n👥 Creating users...");

  const dinesh = await prisma.user.create({
    data: {
      name: "Dinesh Sutihar",
      email: "dinesh@dineshsutihar.me",
      password: passwordHash,
      bio: "Full Stack Developer passionate about Web3 and decentralized applications. Building the future of hiring on blockchain.",
      skills: ["react", "typescript", "node", "solana", "rust", "postgres"],
      linkedinUrl: "https://linkedin.com/in/dineshsutihar",
    },
  });
  console.log(`  ✅ Created: ${dinesh.name} (${dinesh.email})`);

  const alice = await prisma.user.create({
    data: {
      name: "Alice Johnson",
      email: "alice@example.com",
      password: passwordHash,
      bio: "Senior Frontend Engineer with 5+ years of experience in React and TypeScript. Love creating beautiful, accessible user interfaces.",
      skills: ["react", "typescript", "css", "tailwindcss", "figma", "nextjs"],
      linkedinUrl: "https://linkedin.com/in/alicejohnson",
    },
  });
  console.log(`  ✅ Created: ${alice.name} (${alice.email})`);

  const bob = await prisma.user.create({
    data: {
      name: "Bob Chen",
      email: "bob@example.com",
      password: passwordHash,
      bio: "Blockchain enthusiast and smart contract developer. Specialized in Solana and Ethereum ecosystems.",
      skills: ["solidity", "rust", "web3.js", "anchor", "typescript", "node"],
      linkedinUrl: "https://linkedin.com/in/bobchen",
    },
  });
  console.log(`  ✅ Created: ${bob.name} (${bob.email})`);

  const carol = await prisma.user.create({
    data: {
      name: "Carol Martinez",
      email: "carol@example.com",
      password: passwordHash,
      bio: "DevOps engineer with expertise in cloud infrastructure and CI/CD pipelines. AWS certified solutions architect.",
      skills: ["aws", "docker", "kubernetes", "terraform", "python", "github-actions"],
      linkedinUrl: "https://linkedin.com/in/carolmartinez",
    },
  });
  console.log(`  ✅ Created: ${carol.name} (${carol.email})`);

  const david = await prisma.user.create({
    data: {
      name: "David Kim",
      email: "david@example.com",
      password: passwordHash,
      bio: "AI/ML Engineer focused on NLP and computer vision. Building intelligent systems that make a difference.",
      skills: ["python", "tensorflow", "pytorch", "scikit-learn", "pandas", "opencv"],
      linkedinUrl: "https://linkedin.com/in/davidkim",
    },
  });
  console.log(`  ✅ Created: ${david.name} (${david.email})`);

  const emma = await prisma.user.create({
    data: {
      name: "Emma Wilson",
      email: "emma@example.com",
      password: passwordHash,
      bio: "Product Manager with a technical background. Passionate about building products that users love.",
      skills: ["agile", "scrum", "jira", "analytics", "sql", "figma"],
      linkedinUrl: "https://linkedin.com/in/emmawilson",
    },
  });
  console.log(`  ✅ Created: ${emma.name} (${emma.email})`);

  const frank = await prisma.user.create({
    data: {
      name: "Frank Rodriguez",
      email: "frank@example.com",
      password: passwordHash,
      bio: "Backend Developer specializing in microservices and high-performance systems. Node.js and Go enthusiast.",
      skills: ["node", "express", "mongodb", "redis", "graphql", "go"],
      linkedinUrl: "https://linkedin.com/in/frankrodriguez",
    },
  });
  console.log(`  ✅ Created: ${frank.name} (${frank.email})`);

  const grace = await prisma.user.create({
    data: {
      name: "Grace Lee",
      email: "grace@example.com",
      password: passwordHash,
      bio: "Mobile Developer with expertise in React Native and Flutter. Creating seamless cross-platform experiences.",
      skills: ["react native", "flutter", "typescript", "ios", "android", "firebase"],
      linkedinUrl: "https://linkedin.com/in/gracelee",
    },
  });
  console.log(`  ✅ Created: ${grace.name} (${grace.email})`);

  // ============================================
  // CREATE JOBS
  // ============================================
  console.log("\n💼 Creating jobs...");

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
      userId: dinesh.id,
      companyName: "Web3 Labs",
      role: "Full-time",
      industry: "Technology",
      experienceLevel: "Senior",
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
      userId: dinesh.id,
      companyName: "DeFi Ventures",
      role: "Full-time",
      industry: "Blockchain",
      experienceLevel: "Senior",
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
      userId: alice.id,
      companyName: "SaaS Pro",
      role: "Full-time",
      industry: "SaaS",
      experienceLevel: "Mid",
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
      userId: frank.id,
      companyName: "FinTech Solutions",
      role: "Full-time",
      industry: "Finance",
      experienceLevel: "Mid",
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
      userId: carol.id,
      companyName: "CloudScale Inc",
      role: "Full-time",
      industry: "Cloud Infrastructure",
      experienceLevel: "Senior",
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
      userId: grace.id,
      companyName: "AppCraft Studio",
      role: "Full-time",
      industry: "Mobile",
      experienceLevel: "Mid",
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
      userId: david.id,
      companyName: "AI Innovations",
      role: "Full-time",
      industry: "Artificial Intelligence",
      experienceLevel: "Senior",
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
      userId: emma.id,
      companyName: "ProductFirst",
      role: "Full-time",
      industry: "Product Management",
      experienceLevel: "Senior",
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
      userId: alice.id,
      companyName: "QualityFirst",
      role: "Full-time",
      industry: "Quality Assurance",
      experienceLevel: "Mid",
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
      userId: dinesh.id,
      companyName: "DesignHub",
      role: "Full-time",
      industry: "Design",
      experienceLevel: "Mid",
    },
    {
      title: "Junior React Developer",
      description:
        "Great opportunity for a junior developer to join a fast-growing startup! You'll work alongside senior developers to build modern web applications using React and TypeScript. We provide mentorship and learning opportunities to help you grow your skills.",
      skills: ["react", "javascript", "html", "css", "git"],
      budget: "800000",
      location: "Remote, India",
      tags: ["junior", "remote", "mentorship", "startup"],
      workMode: "Remote",
      userId: alice.id,
      companyName: "StartupXYZ",
      role: "Full-time",
      industry: "Technology",
      experienceLevel: "Entry",
    },
    {
      title: "Solana Smart Contract Developer",
      description:
        "Looking for an experienced Rust developer to build and audit smart contracts on Solana. You'll work on DeFi protocols, NFT marketplaces, and token programs. Deep understanding of Anchor framework required.",
      skills: ["rust", "solana", "anchor", "typescript", "web3.js"],
      budget: "4500000",
      location: "Remote, Global",
      tags: ["solana", "defi", "nft", "remote"],
      workMode: "Remote",
      userId: bob.id,
      companyName: "Solana Foundation Partner",
      role: "Contract",
      industry: "Blockchain",
      experienceLevel: "Senior",
    },
  ];

  const createdJobs: Awaited<ReturnType<typeof prisma.job.create>>[] = [];
  for (const job of jobs) {
    const created = await prisma.job.create({
      data: {
        ...job,
        skills: JSON.stringify(job.skills),
        tags: JSON.stringify(job.tags),
      },
    });
    createdJobs.push(created);
    console.log(`  ✅ Created job: ${created.title}`);
  }

  // ============================================
  // CREATE JOB APPLICATIONS
  // ============================================
  console.log("\n📝 Creating job applications...");

  const applications = [
    // Alice applies to Full Stack and Blockchain jobs
    { userId: alice.id, jobId: createdJobs[0].id, status: "pending" },
    { userId: alice.id, jobId: createdJobs[1].id, status: "reviewed" },
    
    // Bob applies to Full Stack and Solana jobs
    { userId: bob.id, jobId: createdJobs[0].id, status: "shortlisted" },
    { userId: bob.id, jobId: createdJobs[11].id, status: "pending" },
    
    // Carol applies to DevOps job
    { userId: carol.id, jobId: createdJobs[4].id, status: "interviewed" },
    
    // David applies to AI/ML job
    { userId: david.id, jobId: createdJobs[6].id, status: "pending" },
    
    // Frank applies to Backend job
    { userId: frank.id, jobId: createdJobs[3].id, status: "accepted" },
    { userId: frank.id, jobId: createdJobs[0].id, status: "pending" },
    
    // Grace applies to Mobile job
    { userId: grace.id, jobId: createdJobs[5].id, status: "pending" },
    
    // Emma applies to Product Manager job
    { userId: emma.id, jobId: createdJobs[7].id, status: "reviewed" },
  ];

  for (const app of applications) {
    await prisma.jobApplication.create({ data: app });
    const job = createdJobs.find(j => j.id === app.jobId);
    const user = [alice, bob, carol, david, emma, frank, grace].find(u => u.id === app.userId);
    console.log(`  ✅ ${user?.name} applied to "${job?.title}" (${app.status})`);
  }

  // ============================================
  // CREATE POSTS
  // ============================================
  console.log("\n📰 Creating posts...");

  const posts = [
    {
      title: "Excited to launch Hire3!",
      content: "After months of hard work, we're finally launching Hire3 - a decentralized hiring platform powered by Solana! 🚀 Job seekers can now find opportunities and get paid in crypto. What do you think about the future of Web3 hiring?",
      type: "announcement",
      tags: ["web3", "launch", "solana", "hiring"],
      userId: dinesh.id,
    },
    {
      title: "5 Tips for Landing Your Dream Remote Job",
      content: "1. Optimize your LinkedIn profile with relevant keywords\n2. Build a portfolio showcasing your best work\n3. Network actively in relevant communities\n4. Tailor your resume for each application\n5. Practice interviewing with mock sessions\n\nWhat tips would you add? 💼",
      type: "article",
      tags: ["career", "tips", "remote-work"],
      userId: alice.id,
    },
    {
      title: "Looking for Rust developers!",
      content: "We're building the next generation of DeFi protocols on Solana and need talented Rust developers. If you're passionate about blockchain and want to work on cutting-edge technology, check out our job posting! #hiring #rust #solana",
      type: "job",
      tags: ["hiring", "rust", "solana", "defi"],
      userId: bob.id,
    },
    {
      title: "The importance of CI/CD in modern development",
      content: "Just automated our entire deployment pipeline with GitHub Actions and Kubernetes. Deployment time went from 2 hours to 15 minutes! Here's what I learned about building reliable CI/CD pipelines...",
      type: "article",
      tags: ["devops", "cicd", "automation"],
      userId: carol.id,
    },
    {
      title: "AI is transforming how we work",
      content: "Just integrated GPT-4 into our workflow and productivity increased by 40%! What AI tools are you using in your daily work? Would love to hear your experiences. 🤖",
      type: "discussion",
      tags: ["ai", "productivity", "tech"],
      userId: david.id,
    },
    {
      title: "React Native vs Flutter in 2026",
      content: "After building apps with both frameworks, here's my honest comparison:\n\n✅ React Native: Better for JS/TS teams, larger ecosystem\n✅ Flutter: Better performance, beautiful UI out of the box\n\nWhat's your preference?",
      type: "article",
      tags: ["mobile", "react-native", "flutter"],
      userId: grace.id,
    },
    {
      title: "New to Web3? Start here!",
      content: "Getting a lot of questions about how to get started in Web3 development. Here are my top resources:\n\n1. Solana Cookbook\n2. Buildspace tutorials\n3. Alchemy University\n4. Web3 University\n\nDrop your favorite resources below! 📚",
      type: "article",
      tags: ["web3", "learning", "blockchain"],
      userId: dinesh.id,
    },
  ];

  for (const post of posts) {
    const created = await prisma.post.create({
      data: {
        ...post,
        tags: JSON.stringify(post.tags),
      },
    });
    const author = [dinesh, alice, bob, carol, david, emma, frank, grace].find(u => u.id === post.userId);
    console.log(`  ✅ Created post: "${created.title}" by ${author?.name}`);
  }

  // ============================================
  // CREATE COMMENTS
  // ============================================
  console.log("\n💬 Creating comments...");

  const allPosts = await prisma.post.findMany();
  
  const comments = [
    { content: "This is amazing! Congrats on the launch! 🎉", postId: allPosts[0].id, userId: alice.id },
    { content: "Can't wait to try it out!", postId: allPosts[0].id, userId: bob.id },
    { content: "Great tips! I'd add: always follow up after interviews.", postId: allPosts[1].id, userId: emma.id },
    { content: "Rust is the future! Count me in.", postId: allPosts[2].id, userId: dinesh.id },
    { content: "GitHub Actions is a game changer!", postId: allPosts[3].id, userId: frank.id },
    { content: "Which AI tools specifically? Would love to know more.", postId: allPosts[4].id, userId: alice.id },
    { content: "I prefer React Native for the JS ecosystem.", postId: allPosts[5].id, userId: frank.id },
  ];

  for (const comment of comments) {
    await prisma.comment.create({ data: comment });
    console.log(`  ✅ Added comment on post`);
  }

  // ============================================
  // CREATE POST LIKES
  // ============================================
  console.log("\n❤️ Creating post likes...");

  const likes = [
    { postId: allPosts[0].id, userId: alice.id },
    { postId: allPosts[0].id, userId: bob.id },
    { postId: allPosts[0].id, userId: carol.id },
    { postId: allPosts[0].id, userId: david.id },
    { postId: allPosts[1].id, userId: dinesh.id },
    { postId: allPosts[1].id, userId: emma.id },
    { postId: allPosts[2].id, userId: dinesh.id },
    { postId: allPosts[3].id, userId: alice.id },
    { postId: allPosts[3].id, userId: bob.id },
    { postId: allPosts[4].id, userId: grace.id },
    { postId: allPosts[5].id, userId: alice.id },
    { postId: allPosts[6].id, userId: bob.id },
    { postId: allPosts[6].id, userId: carol.id },
  ];

  for (const like of likes) {
    await prisma.postLike.create({ data: like });
  }
  console.log(`  ✅ Added ${likes.length} likes`);

  // ============================================
  // SUMMARY
  // ============================================
  console.log("\n" + "=".repeat(50));
  console.log("🌱 SEED COMPLETE!");
  console.log("=".repeat(50));
  console.log(`
📊 Summary:
  - Users:        8
  - Jobs:         ${createdJobs.length}
  - Applications: ${applications.length}
  - Posts:        ${posts.length}
  - Comments:     ${comments.length}
  - Likes:        ${likes.length}

🔑 Test Accounts (password: password123):
  - dinesh@dineshsutihar.me (Admin/Job Creator)
  - alice@example.com (Frontend Developer)
  - bob@example.com (Blockchain Engineer)
  - carol@example.com (DevOps Engineer)
  - david@example.com (AI/ML Engineer)
  - emma@example.com (Product Manager)
  - frank@example.com (Backend Developer)
  - grace@example.com (Mobile Developer)
`);
}

run().catch((e) => {
  console.error("❌ Seed failed:", e);
  if (typeof process !== "undefined") process.exit(1);
});
