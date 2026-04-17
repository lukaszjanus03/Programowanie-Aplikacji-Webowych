import { useEffect, useRef, useState } from "react";
import { useTheme } from "../ThemeContext";
import { useAuth } from "../auth/AuthContext";
import { renderGoogleButton, devLogin, IS_DEV_AUTH_MODE } from "../auth/googleAuth";

export default function LoginView() {
  const { theme } = useTheme();
  const { loginWithProfile } = useAuth();
  const isDark = theme === "dark";

  const googleBtnRef = useRef<HTMLDivElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Dev mode fields
  const [devEmail, setDevEmail] = useState("");
  const [devName, setDevName] = useState("");

  useEffect(() => {
    if (IS_DEV_AUTH_MODE) return;
    if (!googleBtnRef.current) return;

    let cancelled = false;

    renderGoogleButton(googleBtnRef.current, (profile) => {
      if (cancelled) return;
      loginWithProfile(profile).catch((e: unknown) => {
        setError(e instanceof Error ? e.message : "Nie udało się zalogować.");
      });
    }).catch((e: unknown) => {
      if (!cancelled) {
        setError(
          e instanceof Error
            ? `Nie udało się załadować Google Sign-In: ${e.message}`
            : "Nie udało się załadować Google Sign-In."
        );
      }
    });

    return () => {
      cancelled = true;
    };
  }, [loginWithProfile]);

  const handleDevLogin = async () => {
    setError(null);
    const email = devEmail.trim();
    if (!email) {
      setError("Podaj adres e-mail.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Podaj poprawny adres e-mail.");
      return;
    }
    try {
      await loginWithProfile(devLogin(email, devName));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Nie udało się zalogować.");
    }
  };

  return (
    <div
      className={`min-h-screen font-sans flex items-center justify-center px-6 py-12 transition-colors duration-300 ${
        isDark
          ? "bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 text-slate-200"
          : "bg-gradient-to-br from-slate-100 via-indigo-50 to-slate-100 text-slate-900"
      }`}
    >
      <div
        className={`w-full max-w-md rounded-3xl border p-8 ${
          isDark
            ? "bg-white/5 border-white/10 backdrop-blur-xl"
            : "bg-white border-slate-200 shadow-xl"
        }`}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-mono font-bold text-2xl text-white shadow-lg shadow-indigo-500/30">
            M
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight leading-none">ManageMe</h1>
            <p
              className={`text-xs uppercase tracking-widest mt-1 ${
                isDark ? "text-slate-500" : "text-slate-400"
              }`}
            >
              Zarządzanie projektami
            </p>
          </div>
        </div>

        <h2 className={`text-lg font-semibold mb-2 ${isDark ? "text-slate-100" : "text-slate-900"}`}>
          Zaloguj się, aby kontynuować
        </h2>
        <p className={`text-sm mb-6 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
          Użyj konta Google, aby rozpocząć pracę. Nowe konta otrzymują rolę <b>gość</b> i oczekują
          na zatwierdzenie przez administratora.
        </p>

        {error && (
          <div
            className={`mb-4 rounded-xl px-4 py-3 text-sm border ${
              isDark
                ? "bg-red-500/10 border-red-500/25 text-red-300"
                : "bg-red-50 border-red-200 text-red-600"
            }`}
          >
            {error}
          </div>
        )}

        {!IS_DEV_AUTH_MODE ? (
          <div className="flex flex-col items-center gap-3">
            <div ref={googleBtnRef} />
            <p className={`text-xs text-center ${isDark ? "text-slate-500" : "text-slate-400"}`}>
              Po zalogowaniu aplikacja używa Twojego adresu e-mail do identyfikacji konta.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div
              className={`rounded-xl px-4 py-3 text-xs border ${
                isDark
                  ? "bg-amber-500/10 border-amber-500/25 text-amber-300"
                  : "bg-amber-50 border-amber-200 text-amber-700"
              }`}
            >
              <b>Tryb deweloperski</b>: nie ustawiono <code>VITE_GOOGLE_CLIENT_ID</code>. Zaloguj się
              podając adres e-mail (imitacja OAuth do testów lokalnych).
            </div>

            <div>
              <label className={`form-label ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                E-mail
              </label>
              <input
                type="email"
                value={devEmail}
                onChange={(e) => setDevEmail(e.target.value)}
                placeholder="jan.kowalski@example.com"
                className={`form-input border ${
                  isDark
                    ? "bg-white/5 border-white/10 text-slate-200 placeholder-slate-600 focus:border-indigo-500/50"
                    : "bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-indigo-500"
                }`}
              />
            </div>

            <div>
              <label className={`form-label ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                Imię i nazwisko (opcjonalnie)
              </label>
              <input
                type="text"
                value={devName}
                onChange={(e) => setDevName(e.target.value)}
                placeholder="Jan Kowalski"
                className={`form-input border ${
                  isDark
                    ? "bg-white/5 border-white/10 text-slate-200 placeholder-slate-600 focus:border-indigo-500/50"
                    : "bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-indigo-500"
                }`}
              />
            </div>

            <button className="btn-primary w-full justify-center" onClick={handleDevLogin}>
              🔐 Zaloguj się (dev mode)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
