import { useTheme } from "../ThemeContext";
import { useAuth } from "../auth/AuthContext";

export default function PendingApprovalView() {
  const { theme } = useTheme();
  const { currentUser, logout } = useAuth();
  const isDark = theme === "dark";

  return (
    <div
      className={`min-h-screen font-sans flex items-center justify-center px-6 py-12 transition-colors duration-300 ${
        isDark
          ? "bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 text-slate-200"
          : "bg-gradient-to-br from-slate-100 via-indigo-50 to-slate-100 text-slate-900"
      }`}
    >
      <div
        className={`w-full max-w-lg rounded-3xl border p-10 text-center ${
          isDark
            ? "bg-white/5 border-white/10 backdrop-blur-xl"
            : "bg-white border-slate-200 shadow-xl"
        }`}
      >
        <div className="text-6xl mb-4">⏳</div>
        <h1
          className={`text-2xl font-bold mb-3 tracking-tight ${
            isDark ? "text-slate-100" : "text-slate-900"
          }`}
        >
          Oczekiwanie na zatwierdzenie konta
        </h1>
        <p className={`text-sm mb-6 leading-relaxed ${isDark ? "text-slate-400" : "text-slate-500"}`}>
          Dziękujemy za zalogowanie się, <b>{currentUser?.firstName}</b>! Twoje konto zostało
          utworzone i czeka na zatwierdzenie przez administratora. Gdy administrator przypisze Ci
          odpowiednią rolę, uzyskasz dostęp do aplikacji.
        </p>

        <div
          className={`rounded-xl px-4 py-3 text-xs mb-6 border text-left ${
            isDark
              ? "bg-white/5 border-white/10 text-slate-400"
              : "bg-slate-50 border-slate-200 text-slate-500"
          }`}
        >
          <div className="flex justify-between mb-1">
            <span className="uppercase tracking-widest font-semibold">E-mail</span>
            <span className="font-mono">{currentUser?.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="uppercase tracking-widest font-semibold">Rola</span>
            <span className="font-bold text-amber-500 uppercase tracking-widest">
              {currentUser?.role}
            </span>
          </div>
        </div>

        <button
          onClick={logout}
          className={`w-full px-4 py-2.5 rounded-xl text-sm border transition-colors ${
            isDark
              ? "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
              : "bg-black/5 border-black/10 text-slate-600 hover:bg-black/10"
          }`}
        >
          Wyloguj się
        </button>
      </div>
    </div>
  );
}
