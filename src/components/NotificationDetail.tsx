import { useEffect } from "react";
import { Notification } from "../models/Notification";
import { notificationApi } from "../api/notificationApi";
import { useTheme } from "../ThemeContext";

interface NotificationDetailProps {
  notification: Notification;
  onBack: () => void;
  onRefresh: () => void;
}

const PRIO_STYLES = {
  low: { label: "Niski", color: "text-slate-400", border: "border-slate-400", bg: "bg-slate-400/10" },
  medium: { label: "Średni", color: "text-amber-400", border: "border-amber-400", bg: "bg-amber-400/10" },
  high: { label: "Wysoki", color: "text-red-400", border: "border-red-400", bg: "bg-red-400/10" },
};

export default function NotificationDetail({ notification, onBack, onRefresh }: NotificationDetailProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const prio = PRIO_STYLES[notification.prority];

  useEffect(() => {
    if (!notification.isRead) {
      notificationApi.markAsRead(notification.id);
      onRefresh();
    }
  }, [notification.id, notification.isRead, onRefresh]);

  const cardCls = `rounded-2xl border p-8 ${isDark ? "bg-white/5 border-white/10" : "bg-white border-slate-200 shadow-sm"}`;

  return (
    <div>
      <div className="flex items-center gap-4 mb-7">
        <button
          className={`px-4 py-2 rounded-lg text-sm border transition-colors ${
            isDark
              ? "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
              : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50 shadow-sm"
          }`}
          onClick={onBack}
        >
          ← Powiadomienia
        </button>
        <h2 className={`text-xl font-bold tracking-tight ${isDark ? "text-slate-100" : "text-slate-900"}`}>
          Szczegóły powiadomienia
        </h2>
      </div>

      <div className={cardCls}>
        <div className="flex items-center gap-3 mb-5">
          <span className={`text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-md border ${prio.color} ${prio.border}`}>
            {prio.label}
          </span>
          <span className={`text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-md ${
            notification.isRead
              ? isDark ? "bg-slate-700 text-slate-400" : "bg-slate-100 text-slate-500"
              : "bg-emerald-500/15 text-emerald-400"
          }`}>
            {notification.isRead ? "Przeczytane" : "Nieprzeczytane"}
          </span>
        </div>

        <h3 className={`text-2xl font-bold mb-3 ${isDark ? "text-slate-100" : "text-slate-900"}`}>
          {notification.title}
        </h3>

        <p className={`text-sm leading-relaxed mb-6 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
          {notification.message}
        </p>

        <div className={`border-t pt-4 ${isDark ? "border-white/5" : "border-slate-100"}`}>
          <div className="flex gap-3 py-2">
            <span className={`text-sm min-w-36 ${isDark ? "text-slate-500" : "text-slate-400"}`}>Data utworzenia</span>
            <span className={`text-sm font-medium ${isDark ? "text-slate-200" : "text-slate-800"}`}>
              {new Date(notification.date).toLocaleString("pl-PL")}
            </span>
          </div>
          <div className="flex gap-3 py-2">
            <span className={`text-sm min-w-36 ${isDark ? "text-slate-500" : "text-slate-400"}`}>Priorytet</span>
            <span className={`text-sm font-medium ${prio.color}`}>{prio.label}</span>
          </div>
          <div className="flex gap-3 py-2">
            <span className={`text-sm min-w-36 ${isDark ? "text-slate-500" : "text-slate-400"}`}>ID</span>
            <span className={`text-sm font-mono ${isDark ? "text-slate-500" : "text-slate-400"}`}>
              {notification.id.slice(0, 12)}…
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
