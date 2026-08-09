import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — Member Mate",
  description: "Privacy Policy for Member Mate — member management app for businesses.",
};

const INK = "#1C1526";
const PRIMARY = "#8B5CF6";
const BG = "#F6F1E7";
const BORDER = "#E5E1D8";
const MUTED = "#6B7280";

const LAST_UPDATED = "10 August 2026";

function Section({ title, children }) {
  return (
    <section className="mb-8">
      <h2 className="mb-2 text-base font-semibold" style={{ color: INK }}>
        {title}
      </h2>
      <div className="space-y-3 text-sm leading-relaxed" style={{ color: "#3F3752" }}>
        {children}
      </div>
    </section>
  );
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen" style={{ background: BG }}>
      <header
        className="sticky top-0 z-10 flex items-center justify-between border-b px-4 py-4"
        style={{ background: "#FFFFFF", borderColor: BORDER }}
      >
        <Link href="/" className="text-sm font-bold uppercase tracking-[0.15em]" style={{ color: INK }}>
          Member Mate
        </Link>
        <Link href="/" className="text-xs font-medium" style={{ color: PRIMARY }}>
          Back to home
        </Link>
      </header>

      <main className="mx-auto max-w-2xl px-5 py-10">
        <h1 className="mb-1 text-2xl font-bold" style={{ color: INK }}>
          Privacy Policy
        </h1>
        <p className="mb-8 text-xs" style={{ color: MUTED }}>
          Last updated: {LAST_UPDATED}
        </p>

        <p className="mb-8 text-sm leading-relaxed" style={{ color: "#3F3752" }}>
          Member Mate (&ldquo;we&rdquo;, &ldquo;our&rdquo;, &ldquo;us&rdquo;) provides a member management
          platform that lets businesses (&ldquo;Owners&rdquo; or &ldquo;Admins&rdquo;) enroll, track, and manage
          their members, including self-enrollment by members via a QR code. This Privacy Policy explains what
          information we collect, how we use it, and the choices you have. By using Member Mate, you agree to
          the practices described here.
        </p>

        <Section title="1. Who This Policy Covers">
          <p>This policy applies to two types of users:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <strong>Business Owners / Admins</strong> — who create an account, manage their business profile,
              and enroll or review members.
            </li>
            <li>
              <strong>Members</strong> — individuals who are enrolled by an Owner/Admin, or who self-enroll by
              scanning a business&apos;s QR code.
            </li>
          </ul>
        </Section>

        <Section title="2. Information We Collect">
          <p>
            <strong>Account information (Owners/Admins):</strong> full name, business name, mobile number, email
            address, and a securely hashed password. We generate a unique business ID for each account.
          </p>
          <p>
            <strong>Member information:</strong> full name, mobile number, email address, and, where provided, a
            photo and identity documents uploaded during enrollment. Fee, payment, and admission details are
            added by the Owner/Admin when reviewing an enrollment.
          </p>
          <p>
            <strong>Enrollment &amp; verification data:</strong> when a member self-enrolls via QR code, we
            temporarily store their submitted details along with a one-time password (OTP) used to verify their
            mobile number or email before the enrollment is created.
          </p>
          <p>
            <strong>Notifications &amp; push subscriptions:</strong> if you enable browser or app push
            notifications, we store a device-specific subscription token so we can deliver alerts (for example,
            when a new member needs review). This token does not by itself identify you personally.
          </p>
          <p>
            <strong>Usage data:</strong> basic technical information such as login timestamps and session data,
            used to keep your account secure and the service running reliably.
          </p>
        </Section>

        <Section title="3. How We Use Information">
          <ul className="list-disc space-y-1 pl-5">
            <li>To create and manage Owner/Admin and Member records within a business&apos;s account.</li>
            <li>To verify identity during self-enrollment via OTP.</li>
            <li>To let Owners/Admins review, confirm, or cancel pending enrollments.</li>
            <li>To send in-app and push notifications about enrollment activity relevant to an Owner/Admin.</li>
            <li>To maintain the security, integrity, and proper functioning of the platform.</li>
            <li>To communicate important service updates, such as changes to this policy.</li>
          </ul>
          <p>We do not sell member or business data to third parties, and we do not use it for advertising.</p>
        </Section>

        <Section title="4. Where Data Is Stored">
          <p>
            Business, member, and enrollment records are stored in a secured MongoDB database. Uploaded photos
            and identity documents are stored using a third-party object storage provider (Cloudflare R2), under
            access-controlled storage keys tied to each business account. Passwords are never stored in plain
            text — they are hashed before being saved.
          </p>
        </Section>

        <Section title="5. Data Sharing">
          <p>
            Member data entered by or shared with a business (Owner/Admin) is visible only to that business&apos;s
            authorized account. We do not share data across unrelated businesses. We may share limited data with
            service providers who help us operate the platform (such as our database and file storage
            providers), solely to provide the service, and under obligations to protect that data. We may also
            disclose information if required by law or to protect the rights, safety, or property of Member
            Mate, our users, or others.
          </p>
        </Section>

        <Section title="6. Data Retention">
          <p>
            We retain account and member data for as long as the related business account remains active, or as
            needed to provide the service. Pending self-enrollment records (including OTP data) are temporary
            and are removed automatically once an enrollment is verified, expires, or is otherwise cleaned up.
            You may request deletion of your data as described in Section 8.
          </p>
        </Section>

        <Section title="7. Push Notifications">
          <p>
            Push notifications are entirely opt-in. If you enable them, your browser or device creates a
            subscription that we use only to deliver relevant alerts (for example, enrollment review requests).
            You can disable push notifications at any time from the app&apos;s settings, or by revoking notification
            permission in your browser or device settings. Disabling push notifications does not affect in-app
            notifications.
          </p>
        </Section>

        <Section title="8. Your Rights and Choices">
          <ul className="list-disc space-y-1 pl-5">
            <li>Owners/Admins can update their profile information directly within the app.</li>
            <li>Members may contact the business that enrolled them to request corrections to their details.</li>
            <li>
              You may request access to, correction of, or deletion of your personal data by contacting us
              using the details in Section 11.
            </li>
            <li>You may withdraw consent for push notifications at any time.</li>
          </ul>
        </Section>

        <Section title="9. Data Security">
          <p>
            We use industry-standard measures to protect your information, including password hashing,
            authenticated API access, and access-controlled file storage. However, no method of transmission or
            storage is 100% secure, and we cannot guarantee absolute security.
          </p>
        </Section>

        <Section title="10. Children's Privacy">
          <p>
            Member Mate is intended for use by businesses to manage their members and is not directed at
            children under 13. If a business enrolls a minor as a member, it does so as the responsible party
            for that member&apos;s data, in compliance with applicable local laws.
          </p>
        </Section>

        <Section title="11. Contact Us">
          <p>
            If you have questions about this Privacy Policy or wish to exercise your data rights, please contact
            us at:
          </p>
          <p className="font-medium" style={{ color: INK }}>
            support@membermate.app
          </p>
        </Section>

        <Section title="12. Changes to This Policy">
          <p>
            We may update this Privacy Policy from time to time. If we make material changes, we will update the
            &ldquo;Last updated&rdquo; date above and, where appropriate, notify Owners/Admins in-app.
          </p>
        </Section>
      </main>
    </div>
  );
}