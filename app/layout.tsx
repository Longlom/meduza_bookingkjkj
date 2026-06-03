import "./globals.css";
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import AppVideoShell from "@/components/AppVideoShell";

export const metadata: Metadata = {
  title: "Meduza — Booking",
  description: "Book a table at Meduza."
};

export const viewport = {
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AppVideoShell>{children}</AppVideoShell>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

