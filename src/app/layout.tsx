import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Playfair_Display,
  Bricolage_Grotesque,
  Jost,
  Poppins,
} from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import Logo from "@/components/logo";
import PageTransition from "@/components/page-transition";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const bricolageGrotesque = Bricolage_Grotesque({
  variable: "--font-bricolage-grotesque",
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
});

export const metadata: Metadata = {
  title: "Bhavesh Singhal",
  description: "My personal portfolio showcasing my work and projects.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistMono.variable} ${playfairDisplay.variable} ${bricolageGrotesque.variable} ${jost.variable} ${poppins.variable} ${southera.className} ${geistSans.variable} antialiased`}
      >
        <PageTransition svg={<Logo />} animation="wipe" blocks={10}>
          {children}
        </PageTransition>
      </body>
      <Analytics />
    </html>
  );
}
