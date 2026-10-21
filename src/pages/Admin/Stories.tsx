import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  listAdminStories,
  createAdminStory,
  type AdminStory,
} from "../../features/admin/api/stories";
import AdminPageHeader from "../../features/admin/components/AdminPageHeader";
import InlineForm from "../../features/admin/components/InlineForm";
import { storyFields } from "../../features/admin/components/StoryFields";
import { categoryLabel } from "../../features/stories/Category";

export default function AdminStories() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [items, setItems] = useState<AdminStory[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  // "?new=1" (from the dashboard's Add story button) opens the form straight away.
  const creating = params.get("new") === "1";

  const load = useCallback(async () => {
    try {
      setItems(await listAdminStories());
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function setCreating(open: boolean) {
    setParams(open ? { new: "1" } : {}, { replace: true });
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-8 md:px-8 md:py-12">
      <AdminPageHeader
        title="Stories"
        description="Myths, folklore, legends and oral histories. A story can stand on its own, or be connected to a chapter of an exhibition."
        action={
          !creating && (
            <button
              type="button"
              onClick={() => setCreating(true)}
              className="h-11 bg-heritage-green px-6 font-sans text-body-s font-medium text-ivory transition-colors hover:bg-deep-forest"
            >
              New story
            </button>
          )
        }
      />

      {creating && (
        <div className="mt-8 max-w-2xl">
          <InlineForm
            submitLabel="Create and open"
            onCancel={() => setCreating(false)}
            fields={storyFields()}
            onSubmit={async (values) => {
              const created = await createAdminStory(values);
              navigate(`/admin/stories/${created.id}`);
            }}
          />
          <p className="mt-3 font-sans text-meta text-muted">
            It is saved as a draft, and not connected to any exhibition. You can change both on the
            next page.
          </p>
        </div>
      )}

      <div className="py-10">
        {status === "loading" && (
          <p className="font-sans text-body-s text-muted">Loading stories…</p>
        )}

        {status === "error" && (
          <p role="alert" className="font-sans text-body-m text-error">
            We couldn&rsquo;t load the stories. Refresh to try again.
          </p>
        )}

        {status === "ready" && items.length === 0 && (
          <p className="font-sans text-body-m text-muted">
            No stories yet. Create the first one above.
          </p>
        )}

        {status === "ready" && items.length > 0 && (
          <ul className="divide-y divide-line border-y border-line">
            {items.map((item) => {
              const category = categoryLabel(item.category);
              const where = item.exhibition_title
                ? `${item.exhibition_title} › ${item.section_title}`
                : "Standalone";

              return (
                <li key={item.id}>
                  <Link
                    to={`/admin/stories/${item.id}`}
                    className="flex items-center justify-between gap-4 py-5 transition-colors hover:bg-heritage-green/5"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-display text-heading-s">{item.title}</p>
                      <p className="truncate font-sans text-body-s text-muted">
                        {category ? `${category} · ` : ""}
                        {where}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 border px-2 py-0.5 font-sans text-meta capitalize ${
                        item.status === "published"
                          ? "border-heritage-green/40 text-heritage-green"
                          : "border-line text-muted"
                      }`}
                    >
                      {item.status}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}