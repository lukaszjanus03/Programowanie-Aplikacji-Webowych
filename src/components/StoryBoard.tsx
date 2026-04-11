import { useState, useEffect, useCallback } from "react";
import { Story, StoryStatus, Priority } from "../models/Story";
import { storyApi } from "../api/storyApi";
import { userManager } from "../api/userManager";
import { useTheme } from "../ThemeContext";
import StoryForm from "./StoryForm";
import DeleteConfirm from "./DeleteConfirm";
import KanbanBoard from "./KanbanBoard";

interface StoryBoardProps {
  projectId: string;
  projectName: string;
  onBack: () => void;
}

const STATUS_CONFIG: Record<StoryStatus, { label: string; color: string; border: string }> = {
  todo:  { label: "📋 To Do",       color: "text-amber-400",  border: "border-amber-400" },
  doing: { label: "🔧 In Progress", color: "text-blue-400",   border: "border-blue-400"  },
  done:  { label: "✅ Done",        color: "text-emerald-400", border: "border-emerald-400" },
};

const PRIORITY_LABELS: Record<Priority, { label: string; color: string; border: string }> = {
  low:    { label: "Niski",  color: "text-slate-400",  border: "border-slate-400" },
  medium: { label: "Średni", color: "text-amber-400",  border: "border-amber-400" },
  high:   { label: "Wysoki", color: "text-red-400",    border: "border-red-400"   },
};

export default function StoryBoard({ projectId, projectName, onBack }: StoryBoardProps) {
  const [stories, setStories] = useState<Story[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<StoryStatus | "all">("all");
  const [toast, setToast] = useState<string | null>(null);
  const [kanbanStoryId, setKanbanStoryId] = useState<string | null>(null);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const reload = useCallback(() => { setStories(storyApi.getByProject(projectId)); }, [projectId]);
  useEffect(() => { reload(); }, [reload]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2400);
    return () => clearTimeout(t);
  }, [toast]);

  const openCreate = () => { setEditingStory(null); setFormOpen(true); };
  const openEdit = (s: Story) => { setEditingStory(s); setFormOpen(true); };
  const closeForm = () => { setFormOpen(false); setEditingStory(null); };

  const handleSubmit = (data: { name: string; description: string; priority: Priority; status: StoryStatus }) => {
    const user = userManager.getLoggedUser();
    if (editingStory) {
      storyApi.update(editingStory.id, data);
      setToast("Historyjka zaktualizowana ✓");
    } else {
      storyApi.create({ ...data, projectId, ownerId: user.id });
      setToast("Historyjka utworzona ✓");
    }
    reload();
    closeForm();
  };

  const handleDelete = () => {
    if (deleteId) { storyApi.delete(deleteId); reload(); setDeleteId(null); setToast("Historyjka usunięta"); }
  };

  const filtered = filterStatus === "all" ? stories : stories.filter((s) => s.status === filterStatus);
  const grouped: Record<StoryStatus, Story[]> = { todo: [], doing: [], done: [] };
  filtered.forEach((s) => grouped[s.status].push(s));

  if (kanbanStoryId) {
    return <KanbanBoard storyId={kanbanStoryId} onBack={() => { setKanbanStoryId(null); reload(); }} />;
  }

  const cardBase = isDark
    ? "bg-white/5 border-white/10 hover:bg-white/[0.08]"
    : "bg-white border-slate-200 shadow-sm hover:shadow-md";

  const columnBase = isDark
    ? "bg-white/[0.02] border-white/[0.06]"
    : "bg-slate-50 border-slate-200";

  return (
    <div>
      {toast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-white px-6 py-2.5 rounded-xl font-semibold text-sm shadow-xl shadow-emerald-500/30 animate-toast-in">
          {toast}
        </div>
      )}

      {/* Top bar */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div className="flex items-center gap-3 flex-wrap">
          <button
            className={`px-4 py-2 rounded-lg text-sm border transition-colors ${isDark ? "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10" : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50 shadow-sm"}`}
            onClick={onBack}
          >
            ← Projekty
          </button>
          <h2 className={`text-xl font-bold tracking-tight ${isDark ? "text-slate-100" : "text-slate-900"}`}>{projectName}</h2>
          <span className="bg-indigo-500/15 text-indigo-400 px-3 py-1 rounded-md text-xs font-semibold">
            {stories.length} historyjek
          </span>
        </div>
        <button className="btn-primary" onClick={openCreate}>
          <span className="text-lg leading-none">+</span> Nowa historyjka
        </button>
      </div>

      {/* Filter row */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {(["all", "todo", "doing", "done"] as const).map((val) => (
          <button
            key={val}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm border transition-colors ${
              filterStatus === val
                ? isDark
                  ? "bg-indigo-500/15 border-indigo-500/30 text-indigo-300"
                  : "bg-indigo-50 border-indigo-200 text-indigo-600"
                : isDark
                  ? "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
                  : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50 shadow-sm"
            }`}
            onClick={() => setFilterStatus(val)}
          >
            {val === "all" ? "Wszystkie" : STATUS_CONFIG[val].label}
            <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${isDark ? "bg-white/10" : "bg-black/[0.08]"}`}>
              {val === "all" ? stories.length : stories.filter((s) => s.status === val).length}
            </span>
          </button>
        ))}
      </div>

      {filterStatus === "all" ? (
        <div className="grid grid-cols-3 gap-4">
          {(["todo", "doing", "done"] as const).map((status) => (
            <div key={status} className={`rounded-2xl border p-4 min-h-48 ${columnBase}`}>
              <div className={`flex items-center justify-between pb-3 mb-3 border-b-2 text-sm font-bold ${STATUS_CONFIG[status].color} ${STATUS_CONFIG[status].border}`}>
                <span>{STATUS_CONFIG[status].label}</span>
                <span className={`text-xs px-2 py-0.5 rounded font-bold ${isDark ? "bg-white/10 text-slate-300" : "bg-black/[0.08] text-slate-600"}`}>
                  {grouped[status].length}
                </span>
              </div>
              {grouped[status].length === 0 ? (
                <p className={`text-xs text-center py-5 ${isDark ? "text-slate-600" : "text-slate-400"}`}>Brak historyjek</p>
              ) : (
                grouped[status].map((s) => (
                  <StoryCard key={s.id} story={s} onEdit={openEdit} onDelete={setDeleteId} onKanban={setKanbanStoryId} isDark={isDark} cardBase={cardBase} />
                ))
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.length === 0 ? (
            <p className={`text-sm text-center py-10 ${isDark ? "text-slate-600" : "text-slate-400"}`}>Brak historyjek w tej kategorii</p>
          ) : (
            filtered.map((s) => (
              <StoryCard key={s.id} story={s} onEdit={openEdit} onDelete={setDeleteId} onKanban={setKanbanStoryId} isDark={isDark} cardBase={cardBase} />
            ))
          )}
        </div>
      )}

      {formOpen && <StoryForm story={editingStory} onSubmit={handleSubmit} onCancel={closeForm} />}
      {deleteId && <DeleteConfirm onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />}
    </div>
  );
}

function StoryCard({ story, onEdit, onDelete, onKanban, isDark, cardBase }: {
  story: Story;
  onEdit: (s: Story) => void;
  onDelete: (id: string) => void;
  onKanban: (id: string) => void;
  isDark: boolean;
  cardBase: string;
}) {
  const prio = PRIORITY_LABELS[story.priority];
  return (
    <div className={`rounded-xl border p-4 mb-2.5 animate-fade-slide-up transition-colors ${cardBase}`}>
      <div className="flex items-center justify-between mb-2">
        <span className={`text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${prio.color} ${prio.border}`}>
          {prio.label}
        </span>
        <span className={`text-xs font-mono ${isDark ? "text-slate-600" : "text-slate-400"}`}>
          {new Date(story.createdAt).toLocaleDateString("pl-PL")}
        </span>
      </div>
      <h4 className={`text-sm font-bold mb-1.5 ${isDark ? "text-slate-100" : "text-slate-900"}`}>{story.name}</h4>
      {story.description && (
        <p className={`text-xs leading-relaxed mb-3 ${isDark ? "text-slate-400" : "text-slate-500"}`}>{story.description}</p>
      )}
      <div className="flex gap-1.5">
        <button
          className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition-colors ${isDark ? "bg-blue-500/10 border-blue-500/25 text-blue-300 hover:bg-blue-500/20" : "bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100"}`}
          onClick={() => onKanban(story.id)}
        >
          📌 Kanban
        </button>
        <button
          className={`px-3 py-1.5 rounded-md text-xs border transition-colors ${isDark ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-300 hover:bg-indigo-500/20" : "bg-indigo-50 border-indigo-200 text-indigo-600 hover:bg-indigo-100"}`}
          onClick={() => onEdit(story)}
        >
          ✏️
        </button>
        <button
          className={`px-3 py-1.5 rounded-md text-xs border transition-colors ${isDark ? "bg-red-500/10 border-red-500/15 text-red-300 hover:bg-red-500/15" : "bg-red-50 border-red-200 text-red-500 hover:bg-red-100"}`}
          onClick={() => onDelete(story.id)}
        >
          🗑
        </button>
      </div>
    </div>
  );
}
