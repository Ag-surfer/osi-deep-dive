import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "The OSI Model — A Deep Dive",
    template: "%s · The OSI Model",
  },
  description:
    "A deep, MIT/Berkeley-grade reference for the OSI model — one in-depth page per layer, with diagrams, bit-level header breakdowns, security, and interactive visualizations.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
