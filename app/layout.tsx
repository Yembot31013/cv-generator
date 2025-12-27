import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Stunning CV Generator | Web3-Inspired Resume Templates",
  description:
    "Create beautiful, modern CVs with Web3-inspired templates featuring 3D effects, glassmorphism, and neon designs. Open source, privacy-focused — your API keys stay on your device.",
  keywords: [
    "CV generator",
    "resume builder",
    "Web3 CV",
    "modern resume",
    "glassmorphism",
    "neon design",
    "open source",
    "privacy",
  ],
  authors: [{ name: "yembot" }],
  creator: "yembot",
  openGraph: {
    title: "Stunning CV Generator",
    description:
      "Create beautiful, modern CVs with Web3-inspired templates. Open source and privacy-focused.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Stunning CV Generator",
    description:
      "Create beautiful, modern CVs with Web3-inspired templates. Open source and privacy-focused.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
