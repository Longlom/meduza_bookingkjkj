import "./globals.css";
import type { Metadata } from "next";

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
      <body>{children}</body>
    </html>
  );
}

