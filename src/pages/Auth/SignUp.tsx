import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { signUp } from "../../features/auth/api";
import {
  ApiError,
  getApiErrorMessage,
  getApiFieldErrors,
} from "../../services/api/client";
import GoogleAuthButton from "../../features/auth/components/GoogleAuthButton";

export default function SignUp() {
  const navigate = useNavigate();
  const from = (useLocation().state as { from?: string } | null)?.from;
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [nextAction, setNextAction] = useState<"signin" | "verify" | "retry" | null>(
    null,
  );
  const [retryAfterSeconds, setRetryAfterSeconds] = useState<number>();
  const [wait, setWait] = useState(0);

  useEffect(() => {
    if (wait <= 0) return;
    const timer = window.setTimeout(() => setWait((seconds) => seconds - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [wait]);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFieldErrors((current) => ({ ...current, [e.target.name]: "" }));
    setError("");
  }

  async function submitSignup() {
    setError("");
    setFieldErrors({});
    setNextAction(null);
    setRetryAfterSeconds(undefined);
    setWait(0);
    setLoading(true);

    try {
      const response = await signUp(form);
      if (response.code !== "OTP_SENT") {
        setError("We couldn't complete account creation. Please try again.");
        return;
      }
      navigate("/auth/verify", {
        state: {
          email: form.email.trim().toLowerCase(),
          name: form.name,
          from,
          expiresInSeconds: response.data?.expiresInSeconds,
          resendAfterSeconds: response.data?.resendAfterSeconds ?? 0,
        },
      });
    } catch (err) {
      const apiError =
        err instanceof ApiError
          ? err
          : new ApiError(0, "We’re having trouble connecting. Try again shortly.");
      const serverFieldErrors = getApiFieldErrors(err);
      setFieldErrors(serverFieldErrors);
      switch (apiError.code) {
        case "EMAIL_ALREADY_EXISTS":
          setError("An account with this email already exists. Sign in to continue.");
          setNextAction("signin");
          break;
        case "EMAIL_REQUIRES_VERIFICATION":
          setError("This email still needs verification. Continue when you're ready.");
          setNextAction("verify");
          break;
        case "OTP_DELIVERY_FAILED":
          setError("Check your email for a verification code.");
          setNextAction("verify");
          break;
        case "OTP_COOLDOWN":
          setRetryAfterSeconds(apiError.retryAfterSeconds);
          setWait(apiError.retryAfterSeconds ?? 0);
          setError("Check your email for a verification code.");
          setNextAction("verify");
          break;
        case "RATE_LIMITED":
          setRetryAfterSeconds(apiError.retryAfterSeconds);
          setWait(apiError.retryAfterSeconds ?? 0);
          setError("Account creation is temporarily limited. Please wait before trying again.");
          break;
        case "RATE_LIMIT_STORE_UNAVAILABLE":
          setError("Account creation is temporarily unavailable. You can try again shortly.");
          setNextAction("retry");
          break;
        case "PASSWORD_TOO_SHORT":
          setFieldErrors((current) => ({
            ...current,
            password:
              serverFieldErrors.password ??
              getApiErrorMessage(apiError, "Password should be at least 8 characters."),
          }));
          break;
        default:
          setError(
            getApiErrorMessage(
              apiError,
              "We couldn't create your account. Please try again.",
            ),
          );
      }
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!form.name.trim()) errors.name = "Enter your name.";
    if (!form.email.trim()) {
      errors.email = "Enter your email.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errors.email = "Enter a valid email address.";
    }
    if (form.password.length < 8) {
      errors.password = "Password should be at least 8 characters.";
    }
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError("");
      return;
    }
    void submitSignup();
  }

  function continueVerification() {
    navigate("/auth/verify", {
      state: {
        email: form.email.trim().toLowerCase(),
        name: form.name,
        from,
        resume: true,
        resendAfterSeconds: retryAfterSeconds ?? 0,
      },
    });
  }

  return (
    <>
      <h1 className="font-display text-heading-l leading-tight">
        Don't just explore history. Keep it with you.
      </h1>
      <p className="mt-4 text-body-m text-muted">
        Save the stories that stay with you. Track your progress. Build your own
        path through REKÒ.
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-10 space-y-5">
        <Input
          label="Full name"
          name="name"
          autoComplete="name"
          required
          value={form.name}
          onChange={handleChange}
          error={fieldErrors.name}
        />
        <Input
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={form.email}
          onChange={handleChange}
          error={fieldErrors.email}
        />
        <Input
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          value={form.password}
          onChange={handleChange}
          error={fieldErrors.password}
        />

        {error && (
          <p role="alert" className="text-body-s text-error">
            {error}
          </p>
        )}
        {nextAction === "signin" && (
          <Link
            to="/auth/login"
            state={{ email: form.email.trim().toLowerCase() }}
            className="inline-block text-body-s font-medium text-ink underline underline-offset-4"
          >
            Go to sign in
          </Link>
        )}
        {nextAction === "verify" && (
          <Button
            type="button"
            onClick={continueVerification}
            className="w-full"
          >
            Continue to verification
          </Button>
        )}
        {nextAction === "retry" && (
          <Button
            type="button"
            onClick={() => void submitSignup()}
            disabled={loading}
            className="w-full"
          >
            Try again
          </Button>
        )}

        <Button
          type="submit"
          disabled={loading || wait > 0 || nextAction !== null}
          className="w-full"
        >
          {loading
            ? "Creating account…"
            : wait > 0
              ? `Try again in ${wait}s`
              : "Create account"}
        </Button>
      </form>

      <div className="mt-8">
        <div className="relative flex items-center gap-4">
          <div className="h-px flex-1 bg-border" />

          <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted">
            Or continue with
          </span>

          <div className="h-px flex-1 bg-border" />
        </div>

        <div className="mt-5">
          <GoogleAuthButton mode="signup" />
        </div>
      </div>

      <p className="mt-8 text-body-s text-muted">
        Already have an account?{" "}
        <Link
          to="/auth/login"
          className="font-medium text-ink underline underline-offset-4"
        >
          Sign in
        </Link>
      </p>
    </>
  );
}
