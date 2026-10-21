import {
  Component,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useProgress } from "@react-three/drei";

import ObjectScene, {
  type Phase,
  type PickResult,
} from "../../features/object-viewer/ObjectScene";
import {
  getObject,
  type ObjectConfig,
  type ObjectSource,
  type ObjectStory,
} from "../../features/object-viewer/objects";

// ---------- Small helpers ----------

function webglAvailable() {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

// Phones and weaker laptops get a lighter scene.
function isLowPower() {
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  return coarse || (navigator.hardwareConcurrency ?? 8) <= 4;
}

const pad = (number: number) => String(number).padStart(2, "0");
const round = (number: number) => Math.round(number * 100) / 100;

// If the 3D scene crashes (for example the model file is missing),
// the visitor still gets the stories as plain text.
class SceneBoundary extends Component<
  { onError: () => void; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onError();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function Sources({ sources }: { sources: ObjectSource[] }) {
  return (
    <div className="mt-6 border-t border-ivory/15 pt-4">
      <p className="font-sans text-[10px] uppercase tracking-[0.18em] text-ivory/50">
        Sources and further reading
      </p>
      <ul className="mt-3 space-y-2">
        {sources.map((source) => (
          <li key={source.url}>
            <a
              href={source.url}
              target="_blank"
              rel="noreferrer"
              className="font-sans text-body-s text-ivory/85 underline decoration-ochre underline-offset-4 transition-colors hover:text-ivory"
            >
              {source.label} ↗
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ---------- Plain-text version (no WebGL, or the scene failed) ----------

function StoryFallback({
  config,
  stories,
  slug,
  message,
}: {
  config: ObjectConfig;
  stories: ObjectStory[];
  slug: string;
  message: string;
}) {
  return (
    <main className="min-h-svh bg-ink px-5 py-16 text-ivory md:px-10">
      <div className="mx-auto max-w-2xl">
        <Link
          to={`/experiences/${slug}?chapter=${config.sectionSlug}`}
          className="font-sans text-body-s text-ivory/70 underline underline-offset-4 hover:text-ivory"
        >
          ← Back to the exhibition
        </Link>

        <p className="mt-12 font-sans text-label uppercase tracking-[0.2em] text-ochre">
          {config.eyebrow}
        </p>
        <h1 className="mt-4 font-display text-heading-l leading-tight">
          {config.title}
        </h1>
        <p className="mt-2 font-sans text-body-m text-ivory/60">
          {config.subtitle}
        </p>
        <p className="mt-6 font-sans text-body-s text-ivory/60">{message}</p>

        <ol className="mt-12 space-y-12">
          {stories.map((story, index) => (
            <li key={story.id}>
              <p className="font-sans text-label uppercase tracking-[0.18em] text-ochre">
                {pad(index + 1)} / {story.eyebrow}
              </p>
              <h2 className="mt-2 font-display text-heading-m">
                {story.title}
              </h2>
              <p className="mt-3 font-sans text-body-m text-ivory/75">
                {story.body}
              </p>
              <Sources sources={story.sources} />
            </li>
          ))}

          <li>
            <p className="font-sans text-label uppercase tracking-[0.18em] text-ochre">
              {config.finale.eyebrow}
            </p>
            <h2 className="mt-2 font-display text-heading-m">
              {config.finale.title}
            </h2>
            <p className="mt-3 font-sans text-body-m text-ivory/75">
              {config.finale.body}
            </p>
            <Sources sources={config.finale.sources} />
          </li>
        </ol>
      </div>
    </main>
  );
}

// ---------- The viewer ----------

function Viewer({ config, slug }: { config: ObjectConfig; slug: string }) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const calibrate = params.get("calibrate") === "1";
  const reduced = useReducedMotion() ?? false;

  const [lowPower] = useState(isLowPower);
  const [webgl] = useState(webglAvailable);
  const { progress } = useProgress();

  // Markers marked needsCheck stay hidden from visitors until you have verified them.
  const stories = useMemo(
    () => config.stories.filter((story) => calibrate || !story.needsCheck),
    [config, calibrate],
  );

  const [phase, setPhase] = useState<Phase>("loading");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [interacted, setInteracted] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [picked, setPicked] = useState<PickResult | null>(null);
  const [failed, setFailed] = useState(false);

  const finaleIndex = stories.length;
  const finale = activeIndex === finaleIndex;
  const story =
    activeIndex !== null && activeIndex < finaleIndex
      ? stories[activeIndex]
      : null;

  const handleReady = useCallback(
    () => setPhase(reduced ? "explore" : "intro"),
    [reduced],
  );
  const handleIntroDone = useCallback(() => setPhase("explore"), []);
  const handleInteract = useCallback(() => setInteracted(true), []);

  const select = useCallback((index: number) => {
    setActiveIndex(index);
    setInteracted(true);
  }, []);

  const close = useCallback(() => setActiveIndex(null), []);

  const step = useCallback(
    (direction: number) =>
      setActiveIndex((current) =>
        current === null
          ? null
          : (current + direction + finaleIndex + 1) % (finaleIndex + 1),
      ),
    [finaleIndex],
  );

  // Keyboard: Esc closes, the arrow keys move between points.
  useEffect(() => {
    if (activeIndex === null) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") close();
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeIndex, close, step]);

  if (!webgl || failed) {
    return (
      <StoryFallback
        config={config}
        stories={stories}
        slug={slug}
        message={
          failed
            ? "The 3D view couldn't load, so here are the details as text."
            : "Your browser can't show the 3D view, so here are the details as text."
        }
      />
    );
  }

  const content = finale
    ? {
        eyebrow: config.finale.eyebrow,
        title: config.finale.title,
        body: config.finale.body,
        sources: config.finale.sources,
      }
    : story && activeIndex !== null
      ? {
          eyebrow: `${pad(activeIndex + 1)} / ${story.eyebrow}`,
          title: story.title,
          body: story.body,
          sources: story.sources,
        }
      : null;

  const exploring = phase === "explore";
  const pickedText = picked
    ? `position: [${picked.position.map(round).join(", ")}],\nnormal: [${picked.normal
        .map(round)
        .join(", ")}],`
    : "";

  return (
    <main
      aria-label={`${config.title}, interactive 3D view`}
      className="relative h-svh min-h-140 w-full overflow-hidden bg-[#050806] text-ivory"
    >
      {/* The 3D scene */}
      <div className="absolute inset-0">
        <SceneBoundary onError={() => setFailed(true)}>
          <ObjectScene
            config={config}
            stories={stories}
            phase={phase}
            activeIndex={activeIndex}
            finale={finale}
            reduced={reduced}
            lowPower={lowPower}
            interacted={interacted}
            resetKey={resetKey}
            calibrate={calibrate}
            picked={picked}
            onReady={handleReady}
            onIntroDone={handleIntroDone}
            onInteract={handleInteract}
            onSelect={select}
            onPick={setPicked}
          />
        </SceneBoundary>
      </div>

      {/* A soft dark edge around the picture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_46%,transparent_38%,rgba(3,7,5,0.78)_100%)]"
      />

      {/* Top bar */}
      <header className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-center justify-between px-5 py-5 md:px-10 md:py-7">
        <Link
          to="/"
          aria-label="REKÒ home"
          className="pointer-events-auto font-display text-[1.7rem] tracking-[-0.04em]"
        >
          REKÒ<span className="text-ochre">.</span>
        </Link>

        <button
          type="button"
          onClick={() =>
            navigate(`/experiences/${slug}?chapter=${config.sectionSlug}`)
          }
          className="pointer-events-auto border border-ivory/30 bg-ink/40 px-4 py-2.5 font-sans text-[10px] uppercase tracking-[0.16em] backdrop-blur-sm transition-colors hover:border-ochre hover:bg-ochre/10"
        >
          Back to exhibition <span aria-hidden>↗</span>
        </button>
      </header>

      {/* Loading */}
      <AnimatePresence>
        {phase === "loading" && (
          <motion.div
            key="loader"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-[#050806]"
          >
            <p className="font-display text-[2.6rem] tracking-[-0.04em]">
              REKÒ<span className="text-ochre">.</span>
            </p>
            <div className="mt-8 h-px w-48 bg-ivory/15">
              <div
                className="h-full bg-ochre transition-[width] duration-300"
                style={{ width: `${Math.round(progress)}%` }}
              />
            </div>
            <p className="mt-4 font-sans text-[10px] uppercase tracking-[0.2em] text-ivory/50">
              Preparing the gallery
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* The arrival */}
      <AnimatePresence>
        {phase === "intro" && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 1.6, duration: 1.6 }}
            className="pointer-events-none absolute inset-x-0 bottom-[14%] z-10 px-6 text-center"
          >
            <p className="font-sans text-[10px] uppercase tracking-[0.28em] text-ochre">
              {config.eyebrow}
            </p>
            <h1 className="mt-4 font-display text-[clamp(2.6rem,7vw,5.5rem)] leading-[0.95] tracking-[-0.03em]">
              Look closely.
            </h1>
            <p className="mx-auto mt-5 max-w-md font-sans text-body-s text-ivory/65">
              {config.teaser}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* What this object is */}
      {exploring && (
        <div className="pointer-events-none absolute left-5 top-20 z-10 md:bottom-8 md:left-10 md:top-auto hide-in-hall">
          <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-ochre">
            {config.eyebrow}
          </p>
          <p className="mt-1 max-w-[16rem] font-display text-[1.15rem] leading-tight md:max-w-xs md:text-[1.4rem]">
            {config.title}
          </p>
          <p className="mt-1 font-sans text-meta text-ivory/55">
            {config.subtitle}
          </p>

          {config.credit.model && (
            <p className="mt-3 hidden max-w-xs font-sans text-meta text-ivory/40 md:block">
              Digital model: {config.credit.model}
              {config.credit.original && (
                <> · Original: {config.credit.original}</>
              )}
            </p>
          )}
        </div>
      )}

      {/* A hint, until the visitor touches the object */}
      <AnimatePresence>
        {exploring && !interacted && activeIndex === null && (
          <motion.p
            key="hint"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="pointer-events-none absolute inset-x-0 bottom-24 z-10 px-6 text-center font-sans text-[10px] uppercase tracking-[0.2em] text-ivory/60 md:bottom-8 hide-in-hall"
          >
            Drag to turn · Select a numbered point to look closer
          </motion.p>
        )}
      </AnimatePresence>

      {/* Move between points */}
      {exploring && activeIndex === null && (
        <nav
          aria-label="Look closer"
          className="absolute inset-x-0 bottom-6 z-20 flex justify-center px-4 md:bottom-16 hide-in-hall"
        >
          <ul className="flex items-center gap-1.5 border border-ivory/15 bg-ink/70 px-2.5 py-2 backdrop-blur-md">
            {stories.map((item, index) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => select(index)}
                  aria-label={`Look closer: ${item.title}`}
                  className="grid size-8 place-items-center rounded-full border border-ivory/30 font-sans text-[11px] transition-colors hover:border-ivory hover:bg-ochre"
                >
                  {index + 1}
                </button>
              </li>
            ))}
            <li className="ml-1 border-l border-ivory/15 pl-2">
              <button
                type="button"
                onClick={() => select(finaleIndex)}
                className="px-3 py-1.5 font-sans text-[10px] uppercase tracking-[0.16em] text-ivory/85 transition-colors hover:text-ochre"
              >
                Where is it now?
              </button>
            </li>
          </ul>
        </nav>
      )}

      {exploring && activeIndex === null && (
        <button
          type="button"
          onClick={() => setResetKey((key) => key + 1)}
          className="absolute bottom-6 right-5 z-20 hidden border border-ivory/30 bg-ink/50 px-4 py-2.5 font-sans text-[10px] uppercase tracking-[0.16em] backdrop-blur-sm transition-colors hover:border-ochre md:right-10 md:bottom-8 md:block hide-in-hall"
        >
          Full view
        </button>
      )}

      {/* The story panel */}
      <AnimatePresence mode="wait">
        {content && (
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, y: reduced ? 0 : 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduced ? 0 : -8 }}
            transition={{ duration: reduced ? 0 : 0.35 }}
            className="pointer-events-none absolute inset-x-3 bottom-4 z-30 md:inset-x-auto md:bottom-24 md:right-8 md:top-24 md:flex md:w-92 md:items-center"
          >
            <aside
              role="dialog"
              aria-label={content.title}
              className="pointer-events-auto max-h-[56svh] overflow-y-auto border border-ivory/15 border-t-2 border-t-ochre bg-[#0a110d]/90 p-6 backdrop-blur-xl md:max-h-full"
            >
              <div className="flex items-center justify-between gap-4">
                <p className="font-sans text-[10px] uppercase tracking-[0.18em] text-ivory/60">
                  {content.eyebrow}
                </p>
                <button
                  type="button"
                  onClick={close}
                  aria-label="Close"
                  className="text-2xl leading-none text-ivory/60 transition-colors hover:text-ivory"
                >
                  ×
                </button>
              </div>

              <h2 className="mt-4 font-display text-[1.7rem] leading-[1.08] tracking-[-0.02em] md:text-[1.9rem]">
                {content.title}
              </h2>
              <p className="mt-4 font-sans text-body-s leading-relaxed text-ivory/75">
                {content.body}
              </p>

              <Sources sources={content.sources} />

              <div className="mt-6 flex items-center justify-between border-t border-ivory/15 pt-4">
                <button
                  type="button"
                  onClick={() => step(-1)}
                  className="font-sans text-[10px] uppercase tracking-[0.16em] text-ivory/70 transition-colors hover:text-ivory"
                >
                  ← Previous
                </button>

                <span className="font-sans text-meta tabular-nums text-ochre">
                  {Math.min((activeIndex ?? 0) + 1, finaleIndex + 1)} /{" "}
                  {finaleIndex + 1}
                </span>

                <button
                  type="button"
                  onClick={() => step(1)}
                  className="font-sans text-[10px] uppercase tracking-[0.16em] text-ivory/70 transition-colors hover:text-ivory"
                >
                  Next →
                </button>
              </div>
            </aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Calibration helper: open this page with ?calibrate=1 */}
      {calibrate && (
        <div className="absolute bottom-24 left-5 z-40 w-72 border border-[#ff3df2]/60 bg-ink/90 p-4 font-sans text-meta md:bottom-24 md:left-10">
          <p className="uppercase tracking-[0.16em] text-[#ff3df2]">
            Calibrate mode
          </p>
          <p className="mt-2 text-ivory/70">
            Click the model where a marker should sit. Copy the two lines below
            into that marker in objects.ts.
          </p>
          <pre className="mt-3 whitespace-pre-wrap text-ivory">
            {pickedText || "Nothing picked yet."}
          </pre>
          {picked && (
            <button
              type="button"
              onClick={() => navigator.clipboard?.writeText(pickedText)}
              className="mt-3 border border-ivory/40 px-3 py-1.5 uppercase tracking-[0.14em] hover:border-ochre"
            >
              Copy
            </button>
          )}
          {!config.credit.model && (
            <p className="mt-3 text-ochre">
              Reminder: fill in credit.model in objects.ts before showing this
              to anyone.
            </p>
          )}
        </div>
      )}

      {/* The same details as text, for screen readers */}
      <ol className="sr-only">
        {stories.map((item) => (
          <li key={item.id}>
            {item.title}. {item.body}
          </li>
        ))}
        <li>
          {config.finale.title}. {config.finale.body}
        </li>
      </ol>
    </main>
  );
}

// ---------- The route ----------

export default function ObjectViewer() {
  const { slug = "", key: objectKey } = useParams<{
    slug: string;
    key: string;
  }>();
  const config = getObject(objectKey);

  if (!config || config.exhibitionSlug !== slug) {
    return (
      <main className="flex min-h-svh flex-col items-center justify-center bg-ink px-5 text-center text-ivory">
        <p className="font-display text-heading-m">
          This object isn't in the gallery.
        </p>
        <Link
          to={slug ? `/experiences/${slug}` : "/"}
          className="mt-6 font-sans text-body-s underline underline-offset-4 hover:text-ochre"
        >
          Back to the exhibition
        </Link>
      </main>
    );
  }

  return <Viewer config={config} slug={slug} />;
}
