import { Mail, Notebook } from "lucide-react";
import X from "@/components/logos/x-formerly-twitter";
import GithubLogo from "@/components/logos/github";
import Link from "next/link";
import ArrowTopRight2 from "@/components/arrow-up";
import { site } from "@/lib/site";

interface LinksProps {
  LINK_SIZE: number;
}

export default function Links({ LINK_SIZE }: LinksProps) {
  const links = [
    {
      icon: <Notebook width={LINK_SIZE} height={LINK_SIZE} />,
      label: "Resume",
      link: "/resume",
      external: false,
    },
    {
      icon: <GithubLogo width={LINK_SIZE} height={LINK_SIZE} />,
      label: "GitHub",
      link: site.github,
      external: true,
    },
    {
      icon: <X width={LINK_SIZE} height={LINK_SIZE} />,
      label: "Twitter",
      link: site.twitter,
      external: true,
    },
    {
      icon: <Mail width={LINK_SIZE} height={LINK_SIZE} />,
      label: "Email",
      link: `mailto:${site.email}`,
      external: true,
    },
  ];

  return (
    <div className="flex flex-wrap gap-2 links">
      {links.map(({ icon, label, link, external }) => (
        <div key={label} className="flex">
          <Link
            href={link}
            // Internal routes stay in the tab so the page transition can run.
            target={external ? "_blank" : undefined}
            rel={external ? "noopener noreferrer" : undefined}
            className="group flex items-center gap-1 whitespace-nowrap text-[12px] font-poppins text-muted-black hover:text-accent lowercase"
          >
            {icon}
            <span>{label}</span>
            <span className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200">
              <ArrowTopRight2 size={LINK_SIZE.toString()} />
            </span>
          </Link>
        </div>
      ))}
    </div>
  );
}
