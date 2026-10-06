import ArrowLink from "../../components/ui/ArrowLink";
import { useBookmarks } from "../../features/bookmarks/bookmarks-context";
import { useDiscovery } from "../../features/experience/discovery/discovery-context";

function Bookmarks() {
  const { bookmarks, status, toggle } = useBookmarks();
  const { openRef } = useDiscovery();

  if (status === "loading") {
    return (
      <p className="font-sans text-body-s text-muted">
        Loading your bookmarks…
      </p>
    );
  }

  if (status === "error") {
    return (
      <p role="alert" className="font-sans text-body-m text-muted">
        We couldn't load your bookmarks. Refresh to try again.
      </p>
    );
  }

  if (bookmarks.length === 0) {
    return (
      <div>
        <p className="max-w-md font-display text-heading-m leading-tight">
          Your bookmarks are empty.
        </p>
        <p className="mt-3 max-w-md font-sans text-body-m text-muted">
          In an experience, select the bookmark icon on anything you'd like to
          come back to.
        </p>
        <div className="mt-8">
          <ArrowLink to="/explore/exhibitions">Browse exhibitions</ArrowLink>
        </div>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-line border-y border-line">
      {bookmarks.map((bookmark) => (
        <li
          key={bookmark.id}
          className="grid gap-4 py-7 md:grid-cols-[1fr_auto] md:items-start md:gap-10"
        >
          <button
            type="button"
            onClick={() => openRef({ kind: "artifact", slug: bookmark.slug })}
            className="group text-left"
          >
            {bookmark.date_display && (
              <span className="block font-display text-heading-s text-ochre">
                {bookmark.date_display}
              </span>
            )}
            <span className="mt-1 block font-display text-heading-m leading-tight transition-colors group-hover:text-heritage-green">
              {bookmark.title}
            </span>
            {bookmark.artifact_type && (
              <span className="mt-1 block font-sans text-body-s text-muted">
                {bookmark.artifact_type}
              </span>
            )}
            {bookmark.description && (
              <span className="mt-3 line-clamp-2 block max-w-xl font-sans text-body-m text-muted">
                {bookmark.description}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => toggle(bookmark.artifact_id)}
            aria-label={`Remove ${bookmark.title} from bookmarks`}
            className="justify-self-start border border-ink/40 px-4 py-2 font-sans text-body-s transition-colors hover:border-ink md:justify-self-end"
          >
            Remove
          </button>
        </li>
      ))}
    </ul>
  );
}

export default Bookmarks;
