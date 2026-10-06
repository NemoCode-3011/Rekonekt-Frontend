import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { forgotPassword, resetPassword } from "../../features/auth/api";
import type { ApiError } from "../../services/api/client";

export default function ResetPassword() {
  const navigate = useNavigate();
  const stateEmail: string | undefined = useLocation().state?.email;

  const [email, setEmail] = useState(stateEmail ?? "");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setNotice("");
    setLoading(true);

    try {
      await resetPassword(email, otp, newPassword);
      navigate("/auth/login", { state: { email, reset: true } });
    } catch (err) {
      setError((err as ApiError).message);
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setError("");
    setNotice("");

    try {
      await forgotPassword(email);
      setNotice("A new code is on its way.");
    } catch (err) {
      setError((err as ApiError).message);
    }
  }

  return (
    <>
      <h1 className="font-display text-heading-l leading-tight">
        Choose a new password.
      </h1>
      <p className="mt-4 text-body-m text-muted">
        {stateEmail
          ? `Enter the 6-digit code we sent to ${stateEmail} and choose a new password. The code expires in 5 minutes.`
          : "Enter your email, the 6-digit code we sent you, and a new password."}
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
          required
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
        />

        <Input
          label="New password"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />

        {error && (
          <p role="alert" className="text-body-s text-error">
            {error}
          </p>
        )}
        {notice && <p className="text-body-s text-success">{notice}</p>}

        <Button type="submit" disabled={loading || otp.length !== 6} className="w-full">
          {loading ? "Updating…" : "Update password"}
        </Button>
      </form>

      <p className="mt-8 text-body-s text-muted">
        Didn't get it?{" "}
        <button
          type="button"
          onClick={handleResend}
          className="py-2 font-medium text-ink underline underline-offset-4"
        >
          Resend code
        </button>
        {" · "}
        <Link to="/auth/login" className="font-medium text-ink underline underline-offset-4">
          Back to sign in
        </Link>
      </p>
    </>
  );
}