import Link from "next/link";
import Logo from "./logo";

export default function Navbar() {
  return (
    <nav>
      <div className="font-bricolage text-[1.25rem]">
        Bhavesh Singhal
      </div>
      <div className="nav-links">
        <Link href="/">Home</Link>
        <Link href="/ai">About</Link>
      </div>
    </nav>
  );
}
