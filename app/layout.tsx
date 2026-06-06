import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { themeInitScript } from "@/components/ThemeToggle";

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
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="flex min-h-screen flex-col antialiased">
        <SiteHeader />
        <div className="flex-1">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
