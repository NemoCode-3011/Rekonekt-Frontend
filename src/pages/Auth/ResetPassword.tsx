import { useEffect, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { forgotPassword, resetPassword } from "../../features/auth/api";
import {
  ApiError,
  getApiErrorMessage,
  getApiFieldErrors,
} from "../../services/api/client";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { useAuth } from "../../features/auth/auth-context";

export default function ResetPassword() {
  const navigate = useNavigate();
  const { clearLocalSession } = useAuth();
  const stateEmail: string | undefined = useLocation().state?.email;

  const [email, setEmail] = useState(stateEmail ?? "");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [submitWait, setSubmitWait] = useState(0);
  const [resendWait, setResendWait] = useState(0);
  const [resetComplete, setResetComplete] = useState(false);

  useEffect(() => {
    if (submitWait <= 0) return;
    const timer = setTimeout(
      () => setSubmitWait((seconds) => seconds - 1),
      1000,
    );
    return () => clearTimeout(timer);
  }, [submitWait]);

  useEffect(() => {
    if (resendWait <= 0) return;
    const timer = setTimeout(
      () => setResendWait((seconds) => seconds - 1),
      1000,
    );
    return () => clearTimeout(timer);
  }, [resendWait]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setNotice("");
    setLoading(true);

    try {
      const response = await resetPassword(email, otp, newPassword);
      if (response.code !== "PASSWORD_RESET") {
        setError("We couldn't update your password. Please try again.");
        return;
      }
      clearLocalSession();
      setResetComplete(true);
    } catch (err) {
      const apiError =
        err instanceof ApiError
          ? err
          : new ApiError(0, "We’re having trouble connecting. Try again shortly.");
      setFieldErrors(getApiFieldErrors(err));
      switch (apiError.code) {
        case "INVALID_OTP":
          setError("That reset code isn't correct. Check it and try again.");
          break;
        case "OTP_EXPIRED":
          setError("That reset code has expired. Request another code to continue.");
          break;
        case "OTP_ATTEMPTS_EXCEEDED":
          setError("Too many attempts. Request another reset code when available.");
          break;
        case "RATE_LIMITED":
          setError("Password reset is temporarily limited. Please wait before trying again.");
          if (apiError.retryAfterSeconds) {
            setSubmitWait(apiError.retryAfterSeconds);
          }
          break;
        case "RATE_LIMIT_STORE_UNAVAILABLE":
          setError("We’re having trouble connecting. Try again shortly.");
          break;
        default:
          setError(
            getApiErrorMessage(
              apiError,
              "We couldn't update your password. Please try again.",
            ),
          );
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (resendWait > 0 || resending) return;
    setError("");
    setFieldErrors({});
    setNotice("");
    setResending(true);

    try {
      const response = await forgotPassword(email);
      if (response.code === "PASSWORD_RESET_REQUEST_ACCEPTED") {
        setNotice("If there’s an account for this email, a reset code is on the way.");
      } else {
        setError("We couldn't process that request. Please try again later.");
      }
    } catch (err) {
      const apiError =
        err instanceof ApiError
          ? err
          : new ApiError(0, "We’re having trouble connecting. Try again shortly.");
      setFieldErrors(getApiFieldErrors(err));
      if (apiError.code === "RATE_LIMITED") {
        setError("Requests are temporarily limited. Please wait before trying again.");
        if (apiError.retryAfterSeconds) {
          setResendWait(apiError.retryAfterSeconds);
        }
      } else if (apiError.code === "RATE_LIMIT_STORE_UNAVAILABLE") {
        setError("We’re having trouble connecting. Try again shortly.");
      } else {
        setError(
          getApiErrorMessage(
            apiError,
            "We couldn't process that request. Please try again later.",
          ),
        );
      }
    } finally {
      setResending(false);
    }
  }

  if (resetComplete) {
    return (
      <div className="text-center">
        <div className="mx-auto grid size-14 place-items-center rounded-full bg-success/10 text-success">
          <CheckCircle2 aria-hidden="true" className="size-7" />
        </div>
        <p className="mt-8 font-sans text-label uppercase tracking-[0.2em] text-success">
          Password updated
        </p>
        <h1 className="mt-3 font-display text-heading-l leading-tight">
          You're ready to continue.
        </h1>
        <p className="mt-5 text-body-m text-muted">
          Your new password is active. Sign in to return to REKÒ.
        </p>
        <Button
          type="button"
          onClick={() =>
            navigate("/auth/login", {
              replace: true,
              state: { email, reset: true },
            })
          }
          className="mt-8 w-full"
        >
          Sign in
          <ArrowRight aria-hidden="true" className="ml-2 inline size-4" />
        </Button>
      </div>
    );
  }

  return (
    <>
      <h1 className="font-display text-heading-l leading-tight">
        Choose a new password.
      </h1>
      <p className="mt-4 text-body-m text-muted">
        {stateEmail
          ? `Enter the 6-digit password reset code for ${stateEmail} and choose a new password.`
          : "Enter your email, the 6-digit password reset code, and a new password."}
      </p>

      <form onSubmit={handleSubmit} className="mt-10 space-y-5">
        {!stateEmail && (
          <Input
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setFieldErrors((current) => ({ ...current, email: "" }));
              setError("");
            }}
            error={fieldErrors.email}
          />
        )}

        <Input
          label="Password reset code"
          name="otp"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          pattern="[0-9]{6}"
          title="Enter the six-digit code"
          required
          value={otp}
          onChange={(e) => {
            setOtp(e.target.value.replace(/\D/g, ""));
            setFieldErrors((current) => ({ ...current, otp: "" }));
            setError("");
          }}
          error={fieldErrors.otp ?? fieldErrors.code}
        />

        <Input
          label="New password"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          value={newPassword}
          onChange={(e) => {
            setNewPassword(e.target.value);
            setFieldErrors((current) => ({ ...current, newPassword: "" }));
            setError("");
          }}
          error={fieldErrors.newPassword ?? fieldErrors.password}
        />

        {error && (
          <p role="alert" className="text-body-s text-error">
            {error}
          </p>
        )}
        {notice && <p className="text-body-s text-success">{notice}</p>}

        <Button
          type="submit"
          disabled={loading || otp.length !== 6 || submitWait > 0}
          className="w-full"
        >
          {loading
            ? "Updating…"
            : submitWait > 0
              ? `Please wait ${submitWait}s`
              : "Update password"}
        </Button>
      </form>

      <p className="mt-8 text-body-s text-muted">
        Didn't get it?{" "}
        <button
          type="button"
          onClick={handleResend}
          disabled={resendWait > 0 || resending}
          className="py-2 font-medium text-ink underline underline-offset-4 disabled:no-underline disabled:opacity-50"
        >
          {resending
            ? "Sending…"
            : resendWait > 0
              ? `Resend code in ${resendWait}s`
              : "Resend code"}
        </button>
        {" · "}
        <Link to="/auth/login" className="font-medium text-ink underline underline-offset-4">
          Back to sign in
        </Link>
      </p>
    </>
  );
}