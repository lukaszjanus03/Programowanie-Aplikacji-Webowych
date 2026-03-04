import { useState, useEffect, useCallback } from "react";
import { Project } from "./models/Project";
import { projectApi } from "./api/projectApi";
import ProjectList from "./components/ProjectList";
import ProjectForm from "./components/ProjectForm";
import DeleteConfirm from "./components/DeleteConfirm";

export default function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const reload = useCallback(() => setProjects(projectApi.getAll()), []);

  useEffect(() => {
    reload();
  }, [reload]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2400);
    return () => clearTimeout(t);
  }, [toast]);

  const openCreate = () => {
    setEditingProject(null);
    setFormOpen(true);
  };

  const openEdit = (project: Project) => {
    setEditingProject(project);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingProject(null);
  };

  const handleSubmit = (name: string, description: string) => {
    if (editingProject) {
      projectApi.update(editingProject.id, { name, description });
      setToast("Projekt zaktualizowany ✓");
    } else {
      projectApi.create({ name, description });
      setToast("Projekt utworzony ✓");
    }
    reload();
    closeForm();
  };

  const handleDeleteRequest = (id: string) => {
    setDeleteId(id);
  };

  const handleDeleteConfirm = () => {
    if (deleteId) {
      projectApi.delete(deleteId);
      reload();
      setDeleteId(null);
      setToast("Projekt usunięty");
    }
  };

  return (
    <div style={styles.wrapper}>
      {/* Toast */}
      {toast && <div style={styles.toast}>{toast}</div>}

      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={styles.logo}>M</div>
            <div>
              <h1 style={styles.title}>ManageMe</h1>
              <p style={styles.subtitle}>Zarządzanie projektami</p>
            </div>
          </div>
          <button style={styles.addBtn} onClick={openCreate}>
            <span style={{ fontSize: 20, lineHeight: 1 }}>+</span>
            <span>Nowy projekt</span>
          </button>
        </div>
      </header>

      {/* Main content */}
      <main style={styles.main}>
        <div style={styles.statsRow}>
          <div style={styles.statCard}>
            <span style={styles.statNum}>{projects.length}</span>
            <span style={styles.statLabel}>Projektów</span>
          </div>
        </div>

        <ProjectList
          projects={projects}
          onEdit={openEdit}
          onDelete={handleDeleteRequest}
        />
      </main>

      {/* Modals */}
      {formOpen && (
        <ProjectForm
          project={editingProject}
          onSubmit={handleSubmit}
          onCancel={closeForm}
        />
      )}

      {deleteId && (
        <DeleteConfirm
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteId(null)}
        />
      )}

      {/* Global keyframes */}
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { margin: 0; }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(-20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(99,102,241,.4); }
          50%      { box-shadow: 0 0 0 8px rgba(99,102,241,0); }
        }
      `}</style>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    fontFamily: "'DM Sans', sans-serif",
    background: "linear-gradient(145deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)",
    minHeight: "100vh",
    color: "#e2e8f0",
    position: "relative",
  },
  toast: {
    position: "fixed",
    top: 20,
    left: "50%",
    transform: "translateX(-50%)",
    background: "#22c55e",
    color: "#fff",
    padding: "10px 24px",
    borderRadius: 10,
    fontWeight: 600,
    fontSize: 14,
    zIndex: 999,
    animation: "toastIn .3s ease",
    boxShadow: "0 8px 30px rgba(34,197,94,.35)",
  },
  header: {
    borderBottom: "1px solid rgba(255,255,255,.06)",
    backdropFilter: "blur(12px)",
    background: "rgba(15,23,42,.7)",
    position: "sticky",
    top: 0,
    zIndex: 50,
  },
  headerInner: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "16px 24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap" as const,
    gap: 12,
  },
  logo: {
    width: 42,
    height: 42,
    borderRadius: 12,
    background: "linear-gradient(135deg, #6366f1, #a855f7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Space Mono', monospace",
    fontWeight: 700,
    fontSize: 20,
    color: "#fff",
  },
  title: {
    margin: 0,
    fontSize: 20,
    fontWeight: 700,
    letterSpacing: "-0.02em",
  },
  subtitle: {
    margin: 0,
    fontSize: 12,
    color: "#94a3b8",
    letterSpacing: "0.05em",
    textTransform: "uppercase" as const,
  },
  addBtn: {
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    border: "none",
    color: "#fff",
    padding: "10px 20px",
    borderRadius: 10,
    fontWeight: 600,
    fontSize: 14,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 8,
    boxShadow: "0 4px 20px rgba(99,102,241,.3)",
    fontFamily: "inherit",
  },
  main: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "32px 24px 60px",
  },
  statsRow: {
    display: "flex",
    gap: 16,
    marginBottom: 32,
  },
  statCard: {
    background: "rgba(255,255,255,.04)",
    border: "1px solid rgba(255,255,255,.08)",
    borderRadius: 14,
    padding: "20px 28px",
    display: "flex",
    flexDirection: "column" as const,
    gap: 4,
    minWidth: 140,
  },
  statNum: {
    fontSize: 32,
    fontWeight: 700,
    fontFamily: "'Space Mono', monospace",
    background: "linear-gradient(135deg, #6366f1, #a855f7)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  statLabel: {
    fontSize: 13,
    color: "#94a3b8",
    textTransform: "uppercase" as const,
    letterSpacing: "0.08em",
  },
};
