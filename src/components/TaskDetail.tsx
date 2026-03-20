import { useState, useEffect, useCallback } from "react";
import { Task } from "../models/Task";
import { Story } from "../models/Story";
import { User } from "../models/User";
import { taskApi } from "../api/taskApi";
import { storyApi } from "../api/storyApi";
import { userManager } from "../api/userManager";

interface TaskDetailProps {
  taskId: string;
  onBack: () => void;
  onUpdated: () => void;
}

const PRIO_MAP = {
  low: { label: "Niski", color: "#94a3b8" },
  medium: { label: "Średni", color: "#f59e0b" },
  high: { label: "Wysoki", color: "#ef4444" },
};

const STATUS_MAP = {
  todo: { label: "To Do", color: "#f59e0b", bg: "rgba(245,158,11,.12)" },
  doing: { label: "W trakcie", color: "#3b82f6", bg: "rgba(59,130,246,.12)" },
  done: { label: "Gotowe", color: "#22c55e", bg: "rgba(34,197,94,.12)" },
};

const ROLE_MAP = {
  admin: { label: "Admin", color: "#a855f7" },
  developer: { label: "Developer", color: "#3b82f6" },
  devops: { label: "DevOps", color: "#f59e0b" },
};

export default function TaskDetail({ taskId, onBack, onUpdated }: TaskDetailProps) {
  const [task, setTask] = useState<Task | null>(null);
  const [story, setStory] = useState<Story | null>(null);
  const [assignedUser, setAssignedUser] = useState<User | undefined>(undefined);
  const [assignableUsers, setAssignableUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [toast, setToast] = useState<string | null>(null);

  const reload = useCallback(() => {
    const t = taskApi.getById(taskId);
    if (!t) return;
    setTask(t);
    const s = storyApi.getById(t.storyId);
    setStory(s ?? null);
    if (t.assignedUserId) {
      setAssignedUser(userManager.getUserById(t.assignedUserId));
    }
    setAssignableUsers(userManager.getAssignableUsers());
  }, [taskId]);

  useEffect(() => { reload(); }, [reload]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2400);
    return () => clearTimeout(t);
  }, [toast]);

  const showToast = (msg: string) => setToast(msg);

  const handleAssign = () => {
    if (!selectedUserId || !task) return;
    taskApi.assignUser(task.id, selectedUserId);

    // If story was todo → set to doing
    if (story && story.status === "todo") {
      storyApi.update(story.id, { status: "doing" });
    }

    showToast("Zadanie przypisane ✓");
    reload();
    onUpdated();
  };

  const handleMarkDone = () => {
    if (!task) return;
    taskApi.markDone(task.id);

    // Check if all tasks in story are done
    if (story) {
      const allTasks = taskApi.getByStory(story.id);
      const allUpdated = allTasks.map((t) => (t.id === task.id ? { ...t, status: "done" as const } : t));
      const allDone = allUpdated.every((t) => t.status === "done");
      if (allDone) {
        storyApi.update(story.id, { status: "done" });
      }
    }

    showToast("Zadanie zakończone ✓");
    reload();
    onUpdated();
  };

  if (!task) return <div style={{ color: "#94a3b8", padding: 40 }}>Ładowanie...</div>;

  const prio = PRIO_MAP[task.priority];
  const status = STATUS_MAP[task.status];

  const fmt = (iso?: string) =>
    iso ? new Date(iso).toLocaleString("pl-PL") : "—";

  return (
    <div style={styles.wrapper}>
      {toast && <div style={styles.toast}>{toast}</div>}

      {/* Top bar */}
      <div style={styles.topBar}>
        <button style={styles.backBtn} onClick={onBack}>← Kanban</button>
        <h2 style={styles.heading}>Szczegóły zadania</h2>
      </div>

      <div style={styles.grid}>
        {/* Left: main info */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <span
              style={{ ...styles.statusBadge, color: status.color, background: status.bg }}
            >
              {status.label}
            </span>
            <span style={{ ...styles.prioBadge, color: prio.color, borderColor: prio.color }}>
              {prio.label}
            </span>
          </div>

          <h3 style={styles.taskName}>{task.name}</h3>
          {task.description && <p style={styles.taskDesc}>{task.description}</p>}

          <div style={styles.metaGrid}>
            <MetaRow label="Historyjka" value={story ? story.name : "—"} />
            <MetaRow label="Szacowany czas" value={`${task.estimatedHours} h`} />
            <MetaRow label="Data dodania" value={fmt(task.createdAt)} />
            <MetaRow label="Data startu" value={fmt(task.startedAt)} />
            <MetaRow label="Data zakończenia" value={fmt(task.finishedAt)} />
          </div>
        </div>

        {/* Right: assignment & actions */}
        <div>
          {/* Assigned user */}
          <div style={styles.card}>
            <h4 style={styles.sectionTitle}>👤 Przypisana osoba</h4>
            {assignedUser ? (
              <div style={styles.userRow}>
                <div style={styles.avatar}>
                  {assignedUser.firstName[0]}{assignedUser.lastName[0]}
                </div>
                <div>
                  <div style={styles.userName}>
                    {assignedUser.firstName} {assignedUser.lastName}
                  </div>
                  <span
                    style={{
                      ...styles.roleBadge,
                      color: ROLE_MAP[assignedUser.role].color,
                      borderColor: ROLE_MAP[assignedUser.role].color,
                    }}
                  >
                    {ROLE_MAP[assignedUser.role].label}
                  </span>
                </div>
              </div>
            ) : (
              <p style={styles.unassigned}>Brak przypisanej osoby</p>
            )}

            {task.status === "todo" && (
              <div style={styles.assignBox}>
                <label style={styles.label}>Przypisz osobę</label>
                <select
                  style={styles.select}
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                >
                  <option value="">— wybierz —</option>
                  {assignableUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.firstName} {u.lastName} ({ROLE_MAP[u.role].label})
                    </option>
                  ))}
                </select>
                <button
                  style={{
                    ...styles.assignBtn,
                    opacity: selectedUserId ? 1 : 0.45,
                    cursor: selectedUserId ? "pointer" : "not-allowed",
                  }}
                  onClick={handleAssign}
                  disabled={!selectedUserId}
                >
                  Przypisz i rozpocznij
                </button>
              </div>
            )}
          </div>

          {/* Mark done */}
          {task.status === "doing" && (
            <div style={{ ...styles.card, marginTop: 16 }}>
              <h4 style={styles.sectionTitle}>✅ Zakończ zadanie</h4>
              <p style={styles.doneHint}>
                Kliknięcie zakończy zadanie i uzupełni datę zakończenia.
              </p>
              <button style={styles.doneBtn} onClick={handleMarkDone}>
                Oznacz jako gotowe
              </button>
            </div>
          )}

          {task.status === "done" && (
            <div style={{ ...styles.card, marginTop: 16, borderColor: "rgba(34,197,94,.25)" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🎉</div>
              <p style={{ color: "#22c55e", fontWeight: 700, margin: 0 }}>
                Zadanie zostało zakończone
              </p>
              <p style={{ color: "#94a3b8", fontSize: 13, margin: "6px 0 0" }}>
                {fmt(task.finishedAt)}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", gap: 12, padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,.05)" }}>
      <span style={{ color: "#64748b", fontSize: 13, minWidth: 160 }}>{label}</span>
      <span style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 500 }}>{value}</span>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: { padding: "0 0 40px" },
  toast: {
    position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)",
    background: "#22c55e", color: "#fff", padding: "10px 24px", borderRadius: 10,
    fontWeight: 600, fontSize: 14, zIndex: 999,
    boxShadow: "0 8px 30px rgba(34,197,94,.35)",
  },
  topBar: { display: "flex", alignItems: "center", gap: 16, marginBottom: 28 },
  backBtn: {
    background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)",
    color: "#94a3b8", padding: "8px 14px", borderRadius: 8, fontSize: 13,
    cursor: "pointer", fontFamily: "inherit",
  },
  heading: { margin: 0, fontSize: 22, fontWeight: 700, color: "#e2e8f0" },
  grid: {
    display: "grid", gridTemplateColumns: "1fr 360px", gap: 20,
    alignItems: "start",
  },
  card: {
    background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)",
    borderRadius: 16, padding: 24,
  },
  cardHeader: { display: "flex", gap: 10, marginBottom: 16 },
  statusBadge: {
    fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 6,
    textTransform: "uppercase", letterSpacing: "0.06em",
  },
  prioBadge: {
    fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 6,
    border: "1px solid", textTransform: "uppercase", letterSpacing: "0.06em",
  },
  taskName: { margin: "0 0 10px", fontSize: 24, fontWeight: 700, color: "#f1f5f9" },
  taskDesc: { margin: "0 0 20px", fontSize: 14, color: "#94a3b8", lineHeight: 1.6 },
  metaGrid: { display: "flex", flexDirection: "column" },
  sectionTitle: { margin: "0 0 16px", fontSize: 15, fontWeight: 700, color: "#e2e8f0" },
  userRow: { display: "flex", alignItems: "center", gap: 14, marginBottom: 16 },
  avatar: {
    width: 44, height: 44, borderRadius: 12,
    background: "linear-gradient(135deg, #6366f1, #a855f7)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontWeight: 700, fontSize: 14, color: "#fff", flexShrink: 0,
  },
  userName: { fontSize: 15, fontWeight: 600, color: "#e2e8f0", marginBottom: 4 },
  roleBadge: {
    fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 4,
    border: "1px solid", textTransform: "uppercase", letterSpacing: "0.06em",
  },
  unassigned: { color: "#475569", fontSize: 13, margin: "0 0 16px" },
  assignBox: { borderTop: "1px solid rgba(255,255,255,.07)", paddingTop: 16 },
  label: {
    display: "block", fontSize: 12, fontWeight: 600, color: "#94a3b8",
    marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em",
  },
  select: {
    width: "100%", background: "rgba(255,255,255,.05)",
    border: "1px solid rgba(255,255,255,.12)", borderRadius: 10,
    padding: "10px 14px", fontSize: 14, color: "#e2e8f0",
    fontFamily: "'DM Sans', sans-serif", outline: "none",
    boxSizing: "border-box", marginBottom: 12,
  },
  assignBtn: {
    width: "100%", background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    border: "none", color: "#fff", padding: "11px 20px", borderRadius: 10,
    fontWeight: 600, fontSize: 14, fontFamily: "inherit",
    boxShadow: "0 4px 20px rgba(99,102,241,.3)",
  },
  doneHint: { color: "#94a3b8", fontSize: 13, margin: "0 0 14px", lineHeight: 1.5 },
  doneBtn: {
    width: "100%", background: "linear-gradient(135deg, #22c55e, #16a34a)",
    border: "none", color: "#fff", padding: "11px 20px", borderRadius: 10,
    fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: "inherit",
    boxShadow: "0 4px 20px rgba(34,197,94,.3)",
  },
};
