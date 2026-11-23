import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
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
import { signIn } from "../../features/auth/api";
import {
  ApiError,
  getApiErrorMessage,
  getApiFieldErrors,
} from "../../services/api/client";
import { useAuth } from "../../features/auth/auth-context";
import GoogleAuthButton from "../../features/auth/components/GoogleAuthButton";

type SignInMode = "visitor" | "admin";

interface SignInProps {
  mode?: SignInMode;
}

export default function SignIn({ mode = "visitor" }: SignInProps) {
  const navigate = useNavigate();
  const { logout, refreshUser, showToast } = useAuth();

  const state = useLocation().state as {
    email?: string;
    verified?: boolean;
    reset?: boolean;
    from?: string;
    expired?: boolean;
  } | null;

  const isAdminLogin = mode === "admin";

  const [form, setForm] = useState({
    email: state?.email ?? "",
    password: "",
  });

  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [wait, setWait] = useState(0);

  useEffect(() => {
    if (wait <= 0) return;
    const timer = window.setTimeout(() => setWait((seconds) => seconds - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [wait]);

  const email = form.email;

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
    setFieldErrors((current) => ({ ...current, [e.target.name]: "" }));
    setError("");
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    setError("");
    setFieldErrors({});
    setLoading(true);

    try {
      const response = await signIn(email, form.password);
      if (response.code !== "LOGIN_SUCCESS") {
        setError("We couldn't complete sign in. Please try again.");
        return;
      }

      const user = await refreshUser();

      const isAdmin = user.role === "admin" || user.role === "super admin";

      if (isAdminLogin && !isAdmin) {
        await logout();
        setError("This account does not have admin access.");
        return;
      }

      showToast("You're signed in.");

      if (isAdmin) {
        navigate("/admin/dashboard", { replace: true });
      } else {
        navigate(state?.from ?? "/", { replace: true });
      }
    } catch (err) {
      const apiError =
        err instanceof ApiError
          ? err
          : new ApiError(0, "We’re having trouble connecting. Try again shortly.");
      setFieldErrors(getApiFieldErrors(err));

      if (apiError.code === "EMAIL_NOT_VERIFIED") {
        navigate("/auth/verify", {
          state: { email, resume: true },
        });
      } else if (apiError.code === "INVALID_CREDENTIALS") {
        setError("Incorrect email or password. Please try again.");
      } else if (
        apiError.code === "RATE_LIMITED" ||
        apiError.code === "RATE_LIMIT_STORE_UNAVAILABLE"
      ) {
        setError("We’re having trouble connecting. Try again shortly.");
        if (apiError.code === "RATE_LIMITED") {
          setWait(apiError.retryAfterSeconds ?? 0);
        }
      } else if (apiError.status === 0) {
        setError(getApiErrorMessage(apiError, "Sign in failed."));
      } else if (apiError.status >= 500) {
        setError(getApiErrorMessage(apiError, "Sign in failed."));
      } else {
        setError(
          getApiErrorMessage(
            apiError,
            "Incorrect email or password. Please try again.",
          ),
        );
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
          : "Pick up where you left off."}
      </h1>

      {isAdminLogin && (
        <p className="mt-4 flex items-center gap-2 text-body-m text-muted">
          <ShieldCheck
            aria-hidden="true"
            className="size-4 shrink-0 text-heritage-green"
          />
          <span>Admin and super admin accounts only.</span>
        </p>
      )}

      {state?.verified && (
        <p
          role="status"
          className="mt-4 flex items-start gap-2 text-body-m text-success"
        >
          <CheckCircle2 aria-hidden="true" className="mt-1 size-4 shrink-0" />
          <span>Email verified. Sign in to continue.</span>
        </p>
      )}

      {state?.reset && (
        <p
          role="status"
          className="mt-4 flex items-start gap-2 text-body-m text-success"
        >
          <CheckCircle2 aria-hidden="true" className="mt-1 size-4 shrink-0" />
          <span>Password updated. Sign in with your new password.</span>
        </p>
      )}

      {state?.expired && (
        <p
          role="status"
          className="mt-4 flex items-start gap-2 text-body-m text-muted"
        >
          <Clock3 aria-hidden="true" className="mt-1 size-4 shrink-0" />
          <span>Your session expired. Enter your password to continue.</span>
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        aria-busy={loading}
        className="mt-10 space-y-5"
      >
        {(
          <Input
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            icon={Mail}
            required
            value={form.email}
            onChange={handleChange}
            error={fieldErrors.email}
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
          error={fieldErrors.password}
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
          <p
            role="alert"
            className="flex items-start gap-2 text-body-s text-error"
          >
            <CircleAlert
              aria-hidden="true"
              className="mt-0.5 size-4 shrink-0"
            />
            <span>{error}</span>
          </p>
        )}

        <Button
          type="submit"
          disabled={loading || wait > 0}
          aria-busy={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <LoaderCircle
                aria-hidden="true"
                className="mr-2 inline size-4 animate-spin"
              />
              Signing in…
            </>
          ) : wait > 0 ? (
            <>Please wait {wait}s</>
          ) : (
            <>
              Sign in
              <ArrowRight aria-hidden="true" className="ml-2 inline size-4" />
            </>
          )}
        </Button>
      </form>

      {!isAdminLogin && (
        <div className="mt-8">
          <p className="mb-4 text-center text-body-s text-muted">or</p>
          <GoogleAuthButton mode="signin" />
        </div>
      )}

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
