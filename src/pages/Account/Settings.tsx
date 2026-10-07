import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { useAuth } from "../../features/auth/auth-context";
import {
  changePassword,
  getCulturalGroups,
  updateProfile,
  type CulturalGroup,
} from "../../features/auth/api";

const languages = [
  { code: "en", label: "English" },
  { code: "yo", label: "Yorùbá" },
  { code: "ig", label: "Igbo" },
  { code: "ha", label: "Hausa" },
];

const labelClass =
  "mb-2 block text-label font-medium uppercase tracking-widest text-muted";
const selectClass =
  "h-12 w-full border border-line bg-transparent px-4 text-body-m outline-none transition-colors focus:border-heritage-green";

function errorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";
}

// One row of the page: a title on the left, the form on the right.
function Block({
  title,
  intro,
  children,
}: {
  title: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <section className="grid gap-8 py-10 md:grid-cols-[16rem_1fr] md:gap-16">
      <div>
        <h2 className="font-display text-heading-s">{title}</h2>
        <p className="mt-2 font-sans text-body-s text-muted">{intro}</p>
      </div>
      <div className="max-w-xl space-y-6">{children}</div>
    </section>
  );
}

function Settings() {
  const { user, setUser, showToast } = useAuth();

  // ---- Your details ----
  const [name, setName] = useState(user?.name ?? "");
  const [language, setLanguage] = useState(user?.preferred_language ?? "en");
  const [groupId, setGroupId] = useState(
    user?.cultural_group_id ? String(user.cultural_group_id) : "",
  );
  const [groups, setGroups] = useState<CulturalGroup[]>([]);
  const [nameError, setNameError] = useState("");
  const [saving, setSaving] = useState(false);

  // ---- Password ----
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>(
    {},
  );
  const [changing, setChanging] = useState(false);

  // The list of cultural groups is optional. If it can't load, the
  // dropdown is simply left out.
  useEffect(() => {
    getCulturalGroups()
      .then(setGroups)
      .catch(() => {});
  }, []);

  if (!user) return null; // this page is only reachable when signed in

  const changed =
    name.trim() !== user.name ||
    language !== user.preferred_language ||
    (groupId ? Number(groupId) : null) !== (user.cultural_group_id ?? null);

  async function handleDetailsSubmit(event: FormEvent) {
    event.preventDefault();

    if (name.trim().length < 2) {
      setNameError("Name must be at least 2 characters.");
      return;
    }

    setNameError("");
    setSaving(true);

    try {
      const updated = await updateProfile({
        name: name.trim(),
        preferredLanguage: language,
        culturalGroupId: groupId ? Number(groupId) : null,
      });

      setUser(updated);
      showToast("Your settings are saved.");
    } catch (error) {
      showToast(errorMessage(error), "error");
    } finally {
      setSaving(false);
    }
  }

  async function handlePasswordSubmit(event: FormEvent) {
    event.preventDefault();

    const errors: Record<string, string> = {};

    if (!currentPassword) errors.current = "Enter your current password.";
    if (newPassword.length < 8) errors.next = "Use at least 8 characters.";
    if (confirmPassword !== newPassword)
      errors.confirm = "The passwords don't match.";

    setPasswordErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setChanging(true);

    try {
      await changePassword(currentPassword, newPassword);

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      showToast("Your password has been changed.");
    } catch (error) {
      showToast(errorMessage(error), "error");
    } finally {
      setChanging(false);
    }
  }

  return (
    <div className="divide-y divide-line border-y border-line">
      <Block
        title="Your details"
        intro="How REKÒ greets you. Translations are coming, so for now your language is used for greetings."
      >
        <form onSubmit={handleDetailsSubmit} className="space-y-6" noValidate>
          <Input
            label="Name"
            name="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            error={nameError}
            autoComplete="name"
          />

          <div>
            <label htmlFor="email" className={labelClass}>
              Email
            </label>
            <input
              id="email"
              value={user.email}
              disabled
              className="h-12 w-full border border-line bg-transparent px-4 text-body-m text-muted"
            />
          </div>

          <div>
            <label htmlFor="language" className={labelClass}>
              Preferred language
            </label>
            <select
              id="language"
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
              className={selectClass}
            >
              {languages.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          {groups.length > 0 && (
            <div>
              <label htmlFor="group" className={labelClass}>
                Cultural group (optional)
              </label>
              <select
                id="group"
                value={groupId}
                onChange={(event) => setGroupId(event.target.value)}
                className={selectClass}
              >
                <option value="">Prefer not to say</option>
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <Button type="submit" disabled={saving || !changed}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </form>
      </Block>

      <Block
        title="Password"
        intro="Choose a new password. You'll stay signed in on this device."
      >
        <form onSubmit={handlePasswordSubmit} className="space-y-6" noValidate>
          <Input
            label="Current password"
            name="current-password"
            type="password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            error={passwordErrors.current}
            autoComplete="current-password"
          />
          <Input
            label="New password"
            name="new-password"
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            error={passwordErrors.next}
            autoComplete="new-password"
          />
          <Input
            label="Confirm new password"
            name="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            error={passwordErrors.confirm}
            autoComplete="new-password"
          />

          <Button type="submit" disabled={changing}>
            {changing ? "Changing…" : "Change password"}
          </Button>
        </form>
      </Block>
    </div>
  );
}

export default Settings;
