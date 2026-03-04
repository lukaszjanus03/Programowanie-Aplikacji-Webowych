import { Project } from "../models/Project";

interface ProjectCardProps {
  project: Project;
  index: number;
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
}

export default function ProjectCard({ project, index, onEdit, onDelete }: ProjectCardProps) {
  return (
    <div style={{ ...styles.card, animationDelay: `${index * 60}ms` }}>
      <div style={styles.header}>
        <div style={styles.dot} />
        <h3 style={styles.title}>{project.name}</h3>
      </div>
      <p style={styles.desc}>{project.description || "Brak opisu"}</p>
      <div style={styles.id}>ID: {project.id.slice(0, 8)}…</div>
      <div style={styles.actions}>
        <button style={styles.editBtn} onClick={() => onEdit(project)}>
          ✏️ Edytuj
        </button>
        <button style={styles.deleteBtn} onClick={() => onDelete(project.id)}>
          🗑 Usuń
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    background: "rgba(255,255,255,.04)",
    border: "1px solid rgba(255,255,255,.08)",
    borderRadius: 16,
    padding: 24,
    animation: "fadeSlideUp .45s ease both",
    transition: "border-color .2s, transform .2s",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #6366f1, #a855f7)",
    flexShrink: 0,
    animation: "pulse 2.5s infinite",
  },
  title: {
    margin: 0,
    fontSize: 17,
    fontWeight: 700,
    color: "#e2e8f0",
    letterSpacing: "-0.01em",
  },
  desc: {
    margin: "0 0 12px",
    fontSize: 14,
    color: "#94a3b8",
    lineHeight: 1.55,
  },
  id: {
    fontSize: 11,
    fontFamily: "'Space Mono', monospace",
    color: "#475569",
    marginBottom: 16,
  },
  actions: {
    display: "flex",
    gap: 8,
  },
  editBtn: {
    background: "rgba(99,102,241,.15)",
    border: "1px solid rgba(99,102,241,.25)",
    color: "#a5b4fc",
    padding: "7px 14px",
    borderRadius: 8,
    fontSize: 13,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  deleteBtn: {
    background: "rgba(239,68,68,.1)",
    border: "1px solid rgba(239,68,68,.2)",
    color: "#fca5a5",
    padding: "7px 14px",
    borderRadius: 8,
    fontSize: 13,
    cursor: "pointer",
    fontFamily: "inherit",
  },
};
