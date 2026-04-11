import { Notification } from "../models/Notification";
import { useTheme } from "../ThemeContext";

interface NotificationDialogProps {
  notification: Notification;
  onClose: () => void;
  onViewDetail: (id: string) => void;
}

const PRIO_STYLES = {
  low: { label: "Niski", color: "text-slate-400", border: "border-slate-400" },
  medium: { label: "Średni", color: "text-amber-400", border: "border-amber-400" },
  high: { label: "Wysoki", color: "text-red-400", border: "border-red-400" },
};

export default function NotificationDialog({ notification, onClose, onViewDetail }: NotificationDialogProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const prio = PRIO_STYLES[notification.prority];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`max-w-md w-full rounded-2xl p-8 border animate-fade-slide-up ${
          isDark ? "bg-slate-800 border-white/10" : "bg-white border-slate-200"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">🔔</span>
          <span className={`text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${prio.color} ${prio.border}`}>
            {prio.label}
          </span>
        </div>

        <h3 className={`text-xl font-bold mb-2 ${isDark ? "text-slate-100" : "text-slate-900"}`}>
          {notification.title}
        </h3>

        <p className={`text-sm leading-relaxed mb-6 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
          {notification.message}
        </p>

        <div className="flex justify-end gap-2.5">
          <button
            className={`px-5 py-2.5 rounded-xl text-sm border transition-colors ${
              isDark
                ? "border-white/10 text-slate-400 hover:bg-white/5"
                : "border-slate-200 text-slate-500 hover:bg-slate-50"
            }`}
            onClick={onClose}
          >
            Zamknij
          </button>
          <button
            className="btn-primary"
            onClick={() => onViewDetail(notification.id)}
          >
            Zobacz szczegóły
          </button>
        </div>
      </div>
    </div>
  );
}
