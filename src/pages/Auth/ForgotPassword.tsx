import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { forgotPassword } from "../../services/api/auth";
import type { ApiError } from "../../services/api/client";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>(useLocation().state?.email ?? "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await forgotPassword(email);
      navigate("/auth/reset-password", { state: { email } });
    } catch (err) {
      setError((err as ApiError).message);
    } finally {
      setLoading(false);
    }
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

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Sending code…" : "Send code"}
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