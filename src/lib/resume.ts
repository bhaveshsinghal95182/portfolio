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

export const experience: Experience[] = [
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
    items: ["TypeScript", "JavaScript", "Rust", "Python", "SQL"],
  },
  {
    group: "Frontend",
    items: ["React", "Next.js", "Tailwind CSS", "GSAP", "Motion"],
  },
  { group: "Backend", items: ["Node.js", "Express", "REST APIs", "Prisma"] },
  { group: "Tooling", items: ["Docker", "Git", "pnpm", "Vercel"] },
];
