import { useCallback, useEffect, useState } from "react";
import AdminPageHeader from "../../features/admin/components/AdminPageHeader";
import InlineForm from "../../features/admin/components/InlineForm";
import {
  createAdmin,
  getTeam,
  revokeAdmin,
  type TeamMember,
} from "../../features/admin/api/team";
import { useAuth } from "../../features/auth/auth-context";

function errorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";
}

export default function Team() {
  const { user, showToast } = useAuth();
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );

  const load = useCallback(async () => {
    try {
      setTeam(await getTeam());
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function remove(member: TeamMember) {
    if (
      !window.confirm(
        `Remove admin access for ${member.name}? They keep their account as a visitor.`,
      )
    ) {
      return;
    }

    try {
      await revokeAdmin(member.id);
      showToast(`${member.name} is no longer an admin.`);
      await load();
    } catch (error) {
      showToast(errorMessage(error), "error");
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-8 md:px-8 md:py-12">
      <AdminPageHeader
        title="Team"
        description="The people who can edit and publish REKÒ. Only a super admin can see this page."
      />

      <div className="grid gap-14 py-10 lg:grid-cols-[1fr_22rem]">
        <section>
          {status === "loading" && (
            <p className="font-sans text-body-s text-muted">
              Loading the team…
            </p>
          )}

          {status === "error" && (
            <p role="alert" className="font-sans text-body-m text-error">
              We couldn't load the team. Refresh to try again.
            </p>
          )}

          {status === "ready" && (
            <ul className="divide-y divide-line border-y border-line">
              {team.map((member) => (
                <li
                  key={member.id}
                  className="flex items-center justify-between gap-4 py-4"
                >
                  <div className="min-w-0">
                    <p className="truncate font-sans text-body-m text-ink">
                      {member.name}
                      {member.id === user?.id && (
                        <span className="ml-2 text-meta text-muted">(you)</span>
                      )}
                    </p>
                    <p className="truncate font-sans text-body-s text-muted">
                      {member.email}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-4">
                    <span className="border border-line px-2 py-0.5 font-sans text-meta capitalize text-muted">
                      {member.role}
                    </span>

                    {member.role === "admin" && (
                      <button
                        type="button"
                        onClick={() => remove(member)}
                        className="font-sans text-body-s text-muted underline underline-offset-4 hover:text-error"
                      >
                        Remove access
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="mb-4 font-display text-heading-s">Add an admin</h2>

          <InlineForm
            submitLabel="Create admin"
            fields={[
              { name: "name", label: "Name", required: true },
              { name: "email", label: "Email", kind: "email", required: true },
              {
                name: "password",
                label: "Temporary password",
                kind: "password",
                required: true,
                hint: "At least 8 characters. Share it privately. They can change it in Settings.",
              },
            ]}
            onSubmit={async (values) => {
              if (values.password.length < 8) {
                throw new Error("The password needs at least 8 characters.");
              }

              await createAdmin({
                name: values.name.trim(),
                email: values.email.trim().toLowerCase(),
                password: values.password,
              });

              showToast("Admin created.");
              await load();
            }}
          />
        </section>
      </div>
    </div>
  );
}
