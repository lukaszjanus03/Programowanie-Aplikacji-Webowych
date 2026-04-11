import { useTheme } from "../ThemeContext";

interface DeleteConfirmProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteConfirm({ onConfirm, onCancel }: DeleteConfirmProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div
        className={`max-w-md w-full rounded-2xl p-8 border animate-fade-slide-up ${isDark ? "bg-slate-800 border-white/10" : "bg-white border-slate-200"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-red-500 mb-3">Potwierdź usunięcie</h2>
        <p className={`mb-6 text-sm leading-relaxed ${isDark ? "text-slate-400" : "text-slate-500"}`}>
          Czy na pewno chcesz usunąć ten element? Tej operacji nie można cofnąć.
        </p>
        <div className="flex justify-end gap-2.5">
          <button
            className={`px-5 py-2.5 rounded-xl text-sm border transition-colors ${isDark ? "border-white/10 text-slate-400 hover:bg-white/5" : "border-slate-200 text-slate-500 hover:bg-slate-50"}`}
            onClick={onCancel}
          >
            Anuluj
          </button>
          <button
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-br from-red-500 to-red-600 shadow-lg shadow-red-500/30 hover:opacity-90 transition-opacity"
            onClick={onConfirm}
          >
            Tak, usuń
          </button>
        </div>
      </div>
    </div>
  );
}
