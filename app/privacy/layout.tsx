import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Read Dil Milao's Privacy Policy. Learn how we collect, use and protect your personal data on India's modern dating app.",
  robots: { index: true, follow: false },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
