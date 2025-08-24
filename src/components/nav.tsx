import Link from "next/link";

export default function Navbar() {
  return (
    <nav>
      <div className="nav-links">
        <Link
          href="/"
          className="uppercase font-mono font-medium text-[#141414] text-[0.9rem]"
        >
          Home
        </Link>
        {/* <Link
          href="/ai"
          className="uppercase font-mono font-medium text-[#141414] text-[0.9rem]"
        >
          AI
        </Link> */}
        <Link
          href="/achievements"
          className="uppercase font-mono font-medium text-[#141414] text-[0.9rem]"
        >
          Achievements
        </Link>
      </div>
    </nav>
  );
}
