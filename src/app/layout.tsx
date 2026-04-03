import type { Metadata } from "next";
import { Jost } from "next/font/google";
import "./globals.css";

const jost = Jost({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Henley Contracting - AI Lead Intake System",
  description:
    "AI-powered lead intake system for Henley Contracting Ltd. Automates the gap between lead contact and on-site consultation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${jost.className} h-full`}>
      <body className="min-h-full flex flex-col bg-gray-50">{children}</body>
    </html>
  );
}
