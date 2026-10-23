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
  title: "Alpha Science Lab | Multi-Stage Competition Platform",
  description: "Official submission platform for Alpha Science Lab (ASL). Securely submit video demonstrations, presentation slide decks (PPTX), and GitHub monorepos across 10 engineering milestones.",
  icons: {
    icon: "/asl-logo.png",
    apple: "/asl-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#060913] text-slate-100">{children}</body>
    </html>
  );
}
