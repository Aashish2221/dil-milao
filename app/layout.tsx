import type { Metadata, Viewport } from "next";
import "./globals.css";
import ServiceWorker from "@/components/ServiceWorker";
import PushNotifications from "@/components/PushNotifications";

const SITE_URL = "https://dil-milao.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Dil Milao — Indian Dating App",
    template: "%s | Dil Milao",
  },
  description: "India's modern dating app for ages 18–30. Connect with genuine Indians, filter by state/city/religion, and find real love. Free to join.",
  keywords: ["Indian dating app", "dating app India", "dil milao", "Indian matchmaking", "dating site India", "meet Indian singles"],
  applicationName: "Dil Milao",
  authors: [{ name: "Dil Milao" }],
  creator: "Dil Milao",
  publisher: "Dil Milao",
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  verification: { google: "4e29c7721eacfc4d" },
  alternates: { canonical: SITE_URL },
  appleWebApp: {
    capable: true,
    title: "Dil Milao",
    statusBarStyle: "black-translucent",
  },
  formatDetection: { telephone: false },
  openGraph: {
    title: "Dil Milao — Indian Dating App",
    description: "India's modern dating app. Filter by state, city, religion & age. Real connections, Indian values.",
    url: SITE_URL,
    siteName: "Dil Milao",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Dil Milao — Indian Dating App" }],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dil Milao — Indian Dating App",
    description: "Find your perfect match. India's modern dating app for genuine connections.",
    images: ["/og-image.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#ff6b6b",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Dil Milao",
  url: SITE_URL,
  description: "India's modern dating app for ages 18–30. Connect with genuine Indians and find real love.",
  applicationCategory: "SocialNetworkingApplication",
  operatingSystem: "Web, Android, iOS",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "INR",
    description: "Free to join. Premium from ₹199/month.",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    ratingCount: "2000",
    bestRating: "5",
  },
  inLanguage: "en-IN",
  audience: {
    "@type": "Audience",
    geographicArea: { "@type": "Country", name: "India" },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-IN" className="h-full">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
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
        <PushNotifications />
        {children}
      </body>
    </html>
  );
}
