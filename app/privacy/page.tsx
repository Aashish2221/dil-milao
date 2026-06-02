"use client";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

const LAST_UPDATED = "02 June 2025";
const APP_EMAIL = "support@dilmilao.app";
const APP_NAME = "Dil Milao";
const LEGAL_NAME = "Aashish Patil";
const LEGAL_ADDRESS = "India";

export default function PrivacyPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen pb-12" style={{ background: "#0a0a0f" }}>
      <header className="glass sticky top-0 z-50 flex items-center gap-3 px-4 py-3">
        <button onClick={() => router.back()} className="text-white/60 hover:text-white transition-colors">
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-white font-semibold">Privacy Policy</h1>
      </header>

      <div className="max-w-2xl mx-auto px-4 pt-8 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Privacy Policy</h1>
          <p className="text-white/30 text-sm">Last updated: {LAST_UPDATED}</p>
        </div>

        <p className="text-white/60 text-sm leading-relaxed">
          {APP_NAME} is operated by <strong className="text-white/80">{LEGAL_NAME}</strong> ("{APP_NAME}", "we", "our", or "us"), an individual based in {LEGAL_ADDRESS}. We are committed to protecting your privacy. This Privacy Policy explains what personal information we collect, how we use it, and your rights regarding that information. By using the app, you agree to the practices described here.
        </p>

        <Section title="1. Information We Collect">
          <p><strong>Account Information</strong></p>
          <ul>
            <li>Email address (used for login and communication)</li>
            <li>Full name, age, gender</li>
            <li>State and district (location within India)</li>
            <li>Religion and relationship preferences</li>
            <li>Bio and interests</li>
          </ul>
          <p className="mt-3"><strong>Profile Photos</strong></p>
          <ul>
            <li>Photos you upload are stored securely in cloud storage (Supabase Storage).</li>
          </ul>
          <p className="mt-3"><strong>Usage Data</strong></p>
          <ul>
            <li>Likes you send and receive</li>
            <li>Matches created</li>
            <li>Messages exchanged with matches</li>
            <li>Premium subscription and payment history (payment IDs via Cashfree)</li>
          </ul>
          <p className="mt-3"><strong>Device & Technical Data</strong></p>
          <ul>
            <li>Push notification tokens (for match and message alerts)</li>
            <li>Browser type and device type (standard web analytics)</li>
          </ul>
        </Section>

        <Section title="2. How We Use Your Information">
          <ul>
            <li>To create and manage your profile</li>
            <li>To show your profile to other users and show other profiles to you</li>
            <li>To enable matching, likes, and chat features</li>
            <li>To send push notifications about matches and messages (only if you opt in)</li>
            <li>To process premium subscription payments via Cashfree Payments</li>
            <li>To enforce our Terms &amp; Conditions and keep the platform safe</li>
            <li>To improve app performance and user experience</li>
          </ul>
        </Section>

        <Section title="3. Data Storage & Security">
          <p>Your data is stored on <strong>Supabase</strong>, a secure cloud database platform. We use Row Level Security (RLS) policies to ensure that users can only access data they are authorised to see.</p>
          <p className="mt-2">Profile photos are stored in Supabase Storage with access controls. We use HTTPS for all data transmission.</p>
          <p className="mt-2">While we implement reasonable security measures, no system is completely secure. Please protect your account with a strong password.</p>
        </Section>

        <Section title="4. Sharing of Information">
          <p>We do <strong>not</strong> sell, rent, or trade your personal information to third parties.</p>
          <p className="mt-2">We share limited data only in these circumstances:</p>
          <ul>
            <li><strong>Cashfree Payments</strong> — your email and payment amount are shared solely to process payments. We do not store your card or UPI details.</li>
            <li><strong>Legal requirements</strong> — if required by law or a court order, we may disclose data to relevant authorities.</li>
            <li><strong>Other users</strong> — your public profile (name, age, photo, bio, location, interests, religion) is visible to other users of the app as part of the matching experience.</li>
          </ul>
        </Section>

        <Section title="5. Profile Visibility">
          <p>Your profile is visible to other registered users on the platform. Fields like your exact email address are never shown to other users. Blocking a user immediately hides your profile from them and theirs from you.</p>
        </Section>

        <Section title="6. Push Notifications">
          <p>We send push notifications for match alerts, new messages, and likes (subject to your notification preferences). You can turn off any notification type in Settings → Notification Preferences at any time. You can also revoke browser notification permission from your device settings.</p>
        </Section>

        <Section title="7. Data Retention">
          <p>Your data is retained for as long as your account is active. When you delete your account (Settings → Delete Account), your profile, photos, likes, matches, and messages are permanently deleted from our database. Payment records are retained for legal and accounting purposes.</p>
        </Section>

        <Section title="8. Your Rights">
          <p>Under Indian law (IT Act 2000 and applicable rules) and general privacy best practices, you have the right to:</p>
          <ul>
            <li>Access the personal data we hold about you</li>
            <li>Correct inaccurate data by editing your profile</li>
            <li>Delete your account and associated data</li>
            <li>Opt out of push notifications at any time</li>
          </ul>
          <p className="mt-2">To exercise these rights, contact us at <a href={`mailto:${APP_EMAIL}`} className="text-red-400">{APP_EMAIL}</a>.</p>
        </Section>

        <Section title="9. Children's Privacy">
          <p>{APP_NAME} is not intended for users under the age of 18. We do not knowingly collect personal information from minors. If we become aware that a user is under 18, we will immediately delete their account and data.</p>
        </Section>

        <Section title="10. Cookies & Local Storage">
          <p>We use browser cookies and local storage to maintain your login session (via Supabase Auth). We do not use third-party advertising cookies or tracking pixels.</p>
        </Section>

        <Section title="11. Changes to This Policy">
          <p>We may update this Privacy Policy from time to time. We will update the "Last updated" date at the top. Continued use of {APP_NAME} after changes means you accept the revised policy.</p>
        </Section>

        <Section title="12. Contact Us">
          <p>If you have any questions, concerns, or requests related to your privacy, please contact us:</p>
          <div className="mt-2 space-y-1">
            <p className="text-white/70 font-medium">{LEGAL_NAME}</p>
            <p>Operating as: {APP_NAME}</p>
            <p>{LEGAL_ADDRESS}</p>
            <p><a href={`mailto:${APP_EMAIL}`} className="text-red-400 hover:text-red-300 transition-colors">{APP_EMAIL}</a></p>
          </div>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-white font-semibold text-base mb-3">{title}</h2>
      <div className="text-white/55 text-sm leading-relaxed space-y-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_strong]:text-white/80">
        {children}
      </div>
    </div>
  );
}
