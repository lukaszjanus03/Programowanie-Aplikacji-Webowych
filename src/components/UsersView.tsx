import { useCallback, useEffect, useState } from "react";
import { User, UserRole } from "../models/User";
import { userManager } from "../api/userManager";
import { useTheme } from "../ThemeContext";
import { useAuth } from "../auth/AuthContext";

interface UsersViewProps {
  onBack: () => void;
}

const ROLE_OPTIONS: UserRole[] = ["guest", "developer", "devops", "admin"];

const ROLE_MAP: Record<UserRole, { label: string; color: string; bg: string }> = {
  admin:     { label: "Admin",     color: "text-purple-500", bg: "bg-purple-500/10" },
  devops:    { label: "DevOps",    color: "text-amber-500",  bg: "bg-amber-500/10"  },
  developer: { label: "Developer", color: "text-blue-500",   bg: "bg-blue-500/10"   },
  guest:     { label: "Gość",      color: "text-slate-500",  bg: "bg-slate-500/10"  },
};

export default function UsersView({ onBack }: UsersViewProps) {
  const { theme } = useTheme();
  const { currentUser, refreshCurrentUser } = useAuth();
  const isDark = theme === "dark";

  const [users, setUsers] = useState<User[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  const reload = useCallback(() => {
    setUsers(userManager.getAll());
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2400);
    return () => clearTimeout(t);
  }, [toast]);

  const handleRoleChange = (user: User, role: UserRole) => {
    if (user.role === role) return;
    userManager.updateRole(user.id, role);
    setToast(`Rola użytkownika „${user.firstName} ${user.lastName}" zmieniona na ${ROLE_MAP[role].label} ✓`);
    reload();
    if (currentUser && user.id === currentUser.id) refreshCurrentUser();
  };

  const handleToggleBlock = (user: User) => {
    if (currentUser && user.id === currentUser.id) {
      setToast("Nie możesz zablokować samego siebie.");
      return;
    }
    userManager.setBlocked(user.id, !user.isBlocked);
    setToast(user.isBlocked ? "Użytkownik odblokowany ✓" : "Użytkownik zablokowany ✓");
    reload();
  };

  const sorted = [...users].sort((a, b) => {
    // Admins first, then the rest alphabetically.
    if (a.role === "admin" && b.role !== "admin") return -1;
    if (b.role === "admin" && a.role !== "admin") return 1;
    return `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`);
  });

  return (
    <div>
      {toast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-white px-6 py-2.5 rounded-xl font-semibold text-sm shadow-xl shadow-emerald-500/30 animate-toast-in">
          {toast}
        </div>
      )}

      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <button
            onClick={onBack}
            className={`text-xs uppercase tracking-widest font-semibold mb-2 transition-colors ${
              isDark ? "text-slate-500 hover:text-slate-300" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            ← Wróć
          </button>
          <h2 className={`text-2xl font-bold tracking-tight ${isDark ? "text-slate-100" : "text-slate-900"}`}>
            Użytkownicy
          </h2>
          <p className={`text-sm mt-1 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
            Zarządzaj rolami i dostępem użytkowników
          </p>
        </div>
        <div
          className={`rounded-2xl px-5 py-3 border flex flex-col gap-0.5 min-w-[120px] ${
            isDark ? "bg-white/5 border-white/10" : "bg-white border-slate-200 shadow-sm"
          }`}
        >
          <span className="text-2xl font-bold font-mono bg-gradient-to-br from-indigo-400 to-purple-500 bg-clip-text text-transparent">
            {users.length}
          </span>
          <span className={`text-xs uppercase tracking-widest font-semibold ${isDark ? "text-slate-500" : "text-slate-400"}`}>
            Łącznie
          </span>
        </div>
      </div>

      {users.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">👥</div>
          <p className={`text-xl font-bold mb-2 ${isDark ? "text-slate-200" : "text-slate-800"}`}>
            Brak użytkowników
          </p>
          <p className={`text-sm ${isDark ? "text-slate-500" : "text-slate-400"}`}>
            Użytkownicy pojawią się tu po pierwszym zalogowaniu.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((u) => {
            const isSelf = currentUser?.id === u.id;
            const roleInfo = ROLE_MAP[u.role];
            return (
              <div
                key={u.id}
                className={`rounded-2xl p-5 border flex items-center gap-4 flex-wrap transition-colors ${
                  u.isBlocked
                    ? isDark
                      ? "bg-red-500/5 border-red-500/20"
                      : "bg-red-50 border-red-200"
                    : isDark
                      ? "bg-white/5 border-white/10"
                      : "bg-white border-slate-200 shadow-sm"
                }`}
              >
                {/* Avatar */}
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-red-500 flex items-center justify-center text-sm font-bold text-white shrink-0">
                  {u.picture ? (
                    <img src={u.picture} alt="" className="w-full h-full rounded-xl object-cover" />
                  ) : (
                    <>
                      {(u.firstName[0] ?? "?").toUpperCase()}
                      {(u.lastName[0] ?? "").toUpperCase()}
                    </>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-[200px]">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-sm font-semibold ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                      {u.firstName} {u.lastName}
                    </span>
                    {isSelf && (
                      <span
                        className={`text-[10px] uppercase tracking-widest px-1.5 py-0.5 rounded font-bold ${
                          isDark ? "bg-indigo-500/20 text-indigo-300" : "bg-indigo-100 text-indigo-600"
                        }`}
                      >
                        Ty
                      </span>
                    )}
                    {u.isBlocked && (
                      <span
                        className={`text-[10px] uppercase tracking-widest px-1.5 py-0.5 rounded font-bold ${
                          isDark ? "bg-red-500/20 text-red-300" : "bg-red-100 text-red-600"
                        }`}
                      >
                        Zablokowany
                      </span>
                    )}
                  </div>
                  <div className={`text-xs font-mono mt-0.5 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                    {u.email}
                  </div>
                </div>

                {/* Current role badge */}
                <div className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-widest ${roleInfo.bg} ${roleInfo.color}`}>
                  {roleInfo.label}
                </div>

                {/* Role select */}
                <div className="flex items-center gap-2">
                  <label className={`text-[10px] uppercase tracking-widest font-semibold ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                    Rola
                  </label>
                  <select
                    value={u.role}
                    onChange={(e) => handleRoleChange(u, e.target.value as UserRole)}
                    className={`text-xs rounded-lg px-3 py-1.5 border outline-none ${
                      isDark
                        ? "bg-white/5 border-white/10 text-slate-200 focus:border-indigo-500/50"
                        : "bg-white border-slate-200 text-slate-900 focus:border-indigo-500"
                    }`}
                  >
                    {ROLE_OPTIONS.map((r) => (
                      <option key={r} value={r}>
                        {ROLE_MAP[r].label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Block toggle */}
                <button
                  onClick={() => handleToggleBlock(u)}
                  disabled={isSelf}
                  title={isSelf ? "Nie możesz zablokować samego siebie" : undefined}
                  className={`px-3.5 py-1.5 rounded-lg text-xs border transition-colors ${
                    isSelf
                      ? isDark
                        ? "bg-white/5 border-white/10 text-slate-600 cursor-not-allowed opacity-50"
                        : "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-60"
                      : u.isBlocked
                        ? isDark
                          ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-300 hover:bg-emerald-500/20"
                          : "bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100"
                        : isDark
                          ? "bg-red-500/10 border-red-500/20 text-red-300 hover:bg-red-500/15"
                          : "bg-red-50 border-red-200 text-red-500 hover:bg-red-100"
                  }`}
                >
                  {u.isBlocked ? "✓ Odblokuj" : "🚫 Zablokuj"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
