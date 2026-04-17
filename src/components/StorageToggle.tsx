import { useState } from "react";
import {
  EFFECTIVE_STORAGE_MODE,
  REQUESTED_STORAGE_MODE,
  setStorageOverride,
} from "../storage";
import { IS_FIREBASE_CONFIGURED } from "../config";
import { StorageMode } from "../config";
import { useTheme } from "../ThemeContext";

/**
 * Przełącznik magazynu danych (localStorage ↔ Firestore).
 *
 * Zmiana trybu zapisuje wybór do localStorage (klucz `manageme_storage_mode_override`)
 * i przeładowuje stronę — store musi zostać zbootstrapowany na świeżym backendzie.
 *
 * Jeśli klucze Firebase nie są wpisane w `.env`, przełącznik pokazuje Firestore
 * jako niedostępny (wybór zostanie zdegradowany do `local`).
 */
export default function StorageToggle() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [busy, setBusy] = useState(false);

  const firestoreAvailable = IS_FIREBASE_CONFIGURED;
  const current = EFFECTIVE_STORAGE_MODE;
  const userRequested = REQUESTED_STORAGE_MODE;

  const handleSwitch = (target: StorageMode) => {
    if (busy || target === userRequested) return;
    if (target === "firestore" && !firestoreAvailable) {
      alert(
        "Firestore nie jest skonfigurowany — brakuje zmiennych VITE_FIREBASE_* w pliku .env."
      );
      return;
    }
    setBusy(true);
    setStorageOverride(target);
    // Przeładowanie jest najprostszym sposobem, żeby wszystkie singletony
    // (store, backend, api) zostały utworzone od zera na nowym backendzie.
    window.location.reload();
  };

  const btnClass = (active: boolean, disabled: boolean) => {
    if (active) {
      return isDark
        ? "bg-indigo-500/20 border-indigo-500/40 text-indigo-200"
        : "bg-indigo-100 border-indigo-300 text-indigo-700";
    }
    if (disabled) {
      return isDark
        ? "bg-white/5 border-white/10 text-slate-600 cursor-not-allowed opacity-50"
        : "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-60";
    }
    return isDark
      ? "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
      : "bg-black/5 border-black/10 text-slate-500 hover:bg-black/10";
  };

  const degraded = userRequested === "firestore" && current === "local";

  return (
    <div
      className={`flex items-center gap-1 p-1 rounded-xl border ${
        isDark ? "bg-white/5 border-white/10" : "bg-black/5 border-black/10"
      }`}
      title={
        degraded
          ? "Wybrano Firestore, ale brak konfiguracji Firebase — używany jest localStorage"
          : `Aktualny magazyn: ${current === "firestore" ? "Firestore (baza)" : "localStorage"}`
      }
    >
      <span
        className={`text-[10px] uppercase tracking-widest font-semibold px-2 ${
          isDark ? "text-slate-500" : "text-slate-400"
        }`}
      >
        Dane
      </span>
      <button
        onClick={() => handleSwitch("local")}
        disabled={busy}
        className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors ${btnClass(
          userRequested === "local",
          false
        )}`}
      >
        💾 Local
      </button>
      <button
        onClick={() => handleSwitch("firestore")}
        disabled={busy || !firestoreAvailable}
        className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors ${btnClass(
          userRequested === "firestore" && firestoreAvailable,
          !firestoreAvailable
        )}`}
      >
        🔥 Firestore
      </button>
    </div>
  );
}
