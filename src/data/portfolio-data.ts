import projectClouddash from "@/assets/project-clouddash.jpg";
import projectEcotrack from "@/assets/project-ecotrack.jpg";
import projectDevflow from "@/assets/project-devflow.jpg";
import projectMedconnect from "@/assets/project-medconnect.jpg";
import certAws from "@/assets/cert-aws.jpg";
import certGcp from "@/assets/cert-gcp.jpg";
import certCka from "@/assets/cert-cka.jpg";
import certMongodb from "@/assets/cert-mongodb.jpg";

export const personalInfo = {
  name: "Clinton Arasa",
  title: "Senior Full-Stack Developer & Cloud Architect",
  bio: "Passionate technologist with 8+ years of experience building scalable web applications and leading cross-functional teams. I thrive at the intersection of elegant design and robust engineering, turning complex problems into intuitive digital experiences.",
  email: "clitonarasa2@gmail.com",
  phone: "+254111823812",
  location: "San Francisco, CA",
  linkedin: "https://linkedin.com/in/alexmorgan",
  github: "https://github.com/alexmorgan",
  website: "https://alexmorgan.dev",
};

export const professionalSummary =
  "Results-driven full-stack developer with deep expertise in React, Node.js, and cloud infrastructure. Proven track record of delivering high-impact products at scale, mentoring engineering teams, and driving technical strategy. Adept at translating business requirements into performant, maintainable software solutions.";

export const skills = {
  technical: [
    "React / Next.js",
    "TypeScript",
    "Node.js",
    "Python",
    "PostgreSQL",
    "AWS / GCP",
    "Docker & Kubernetes",
    "GraphQL",
    "CI/CD Pipelines",
    "System Design",
    "REST APIs",
    "Redis",
  ],
  soft: [
    "Technical Leadership",
    "Agile / Scrum",
    "Cross-functional Collaboration",
    "Mentoring & Coaching",
    "Strategic Planning",
    "Public Speaking",
    "Problem Solving",
    "Stakeholder Communication",
  ],
};

export const workExperience = [
  {
    title: "Senior Full-Stack Developer",
    company: "TechCorp Inc.",
    location: "San Francisco, CA",
    dates: "Jan 2021 – Present",
    responsibilities: [
      "Lead a team of 6 engineers building a real-time analytics platform serving 2M+ monthly users",
      "Architected microservices migration reducing deployment time by 70%",
      "Implemented comprehensive CI/CD pipeline with 95% test coverage",
      "Mentored 4 junior developers, 2 of whom were promoted to mid-level within a year",
    ],
    achievements: [
      "Reduced page load time by 45% through performance optimization",
      "Awarded 'Engineer of the Year' 2023",
    ],
  },
  {
    title: "Full-Stack Developer",
    company: "InnovateLab",
    location: "Austin, TX",
    dates: "Jun 2018 – Dec 2020",
    responsibilities: [
      "Developed and maintained 3 customer-facing SaaS products",
      "Built real-time notification system handling 500K+ daily events",
      "Collaborated with design team to implement responsive UI components",
      "Conducted code reviews and established coding standards",
    ],
    achievements: [
      "Launched MVP that acquired 10K users in first month",
      "Improved API response times by 60%",
    ],
  },
  {
    title: "Junior Developer",
    company: "StartupXYZ",
    location: "Remote",
    dates: "Aug 2016 – May 2018",
    responsibilities: [
      "Built front-end features using React and Redux",
      "Integrated third-party APIs for payment processing and analytics",
      "Participated in daily standups and sprint planning",
    ],
    achievements: [
      "Shipped 20+ features within first 6 months",
    ],
  },
];

export const projects = [
  {
    name: "CloudDash Analytics",
    description: "Real-time analytics dashboard for cloud infrastructure monitoring with customizable widgets and alerting.",
    technologies: ["React", "TypeScript", "D3.js", "Node.js", "PostgreSQL"],
    role: "Tech Lead & Architect",
    link: "https://github.com/alexmorgan/clouddash",
    screenshot: projectClouddash,
  },
  {
    name: "EcoTrack",
    description: "Mobile-first sustainability tracking app helping users reduce their carbon footprint with personalized recommendations.",
    technologies: ["React Native", "GraphQL", "Python", "AWS Lambda"],
    role: "Full-Stack Developer",
    link: "https://github.com/alexmorgan/ecotrack",
    screenshot: projectEcotrack,
  },
  {
    name: "DevFlow",
    description: "Open-source developer workflow automation tool with GitHub integration and custom pipeline builders.",
    technologies: ["Next.js", "TypeScript", "Docker", "Redis"],
    role: "Creator & Maintainer",
    link: "https://github.com/alexmorgan/devflow",
    screenshot: projectDevflow,
  },
  {
    name: "MedConnect",
    description: "Telemedicine platform connecting patients with healthcare providers, featuring video consultations and secure messaging.",
    technologies: ["React", "WebRTC", "Node.js", "MongoDB"],
    role: "Frontend Lead",
    link: "https://github.com/alexmorgan/medconnect",
    screenshot: projectMedconnect,
  },
];

export const educationLevels = [
  "Primary (KCPE)",
  "Secondary (KCSE)",
  "Certificate",
  "Diploma",
  "Degree",
  "Postgraduate Diploma",
  "Master's Degree",
  "Doctorate (PhD)",
] as const;

export const kcseGrades = [
  "A", "A-", "B+", "B plain", "B-", "C+", "C plain", "C-", "D+", "D plain", "D-", "E",
] as const;

export const kcpeScoreRange = { min: 1, max: 400 } as const;

export const degreeClasses = [
  "First Class Honours",
  "Second Class Honours (Upper Division)",
  "Second Class Honours (Lower Division)",
  "Pass",
  "Fail",
] as const;

export const certificatesAwarded = [
  "KCPE (Kenya Certificate of Primary Education)",
  "KCSE (Kenya Certificate of Secondary Education)",
  "Certificate",
  "Diploma",
  "Higher Diploma",
  "Bachelor's Degree",
  "Postgraduate Diploma",
  "Master's Degree",
  "Doctorate (PhD)",
] as const;

export type EducationLevel = (typeof educationLevels)[number];
export type CertificateAwarded = (typeof certificatesAwarded)[number];

export const education = [
  {
    degree: "M.S. Computer Science",
    institution: "Stanford University",
    dates: "2014 – 2016",
    details: "Specialization in Distributed Systems. GPA: 3.9/4.0",
    levelOfStudy: "Master's Degree" as EducationLevel,
    certificateAwarded: "Master's Degree" as CertificateAwarded,
    grade: "",
  },
  {
    degree: "B.S. Computer Engineering",
    institution: "University of California, Berkeley",
    dates: "2010 – 2014",
    details: "Dean's List all semesters. Senior thesis on real-time data processing.",
    levelOfStudy: "Degree" as EducationLevel,
    certificateAwarded: "Bachelor's Degree" as CertificateAwarded,
    grade: "",
  },
];

export const certifications = [
  {
    name: "AWS Solutions Architect – Professional (2023)",
    image: certAws,
  },
  {
    name: "Google Cloud Professional Cloud Architect (2022)",
    image: certGcp,
  },
  {
    name: "Certified Kubernetes Administrator (CKA) (2021)",
    image: certCka,
  },
  {
    name: "MongoDB Certified Developer Associate (2020)",
    image: certMongodb,
  },
];

export const awards = [
  "Engineer of the Year, TechCorp Inc. – 2023",
  "Best Open Source Project, DevConf – 2022",
  "Innovation Award, InnovateLab – 2020",
  "Dean's Award for Academic Excellence – 2014",
];

export const hobbies = [
  { name: "Open Source Contributing", icon: "Code" },
  { name: "Rock Climbing", icon: "Mountain" },
  { name: "Photography", icon: "Camera" },
  { name: "Technical Writing", icon: "BookOpen" },
  { name: "Chess", icon: "Trophy" },
  { name: "Travel", icon: "Globe" },
];

export const blogArticles = [
  {
    title: "Building Scalable Microservices with Node.js and Kubernetes",
    excerpt: "A deep dive into architecting production-ready microservices, covering service mesh patterns, container orchestration, and observability strategies.",
    date: "2024-12-15",
    readTime: "12 min read",
    tags: ["Microservices", "Kubernetes", "Node.js"],
    link: "https://dev.to/alexmorgan/scalable-microservices",
    category: "Architecture",
  },
  {
    title: "React Performance Optimization: From 4s to 400ms Load Time",
    excerpt: "How I reduced our analytics dashboard load time by 90% using code splitting, virtualization, and strategic caching.",
    date: "2024-09-22",
    readTime: "8 min read",
    tags: ["React", "Performance", "Case Study"],
    link: "https://dev.to/alexmorgan/react-performance",
    category: "Case Study",
  },
  {
    title: "A Practical Guide to CI/CD with GitHub Actions",
    excerpt: "Step-by-step walkthrough of building a comprehensive CI/CD pipeline with automated testing, staging deployments, and rollback strategies.",
    date: "2024-07-10",
    readTime: "15 min read",
    tags: ["CI/CD", "DevOps", "GitHub Actions"],
    link: "https://dev.to/alexmorgan/cicd-github-actions",
    category: "Tutorial",
  },
  {
    title: "Why We Migrated from REST to GraphQL — And What We Learned",
    excerpt: "Lessons from migrating a high-traffic API to GraphQL, including performance trade-offs, schema design patterns, and developer experience wins.",
    date: "2024-04-18",
    readTime: "10 min read",
    tags: ["GraphQL", "API Design", "TypeScript"],
    link: "https://dev.to/alexmorgan/rest-to-graphql",
    category: "Case Study",
  },
  {
    title: "Securing Cloud Infrastructure: IAM Best Practices for Startups",
    excerpt: "Essential cloud security patterns every startup should implement from day one, with real-world examples from AWS and GCP.",
    date: "2024-01-30",
    readTime: "11 min read",
    tags: ["Security", "AWS", "Cloud"],
    link: "https://dev.to/alexmorgan/cloud-security-iam",
    category: "Tutorial",
  },
];

export const references = [
  {
    name: "Dr. Sarah Chen",
    title: "VP of Engineering, TechCorp Inc.",
    contact: "Available upon request",
  },
  {
    name: "James Rodriguez",
    title: "CTO, InnovateLab",
    contact: "Available upon request",
  },
];
