import { useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  Clock3,
  LoaderCircle,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import {
  clearLastUser,
  getLastUser,
  saveLastUser,
} from "../../features/auth/lastUser";
import { signIn } from "../../features/auth/api";
import type { ApiError } from "../../services/api/client";
import { useAuth } from "../../features/auth/auth-context";

type SignInMode = "visitor" | "admin";

interface SignInProps {
  mode?: SignInMode;
}

export default function SignIn({ mode = "visitor" }: SignInProps) {
  const navigate = useNavigate();
  const { setUser, logout, showToast } = useAuth();

  const state = useLocation().state as {
    email?: string;
    verified?: boolean;
    reset?: boolean;
    from?: string;
    expired?: boolean;
  } | null;

  const isAdminLogin = mode === "admin";

  const [returning, setReturning] = useState(() =>
    state?.email || isAdminLogin ? null : getLastUser(),
  );

  const [form, setForm] = useState({
    email: state?.email ?? "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const email = returning?.email ?? form.email;

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  function handleNotYou() {
    clearLastUser();
    setReturning(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const user = await signIn(email, form.password);

      const isAdmin = user.role === "admin" || user.role === "super admin";

      if (isAdminLogin && !isAdmin) {
        await logout();
        setError("This account does not have admin access.");
        return;
      }

      setUser(user);

      saveLastUser({
        name: user.name,
        email: user.email,
      });

      showToast("You're signed in.");

      if (isAdmin) {
        navigate("/admin/dashboard", { replace: true });
      } else {
        navigate(state?.from ?? "/", { replace: true });
      }
    } catch (err) {
      const { status, message } = err as ApiError;

      if (status === 403) {
        navigate("/auth/verify", {
          state: { email },
        });
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <h1 className="font-display text-heading-l leading-tight">
        {isAdminLogin
          ? "Sign in to REKÒ Admin."
          : returning
            ? `Welcome back, ${returning.name.split(" ")[0]}.`
            : "Pick up where you left off."}
      </h1>

      {returning && !isAdminLogin && (
        <p className="mt-4 text-body-m text-muted">
          Signing in as {returning.email}.{" "}
          <button
            type="button"
            onClick={handleNotYou}
            className="py-2 font-medium text-ink underline underline-offset-4"
          >
            Not you?
          </button>
        </p>
      )}

      {isAdminLogin && (
        <p className="mt-4 flex items-center gap-2 text-body-m text-muted">
          <ShieldCheck aria-hidden="true" className="size-4 shrink-0 text-heritage-green" />
          <span>Admin and super admin accounts only.</span>
        </p>
      )}

      {state?.verified && (
        <p role="status" className="mt-4 flex items-start gap-2 text-body-m text-success">
          <CheckCircle2 aria-hidden="true" className="mt-1 size-4 shrink-0" />
          <span>Email verified. Sign in to continue.</span>
        </p>
      )}

      {state?.reset && (
        <p role="status" className="mt-4 flex items-start gap-2 text-body-m text-success">
          <CheckCircle2 aria-hidden="true" className="mt-1 size-4 shrink-0" />
          <span>Password updated. Sign in with your new password.</span>
        </p>
      )}

      {state?.expired && (
        <p role="status" className="mt-4 flex items-start gap-2 text-body-m text-muted">
          <Clock3 aria-hidden="true" className="mt-1 size-4 shrink-0" />
          <span>Your session expired. Enter your password to continue.</span>
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        aria-busy={loading}
        className="mt-10 space-y-5"
      >
        {!returning && (
          <Input
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            icon={Mail}
            required
            value={form.email}
            onChange={handleChange}
          />
        )}

        <Input
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          icon={LockKeyhole}
          required
          value={form.password}
          onChange={handleChange}
        />

        <div className="text-right">
          <Link
            to="/auth/forgot-password"
            state={{ email }}
            className="inline-block py-2 text-body-s text-muted underline underline-offset-4 hover:text-ink"
          >
            Forgot password?
          </Link>
        </div>

        {error && (
          <p role="alert" className="flex items-start gap-2 text-body-s text-error">
            <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            <span>{error}</span>
          </p>
        )}

        <Button
          type="submit"
          disabled={loading}
          aria-busy={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <LoaderCircle aria-hidden="true" className="mr-2 inline size-4 animate-spin" />
              Signing in…
            </>
          ) : (
            <>
              Sign in
              <ArrowRight aria-hidden="true" className="ml-2 inline size-4" />
            </>
          )}
        </Button>
      </form>

      {!isAdminLogin && (
        <p className="mt-8 text-body-s text-muted">
          New to REKÒ?{" "}
          <Link
            to="/auth/signup"
            className="font-medium text-ink underline underline-offset-4"
          >
            Create an account
          </Link>
        </p>
      )}
    </>
  );
}
