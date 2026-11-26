import LegalPageLayout, { LegalSection } from "./LegalPageLayout";

export default function SourcesMethodology() {
  return (
    <LegalPageLayout
      eyebrow="A closer look at how we tell stories"
      title="Sources & Methodology"
      intro="A good story invites you in. Good context helps you understand it. Here is how REKÒ aims to bring Nigerian history and cultural knowledge together, while making room for questions and different accounts."
    >
      <LegalSection title="Following the evidence">
        <p>
          REKÒ explores Nigerian history, cultural heritage, people, places,
          events, artifacts and the stories that connect them. Historical
          information can draw on many kinds of material: archival documents,
          historical records, academic research, books, museum collections,
          institutional publications and other credible sources.
        </p>
        <p>
          No single source tells every part of a story. Where possible, we aim
          to give visitors references that let them look further, compare
          accounts and see where information comes from.
        </p>
      </LegalSection>

      <LegalSection title="Sources, context and attribution">
        <p>
          Sources help readers understand the basis for a claim and find out
          more. We seek to identify relevant authors, publications,
          collections or institutions, and to provide links or other reference
          details where they are available.
        </p>
        <p>
          Context matters too. Events, people, objects and cultural practices
          should be considered in the time, place and communities connected to
          them. A quotation, photograph or artifact should not be made to tell
          a story outside the context that gives it meaning.
        </p>
      </LegalSection>

      <LegalSection title="More than one kind of knowledge">
        <p>
          Nigeria’s past is carried in documents and collections, but also in
          memory, language, practice and community knowledge. Oral histories
          and oral traditions can preserve experiences and knowledge that may
          not appear in written records. They deserve to be treated with care
          and respect.
        </p>
        <p>
          We aim to distinguish, where appropriate, between documented
          historical accounts, oral histories and traditions, folklore,
          legends, cultural interpretations and contemporary perspectives.
          Recording that a tradition or story is told is not the same as
          independently verifying every historical claim within it. The
          distinction helps visitors appreciate the story without confusing
          different kinds of evidence.
        </p>
      </LegalSection>

      <LegalSection title="When accounts differ">
        <p>
          Historical accounts can disagree. Evidence may be incomplete, sources
          may reflect particular perspectives, and communities may remember
          events differently. Where accounts differ, we say so.
        </p>
        <p>
          REKÒ aims to provide relevant context, acknowledge significant
          interpretations and avoid presenting disputed accounts as settled
          facts. Our goal is not to flatten those differences, but to help
          visitors understand what is known, what is debated and why the
          differences matter.
        </p>
      </LegalSection>

      <LegalSection title="Contributions and community knowledge">
        <p>
          Knowledge is held by many people: historians, independent
          researchers, storytellers, cultural creators, community custodians
          and people with lived or inherited knowledge of a subject. REKÒ
          welcomes relevant contributions and perspectives from people with
          knowledge and experience to share, including through online
          outreach.
        </p>
        <p>
          Contributions should be understood in their context and attributed
          where appropriate. A contribution can add valuable perspective, but
          it is not automatically independent verification of every claim it
          contains. We aim to be clear about whose perspective is being shared
          and what kind of account it represents.
        </p>
      </LegalSection>

      <LegalSection title="Corrections and new perspectives">
        <p>
          Historical understanding can develop as new material comes to light
          and existing sources are reconsidered. REKÒ welcomes corrections,
          additional context and credible evidence that may improve what we
          have published.
        </p>
        <p>
          If you spot an error or have a source or perspective we should
          consider, write to{" "}
          <a
            className="text-heritage-green underline underline-offset-4"
            href="mailto:reko17900@gmail.com"
          >
            reko17900@gmail.com
          </a>
          . Please include the page or subject, the point you are raising and
          any supporting references you can share.
        </p>
      </LegalSection>

      <p className="border-l-2 border-ochre pl-5 font-display text-heading-s leading-snug text-ink">
        Look closely. Ask questions. Follow the sources. The story gets richer
        when we understand how we know.
      </p>
    </LegalPageLayout>
  );
}
