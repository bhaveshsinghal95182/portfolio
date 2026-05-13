import { Mail, Notebook } from "lucide-react";
import X from "@/components/logos/x-formerly-twitter";
import LinkedinLogo from "@/components/logos/linkedin";
import GithubLogo from "@/components/logos/github";
import Link from "next/link";
import ArrowTopRight2 from "@/components/arrow-up";

interface LinksProps {
  LINK_SIZE: number;
}

export default function Links({ LINK_SIZE }: LinksProps) {
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
      icon: <X width={LINK_SIZE} height={LINK_SIZE} />,
      label: "Twitter",
      link: "https://x.com/descentkatil_",
    },
    {
      icon: <Mail width={LINK_SIZE} height={LINK_SIZE} />,
      label: "Email",
      link: "mailto:worknbhavesh@gmail.com",
    },
  ];

  return (
    <div className="flex flex-wrap gap-2 links">
      {links.map(({ icon, label, link }) => (
        <div key={label} className="flex">
          <Link
            href={link}
            target="_blank"
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
