import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Not found",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <div className="flex min-h-[60svh] flex-col items-center justify-center font-poppins px-4 text-center">
      <h1 className="tracking-[-0.06em] text-primary font-playfair text-7xl">
        404
      </h1>
      <h2 className="text-2xl text-title">Hey! I think you strayed too far</h2>
      <p className="text-body/85">You should probably go back home</p>
      <Link
        href="/"
        className="mt-4 font-mono text-xs text-muted-black hover:text-accent transition-colors"
      >
        ← back home
      </Link>
    </div>
  );
}
