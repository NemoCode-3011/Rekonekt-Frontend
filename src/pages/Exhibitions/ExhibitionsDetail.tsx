import { useParams } from "react-router-dom";
import ArrowLink from "../../components/ui/ArrowLink";
import ChapterList from "../../features/exhibitions/components/ChapterList";
import ExhibitionHero from "../../features/exhibitions/components/ExhibitionHero";
import { useExhibitionDetail } from "../../features/exhibitions/hooks/useExhibitionDetail";

function LoadingState() {
  return (
    <main
      aria-busy="true"
      aria-label="Loading exhibition"
      className="container grid gap-10 py-10 md:grid-cols-12 md:gap-12 md:py-16"
    >
      <div className="order-first aspect-[4/3] animate-pulse bg-sand/50 motion-reduce:animate-none md:order-last md:col-span-7 md:aspect-auto md:min-h-[34rem]" />
      <div className="flex flex-col justify-end gap-5 md:col-span-5">
        <div className="h-8 w-32 animate-pulse bg-sand/50 motion-reduce:animate-none" />
        <div className="h-24 w-full animate-pulse bg-sand/50 motion-reduce:animate-none" />
        <div className="h-20 w-5/6 animate-pulse bg-sand/50 motion-reduce:animate-none" />
      </div>
    </main>
  );
}

function MessageState({ title, body }: { title: string; body: string }) {
  return (
    <main className="container flex min-h-[50svh] flex-col items-start justify-center gap-6 py-20">
      <h1 className="text-heading-l">{title}</h1>
      <p className="max-w-md font-sans text-body-m text-muted">{body}</p>
      <ArrowLink to="/explore/exhibitions">Browse exhibitions</ArrowLink>
    </main>
  );
}

function ExhibitionDetail() {
  const { slug } = useParams<{ slug: string }>();
  const state = useExhibitionDetail(slug);

  if (state.status === "loading") return <LoadingState />;

  if (state.status === "not-found") {
    return (
      <MessageState
        title="Exhibition not found"
        body="It may have been moved, or it isn't published yet."
      />
    );
  }

  if (state.status === "error") {
    return (
      <MessageState
        title="Something went wrong"
        body="We couldn't load this exhibition. Refresh the page to try again."
      />
    );
  }

  const { exhibition, sections } = state;

  return (
    <main>
      <ExhibitionHero exhibition={exhibition} chapterCount={sections.length} />
      <ChapterList experienceSlug={exhibition.slug} sections={sections} />
    </main>
  );
}

export default ExhibitionDetail;
