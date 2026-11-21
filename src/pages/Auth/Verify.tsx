import { useEffect, useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { resendOtp, verifyOtp } from "../../features/auth/api";
import type { ApiError } from "../../services/api/client";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export default function Verify() {
  const navigate = useNavigate();
  const locationState = useLocation().state as {
    email?: string;
    from?: string;
    name?: string;
    resume?: boolean;
    resendAfterSeconds?: number;
    expiresInSeconds?: number;
  } | null;
  const stateEmail = locationState?.email;

  const [email, setEmail] = useState(stateEmail ?? "");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  // Seconds before "Resend code" works again. The server enforces this too.
  const [resendWait, setResendWait] = useState(
    Math.max(0, locationState?.resendAfterSeconds ?? 0),
  );
  const [submitWait, setSubmitWait] = useState(0);
  const [verifiedSuccess, setVerifiedSuccess] = useState(false);

  useEffect(() => {
    if (resendWait <= 0) return;
    const timer = setTimeout(
      () => setResendWait((seconds) => seconds - 1),
      1000,
    );
    return () => clearTimeout(timer);
  }, [resendWait]);

  useEffect(() => {
    if (submitWait <= 0) return;
    const timer = setTimeout(
      () => setSubmitWait((seconds) => seconds - 1),
      1000,
    );
    return () => clearTimeout(timer);
  }, [submitWait]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setNotice("");
    setLoading(true);

    try {
      const response = await verifyOtp(email, otp);
      if (response.code !== "EMAIL_VERIFIED") {
        setError("We couldn't verify the code. Please try again.");
        return;
      }
      setVerifiedSuccess(true);
    } catch (err) {
      const apiError = err as ApiError;
      switch (apiError.code) {
        case "INVALID_OTP":
          setError("That code isn't correct. Check it and try again.");
          break;
        case "OTP_EXPIRED":
          setError("That code has expired. Request another code to continue.");
          break;
        case "OTP_ATTEMPTS_EXCEEDED":
          setError("Too many attempts. Request another code when available.");
          break;
        case "RATE_LIMITED":
          setError("Verification is temporarily limited. Please wait before trying again.");
          break;
        case "RATE_LIMIT_STORE_UNAVAILABLE":
          setError("Verification is temporarily unavailable. Please try again shortly.");
          break;
        default:
          setError(
            apiError.status === 0
              ? "Can't reach the server. Check your connection and try again."
              : "We couldn't verify the code. Please try again.",
          );
      }
      if (
        apiError.retryAfterSeconds &&
        (apiError.code === "RATE_LIMITED" ||
          apiError.code === "OTP_ATTEMPTS_EXCEEDED")
      ) {
        setSubmitWait(apiError.retryAfterSeconds);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (resendWait > 0 || resending) return;
    setError("");
    setNotice("");
    setResending(true);

    try {
      const response = await resendOtp(email);
      if (response.code === "OTP_REQUEST_ACCEPTED") {
        setNotice("If verification is needed, check your email for next steps.");
      } else {
        setError("We couldn't process that request. Please try again later.");
      }
    } catch (err) {
      const apiError = err as ApiError;
      switch (apiError.code) {
        case "OTP_COOLDOWN":
          setResendWait(apiError.retryAfterSeconds ?? 0);
          setNotice("Please check your email. You can request another code when the cooldown ends.");
          break;
        case "OTP_DELIVERY_FAILED":
          setError("We couldn't deliver a code. Please try again later.");
          break;
        case "RATE_LIMITED":
          setResendWait(apiError.retryAfterSeconds ?? 0);
          setError("Requests are temporarily limited. Please wait before trying again.");
          break;
        case "RATE_LIMIT_STORE_UNAVAILABLE":
          setError("Verification is temporarily unavailable. Please try again shortly.");
          break;
        default:
          setError(
            apiError.status === 0
              ? "Can't reach the server. Check your connection and try again."
              : "We couldn't process that request. Please try again later.",
          );
      }
    } finally {
      setResending(false);
    }
  }

  if (verifiedSuccess) {
    const firstName = locationState?.name?.trim().split(/\s+/)[0];
    return (
      <div className="text-center">
        <div className="mx-auto grid size-14 place-items-center rounded-full bg-success/10 text-success">
          <CheckCircle2 aria-hidden="true" className="size-7" />
        </div>
        <p className="mt-8 font-sans text-label uppercase tracking-[0.2em] text-success">
          Email verified
        </p>
        <h1 className="mt-3 font-display text-heading-l leading-tight">
          {firstName ? `Welcome to REKÒ, ${firstName}.` : "Welcome to REKÒ."}
        </h1>
        <p className="mt-5 text-body-m text-muted">
          REKÒ is a digital cultural museum for exploring Nigeria's history,
          art, people, places, and stories. Your account is ready.
        </p>
        <Button
          type="button"
          onClick={() =>
            navigate("/auth/login", {
              replace: true,
              state: { email, verified: true, from: locationState?.from },
            })
          }
          className="mt-8 w-full"
        >
          Sign in to continue
          <ArrowRight aria-hidden="true" className="ml-2 inline size-4" />
        </Button>
      </div>
    );
  }

  return (
    <>
      <h1 className="font-display text-heading-l leading-tight">
        Check your email.
      </h1>
      <p className="mt-4 text-body-m text-muted">
        {stateEmail
          ? `Enter the 6-digit code for ${stateEmail}.${locationState?.expiresInSeconds ? ` It expires in about ${Math.ceil(locationState.expiresInSeconds / 60)} minutes.` : ""}`
          : "Enter your email and the 6-digit code we sent you."}
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
            onChange={(e) => setEmail(e.target.value)}
          />
        )}

        <Input
          label="Verification code"
          name="otp"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          pattern="[0-9]{6}"
          title="Enter the six-digit code"
          required
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
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
            ? "Verifying…"
            : submitWait > 0
              ? `Wait ${submitWait}s to continue`
              : "Verify email"}
        </Button>
      </form>

      <p className="mt-8 text-body-s text-muted">
        Didn't get it?{" "}
        <button
          type="button"
          onClick={handleResend}
          disabled={resendWait > 0 || resending || !email.trim()}
          className="py-2 font-medium text-ink underline underline-offset-4 disabled:no-underline disabled:opacity-50"
        >
          {resending
            ? "Sending…"
            : resendWait > 0
              ? `Resend code in ${resendWait}s`
              : "Resend code"}
        </button>
      </p>
    </>
  );
}
