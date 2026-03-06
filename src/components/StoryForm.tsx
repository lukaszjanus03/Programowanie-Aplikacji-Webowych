import { useState, useEffect } from "react";
import { Story, Priority, StoryStatus } from "../models/Story";

interface StoryFormProps {
  story: Story | null;
  onSubmit: (data: {
    name: string;
    description: string;
    priority: Priority;
    status: StoryStatus;
  }) => void;
  onCancel: () => void;
}

export default function StoryForm({ story, onSubmit, onCancel }: StoryFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [status, setStatus] = useState<StoryStatus>("todo");

  useEffect(() => {
    if (story) {
      setName(story.name);
      setDescription(story.description);
      setPriority(story.priority);
      setStatus(story.status);
    } else {
      setName("");
      setDescription("");
      setPriority("medium");
      setStatus("todo");
    }
  }, [story]);

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSubmit({ name: name.trim(), description: description.trim(), priority, status });
  };

  return (
    <div style={styles.overlay} onClick={onCancel}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 style={styles.title}>
          {story ? "Edytuj historyjkę" : "Nowa historyjka"}
        </h2>

        <div style={styles.field}>
          <label style={styles.label}>Nazwa *</label>
          <input
            style={styles.input}
            placeholder="np. Logowanie użytkownika"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Opis</label>
          <textarea
            style={{ ...styles.input, minHeight: 80, resize: "vertical" }}
            placeholder="Opis historyjki…"
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
            <label style={styles.label}>Status</label>
            <select
              style={styles.input}
              value={status}
              onChange={(e) => setStatus(e.target.value as StoryStatus)}
            >
              <option value="todo">To Do</option>
              <option value="doing">Doing</option>
              <option value="done">Done</option>
            </select>
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
            {story ? "Zapisz zmiany" : "Utwórz"}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: "fixed", inset: 0, background: "rgba(0,0,0,.6)",
    backdropFilter: "blur(6px)", display: "flex", alignItems: "center",
    justifyContent: "center", zIndex: 100, padding: 20,
  },
  modal: {
    background: "#1e293b", border: "1px solid rgba(255,255,255,.1)",
    borderRadius: 18, padding: 32, width: "100%", maxWidth: 520,
    animation: "fadeSlideUp .3s ease",
  },
  title: { margin: "0 0 20px", fontSize: 22, fontWeight: 700, color: "#e2e8f0" },
  field: { marginBottom: 16 },
  row: { display: "flex", gap: 12 },
  label: {
    display: "block", fontSize: 13, fontWeight: 600, color: "#94a3b8",
    marginBottom: 6, textTransform: "uppercase" as const, letterSpacing: "0.06em",
  },
  input: {
    width: "100%", background: "rgba(255,255,255,.05)",
    border: "1px solid rgba(255,255,255,.12)", borderRadius: 10,
    padding: "12px 16px", fontSize: 15, color: "#e2e8f0",
    fontFamily: "'DM Sans', sans-serif", outline: "none",
    boxSizing: "border-box" as const,
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
