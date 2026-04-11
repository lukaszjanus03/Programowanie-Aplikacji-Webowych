import { Notification } from "../models/Notification";
import { notificationApi } from "../api/notificationApi";
import { useTheme } from "../ThemeContext";

interface NotificationListProps {
  notifications: Notification[];
  onBack: () => void;
  onSelect: (id: string) => void;
  onRefresh: () => void;
  userId: string;
}

const PRIO_STYLES = {
  low: { label: "Niski", color: "text-slate-400", border: "border-slate-400", bg: "bg-slate-400/10" },
  medium: { label: "Średni", color: "text-amber-400", border: "border-amber-400", bg: "bg-amber-400/10" },
  high: { label: "Wysoki", color: "text-red-400", border: "border-red-400", bg: "bg-red-400/10" },
};

export default function NotificationList({ notifications, onBack, onSelect, onRefresh, userId }: NotificationListProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const handleMarkAllRead = () => {
    notificationApi.markAllAsRead(userId);
    onRefresh();
  };

  const handleMarkRead = (id: string) => {
    notificationApi.markAsRead(id);
    onRefresh();
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div className="flex items-center gap-3 flex-wrap">
          <button
            className={`px-4 py-2 rounded-lg text-sm border transition-colors ${
              isDark
                ? "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
                : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50 shadow-sm"
            }`}
            onClick={onBack}
          >
            ← Powrót
          </button>
          <h2 className={`text-xl font-bold tracking-tight ${isDark ? "text-slate-100" : "text-slate-900"}`}>
            Powiadomienia
          </h2>
          {unreadCount > 0 && (
            <span className="bg-red-500/15 text-red-400 px-3 py-1 rounded-md text-xs font-semibold">
              {unreadCount} nieprzeczytanych
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button className="btn-primary text-xs px-4 py-2" onClick={handleMarkAllRead}>
            ✓ Oznacz wszystkie jako przeczytane
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🔔</div>
          <p className={`text-xl font-bold mb-2 ${isDark ? "text-slate-200" : "text-slate-800"}`}>
            Brak powiadomień
          </p>
          <p className={`text-sm ${isDark ? "text-slate-500" : "text-slate-400"}`}>
            Powiadomienia pojawią się tutaj automatycznie
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {notifications.map((n) => {
            const prio = PRIO_STYLES[n.prority];
            return (
              <div
                key={n.id}
                className={`rounded-xl border p-4 transition-colors cursor-pointer ${
                  n.isRead
                    ? isDark
                      ? "bg-white/[0.02] border-white/5 hover:bg-white/5"
                      : "bg-slate-50 border-slate-100 hover:bg-slate-100"
                    : isDark
                      ? "bg-white/5 border-white/10 hover:bg-white/[0.08]"
                      : "bg-white border-slate-200 shadow-sm hover:shadow-md"
                }`}
                onClick={() => onSelect(n.id)}
              >
                <div className="flex items-center gap-2.5 mb-2">
                  {!n.isRead && (
                    <div className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 animate-pulse" />
                  )}
                  <span className={`text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${prio.color} ${prio.border}`}>
                    {prio.label}
                  </span>
                  <span className={`text-xs font-mono ml-auto ${isDark ? "text-slate-600" : "text-slate-400"}`}>
                    {new Date(n.date).toLocaleString("pl-PL")}
                  </span>
                </div>
                <h4 className={`text-sm font-bold mb-1 ${
                  n.isRead
                    ? isDark ? "text-slate-400" : "text-slate-500"
                    : isDark ? "text-slate-100" : "text-slate-900"
                }`}>
                  {n.title}
                </h4>
                <p className={`text-xs leading-relaxed ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                  {n.message}
                </p>
                {!n.isRead && (
                  <button
                    className={`mt-2 px-3 py-1 rounded text-xs border transition-colors ${
                      isDark
                        ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-300 hover:bg-indigo-500/20"
                        : "bg-indigo-50 border-indigo-200 text-indigo-600 hover:bg-indigo-100"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkRead(n.id);
                    }}
                  >
                    ✓ Oznacz jako przeczytane
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
