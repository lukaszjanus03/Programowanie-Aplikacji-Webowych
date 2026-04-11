import { useState, useEffect, useCallback } from "react";
import { Task, TaskStatus } from "../models/Task";
import { Story } from "../models/Story";
import { taskApi } from "../api/taskApi";
import { storyApi } from "../api/storyApi";
import { userManager } from "../api/userManager";
import { notificationService } from "../services/notificationService";
import { useTheme } from "../ThemeContext";
import { Priority } from "../models/Story";
import TaskForm from "./TaskForm";
import DeleteConfirm from "./DeleteConfirm";
import TaskDetail from "./TaskDetail";

interface KanbanBoardProps {
  storyId: string;
  onBack: () => void;
}

const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; textColor: string; border: string }> = {
  todo:  { label: "To Do",      color: "text-amber-400",   textColor: "#f59e0b", border: "border-amber-400"   },
  doing: { label: "W trakcie",  color: "text-blue-400",    textColor: "#3b82f6", border: "border-blue-400"    },
  done:  { label: "Gotowe",     color: "text-emerald-400", textColor: "#22c55e", border: "border-emerald-400" },
};

const PRIO_MAP = {
  low:    { label: "Niski",  color: "text-slate-400",  border: "border-slate-400" },
  medium: { label: "Średni", color: "text-amber-400",  border: "border-amber-400" },
  high:   { label: "Wysoki", color: "text-red-400",    border: "border-red-400"   },
};

export default function KanbanBoard({ storyId, onBack }: KanbanBoardProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [story, setStory] = useState<Story | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [detailTaskId, setDetailTaskId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const reload = useCallback(() => {
    setTasks(taskApi.getByStory(storyId));
    const s = storyApi.getById(storyId);
    setStory(s ?? null);
  }, [storyId]);

  useEffect(() => { reload(); }, [reload]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2400);
    return () => clearTimeout(t);
  }, [toast]);

  const openCreate = () => { setEditingTask(null); setFormOpen(true); };
  const openEdit = (task: Task) => { setEditingTask(task); setFormOpen(true); };
  const closeForm = () => { setFormOpen(false); setEditingTask(null); };

  const handleSubmit = (data: { name: string; description: string; priority: Priority; estimatedHours: number; storyId: string; status: TaskStatus }) => {
    if (editingTask) {
      taskApi.update(editingTask.id, { name: data.name, description: data.description, priority: data.priority, estimatedHours: data.estimatedHours });
      setToast("Zadanie zaktualizowane ✓");
    } else {
      taskApi.create({ name: data.name, description: data.description, priority: data.priority, estimatedHours: data.estimatedHours, storyId, status: "todo" });
      // Notification: new task in story
      if (story) {
        notificationService.notifyTaskCreated(data.name, story.name, story.ownerId);
      }
      setToast("Zadanie utworzone ✓");
    }
    reload();
    closeForm();
  };

  const handleDelete = () => {
    if (deleteId) {
      const taskToDelete = taskApi.getById(deleteId);
      taskApi.delete(deleteId);
      // Notification: task deleted from story
      if (taskToDelete && story) {
        notificationService.notifyTaskDeleted(taskToDelete.name, story.name, story.ownerId);
      }
      reload();
      setDeleteId(null);
      setToast("Zadanie usunięte");
    }
  };

  const grouped: Record<TaskStatus, Task[]> = { todo: [], doing: [], done: [] };
  tasks.forEach((t) => grouped[t.status].push(t));

  if (detailTaskId) {
    return <TaskDetail taskId={detailTaskId} onBack={() => setDetailTaskId(null)} onUpdated={reload} />;
  }

  const columnBase = isDark ? "bg-white/[0.02] border-white/[0.06]" : "bg-slate-50 border-slate-200";

  return (
    <div>
      {toast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-white px-6 py-2.5 rounded-xl font-semibold text-sm shadow-xl shadow-emerald-500/30 animate-toast-in">
          {toast}
        </div>
      )}

      {/* Top bar */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-7">
        <div className="flex items-center gap-3 flex-wrap">
          <button
            className={`px-4 py-2 rounded-lg text-sm border transition-colors ${isDark ? "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10" : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50 shadow-sm"}`}
            onClick={onBack}
          >
            ← Historyjki
          </button>
          <div>
            <h2 className={`text-xl font-bold tracking-tight leading-none ${isDark ? "text-slate-100" : "text-slate-900"}`}>
              Kanban – {story?.name ?? "…"}
            </h2>
            <p className={`text-xs mt-0.5 ${isDark ? "text-slate-500" : "text-slate-400"}`}>Zadania historyjki</p>
          </div>
          <span className="bg-indigo-500/15 text-indigo-400 px-3 py-1 rounded-md text-xs font-semibold">
            {tasks.length} zadań
          </span>
        </div>
        <button className="btn-primary" onClick={openCreate}>
          <span className="text-lg leading-none">+</span> Nowe zadanie
        </button>
      </div>

      {/* Columns */}
      <div className="grid grid-cols-3 gap-4">
        {(["todo", "doing", "done"] as TaskStatus[]).map((status) => (
          <div key={status} className={`rounded-2xl border p-3.5 min-h-[14rem] ${columnBase}`}>
            <div className={`flex items-center justify-between pb-3 mb-3 border-b-2 text-sm font-bold ${STATUS_CONFIG[status].color} ${STATUS_CONFIG[status].border}`}>
              <span>📋 {STATUS_CONFIG[status].label}</span>
              <span
                className="text-xs font-bold px-2 py-0.5 rounded"
                style={{ background: STATUS_CONFIG[status].textColor + "22", color: STATUS_CONFIG[status].textColor }}
              >
                {grouped[status].length}
              </span>
            </div>

            {grouped[status].length === 0 ? (
              <p className={`text-xs text-center py-5 ${isDark ? "text-slate-600" : "text-slate-400"}`}>Brak zadań</p>
            ) : (
              grouped[status].map((task) => (
                <TaskCard key={task.id} task={task} onEdit={openEdit} onDelete={setDeleteId} onDetail={setDetailTaskId} isDark={isDark} />
              ))
            )}
          </div>
        ))}
      </div>

      {formOpen && <TaskForm task={editingTask} storyId={storyId} onSubmit={handleSubmit} onCancel={closeForm} />}
      {deleteId && <DeleteConfirm onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />}
    </div>
  );
}

function TaskCard({ task, onEdit, onDelete, onDetail, isDark }: {
  task: Task;
  onEdit: (t: Task) => void;
  onDelete: (id: string) => void;
  onDetail: (id: string) => void;
  isDark: boolean;
}) {
  const prio = PRIO_MAP[task.priority];
  const user = task.assignedUserId ? userManager.getUserById(task.assignedUserId) : undefined;
  const fmt = (iso?: string) => iso ? new Date(iso).toLocaleDateString("pl-PL") : null;

  return (
    <div className={`rounded-xl border p-3.5 mb-2.5 animate-fade-slide-up transition-colors ${isDark ? "bg-white/5 border-white/10 hover:bg-white/[0.08]" : "bg-white border-slate-200 shadow-sm hover:shadow"}`}>
      <div className="flex items-center justify-between mb-2">
        <span className={`text-xs font-bold uppercase tracking-widest px-1.5 py-0.5 rounded border ${prio.color} ${prio.border}`}>
          {prio.label}
        </span>
        <span className={`text-xs font-mono ${isDark ? "text-slate-600" : "text-slate-400"}`}>{task.estimatedHours}h</span>
      </div>

      <h4 className={`text-sm font-bold mb-1 ${isDark ? "text-slate-100" : "text-slate-900"}`}>{task.name}</h4>
      {task.description && (
        <p className={`text-xs leading-relaxed mb-2 ${isDark ? "text-slate-400" : "text-slate-500"}`}>{task.description}</p>
      )}

      {user && (
        <div className="flex items-center gap-1.5 mb-1.5">
          <div className="w-5 h-5 rounded bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-[9px] font-bold text-white shrink-0">
            {user.firstName[0]}{user.lastName[0]}
          </div>
          <span className="text-xs text-indigo-400">{user.firstName} {user.lastName}</span>
        </div>
      )}

      {task.startedAt && <p className={`text-xs mb-0.5 ${isDark ? "text-slate-600" : "text-slate-400"}`}>🕐 Start: {fmt(task.startedAt)}</p>}
      {task.finishedAt && <p className={`text-xs mb-0.5 ${isDark ? "text-slate-600" : "text-slate-400"}`}>🏁 Koniec: {fmt(task.finishedAt)}</p>}

      <div className="flex gap-1.5 mt-2.5 flex-wrap">
        <button
          className={`px-2.5 py-1 rounded text-xs border transition-colors ${isDark ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-300 hover:bg-indigo-500/20" : "bg-indigo-50 border-indigo-200 text-indigo-600 hover:bg-indigo-100"}`}
          onClick={() => onDetail(task.id)}
        >
          👁 Szczegóły
        </button>
        {task.status === "todo" && (
          <button
            className={`px-2.5 py-1 rounded text-xs border transition-colors ${isDark ? "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10" : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"}`}
            onClick={() => onEdit(task)}
          >
            ✏️
          </button>
        )}
        <button
          className={`px-2.5 py-1 rounded text-xs border transition-colors ${isDark ? "bg-red-500/10 border-red-500/15 text-red-300 hover:bg-red-500/15" : "bg-red-50 border-red-200 text-red-500 hover:bg-red-100"}`}
          onClick={() => onDelete(task.id)}
        >
          🗑
        </button>
      </div>
    </div>
  );
}
