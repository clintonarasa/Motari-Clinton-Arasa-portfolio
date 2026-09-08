export async function authenticate(email: string, password: string) {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });
  return response.ok;
}

export function signIn(email: string) {
  return email;
}

export async function signOut() {
  await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
}

export function isSignedIn() {
  return false;
}

export function getSessionEmail(): string | null {
  return null;
}

export function usingSupabase(): boolean {
  return false;
}

export function getStoredCreds() {
  return { email: localStorage.getItem("local-admin-email") || "", password: localStorage.getItem("local-admin-password") || "" };
}

export function setStoredCreds(email: string, password: string) {
  localStorage.setItem("local-admin-email", email);
  localStorage.setItem("local-admin-password", password);
}

export default {
  authenticate,
  signIn,
  signOut,
  isSignedIn,
  getSessionEmail,
  usingSupabase,
  getStoredCreds,
  setStoredCreds,
};
