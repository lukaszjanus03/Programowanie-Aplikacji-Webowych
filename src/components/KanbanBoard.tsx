import { useState, useEffect, useCallback } from "react";
import { Task, TaskStatus } from "../models/Task";
import { Story } from "../models/Story";
import { taskApi } from "../api/taskApi";
import { storyApi } from "../api/storyApi";
import { userManager } from "../api/userManager";
import TaskForm from "./TaskForm";
import DeleteConfirm from "./DeleteConfirm";
import TaskDetail from "./TaskDetail";
import { Priority } from "../models/Story";

interface KanbanBoardProps {
  storyId: string;
  onBack: () => void;
}

const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; icon: string }> = {
  todo: { label: "To Do", color: "#f59e0b", icon: "📋" },
  doing: { label: "W trakcie", color: "#3b82f6", icon: "🔧" },
  done: { label: "Gotowe", color: "#22c55e", icon: "✅" },
};

const PRIO_MAP = {
  low: { label: "Niski", color: "#94a3b8" },
  medium: { label: "Średni", color: "#f59e0b" },
  high: { label: "Wysoki", color: "#ef4444" },
};

export default function KanbanBoard({ storyId, onBack }: KanbanBoardProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [story, setStory] = useState<Story | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [detailTaskId, setDetailTaskId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

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

  const handleSubmit = (data: {
    name: string; description: string; priority: Priority;
    estimatedHours: number; storyId: string; status: TaskStatus;
  }) => {
    if (editingTask) {
      taskApi.update(editingTask.id, {
        name: data.name,
        description: data.description,
        priority: data.priority,
        estimatedHours: data.estimatedHours,
      });
      setToast("Zadanie zaktualizowane ✓");
    } else {
      taskApi.create({
        name: data.name,
        description: data.description,
        priority: data.priority,
        estimatedHours: data.estimatedHours,
        storyId,
        status: "todo",
      });
      setToast("Zadanie utworzone ✓");
    }
    reload();
    closeForm();
  };

  const handleDelete = () => {
    if (deleteId) {
      taskApi.delete(deleteId);
      reload();
      setDeleteId(null);
      setToast("Zadanie usunięte");
    }
  };

  const grouped: Record<TaskStatus, Task[]> = { todo: [], doing: [], done: [] };
  tasks.forEach((t) => grouped[t.status].push(t));

  if (detailTaskId) {
    return (
      <TaskDetail
        taskId={detailTaskId}
        onBack={() => setDetailTaskId(null)}
        onUpdated={reload}
      />
    );
  }

  return (
    <div>
      {toast && <div style={styles.toast}>{toast}</div>}

      {/* Top bar */}
      <div style={styles.topBar}>
        <div style={styles.topLeft}>
          <button style={styles.backBtn} onClick={onBack}>← Historyjki</button>
          <div>
            <h2 style={styles.heading}>Kanban – {story?.name ?? "…"}</h2>
            <p style={styles.subheading}>Zadania historyjki</p>
          </div>
          <span style={styles.badge}>{tasks.length} zadań</span>
        </div>
        <button style={styles.addBtn} onClick={openCreate}>
          <span style={{ fontSize: 18 }}>+</span> Nowe zadanie
        </button>
      </div>

      {/* Kanban columns */}
      <div style={styles.columns}>
        {(["todo", "doing", "done"] as TaskStatus[]).map((status) => (
          <div key={status} style={styles.column}>
            <div style={{ ...styles.colHeader, borderColor: STATUS_CONFIG[status].color }}>
              <span>
                {STATUS_CONFIG[status].icon} {STATUS_CONFIG[status].label}
              </span>
              <span
                style={{
                  ...styles.colCount,
                  background: STATUS_CONFIG[status].color + "22",
                  color: STATUS_CONFIG[status].color,
                }}
              >
                {grouped[status].length}
              </span>
            </div>

            {grouped[status].length === 0 ? (
              <p style={styles.emptyCol}>Brak zadań</p>
            ) : (
              grouped[status].map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={openEdit}
                  onDelete={setDeleteId}
                  onDetail={setDetailTaskId}
                />
              ))
            )}
          </div>
        ))}
      </div>

      {formOpen && (
        <TaskForm
          task={editingTask}
          storyId={storyId}
          onSubmit={handleSubmit}
          onCancel={closeForm}
        />
      )}
      {deleteId && (
        <DeleteConfirm onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
      )}
    </div>
  );
}

function TaskCard({
  task, onEdit, onDelete, onDetail,
}: {
  task: Task;
  onEdit: (t: Task) => void;
  onDelete: (id: string) => void;
  onDetail: (id: string) => void;
}) {
  const prio = PRIO_MAP[task.priority];
  const user = task.assignedUserId ? userManager.getUserById(task.assignedUserId) : undefined;

  const fmt = (iso?: string) =>
    iso ? new Date(iso).toLocaleDateString("pl-PL") : null;

  return (
    <div style={styles.card}>
      <div style={styles.cardTop}>
        <span style={{ ...styles.prioBadge, color: prio.color, borderColor: prio.color }}>
          {prio.label}
        </span>
        <span style={styles.cardHours}>{task.estimatedHours}h</span>
      </div>

      <h4 style={styles.cardTitle}>{task.name}</h4>
      {task.description && <p style={styles.cardDesc}>{task.description}</p>}

      {user && (
        <div style={styles.assigneeRow}>
          <div style={styles.miniAvatar}>
            {user.firstName[0]}{user.lastName[0]}
          </div>
          <span style={styles.assigneeName}>{user.firstName} {user.lastName}</span>
        </div>
      )}

      {task.startedAt && (
        <div style={styles.dateLine}>🕐 Start: {fmt(task.startedAt)}</div>
      )}
      {task.finishedAt && (
        <div style={styles.dateLine}>🏁 Koniec: {fmt(task.finishedAt)}</div>
      )}

      <div style={styles.cardActions}>
        <button style={styles.detailBtn} onClick={() => onDetail(task.id)}>👁 Szczegóły</button>
        {task.status === "todo" && (
          <button style={styles.editBtn} onClick={() => onEdit(task)}>✏️</button>
        )}
        <button style={styles.delBtn} onClick={() => onDelete(task.id)}>🗑</button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  toast: {
    position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)",
    background: "#22c55e", color: "#fff", padding: "10px 24px", borderRadius: 10,
    fontWeight: 600, fontSize: 14, zIndex: 999,
    boxShadow: "0 8px 30px rgba(34,197,94,.35)",
  },
  topBar: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    flexWrap: "wrap" as const, gap: 12, marginBottom: 28,
  },
  topLeft: { display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" as const },
  backBtn: {
    background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)",
    color: "#94a3b8", padding: "8px 14px", borderRadius: 8, fontSize: 13,
    cursor: "pointer", fontFamily: "inherit",
  },
  heading: { margin: 0, fontSize: 20, fontWeight: 700, color: "#e2e8f0" },
  subheading: { margin: 0, fontSize: 12, color: "#64748b" },
  badge: {
    background: "rgba(99,102,241,.15)", color: "#a5b4fc",
    padding: "4px 10px", borderRadius: 6, fontSize: 12, fontWeight: 600,
  },
  addBtn: {
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)", border: "none",
    color: "#fff", padding: "10px 20px", borderRadius: 10, fontWeight: 600,
    fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center",
    gap: 8, boxShadow: "0 4px 20px rgba(99,102,241,.3)", fontFamily: "inherit",
  },
  columns: {
    display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16,
  },
  column: {
    background: "rgba(255,255,255,.02)", borderRadius: 14,
    border: "1px solid rgba(255,255,255,.06)", padding: 14, minHeight: 220,
  },
  colHeader: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    paddingBottom: 12, marginBottom: 12, borderBottom: "2px solid",
    fontSize: 14, fontWeight: 700, color: "#e2e8f0",
  },
  colCount: {
    padding: "2px 9px", borderRadius: 6, fontSize: 12, fontWeight: 700,
  },
  emptyCol: { color: "#475569", fontSize: 13, textAlign: "center" as const, padding: "20px 0" },
  card: {
    background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)",
    borderRadius: 12, padding: 14, marginBottom: 10,
    animation: "fadeSlideUp .3s ease both",
  },
  cardTop: {
    display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8,
  },
  prioBadge: {
    fontSize: 10, fontWeight: 700, textTransform: "uppercase" as const,
    letterSpacing: "0.06em", padding: "3px 7px", borderRadius: 4, border: "1px solid",
  },
  cardHours: {
    fontSize: 11, color: "#64748b", fontFamily: "'Space Mono', monospace",
  },
  cardTitle: { margin: "0 0 5px", fontSize: 14, fontWeight: 700, color: "#e2e8f0" },
  cardDesc: { margin: "0 0 8px", fontSize: 12, color: "#94a3b8", lineHeight: 1.45 },
  assigneeRow: { display: "flex", alignItems: "center", gap: 7, marginBottom: 6 },
  miniAvatar: {
    width: 22, height: 22, borderRadius: 6,
    background: "linear-gradient(135deg, #6366f1, #a855f7)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 9, fontWeight: 700, color: "#fff", flexShrink: 0,
  },
  assigneeName: { fontSize: 11, color: "#a5b4fc" },
  dateLine: { fontSize: 11, color: "#475569", marginBottom: 3 },
  cardActions: { display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" as const },
  detailBtn: {
    background: "rgba(99,102,241,.12)", border: "1px solid rgba(99,102,241,.2)",
    color: "#a5b4fc", padding: "5px 10px", borderRadius: 6, fontSize: 11,
    cursor: "pointer", fontFamily: "inherit",
  },
  editBtn: {
    background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)",
    color: "#94a3b8", padding: "5px 10px", borderRadius: 6, fontSize: 11,
    cursor: "pointer", fontFamily: "inherit",
  },
  delBtn: {
    background: "rgba(239,68,68,.08)", border: "1px solid rgba(239,68,68,.15)",
    color: "#fca5a5", padding: "5px 10px", borderRadius: 6, fontSize: 11,
    cursor: "pointer", fontFamily: "inherit",
  },
};
