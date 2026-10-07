import { useAuth } from "../../auth/auth-context";

export default function AdminTopbar() {
  const { user, logout } = useAuth();

  return (
    <header className="flex min-h-20 items-center justify-between border-b border-ink/10 bg-ivory px-5 md:px-8 lg:px-10">
      <div>
        <p className="font-sans text-[10px] font-medium uppercase tracking-[0.18em] text-muted">
          Admin
        </p>

        <p className="mt-1 font-display text-xl text-ink">Content Studio</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden text-right sm:block">
          <p className="font-sans text-sm text-ink">{user?.name ?? "Admin"}</p>

          <p className="font-sans text-xs capitalize text-muted">
            {user?.role ?? "admin"}
          </p>
        </div>

        <button
          type="button"
          onClick={logout}
          className="border border-ink/15 px-4 py-2 font-sans text-xs text-ink transition-colors hover:border-ink/30 hover:bg-ink/5"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
