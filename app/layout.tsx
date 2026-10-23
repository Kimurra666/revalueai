import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { AppHeader } from "@/components/AppHeader";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  title: "ReValueAI: find the best value for your old phone or laptop",
  description:
    "Add photos and details of an old phone or laptop. Compare what you would get from reselling, repairing or recycling it, then book a pickup with a partner.",
};

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={inter.variable}>
      <body className="min-h-dvh">
        <AppHeader />
        {children}
      </body>
    </html>
  );
}
