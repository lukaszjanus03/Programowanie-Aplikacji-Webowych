import { useTheme } from "../ThemeContext";

interface NotificationBadgeProps {
  count: number;
  onClick: () => void;
}

export default function NotificationBadge({ count, onClick }: NotificationBadgeProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={onClick}
      className={`relative w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-colors ${
        isDark
          ? "bg-white/5 border border-white/10 hover:bg-white/10"
          : "bg-black/5 border border-black/10 hover:bg-black/10"
      }`}
      title="Powiadomienia"
    >
      🔔
      {count > 0 && (
        <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1 shadow-lg shadow-red-500/40 animate-pulse">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
}
