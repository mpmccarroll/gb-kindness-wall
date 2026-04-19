import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GB Kindness Wall | Gardner Bullis Elementary",
  description:
    "Share kindness and gratitude with the Gardner Bullis Grizzly community!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gb-cream paw-bg">{children}</body>
    </html>
  );
}
