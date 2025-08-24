import Link from "next/link";
import ArrowTopRight2 from "@/components/arrow-up";

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

interface ProjectsProps {
  LINK_SIZE: number;
}

export default function Projects({ LINK_SIZE }: ProjectsProps) {
  return (
    <div className="mt-8">
      <h2 className="text-title font-jost font-medium tracking-tight mb-2">
        Projects
      </h2>
      <div className="space-y-2">
        {projects.map((project) => (
          <div key={project.name} className="flex flex-col items-start">
            <Link
              href={project.url}
              target={project.external ? "_blank" : "_self"}
              rel={project.external ? "noopener noreferrer" : undefined}
              className="group relative -mx-3 w-full transform rounded-lg px-3 py-2 transition-all duration-300 ease-in-out hover:bg-accent/15 md:hover:scale-[1.03]"
            >
              <div className="flex items-center justify-between text-sm font-medium tracking-tight">
                <div className="flex items-center">
                  <h3 className="font-sans text-black group-hover:text-primary transition-colors duration-150">
                    {project.name}
                  </h3>
                </div>
                <span className=" opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200">
                  <ArrowTopRight2 size={`${LINK_SIZE}`} />
                </span>
              </div>
              <p className="text-body font-poppins text-sm mt-1">
                {project.description}
              </p>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
