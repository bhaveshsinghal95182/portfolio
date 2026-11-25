/**
 * Resume content, kept as data so /resume renders as real HTML — indexable,
 * linkable and readable on phones, which a PDF in an iframe is not.
 * The PDF in /public stays available as a download.
 */

export interface Experience {
  title: string;
  company: string;
  location: string;
  duration: string;
  highlights: string[];
}

export interface Certification {
  name: string;
  issuer: string;
  issueDate: string;
  credentialUrl?: string;
}

export interface Education {
  qualification: string;
  institution: string;
  detail?: string;
}

/** Contact details used by the downloadable PDF. The page has its own links. */
export const contact = {
  phone: "+91 9518208482",
  email: "worknbhavesh@gmail.com",
  site: "https://bhavesh.recso.dev",
  github: "https://github.com/bhaveshsinghal95182",
  linkedin: "https://www.linkedin.com/in/bhavesh-singhal-2400a4328",
} as const;

export const summary =
  "CS student at MMDU Haryana building developer tools, desktop apps and small products. Creator of Recso, Slatey and aisprite.";

export const experience: Experience[] = [
  {
    title: "Freelance Frontend Developer",
    company: "Self-employed",
    location: "Remote",
    duration: "Jun 2024 – Present",
    highlights: [
      "Delivered two production waitlist landing pages (Speechy, PureHydro), bringing in 500+ email signups in their first month.",
      "Added Upstash Redis rate limiting that held up through 1000+ concurrent requests.",
      "Brought Core Web Vitals to 98+ Lighthouse with lazy loading, code splitting and next-gen image compression.",
    ],
  },
  {
    title: "Software Engineer Intern",
    company: "Supertek Glassware",
    location: "Onsite",
    duration: "May 2025 – July 2025",
    highlights: [
      "Engineered production-grade React + TypeScript UI, shipping 3 reusable components adopted across the core product within a 6-week sprint.",
      "Integrated frontend screens with backend REST APIs, adding resilient loading and error states to improve UX quality.",
      "Optimized production stability by resolving critical issues in a legacy PHP codebase, reducing the defect backlog by 15%.",
    ],
  },
];

export const education: Education[] = [
  {
    qualification: "B.Tech, Computer Science",
    institution: "MMDU Haryana",
    detail: "2023 – 2027",
  },
];

export const certifications: Certification[] = [
  {
    name: "Oracle Cloud Infrastructure 2025 Certified Developer Professional",
    issuer: "Oracle",
    issueDate: "October 2025",
    credentialUrl:
      "https://catalog-education.oracle.com/ords/certview/sharebadge?id=DD505CD34F2F7C8BCC5ED3255612AD75D5CBDD67E7A986DE9F42EA1453655B62",
  },
  {
    name: "Certified Application Developer",
    issuer: "ServiceNow University",
    issueDate: "June 2026",
  },
  {
    name: "Certified System Administrator",
    issuer: "ServiceNow University",
    issueDate: "May 2026",
  },
  {
    name: "Micro-certifications",
    issuer: "ServiceNow University",
    issueDate: "February 2026",
  },
];

export const skills: { group: string; items: string[] }[] = [
  {
    group: "Languages",
    items: ["TypeScript", "JavaScript", "Rust", "Python", "Go", "C++", "SQL"],
  },
  {
    group: "Frontend",
    items: [
      "React",
      "Next.js",
      "Tailwind CSS",
      "GSAP",
      "Motion",
      "Electron",
      "Tauri",
    ],
  },
  {
    group: "Backend",
    items: [
      "Node.js",
      "Express",
      "FastAPI",
      "PostgreSQL",
      "MongoDB",
      "Redis",
      "Prisma",
    ],
  },
  {
    group: "Tooling",
    items: ["Docker", "Nginx", "Linux", "Git", "pnpm", "Vercel", "Figma"],
  },
];
