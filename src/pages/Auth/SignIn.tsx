import { useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { clearLastUser, getLastUser, saveLastUser } from "../../features/auth/lastUser";
import { signIn } from "../../features/auth/api";
import type { ApiError } from "../../services/api/client";
import { useAuth } from "../../features/auth/auth-context";

export default function SignIn() {
  const navigate = useNavigate();
  const { setUser, showToast } = useAuth();
  const state = useLocation().state as {
    email?: string;
    verified?: boolean;
    reset?: boolean;
    from?: string;
  } | null;

  // A returning user is someone who signed in on this device before
  const [returning, setReturning] = useState(() =>
    state?.email ? null : getLastUser()
  );

  const [form, setForm] = useState({ email: state?.email ?? "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const email = returning?.email ?? form.email;

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
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
      setUser(user);
      saveLastUser({ name: user.name, email: user.email });
      showToast("You're signed in.");
      navigate(state?.from ?? "/");
    } catch (err) {
      const { status, message } = err as ApiError;

      if (status === 403) {
        // Correct password, email not verified yet
        navigate("/auth/verify", { state: { email } });
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
        {returning
          ? `Welcome back, ${returning.name.split(" ")[0]}.`
          : "Pick up where you left off."}
      </h1>

      {returning && (
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

      {state?.verified && (
        <p className="mt-4 text-body-m text-success">Email verified. Sign in to continue.</p>
      )}
      {state?.reset && (
        <p className="mt-4 text-body-m text-success">
          Password updated. Sign in with your new password.
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
          <p role="alert" className="text-body-s text-error">
            {error}
          </p>
        )}

        <Button
          type="submit"
          disabled={loading}
          aria-busy={loading}
          className="w-full"
        >
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <p className="mt-8 text-body-s text-muted">
        New to REKÒ?{" "}
        <Link to="/auth/signup" className="font-medium text-ink underline underline-offset-4">
          Create an account
        </Link>
      </p>
    </>
  );
}