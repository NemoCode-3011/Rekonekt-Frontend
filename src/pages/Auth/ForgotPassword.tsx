import { useEffect, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { forgotPassword } from "../../features/auth/api";
import type { ApiError } from "../../services/api/client";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>(useLocation().state?.email ?? "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [wait, setWait] = useState(0);

  useEffect(() => {
    if (wait <= 0) return;
    const timer = window.setTimeout(() => setWait((seconds) => seconds - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [wait]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await forgotPassword(email);
      if (response.code !== "PASSWORD_RESET_REQUEST_ACCEPTED") {
        setError("We couldn't process the request. Please try again later.");
        return;
      }
      setSent(true);
    } catch (err) {
      const apiError = err as ApiError;
      if (apiError.code === "RATE_LIMITED") {
        setError("Requests are temporarily limited. Please wait before trying again.");
        setWait(apiError.retryAfterSeconds ?? 0);
      } else if (apiError.code === "RATE_LIMIT_STORE_UNAVAILABLE") {
        setError("We’re having trouble connecting. Try again shortly.");
      } else {
        setError(
          apiError.status === 0 || apiError.status >= 500
            ? "We’re having trouble connecting. Try again shortly."
            : "We couldn't process the request. Please try again later.",
        );
      }
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="text-center">
        <p className="font-sans text-label uppercase tracking-[0.2em] text-success">
          Password recovery
        </p>
        <h1 className="mt-3 font-display text-heading-l leading-tight">
          Password recovery
        </h1>
        <p className="mt-5 text-body-m text-muted">
          If there’s an account for this email, a reset code is on the way.
        </p>
        <Button
          type="button"
          onClick={() =>
            navigate("/auth/reset-password", { state: { email } })
          }
          className="mt-8 w-full"
        >
          Continue to reset password
        </Button>
        <p className="mt-6 text-body-s text-muted">
          <Link
            to="/auth/login"
            className="font-medium text-ink underline underline-offset-4"
          >
            Back to sign in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <>
      <h1 className="font-display text-heading-l leading-tight">
        Forgot your password?
      </h1>
      <p className="mt-4 text-body-m text-muted">
        Enter your email and we'll send you a code to reset it.
      </p>

      <form onSubmit={handleSubmit} className="mt-10 space-y-5">
        <Input
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {error && (
          <p role="alert" className="text-body-s text-error">
            {error}
          </p>
        )}

        <Button type="submit" disabled={loading || wait > 0} className="w-full">
          {loading
            ? "Sending code…"
            : wait > 0
              ? `Please wait ${wait}s`
              : "Send code"}
        </Button>
      </form>

      <p className="mt-8 text-body-s text-muted">
        Remembered it?{" "}
        <Link to="/auth/login" className="font-medium text-ink underline underline-offset-4">
          Back to sign in
        </Link>
      </p>
    </>
  );
}