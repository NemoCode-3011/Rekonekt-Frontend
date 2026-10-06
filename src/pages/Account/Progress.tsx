import { Link } from "react-router-dom";
import ArrowLink from "../../components/ui/ArrowLink";
import { formatLongDate } from "../../lib/dates";
import { useProgress } from "../../features/progress/useProgress";
import type { ProgressEntry } from "../../features/progress/types";

// Where "Continue" leads: straight to the chapter the visitor left off at.
// A finished experience opens at the beginning instead.
function resumeLink(entry: ProgressEntry) {
  const start = `/experiences/${entry.exhibition_slug}`;

  return !entry.completed && entry.section_slug
    ? `${start}?chapter=${entry.section_slug}`
    : start;
}

function statusLine(entry: ProgressEntry) {
  if (entry.completed) return "You've finished this experience.";
  if (entry.section_title) return `You left off at ${entry.section_title}.`;
  return "You've started this experience.";
}

function Progress() {
  const { entries, status } = useProgress();

  if (status === "loading") {
    return (
      <p className="font-sans text-body-s text-muted">Loading your progress…</p>
    );
  }

  if (status === "error") {
    return (
      <p role="alert" className="font-sans text-body-m text-muted">
        We couldn't load your progress. Refresh to try again.
      </p>
    );
  }

  if (entries.length === 0) {
    return (
      <div>
        <p className="max-w-md font-display text-heading-m leading-tight">
          You haven't started an exhibition yet.
        </p>
        <p className="mt-3 max-w-md font-sans text-body-m text-muted">
          When you step into an experience, REKÒ remembers where you left off.
        </p>
        <div className="mt-8">
          <ArrowLink to="/explore/exhibitions">Browse exhibitions</ArrowLink>
        </div>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-line border-y border-line">
      {entries.map((entry) => (
        <li
          key={entry.id}
          className="grid gap-5 py-8 md:grid-cols-[1fr_auto] md:items-center md:gap-10"
        >
          <div>
            <h2 className="font-display text-heading-m leading-tight">
              {entry.exhibition_title}
            </h2>
            <p className="mt-2 font-sans text-body-m text-muted">
              {statusLine(entry)}
            </p>
            <p className="mt-1 font-sans text-body-s text-muted">
              Last visited {formatLongDate(entry.last_viewed_at)}
            </p>
          </div>

          <Link
            to={resumeLink(entry)}
            className="inline-flex items-center gap-2 justify-self-start border border-ink px-6 py-3 font-sans text-body-m transition-colors hover:bg-ink hover:text-ivory md:justify-self-end"
          >
            {entry.completed ? "Revisit" : "Continue"}
            <span aria-hidden="true">→</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default Progress;
