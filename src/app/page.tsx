import Navbar from "@/components/nav";
import Link from "next/link";
import { Mail, Notebook } from "lucide-react";
import X from "@/components/logos/x-formerly-twitter";
import LinkedinLogo from "@/components/logos/linkedin";
import GithubLogo from "@/components/logos/github";
import ArrowTopRight2 from "@/components/arrow-up";

const LINK_SIZE = 13;

const links = [
  {
    icon: <Notebook width={LINK_SIZE} height={LINK_SIZE} />,
    label: "Resume",
    link: "/resume",
  },
  {
    icon: <GithubLogo width={LINK_SIZE} height={LINK_SIZE} />,
    label: "GitHub",
    link: "https://github.com/bhaveshsinghal95182",
  },
  {
    icon: <LinkedinLogo width={LINK_SIZE} height={LINK_SIZE} />,
    label: "LinkedIn",
    link: "https://www.linkedin.com/in/bhavesh-singhal-2400a4328/",
  },
  {
    icon: <X width={LINK_SIZE} height={LINK_SIZE} />,
    label: "Twitter",
    link: "https://x.com/bhavesh95182",
  },
  {
    icon: <Mail width={LINK_SIZE} height={LINK_SIZE} />,
    label: "Email",
    link: "mailto:worknbhavesh@gmail.com",
  },
];

const projects = [
  {
    name: "DesignFlow",
    description: "Modern design system and component library",
    url: "https://designflow.dev",
    external: true,
  },
  {
    name: "TaskMaster Pro",
    description: "Collaborative project management platform",
    url: "https://taskmaster-pro.com",
    external: true,
  },
  {
    name: "CodeCraft Portfolio",
    description: "Personal portfolio built with React and Three.js",
    url: "https://github.com/bhaveshsinghal/portfolio",
    external: true,
  },
  {
    name: "EcoTracker",
    description: "Sustainability tracking mobile application",
    url: "https://github.com/bhaveshsinghal/ecotracker",
    external: true,
  },
];

export default function Home() {
  return (
    <section className="page flex justify-center my-8 px-4 ">
      <div className="w-[400px] md:w-[600px]">
        <Navbar />
        <h1 className="-tracking-[0.06em] text-[#E65959] font-playfair text-4xl">
          Bhvavesh Singhal
        </h1>
        <div className="flex items-center gap-1">
          <div className="text-muted-black font-jost tracking-tighter text-[12px]">
            developer
          </div>
          <div className="bg-muted-black h-[4px] w-[4px] rounded"></div>
          <div className="text-muted-black font-jost tracking-tighter text-[12px]">
            designer
          </div>
          <div className="bg-muted-black h-[4px] w-[4px] rounded"></div>
          <div className="text-muted-black font-jost tracking-tighter text-[12px]">
            ai enthusiast
          </div>
        </div>

        {/* Intro Text */}
        <div className="intro-text">
          <p className="text-justify tracking-tight font-jost text-muted-black text-sm/snug">
            Hi there, I'm Bhavesh, a 21 y/o CS Student at MMDU Haryana, who
            loves to <span className="font-semibold">code</span> and make my
            life a little easier with the help of{" "}
            <span className="font-semibold">technology</span>. In my spare time,
            I enjoy working on personal{" "}
            <span className="font-semibold">projects</span> and{" "}
            <span className="font-semibold">exploring</span> new technologies.
          </p>
        </div>

        {/* Links */}
        <div className="flex gap-4 links">
          {links.map(({ icon, label, link }) => (
            <div key={label} className="">
              <Link
                href={link}
                target="_blank"
                className={`group flex items-center gap-0.5 text-[${LINK_SIZE}px] font-poppins text-muted-black hover:text-[#E65959] lowercase`}
              >
                {icon}
                <span>{label}</span>
                <span className=" opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200">
                  <ArrowTopRight2 size={`${LINK_SIZE}`} />
                </span>
              </Link>
            </div>
          ))}
        </div>

        <div className="projects">
          <h2 className="text-title font-medium tracking-tight mb-2">
            Projects
          </h2>
          <div className="space-y-2">
            {projects.map((project) => (
              <div key={project.name} className="flex flex-col items-start">
                <Link
                  href={project.url}
                  target={project.external ? "_blank" : "_self"}
                  rel={project.external ? "noopener noreferrer" : undefined}
                  className="group relative -mx-3 w-full transform rounded-lg px-3 py-2 transition-all duration-300 ease-in-out hover:bg-primary md:hover:scale-[1.02]"
                >
                  <div className="flex items-center justify-between text-sm font-medium tracking-tight">
                    <div className="flex items-center">
                      <h3 className="text-black group-hover:text-primary transition-colors duration-150">
                        {project.name}
                      </h3>
                    </div>
                    <span className=" opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200">
                      <ArrowTopRight2 size={`${LINK_SIZE}`} />
                    </span>
                  </div>
                  <p className="text-body text-sm mt-1">
                    {project.description}
                  </p>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
