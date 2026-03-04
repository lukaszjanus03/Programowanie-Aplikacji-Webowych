import { Project } from "../models/Project";
import ProjectCard from "./ProjectCard";

interface ProjectListProps {
  projects: Project[];
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
}

export default function ProjectList({ projects, onEdit, onDelete }: ProjectListProps) {
  if (projects.length === 0) {
    return (
      <div style={styles.empty}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>📁</div>
        <p style={styles.emptyTitle}>Brak projektów</p>
        <p style={styles.emptyDesc}>Kliknij „Nowy projekt" aby rozpocząć</p>
      </div>
    );
  }

  return (
    <div style={styles.grid}>
      {projects.map((p, i) => (
        <ProjectCard
          key={p.id}
          project={p}
          index={i}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: 20,
  },
  empty: {
    textAlign: "center" as const,
    padding: "80px 20px",
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 700,
    margin: "0 0 6px",
    color: "#e2e8f0",
  },
  emptyDesc: {
    color: "#94a3b8",
    margin: 0,
    fontSize: 14,
  },
};
