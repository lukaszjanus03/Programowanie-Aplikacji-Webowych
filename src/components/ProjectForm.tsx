import { useState, useEffect } from "react";
import { Project } from "../models/Project";
import { useTheme } from "../ThemeContext";

interface ProjectFormProps {
  project: Project | null;
  onSubmit: (name: string, description: string) => void;
  onCancel: () => void;
}

export default function ProjectForm({ project, onSubmit, onCancel }: ProjectFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const { theme } = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    if (project) { setName(project.name); setDescription(project.description); }
    else { setName(""); setDescription(""); }
  }, [project]);

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSubmit(name.trim(), description.trim());
  };

  const inputCls = `form-input ${isDark ? "bg-white/5 border border-white/10 text-slate-100 focus:border-indigo-500/60" : "bg-slate-50 border border-slate-200 text-slate-900 focus:border-indigo-500"}`;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div
        className={`max-w-lg w-full rounded-2xl p-8 border animate-fade-slide-up ${isDark ? "bg-slate-800 border-white/10" : "bg-white border-slate-200"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className={`text-2xl font-bold mb-5 ${isDark ? "text-slate-100" : "text-slate-900"}`}>
          {project ? "Edytuj projekt" : "Nowy projekt"}
        </h2>

        <div className="mb-4">
          <label className={`form-label ${isDark ? "text-slate-400" : "text-slate-500"}`}>Nazwa projektu *</label>
          <input
            className={inputCls}
            placeholder="np. Aplikacja e-commerce"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
        </div>

        <div className="mb-5">
          <label className={`form-label ${isDark ? "text-slate-400" : "text-slate-500"}`}>Opis</label>
          <textarea
            className={`${inputCls} min-h-24 resize-y`}
            placeholder="Krótki opis projektu…"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-2.5">
          <button
            className={`px-5 py-2.5 rounded-xl text-sm border transition-colors ${isDark ? "border-white/10 text-slate-400 hover:bg-white/5" : "border-slate-200 text-slate-500 hover:bg-slate-50"}`}
            onClick={onCancel}
          >
            Anuluj
          </button>
          <button
            className={`btn-primary ${!name.trim() ? "opacity-50 cursor-not-allowed" : ""}`}
            onClick={handleSubmit}
            disabled={!name.trim()}
          >
            {project ? "Zapisz zmiany" : "Utwórz projekt"}
          </button>
        </div>
      </div>
    </div>
  );
}
