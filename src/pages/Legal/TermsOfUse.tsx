import LegalPageLayout, { LegalSection } from "./LegalPageLayout";

export default function TermsOfUse() {
  return (
    <LegalPageLayout
      eyebrow="A few things to know before exploring"
      title="Terms of Use"
      intro="REKÒ is a place to explore Nigerian history and cultural heritage. These terms explain the basic expectations that help keep the experience useful, respectful and available."
    >
      <p className="text-meta leading-relaxed text-muted">
        Last updated: 26 November 2026
      </p>

      <LegalSection title="1. Accepting these terms">
        <p>
          By accessing or using REKÒ, you agree to these Terms of Use and any
          applicable laws. If you do not agree, please do not use the website.
        </p>
      </LegalSection>

      <LegalSection title="2. What REKÒ is">
        <p>
          REKÒ is a digital museum and educational platform exploring
          Nigerian history, cultural heritage, people, places, events,
          artifacts and related stories. Its purpose is to make these subjects
          engaging and easier to explore.
        </p>
      </LegalSection>

      <LegalSection title="3. Educational content">
        <p>
          Content on REKÒ is provided for informational, educational and
          exploration purposes. Historical and cultural material may draw on
          available evidence, oral accounts, community knowledge and differing
          interpretations.
        </p>
        <p>
          Not every interpretation is universally accepted or definitively
          settled. REKÒ aims to provide context and references where possible,
          but the presence of material on the website should not be understood
          as a guarantee that every account is complete or beyond dispute.
          Visitors are encouraged to examine sources and consider relevant
          perspectives.
        </p>
      </LegalSection>

      <LegalSection title="4. Acceptable use">
        <p>When using REKÒ, you agree not to:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Use the website for unlawful purposes.</li>
          <li>Attempt to compromise the website’s security.</li>
          <li>Disrupt, damage or interfere with its operation.</li>
          <li>Abuse account features or attempt to access another person’s account.</li>
          <li>Attempt unauthorised access to systems, accounts or data.</li>
          <li>
            Where submissions or contributions are supported, submit material
            that is unlawful, harmful, misleading or infringes another
            person’s rights.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="5. Accounts">
        <p>
          Some features require an account. When creating or using an account,
          provide accurate information and take reasonable care to keep your
          sign-in credentials secure. You are responsible for activity carried
          out through your account, except where applicable law provides
          otherwise.
        </p>
        <p>
          REKÒ may restrict access where reasonably necessary to protect the
          service, its users or its systems, or to address misuse.
        </p>
      </LegalSection>

      <LegalSection title="6. Content and intellectual property">
        <p>
          REKÒ’s original branding, website design, written material and other
          original content are protected by applicable intellectual-property
          laws. You may not reproduce or commercially exploit protected
          material without the required permission, except where permitted by
          law.
        </p>
        <p>
          Historical photographs, archival materials, artifacts, quotations
          and other third-party content may belong to their respective
          creators, owners or institutions. REKÒ does not claim ownership of
          those materials merely by referencing or displaying them. Any
          applicable attribution, licence terms and rights remain relevant.
        </p>
      </LegalSection>

      <LegalSection title="7. External links and services">
        <p>
          REKÒ may link to external websites, publications, platforms or
          services to help visitors explore a subject. Those services are
          operated by others and are subject to their own terms and privacy
          practices. REKÒ is not responsible for changes to external sites or
          for their content and practices.
        </p>
      </LegalSection>

      <LegalSection title="8. Availability and changes">
        <p>
          REKÒ may update, change, suspend or remove parts of the website as
          it develops. The website or individual features may sometimes be
          unavailable or interrupted. We do not promise uninterrupted access
          or that every feature will remain available indefinitely.
        </p>
      </LegalSection>

      <LegalSection title="9. Responsibility and liability">
        <p>
          We aim to make REKÒ useful and to present historical and cultural
          material with care. However, the website is provided as an
          educational resource, and content may be incomplete, change over
          time or reflect interpretations that are open to discussion.
        </p>
        <p>
          To the extent permitted by applicable law, REKÒ is not responsible
          for losses arising from reliance on website material without
          considering its context or checking relevant sources. Nothing in
          these terms excludes or limits liability where doing so would be
          unlawful, or affects rights that cannot legally be excluded.
        </p>
      </LegalSection>

      <LegalSection title="10. Changes to these terms">
        <p>
          These terms may be updated as REKÒ and its features evolve. The
          current version will be published on this page with its revised
          date. Continued use of the website after an update means you accept
          the updated terms, to the extent permitted by applicable law.
        </p>
      </LegalSection>

      <LegalSection title="11. Contact">
        <p>
          Questions about these terms can be sent to{" "}
          <a
            className="text-heritage-green underline underline-offset-4"
            href="mailto:reko17900@gmail.com"
          >
            reko17900@gmail.com
          </a>
          .
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
