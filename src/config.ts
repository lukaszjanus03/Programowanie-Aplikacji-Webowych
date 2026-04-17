/**
 * Konfiguracja aplikacji ManageMe.
 *
 * ─── SUPER ADMIN ────────────────────────────────────────────────────────
 * SUPER_ADMIN_EMAIL — jedyny "zaszyty" użytkownik.
 * Konto zalogowane tym e-mailem dostaje rolę `admin` natychmiast po pierwszym
 * zalogowaniu. Każdy inny nowy użytkownik startuje jako `guest` i musi zostać
 * zatwierdzony przez admina (zmiana roli w widoku listy użytkowników).
 *
 * ─── GOOGLE OAUTH (Lab 6) ───────────────────────────────────────────────
 * VITE_GOOGLE_CLIENT_ID — Client ID z Google Cloud Console.
 * Gdy pusty, aplikacja działa w trybie deweloperskim (logowanie po e-mailu).
 *
 * ─── STORAGE (Lab 7) ────────────────────────────────────────────────────
 * VITE_STORAGE_MODE — wybór systemu przechowywania danych:
 *   "local"     (domyślnie)  — wszystko w localStorage
 *   "firestore"              — Google Cloud Firestore (NoSQL)
 *
 * W trybie "firestore" wymagane są pozostałe zmienne VITE_FIREBASE_*,
 * zaczerpnięte z Firebase Console → Project Settings → Your apps.
 */

export const SUPER_ADMIN_EMAIL = "lukasz.janus03@example.com";

// ── Google OAuth ──
export const GOOGLE_CLIENT_ID: string =
  (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined) ?? "";
export const IS_DEV_AUTH_MODE = GOOGLE_CLIENT_ID.trim() === "";

// ── Storage ──
export type StorageMode = "local" | "firestore";

const RAW_STORAGE_MODE = (
  (import.meta.env.VITE_STORAGE_MODE as string | undefined) ?? "local"
).toLowerCase();

export const STORAGE_MODE: StorageMode =
  RAW_STORAGE_MODE === "firestore" ? "firestore" : "local";

// ── Firebase config ──
export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export const FIREBASE_CONFIG: FirebaseConfig = {
  apiKey:            (import.meta.env.VITE_FIREBASE_API_KEY as string | undefined)             ?? "",
  authDomain:        (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined)         ?? "",
  projectId:         (import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined)          ?? "",
  storageBucket:     (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string | undefined)      ?? "",
  messagingSenderId: (import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined) ?? "",
  appId:             (import.meta.env.VITE_FIREBASE_APP_ID as string | undefined)              ?? "",
};

export const IS_FIREBASE_CONFIGURED =
  FIREBASE_CONFIG.apiKey.trim() !== "" && FIREBASE_CONFIG.projectId.trim() !== "";
