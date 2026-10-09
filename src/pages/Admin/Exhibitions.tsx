import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AdminPageHeader from "../../features/admin/components/AdminPageHeader";
import InlineForm from "../../features/admin/components/InlineForm";
import { getAdminExhibitions } from "../../features/admin/api/dashboard";
import { createExhibitionFromForm } from "../../features/admin/api/workspace";
import type { DashboardExhibitionResponseItem } from "../../features/admin/types/dashboard";

export default function Exhibitions() {
  const navigate = useNavigate();
  const [items, setItems] = useState<DashboardExhibitionResponseItem[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    try {
      setItems((await getAdminExhibitions()).exhibitions);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-8 md:px-8 md:py-12">
      <AdminPageHeader
        title="Exhibitions"
        description="Open an exhibition to build its chapters and content in one place."
        action={
          !creating && (
            <button
              type="button"
              onClick={() => setCreating(true)}
              className="h-11 bg-heritage-green px-6 font-sans text-body-s font-medium text-ivory transition-colors hover:bg-deep-forest"
            >
              New exhibition
            </button>
          )
        }
      />

      {creating && (
        <div className="mt-8 max-w-xl">
          <InlineForm
            submitLabel="Create and open"
            onCancel={() => setCreating(false)}
            fields={[
              { name: "title", label: "Title", required: true },
              {
                name: "subtitle",
                label: "Subtitle",
                hint: "A short line shown on cards.",
              },
              {
                name: "startDate",
                label: "Story begins",
                kind: "date",
                required: true,
                hint: "The date the story starts. Use January 1 if you only know the year.",
              },
              { name: "description", label: "Description", kind: "textarea" },
              {
                name: "coverImageUrl",
                label: "Cover image",
                kind: "image",
                hint: "Optional. You can add it later.",
              },
            ]}
            onSubmit={async (values) => {
              const created = await createExhibitionFromForm(values);
              navigate(`/admin/exhibitions/${created.id}`);
            }}
          />
        </div>
      )}

      <div className="py-10">
        {status === "loading" && (
          <p className="font-sans text-body-s text-muted">
            Loading exhibitions…
          </p>
        )}

        {status === "error" && (
          <p role="alert" className="font-sans text-body-m text-error">
            We couldn't load the exhibitions. Refresh to try again.
          </p>
        )}

        {status === "ready" && items.length === 0 && (
          <p className="font-sans text-body-m text-muted">
            No exhibitions yet. Create the first one above.
          </p>
        )}

        {status === "ready" && items.length > 0 && (
          <ul className="divide-y divide-line border-y border-line">
            {items.map((item) => (
              <li key={item.id}>
                <Link
                  to={`/admin/exhibitions/${item.id}`}
                  className="flex items-center justify-between gap-4 py-5 transition-colors hover:bg-heritage-green/5"
                >
                  <div className="min-w-0">
                    <p className="truncate font-display text-heading-s">
                      {item.title}
                    </p>
                    {item.subtitle && (
                      <p className="truncate font-sans text-body-s text-muted">
                        {item.subtitle}
                      </p>
                    )}
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
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
