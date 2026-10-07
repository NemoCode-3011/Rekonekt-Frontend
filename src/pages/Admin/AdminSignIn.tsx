import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../../features/auth/auth-context";
import SignIn from "../Auth/SignIn";

export default function AdminSignIn() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-ink text-ivory">
        <p className="font-sans text-body-s text-ivory/65">
          Checking your session...
        </p>
      </main>
    );
  }

  if (user) {
    const isAdmin = user.role === "admin" || user.role === "super admin";
    return <Navigate to={isAdmin ? "/admin/dashboard" : "/"} replace />;
  }

  return (
    <main className="min-h-screen bg-ink text-ivory lg:grid lg:grid-cols-[1.1fr_0.9fr]">
      <section className="relative flex min-h-[35vh] flex-col justify-between overflow-hidden bg-deep-forest px-6 py-7 md:px-12 md:py-10 lg:min-h-screen lg:px-16 lg:py-12">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-32 top-1/4 h-[28rem] w-[28rem] rounded-full border border-ivory/10"
        >
          <div className="absolute inset-10 rounded-full border border-ivory/10" />
          <div className="absolute inset-20 rounded-full border border-ivory/10" />
        </div>

        <Link
          to="/"
          className="relative z-10 w-fit font-display text-heading-s tracking-[-0.04em]"
        >
          REKÒ
        </Link>

        <div className="relative z-10 max-w-2xl py-12 lg:py-0">
          <p className="font-sans text-label uppercase tracking-[0.2em] text-sand">
            Content Studio
          </p>
          <h1 className="mt-5 font-display text-display-l leading-[0.92]">
            The stories behind the story.
          </h1>
          <p className="mt-6 max-w-lg font-sans text-body-m leading-relaxed text-ivory/70">
            Sign in to manage REKÒ exhibitions, experiences, and historical
            materials.
          </p>
        </div>

        <p className="relative z-10 hidden font-sans text-label text-ivory/45 lg:block">
          REKÒ · ADMINISTRATION
        </p>
      </section>

      <section className="flex min-h-[65vh] items-center justify-center bg-ivory px-5 py-14 text-ink md:px-10 lg:min-h-screen lg:px-16">
        <div className="w-full max-w-[420px]">
          <p className="font-sans text-label uppercase tracking-[0.18em] text-ochre">
            Staff access
          </p>
          <div className="mt-5">
            <SignIn mode="admin" />
          </div>
          <Link
            to="/"
            className="mt-10 inline-block font-sans text-body-s text-muted underline decoration-line underline-offset-4 hover:text-ink"
          >
            Return to REKÒ
          </Link>
        </div>
      </section>
    </main>
  );
}