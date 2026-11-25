import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display, Jost, Poppins } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import Logo from "@/components/logo";
import PageTransition from "@/components/page-transition";
import { Analytics } from "@vercel/analytics/next";
import Navbar from "@/components/nav";
import CommandPalette from "@/components/command-palette";
import Terminal from "@/components/terminal";
import SiteFooter from "@/components/site-footer";
import MotionSync from "@/components/motion-sync";
import { ThemeProvider } from "@/components/theme-provider";
import { site } from "@/lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
});

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
});

const poppins = Poppins({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-poppins",
});

const southera = localFont({
  src: "../../public/font/Southera.ttf",
  variable: "--font-southera",
  display: "swap",
  // Only the signature and OG cards use it; preloading 150 KB on every page
  // competes with the fonts that are actually above the fold.
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name}: ${site.roles.join(", ")}`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  keywords: [
    site.name,
    "developer",
    "portfolio",
    "Recso",
    "Slatey",
    "aisprite",
    "DukanBook",
    "DealForge",
    "Headcount",
    "Kickstart Express",
    "company-logos",
    "Messy UI",
    "Next.js",
    "TypeScript",
    "Rust",
    "Python",
    "self-hosted",
  ],
  alternates: {
    canonical: "/",
    types: { "application/rss+xml": `${site.url}/feed.xml` },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: site.url,
    siteName: site.name,
    title: `${site.name}: ${site.roles.join(", ")}`,
    description: site.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name}: ${site.roles.join(", ")}`,
    description: site.description,
    creator: site.twitterHandle,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

// Resolves the motion preference before first paint, so the very first page
// transition already knows whether it is allowed to run.
const motionScript = `(function(){try{var s=localStorage.getItem("motion");document.documentElement.dataset.motion=(s==="full"||s==="reduced")?s:(window.matchMedia("(prefers-reduced-motion: reduce)").matches?"reduced":"full");}catch(e){document.documentElement.dataset.motion="full";}})();`;

const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.name,
  url: site.url,
  email: `mailto:${site.email}`,
  jobTitle: "Software Developer",
  description: site.description,
  alumniOf: { "@type": "CollegeOrUniversity", name: site.school },
  sameAs: [site.github, site.twitter],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: motionScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
      </head>
      <body
        className={`${geistMono.variable} ${playfairDisplay.variable} ${jost.variable} ${poppins.variable} ${southera.variable} ${geistSans.variable} antialiased`}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:border focus:border-muted-black/30 focus:bg-background focus:px-3 focus:py-2 focus:font-mono focus:text-xs focus:text-foreground"
        >
          Skip to content
        </a>
        <ThemeProvider>
          <PageTransition svg={<Logo />} animation="wipe" blocks={5}>
            <section className="page flex min-h-screen justify-center px-4 ">
              <div className="w-full max-w-100 md:max-w-150 flex flex-col min-h-screen">
                <Navbar />
                <main id="main-content" tabIndex={-1} className="flex-1 outline-none">{children}</main>
                <SiteFooter />
              </div>
            </section>
          </PageTransition>
          <CommandPalette />
          <Terminal />
          <MotionSync />
        </ThemeProvider>
        {/* Vercel serves the insights script; locally it would only 404. */}
        {process.env.VERCEL ? <Analytics /> : null}
      </body>
    </html>
  );
}
