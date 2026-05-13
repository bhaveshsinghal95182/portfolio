import Link from "next/link";
import ArrowTopRight2 from "@/components/arrow-up";
import Bulb2Fill from "./bulb";

const projects = [
  {
    name: "Kickstart Express",
    description: "A scaffolder cli tool to quickly generate an express app",
    url: "https://kickstart.express",
    external: true,
    milestone: "1k+ weekly downloads",
    milestoneColor: "bg-red-100 text-red-600", // Muted red
  },
  {
    name: "Company-Logos",
    description:
      "An NPM package inspired by shadcn to create logos in all frontend frameworks",
    url: "https://logos-www.vercel.app/",
    external: true,
    milestone: "500+ weekly downloads",
    milestoneColor: "bg-blue-100 text-blue-600", // Muted blue
  },
  {
    name: "Code Execution Backend",
    description:
      "Backend service for executing code snippets compatible in C, C++, Java etc",
    url: "https://github.com/bhaveshsinghal95182/code-execution-backend",
    external: true,
    milestone: "Open Source",
    milestoneColor: "bg-green-100 text-green-600", // Muted green
  },
  {
    name: "Figma Plugin",
    description: "A plugin to create a color palette using tweakcn colors",
    url: "https://www.figma.com/community/plugin/1533799530090421982/tweakcn-css-import",
    external: true,
    milestone: "182 users",
    milestoneColor: "bg-purple-100 text-purple-600", // Muted purple
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
                <div className="flex items-center gap-2">
                  <h3 className="font-sans text-black group-hover:text-primary transition-colors duration-150">
                    {project.name}
                  </h3>
                  <span
                    className={`px-1.5 py-0.5 text-[10px] font-mono font-medium rounded-md ${project.milestoneColor}`}
                  >
                    {project.milestone}
                  </span>
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
      <Link href="https://github.com/bhaveshsinghal95182">
        <div className="group mt-2 p-2 px-4 max-w-76 bg-accent/15 border border-black rounded-2xl text-xs font-jost flex gap-1">
          <Bulb2Fill
            size="16"
            className="text-black transition-colors duration-200 group-hover:text-accent"
          />
          You can check out more of my work on{" "}
          <span className="font-bold transition-colors duration-200 group-hover:text-accent">
            GitHub.
          </span>
        </div>
      </Link>
    </div>
  );
}
