import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dil Milao - Modern Indian Dating",
  description: "Find your perfect match on Dil Milao — India's modern dating app for ages 18-30",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
