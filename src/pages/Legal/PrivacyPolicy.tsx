import LegalPageLayout, { LegalSection } from "./LegalPageLayout";

const contactEmail = "reko17900@gmail.com";

export default function PrivacyPolicy() {
  return (
    <LegalPageLayout
      eyebrow="Your information and your choices"
      title="Privacy Policy"
      intro="When you use REKÒ, some information is needed to provide the website and its features. This page explains the kinds of information involved, why it is used and how to contact us with a privacy question."
    >
      <p className="text-meta leading-relaxed text-muted">
        Last updated: 26 November 2026
      </p>

      <LegalSection title="1. Information you provide">
        <p>
          If you create an account, REKÒ processes information such as your
          name and email address. Account registration also involves
          authentication information. If you choose Google sign-in, Google
          provides identity information needed to authenticate your account.
        </p>
        <p>
          Depending on the features you use, information associated with your
          account may include profile details, bookmarks, personal notes and
          exhibition progress. You choose whether to use these account
          features.
        </p>
      </LegalSection>

      <LegalSection title="2. How we use information">
        <p>Information is used as needed to:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Create and manage accounts and authenticate sign-ins.</li>
          <li>Verify email addresses and support account recovery.</li>
          <li>Save bookmarks, notes, profile information and learning progress.</li>
          <li>Operate, maintain and protect the website and its features.</li>
          <li>Understand website usage and improve the visitor experience.</li>
          <li>Respond to questions and privacy requests.</li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Authentication, sessions and email">
        <p>
          REKÒ supports email-and-password accounts and Google sign-in.
          When you sign in, the service uses a session cookie to recognise your
          authenticated session. The session cookie is configured as
          HTTP-only and uses the browser’s same-site protections; it is
          configured as secure in production. The backend currently sets a
          session lifetime of 24 hours. Signing out clears the session cookie.
        </p>
        <p>
          REKÒ may send transactional emails needed for account functions,
          including verification codes and account recovery messages. These
          emails are not a promise that promotional email marketing is
          provided.
        </p>
      </LegalSection>

      <LegalSection title="4. Cookies and browser storage">
        <p>
          REKÒ uses a session cookie for authenticated sessions. The website
          also uses browser storage for small experience preferences: session
          storage remembers whether the splash screen has been seen during the
          current browser session, and local storage remembers whether the
          experience guide has been dismissed.
        </p>
        <p>
          These storage items support website functionality and preferences.
          You can manage or clear browser storage through your browser
          settings, although doing so may affect how parts of the website
          behave or require you to sign in again.
        </p>
      </LegalSection>

      <LegalSection title="5. Website analytics">
        <p>
          REKÒ uses Vercel Analytics to understand website usage and
          performance. This can include information such as visits, pages
          viewed, general visitor location (for example, country or region)
          and device types. We use these insights to understand how the site
          is being used and where the experience could be improved.
        </p>
        <p>
          We do not describe this analytics information as necessarily
          anonymous or free of identifiers. For further details about the
          provider’s practices, consult Vercel’s own privacy information.
        </p>
      </LegalSection>

      <LegalSection title="6. Services that help operate REKÒ">
        <p>
          REKÒ relies on third-party services to host the website and API,
          store information and media, authenticate accounts, deliver
          transactional email and understand website usage. These include
          Vercel, Render, Neon, Upstash, Brevo, Google and Cloudflare.
        </p>
        <p>
          These providers may process information as needed to provide their
          services. Their own terms and privacy information also apply to
          their services. The exact processing arrangements, processing
          locations and retention practices may vary by provider and service.
        </p>
      </LegalSection>

      <LegalSection title="7. Retention">
        <p>
          Information is retained as needed to operate REKÒ, support
          legitimate operational and security purposes, and meet applicable
          obligations. Retention can differ between account records, session
          data, backups, technical logs and information held by service
          providers. Exact retention periods for all of these systems have
          not been established in this policy.
        </p>
      </LegalSection>

      <LegalSection title="8. Account access and deletion requests">
        <p>
          REKÒ does not currently offer a self-service account deletion
          feature. If you have concerns about your account or personal
          information, you can contact us at{" "}
          <a
            className="text-heritage-green underline underline-offset-4"
            href={`mailto:${contactEmail}`}
          >
            {contactEmail}
          </a>
          .
        </p>
        <p>
          Contacting us does not mean that deletion is automatic or that every
          request can be fulfilled in every circumstance. We will consider
          requests in light of applicable data-protection requirements and
          the information and processes available to us.
        </p>
      </LegalSection>

      <LegalSection title="9. Your privacy rights">
        <p>
          Depending on the circumstances and applicable law, including the
          Nigeria Data Protection Act 2023, you may have rights concerning
          your personal information. These can include requesting access or
          correction, requesting erasure where applicable, seeking restriction
          of processing, objecting to certain processing, withdrawing consent
          where processing is based on consent, and raising a complaint with
          the relevant data-protection authority.
        </p>
        <p>
          To raise a privacy question or make a request, email{" "}
          <a
            className="text-heritage-green underline underline-offset-4"
            href={`mailto:${contactEmail}`}
          >
            {contactEmail}
          </a>
          . The rights available and how they apply depend on the relevant
          circumstances and law.
        </p>
      </LegalSection>

      <LegalSection title="10. Keeping information secure">
        <p>
          REKÒ takes reasonable steps to protect information used by the
          service. No website, transmission or storage system can be
          guaranteed completely secure, so please use a strong, unique
          password and keep your sign-in details private.
        </p>
      </LegalSection>

      <LegalSection title="11. Children’s privacy">
        <p>
          REKÒ is an educational website, but this policy does not describe a
          dedicated child-account or age-verification system. If you are a
          parent, guardian or other concerned person and believe a child’s
          personal information has been provided to REKÒ, please contact us
          so the concern can be considered.
        </p>
      </LegalSection>

      <LegalSection title="12. Changes to this policy">
        <p>
          REKÒ may update this policy as the website, its features and its
          practices evolve. The updated version will be published on this
          page with a revised date.
        </p>
      </LegalSection>

      <LegalSection title="13. Contact">
        <p>
          For privacy questions, concerns or requests, contact REKÒ at{" "}
          <a
            className="text-heritage-green underline underline-offset-4"
            href={`mailto:${contactEmail}`}
          >
            {contactEmail}
          </a>
          .
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
