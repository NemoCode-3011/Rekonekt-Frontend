const KEY = "reko:last-user";

export type LastUser = { name: string; email: string };

export function getLastUser(): LastUser | null {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "null");
  } catch {
    return null;
  }
}

export function saveLastUser(user: LastUser) {
  try {
    localStorage.setItem(KEY, JSON.stringify(user));
  } catch {
    // Storage can be unavailable in private browsing or restricted contexts.
  }
}

export function clearLastUser() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}