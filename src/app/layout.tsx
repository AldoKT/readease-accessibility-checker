import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ReadEase — Accessibility Checker",
  description:
    "Evaluate color contrast and make more accessible visual choices with ReadEase.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
