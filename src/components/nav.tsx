"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/theme-toggle";
import MotionToggle from "@/components/motion-toggle";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/writing", label: "Writing" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav>
      <div className="nav-links">
        {links.map(({ href, label }) => {
          const isActive =
            href === "/" ? pathname === "/" : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "uppercase font-mono font-medium text-[0.9rem] transition-colors duration-200 hover:text-accent",
                isActive ? "text-accent" : "text-foreground",
              )}
            >
              {label}
            </Link>
          );
        })}
        {/* Tighter than the 2rem link gap — these two read as one control. */}
        <span className="flex items-center gap-0.5 -mr-2">
          <MotionToggle />
          <ThemeToggle />
        </span>
      </div>
    </nav>
  );
}
