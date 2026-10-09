import { useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { setupAdminPassword } from "../../features/admin/api/team";
import type { ApiError } from "../../services/api/client";

export default function AdminSetupPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [complete, setComplete] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Your password must be at least 8 characters.");
      return;
    }
    if (!token) {
      setError("This setup link is missing its token. Ask a super admin to send a new invitation.");
      return;
    }

    setSaving(true);
    try {
      await setupAdminPassword(token, password);
      setComplete(true);
    } catch (caught) {
      setError((caught as ApiError).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="grid min-h-dvh place-items-center bg-ivory px-5 py-12">
      <section className="w-full max-w-md">
        <Link to="/" className="font-display text-heading-s tracking-wide text-ink">
          REKÒ
        </Link>
        {complete ? (
          <div className="mt-12">
            <h1 className="font-display text-heading-l leading-tight">
              Your password is ready.
            </h1>
            <p role="status" className="mt-4 text-body-m text-muted">
              You can now sign in to the REKÒ admin studio.
            </p>
            <Link
              to="/admin/login"
              className="mt-8 inline-flex h-12 items-center bg-heritage-green px-6 font-sans text-body-s font-medium text-ivory hover:bg-deep-forest"
            >
              Go to admin sign in
            </Link>
          </div>
        ) : (
          <>
            <h1 className="mt-12 font-display text-heading-l leading-tight">
              Set up your admin password.
            </h1>
            <p className="mt-4 text-body-m text-muted">
              Choose a password with at least 8 characters.
            </p>
            <form onSubmit={handleSubmit} className="mt-10 space-y-5">
              <Input
                label="Password"
                name="password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              {error && (
                <p role="alert" className="text-body-s text-error">
                  {error}
                </p>
              )}
              <Button type="submit" disabled={saving} className="w-full">
                {saving ? "Setting password…" : "Set password"}
              </Button>
            </form>
          </>
        )}
      </section>
    </main>
  );
}
