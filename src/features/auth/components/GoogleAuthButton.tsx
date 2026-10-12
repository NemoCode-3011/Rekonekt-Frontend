import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { useLocation, useNavigate } from "react-router-dom";
import { googleSignIn } from "../api";
import { useAuth } from "../auth-context";
import { saveLastUser } from "../lastUser";

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

export default function GoogleAuthButton() {
  const navigate = useNavigate();
  const { setUser, showToast } = useAuth();
  const from = (useLocation().state as { from?: string } | null)?.from;

  // No client ID set up yet: show nothing instead of a broken button.
  if (!clientId) return null;

  function failed() {
    showToast("Google sign-in failed. Please try again.", "error");
  }

  async function handleSuccess(credential?: string) {
    if (!credential) return failed();

    try {
      const user = await googleSignIn(credential);

      setUser(user);
      saveLastUser({ name: user.name, email: user.email });
      showToast("You're signed in.");
      navigate(from ?? "/", { replace: true });
    } catch {
      failed();
    }
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <GoogleLogin
        onSuccess={(response) => handleSuccess(response.credential)}
        onError={failed}
      />
    </GoogleOAuthProvider>
  );
}