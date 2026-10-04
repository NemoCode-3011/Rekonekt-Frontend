import { useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { signUp } from "../../services/api/auth";
import type { ApiError } from "../../services/api/client";

export default function SignUp() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signUp(form);
      navigate("/auth/verify", { state: { email: form.email } });
    } catch (err) {
      const { status, message } = err as ApiError;
      setError(status === 409 ? "An account with this email already exists." : message);
    } finally {
      setLoading(false);
    }
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

      <form onSubmit={handleSubmit} className="mt-10 space-y-5">
        <Input
          label="Full name"
          name="name"
          autoComplete="name"
          required
          value={form.name}
          onChange={handleChange}
        />
        <Input
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={form.email}
          onChange={handleChange}
        />
        <Input
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          value={form.password}
          onChange={handleChange}
        />

        {error && (
          <p role="alert" className="text-body-s text-error">
            {error}
          </p>
        )}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="mt-8 text-body-s text-muted">
        Already have an account?{" "}
        <Link to="/auth/login" className="font-medium text-ink underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </>
  );
}