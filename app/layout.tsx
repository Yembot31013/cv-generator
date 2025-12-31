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
  title: "AI-Native CV Generator | AI-Powered Resume Builder with Gemini",
  description:
    "Intelligent CV generator powered by Google Gemini 2.5 Pro. Upload your resume, provide a job description, and AI extracts, enhances, tailors, and reviews your CV. Features AI extraction, job-specific tailoring, ATS scoring, and cover letter generation. Open source, privacy-focused — your API keys stay on your device.",
  keywords: [
    "AI CV generator",
    "AI resume builder",
    "Gemini AI resume",
    "AI-powered CV",
    "ATS resume checker",
    "resume AI enhancement",
    "AI cover letter generator",
    "intelligent resume builder",
    "job-specific resume tailoring",
    "AI resume review",
    "open source",
    "privacy",
  ],
  authors: [{ name: "yembot" }],
  creator: "yembot",
  openGraph: {
    title: "AI-Native CV Generator | Powered by Gemini 2.5 Pro",
    description:
      "Intelligent AI-powered CV generator that extracts, enhances, tailors, and reviews your resume. Upload files, provide job descriptions, and let AI create perfectly tailored CVs. Open source and privacy-focused.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI-Native CV Generator | Powered by Gemini 2.5 Pro",
    description:
      "Intelligent AI-powered CV generator that extracts, enhances, tailors, and reviews your resume. Open source and privacy-focused.",
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
