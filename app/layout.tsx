import type { Metadata, Viewport } from "next";
import "./globals.css";
import ServiceWorker from "@/components/ServiceWorker";

export const metadata: Metadata = {
  title: "Dil Milao — Modern Indian Dating",
  description: "Find your perfect match on Dil Milao — India's modern dating app for ages 18–30.",
  keywords: ["dating", "India", "Indian dating", "matchmaking", "dil milao"],
  applicationName: "Dil Milao",
  appleWebApp: {
    capable: true,
    title: "Dil Milao",
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: "Dil Milao — Modern Indian Dating",
    description: "Find your perfect match. India's modern dating app for ages 18–30.",
    type: "website",
    locale: "en_IN",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#ff6b6b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        {/* Capture PWA install prompt before React hydrates */}
        <script dangerouslySetInnerHTML={{ __html: `
          window.addEventListener('beforeinstallprompt', function(e) {
            e.preventDefault();
            window.__pwaPrompt = e;
          });
        `}} />
      </head>
      <body className="min-h-full">
        <ServiceWorker />
        {children}
      </body>
    </html>
  );
}
