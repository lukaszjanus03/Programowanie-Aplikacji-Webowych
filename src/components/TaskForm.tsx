import { useState, useEffect } from "react";
import { Task, TaskStatus } from "../models/Task";
import { Priority } from "../models/Story";

interface TaskFormProps {
  task: Task | null;
  storyId: string;
  onSubmit: (data: {
    name: string;
    description: string;
    priority: Priority;
    estimatedHours: number;
    storyId: string;
    status: TaskStatus;
  }) => void;
  onCancel: () => void;
}

export default function TaskForm({ task, storyId, onSubmit, onCancel }: TaskFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [estimatedHours, setEstimatedHours] = useState(1);

  useEffect(() => {
    if (task) {
      setName(task.name);
      setDescription(task.description);
      setPriority(task.priority);
      setEstimatedHours(task.estimatedHours);
    } else {
      setName("");
      setDescription("");
      setPriority("medium");
      setEstimatedHours(1);
    }
  }, [task]);

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSubmit({
      name: name.trim(),
      description: description.trim(),
      priority,
      estimatedHours,
      storyId,
      status: task?.status ?? "todo",
    });
  };

  return (
    <div style={styles.overlay} onClick={onCancel}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 style={styles.title}>{task ? "Edytuj zadanie" : "Nowe zadanie"}</h2>

        <div style={styles.field}>
          <label style={styles.label}>Nazwa *</label>
          <input
            style={styles.input}
            placeholder="np. Implementacja logowania"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Opis</label>
          <textarea
            style={{ ...styles.input, minHeight: 80, resize: "vertical" as const }}
            placeholder="Opis zadania…"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div style={styles.row}>
          <div style={{ ...styles.field, flex: 1 }}>
            <label style={styles.label}>Priorytet</label>
            <select
              style={styles.input}
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
            >
              <option value="low">Niski</option>
              <option value="medium">Średni</option>
              <option value="high">Wysoki</option>
            </select>
          </div>

          <div style={{ ...styles.field, flex: 1 }}>
            <label style={styles.label}>Szacowany czas (h)</label>
            <input
              style={styles.input}
              type="number"
              min={0.5}
              step={0.5}
              value={estimatedHours}
              onChange={(e) => setEstimatedHours(parseFloat(e.target.value) || 1)}
            />
          </div>
        </div>

        <div style={styles.actions}>
          <button style={styles.cancelBtn} onClick={onCancel}>Anuluj</button>
          <button
            style={{
              ...styles.submitBtn,
              opacity: name.trim() ? 1 : 0.5,
              cursor: name.trim() ? "pointer" : "not-allowed",
            }}
            onClick={handleSubmit}
            disabled={!name.trim()}
          >
            {task ? "Zapisz zmiany" : "Utwórz"}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: "fixed", inset: 0, background: "rgba(0,0,0,.65)",
    backdropFilter: "blur(6px)", display: "flex", alignItems: "center",
    justifyContent: "center", zIndex: 200, padding: 20,
  },
  modal: {
    background: "#1e293b", border: "1px solid rgba(255,255,255,.1)",
    borderRadius: 18, padding: 32, width: "100%", maxWidth: 540,
    animation: "fadeSlideUp .3s ease",
  },
  title: { margin: "0 0 20px", fontSize: 22, fontWeight: 700, color: "#e2e8f0" },
  field: { marginBottom: 16 },
  row: { display: "flex", gap: 12 },
  label: {
    display: "block", fontSize: 12, fontWeight: 600, color: "#94a3b8",
    marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em",
  },
  input: {
    width: "100%", background: "rgba(255,255,255,.05)",
    border: "1px solid rgba(255,255,255,.12)", borderRadius: 10,
    padding: "11px 14px", fontSize: 14, color: "#e2e8f0",
    fontFamily: "'DM Sans', sans-serif", outline: "none",
    boxSizing: "border-box",
  },
  actions: { display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 12 },
  cancelBtn: {
    background: "transparent", border: "1px solid rgba(255,255,255,.12)",
    color: "#94a3b8", padding: "10px 20px", borderRadius: 10, fontSize: 14,
    cursor: "pointer", fontFamily: "inherit",
  },
  submitBtn: {
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)", border: "none",
    color: "#fff", padding: "10px 20px", borderRadius: 10, fontWeight: 600,
    fontSize: 14, cursor: "pointer", fontFamily: "inherit",
    boxShadow: "0 4px 20px rgba(99,102,241,.3)",
  },
};
