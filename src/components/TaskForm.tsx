import { useState, useEffect } from "react";
import { Task, TaskStatus } from "../models/Task";
import { Priority } from "../models/Story";
import { useTheme } from "../ThemeContext";

interface TaskFormProps {
  task: Task | null;
  storyId: string;
  onSubmit: (data: { name: string; description: string; priority: Priority; estimatedHours: number; storyId: string; status: TaskStatus }) => void;
  onCancel: () => void;
}

export default function TaskForm({ task, storyId, onSubmit, onCancel }: TaskFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [estimatedHours, setEstimatedHours] = useState(1);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    if (task) { setName(task.name); setDescription(task.description); setPriority(task.priority); setEstimatedHours(task.estimatedHours); }
    else { setName(""); setDescription(""); setPriority("medium"); setEstimatedHours(1); }
  }, [task]);

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSubmit({ name: name.trim(), description: description.trim(), priority, estimatedHours, storyId, status: task?.status ?? "todo" });
  };

  const inputCls = `form-input ${isDark ? "bg-white/5 border border-white/10 text-slate-100 focus:border-indigo-500/60" : "bg-slate-50 border border-slate-200 text-slate-900 focus:border-indigo-500"}`;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div
        className={`max-w-xl w-full rounded-2xl p-8 border animate-fade-slide-up ${isDark ? "bg-slate-800 border-white/10" : "bg-white border-slate-200"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className={`text-2xl font-bold mb-5 ${isDark ? "text-slate-100" : "text-slate-900"}`}>
          {task ? "Edytuj zadanie" : "Nowe zadanie"}
        </h2>

        <div className="mb-4">
          <label className={`form-label ${isDark ? "text-slate-400" : "text-slate-500"}`}>Nazwa *</label>
          <input className={inputCls} placeholder="np. Implementacja logowania" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
        </div>

        <div className="mb-4">
          <label className={`form-label ${isDark ? "text-slate-400" : "text-slate-500"}`}>Opis</label>
          <textarea className={`${inputCls} min-h-20 resize-y`} placeholder="Opis zadania…" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>

        <div className="flex gap-3 mb-5">
          <div className="flex-1">
            <label className={`form-label ${isDark ? "text-slate-400" : "text-slate-500"}`}>Priorytet</label>
            <select className={inputCls} value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
              <option value="low">Niski</option>
              <option value="medium">Średni</option>
              <option value="high">Wysoki</option>
            </select>
          </div>
          <div className="flex-1">
            <label className={`form-label ${isDark ? "text-slate-400" : "text-slate-500"}`}>Szacowany czas (h)</label>
            <input className={inputCls} type="number" min={0.5} step={0.5} value={estimatedHours} onChange={(e) => setEstimatedHours(parseFloat(e.target.value) || 1)} />
          </div>
        </div>

        <div className="flex justify-end gap-2.5">
          <button className={`px-5 py-2.5 rounded-xl text-sm border transition-colors ${isDark ? "border-white/10 text-slate-400 hover:bg-white/5" : "border-slate-200 text-slate-500 hover:bg-slate-50"}`} onClick={onCancel}>
            Anuluj
          </button>
          <button className={`btn-primary ${!name.trim() ? "opacity-50 cursor-not-allowed" : ""}`} onClick={handleSubmit} disabled={!name.trim()}>
            {task ? "Zapisz zmiany" : "Utwórz"}
          </button>
        </div>
      </div>
    </div>
  );
}
