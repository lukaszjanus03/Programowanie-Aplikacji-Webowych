import { GOOGLE_CLIENT_ID, IS_DEV_AUTH_MODE } from "../config";

export interface GoogleProfile {
  sub: string;
  email: string;
  name: string;
  givenName: string;
  familyName: string;
  picture?: string;
}

// Minimal typing for Google Identity Services
interface GoogleCredentialResponse {
  credential: string;
}

interface GoogleIdClient {
  initialize: (opts: {
    client_id: string;
    callback: (resp: GoogleCredentialResponse) => void;
    auto_select?: boolean;
    cancel_on_tap_outside?: boolean;
  }) => void;
  renderButton: (
    el: HTMLElement,
    opts: {
      theme?: "outline" | "filled_blue" | "filled_black";
      size?: "small" | "medium" | "large";
      type?: "standard" | "icon";
      shape?: "rectangular" | "pill" | "circle" | "square";
      text?: "signin_with" | "signup_with" | "continue_with" | "signin";
      logo_alignment?: "left" | "center";
      width?: number;
    }
  ) => void;
  prompt: () => void;
  disableAutoSelect: () => void;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: GoogleIdClient;
      };
    };
  }
}

const GSI_SRC = "https://accounts.google.com/gsi/client";
let gsiLoadPromise: Promise<void> | null = null;

function loadGsiScript(): Promise<void> {
  if (gsiLoadPromise) return gsiLoadPromise;
  gsiLoadPromise = new Promise((resolve, reject) => {
    if (typeof document === "undefined") {
      reject(new Error("document is not available"));
      return;
    }
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${GSI_SRC}"]`);
    if (existing) {
      if ((window as unknown as { google?: unknown }).google) {
        resolve();
      } else {
        existing.addEventListener("load", () => resolve());
        existing.addEventListener("error", () => reject(new Error("GSI script load error")));
      }
      return;
    }
    const s = document.createElement("script");
    s.src = GSI_SRC;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("GSI script load error"));
    document.head.appendChild(s);
  });
  return gsiLoadPromise;
}

/** Dekoduje payload JWT (bez weryfikacji podpisu — wystarczy, bo ID token
 *  przyszedł bezpośrednio od Google przez kanał HTTPS w trakcie logowania). */
function decodeJwtPayload(token: string): Record<string, unknown> {
  const parts = token.split(".");
  if (parts.length < 2) throw new Error("Invalid JWT");
  const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
  const padded = payload + "=".repeat((4 - (payload.length % 4)) % 4);
  const json = decodeURIComponent(
    atob(padded)
      .split("")
      .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
      .join("")
  );
  return JSON.parse(json) as Record<string, unknown>;
}

function profileFromIdToken(idToken: string): GoogleProfile {
  const p = decodeJwtPayload(idToken);
  const email = String(p.email ?? "");
  const name = String(p.name ?? email);
  const given = String(p.given_name ?? "");
  const family = String(p.family_name ?? "");
  const picture = p.picture ? String(p.picture) : undefined;
  return {
    sub: String(p.sub ?? ""),
    email,
    name,
    givenName: given || (name.split(" ")[0] ?? ""),
    familyName: family || (name.split(" ").slice(1).join(" ") || ""),
    picture,
  };
}

export { IS_DEV_AUTH_MODE };

/** Renderuje oficjalny przycisk "Sign in with Google" w podanym kontenerze.
 *  Callback jest wywoływany po pomyślnym logowaniu. */
export async function renderGoogleButton(
  container: HTMLElement,
  onProfile: (profile: GoogleProfile) => void,
  options?: { theme?: "outline" | "filled_blue" | "filled_black"; width?: number }
): Promise<void> {
  if (IS_DEV_AUTH_MODE) {
    throw new Error("GOOGLE_CLIENT_ID nie jest ustawiony — użyj devLogin().");
  }
  await loadGsiScript();
  const g = window.google;
  if (!g) throw new Error("Google Identity Services nie załadowane");

  g.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: (resp: GoogleCredentialResponse) => {
      try {
        const profile = profileFromIdToken(resp.credential);
        onProfile(profile);
      } catch (e) {
        console.error("Błąd dekodowania ID tokenu Google:", e);
      }
    },
    auto_select: false,
    cancel_on_tap_outside: true,
  });

  g.accounts.id.renderButton(container, {
    theme: options?.theme ?? "filled_blue",
    size: "large",
    type: "standard",
    shape: "pill",
    text: "signin_with",
    logo_alignment: "left",
    width: options?.width ?? 280,
  });
}

/** Tryb deweloperski — używany gdy GOOGLE_CLIENT_ID nie jest skonfigurowany.
 *  Tworzy profil na podstawie ręcznie wpisanego e-maila. */
export function devLogin(email: string, fullName?: string): GoogleProfile {
  const trimmed = email.trim();
  const name = (fullName && fullName.trim()) || trimmed.split("@")[0] || "Użytkownik";
  const parts = name.split(/\s+/);
  return {
    sub: `dev-${trimmed.toLowerCase()}`,
    email: trimmed,
    name,
    givenName: parts[0] ?? name,
    familyName: parts.slice(1).join(" "),
  };
}

export function googleSignOut(): void {
  try {
    window.google?.accounts.id.disableAutoSelect();
  } catch {
    // ignore
  }
}
