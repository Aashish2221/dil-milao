"use client";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

const LAST_UPDATED = "02 June 2025";
const APP_EMAIL = "support@dilmilao.app";
const APP_NAME = "Dil Milao";
const LEGAL_NAME = "Aashish Patil";
const LEGAL_ADDRESS = "India";

export default function TermsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen pb-12" style={{ background: "#0a0a0f" }}>
      <header className="glass sticky top-0 z-50 flex items-center gap-3 px-4 py-3">
        <button onClick={() => router.back()} className="text-white/60 hover:text-white transition-colors">
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-white font-semibold">Terms & Conditions</h1>
      </header>

      <div className="max-w-2xl mx-auto px-4 pt-8 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Terms &amp; Conditions</h1>
          <p className="text-white/30 text-sm">Last updated: {LAST_UPDATED}</p>
        </div>

        <p className="text-white/60 text-sm leading-relaxed">
          {APP_NAME} is operated by <strong className="text-white/80">{LEGAL_NAME}</strong>, an individual based in {LEGAL_ADDRESS}. By accessing or using our app, you agree to be bound by these Terms &amp; Conditions. Please read them carefully. If you do not agree, do not use the app.
        </p>

        <Section title="1. Eligibility">
          <p>You must be at least <strong className="text-white">18 years old</strong> to create an account or use {APP_NAME}. By registering, you confirm that you are 18 or older. We reserve the right to terminate accounts found to belong to minors.</p>
        </Section>

        <Section title="2. Account Registration">
          <ul>
            <li>You must provide accurate, complete, and up-to-date information when creating your profile.</li>
            <li>You are responsible for maintaining the confidentiality of your login credentials.</li>
            <li>You may not create more than one account.</li>
            <li>You may not create an account on behalf of another person.</li>
          </ul>
        </Section>

        <Section title="3. User Conduct">
          <p>You agree not to:</p>
          <ul>
            <li>Post false, misleading, or fraudulent information on your profile.</li>
            <li>Harass, abuse, stalk, threaten, or harm other users.</li>
            <li>Share pornographic, violent, or illegal content.</li>
            <li>Solicit money or financial information from other users.</li>
            <li>Promote any business, service, or commercial activity.</li>
            <li>Use the app for any unlawful purpose.</li>
            <li>Attempt to access another user's account without permission.</li>
          </ul>
          <p className="mt-2">We reserve the right to remove any content and suspend or terminate any account that violates these rules, without prior notice.</p>
        </Section>

        <Section title="4. Profile Content">
          <p>You retain ownership of content you upload (photos, bio, etc.). By uploading content, you grant {APP_NAME} a non-exclusive, royalty-free licence to display that content within the app for the purpose of operating the service. We do not sell your content to third parties.</p>
          <p className="mt-2">Profile photos must be genuine photos of yourself. Impersonating another person is strictly prohibited.</p>
        </Section>

        <Section title="5. Premium Subscriptions">
          <ul>
            <li>{APP_NAME} offers paid premium plans (Gold, Platinum) and a one-time Starter Trial (₹5 for 3 days).</li>
            <li>All payments are processed securely via Cashfree Payments.</li>
            <li>Subscription pricing is displayed in Indian Rupees (INR) inclusive of applicable taxes.</li>
            <li>Premium access is granted immediately upon successful payment verification.</li>
            <li>Subscriptions do not auto-renew. You must manually purchase a new plan when your current plan expires.</li>
          </ul>
        </Section>

        <Section title="6. No Refund Policy">
          <p className="text-red-400/80 font-medium">All purchases on {APP_NAME} are final and non-refundable.</p>
          <p className="mt-2">Once a premium plan, trial, or boost is purchased and activated, we do not offer refunds, exchanges, or credits for:</p>
          <ul>
            <li>Unused days of a subscription.</li>
            <li>Change of mind after purchase.</li>
            <li>Account suspension due to violation of these Terms.</li>
            <li>Failure to use premium features during the subscription period.</li>
          </ul>
          <p className="mt-2">In case of a technical issue where premium was not activated after payment, please contact us at <a href={`mailto:${APP_EMAIL}`} className="text-red-400">{APP_EMAIL}</a> within 48 hours with your payment ID.</p>
        </Section>

        <Section title="7. Profile Boosts">
          <p>Boost credits purchased are non-refundable and non-transferable. Each boost is active for 30 minutes from activation. Unused boost credits do not expire.</p>
        </Section>

        <Section title="8. Account Termination">
          <p>You may delete your account at any time from the Settings page. Upon deletion, your profile data and photos are permanently removed.</p>
          <p className="mt-2">We may suspend or permanently terminate your account without notice if you violate these Terms. No refund will be issued in such cases.</p>
        </Section>

        <Section title="9. Disclaimers">
          <ul>
            <li>{APP_NAME} is a platform to connect people. We do not guarantee that you will find a match.</li>
            <li>We are not responsible for the conduct of any user on or off the platform.</li>
            <li>Always exercise caution when meeting someone from the app in person. Meet in public places.</li>
            <li>The service is provided "as is" without warranties of any kind.</li>
          </ul>
        </Section>

        <Section title="10. Limitation of Liability">
          <p>To the maximum extent permitted by Indian law, {APP_NAME} shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the app, including but not limited to loss of data, loss of revenue, or personal injury resulting from meetings arranged through the platform.</p>
        </Section>

        <Section title="11. Governing Law">
          <p>These Terms are governed by and construed in accordance with the laws of India. Any disputes arising shall be subject to the exclusive jurisdiction of the courts in India.</p>
        </Section>

        <Section title="12. Changes to Terms">
          <p>We may update these Terms from time to time. Continued use of the app after changes constitutes your acceptance of the revised Terms. We will display the updated date at the top of this page.</p>
        </Section>

        <Section title="13. Contact Us">
          <p>For any questions regarding these Terms, please contact us at:</p>
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
