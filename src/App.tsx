import { useState, useEffect, useCallback } from "react";
import { Project } from "./models/Project";
import { projectApi } from "./api/projectApi";
import { activeProjectApi } from "./api/activeProjectApi";
import { userManager } from "./api/userManager";
import ProjectForm from "./components/ProjectForm";
import DeleteConfirm from "./components/DeleteConfirm";
import StoryBoard from "./components/StoryBoard";

export default function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  const user = userManager.getLoggedUser();

  const reload = useCallback(() => setProjects(projectApi.getAll()), []);

  useEffect(() => {
    reload();
    const saved = activeProjectApi.get();
    if (saved) setActiveProjectId(saved);
  }, [reload]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2400);
    return () => clearTimeout(t);
  }, [toast]);

  const openCreate = () => { setEditingProject(null); setFormOpen(true); };
  const openEdit = (project: Project) => { setEditingProject(project); setFormOpen(true); };
  const closeForm = () => { setFormOpen(false); setEditingProject(null); };

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

  const handleDeleteRequest = (id: string) => setDeleteId(id);

  const handleDeleteConfirm = () => {
    if (deleteId) {
      projectApi.delete(deleteId);
      if (activeProjectId === deleteId) {
        activeProjectApi.clear();
        setActiveProjectId(null);
      }
      reload();
      setDeleteId(null);
      setToast("Projekt usunięty");
    }
  };

  const selectProject = (id: string) => {
    activeProjectApi.set(id);
    setActiveProjectId(id);
  };

  const goBackToProjects = () => {
    activeProjectApi.clear();
    setActiveProjectId(null);
  };

  const activeProject = projects.find((p) => p.id === activeProjectId);

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
          <div style={styles.headerRight}>
            {!activeProject && (
              <button style={styles.addBtn} onClick={openCreate}>
                <span style={{ fontSize: 20, lineHeight: 1 }}>+</span>
                <span>Nowy projekt</span>
              </button>
            )}
            <div style={styles.userBadge}>
              <div style={styles.avatar}>
                {user.firstName[0]}{user.lastName[0]}
              </div>
              <div>
                <span style={styles.userName}>
                  {user.firstName} {user.lastName}
                </span>
                <div style={styles.rolePill}>{user.role}</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main style={styles.main}>
        {activeProject ? (
          <StoryBoard
            projectId={activeProject.id}
            projectName={activeProject.name}
            onBack={goBackToProjects}
          />
        ) : (
          <>
            <div style={styles.statsRow}>
              <div style={styles.statCard}>
                <span style={styles.statNum}>{projects.length}</span>
                <span style={styles.statLabel}>Projektów</span>
              </div>
            </div>

            {projects.length === 0 ? (
              <div style={styles.empty}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📁</div>
                <p style={styles.emptyTitle}>Brak projektów</p>
                <p style={styles.emptyDesc}>Kliknij „Nowy projekt" aby rozpocząć</p>
              </div>
            ) : (
              <div style={styles.grid}>
                {projects.map((p, i) => (
                  <div key={p.id} style={{ ...styles.card, animationDelay: `${i * 60}ms` }}>
                    <div style={styles.cardHeader}>
                      <div style={styles.cardDot} />
                      <h3 style={styles.cardTitle}>{p.name}</h3>
                    </div>
                    <p style={styles.cardDesc}>{p.description || "Brak opisu"}</p>
                    <div style={styles.cardId}>ID: {p.id.slice(0, 8)}…</div>
                    <div style={styles.cardActions}>
                      <button style={styles.selectBtn} onClick={() => selectProject(p.id)}>
                        🚀 Wybierz
                      </button>
                      <button style={styles.editBtn} onClick={() => openEdit(p)}>
                        ✏️ Edytuj
                      </button>
                      <button style={styles.deleteBtn} onClick={() => handleDeleteRequest(p.id)}>
                        🗑 Usuń
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Modals */}
      {formOpen && (
        <ProjectForm project={editingProject} onSubmit={handleSubmit} onCancel={closeForm} />
      )}
      {deleteId && (
        <DeleteConfirm onConfirm={handleDeleteConfirm} onCancel={() => setDeleteId(null)} />
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
    minHeight: "100vh", color: "#e2e8f0", position: "relative",
  },
  toast: {
    position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)",
    background: "#22c55e", color: "#fff", padding: "10px 24px", borderRadius: 10,
    fontWeight: 600, fontSize: 14, zIndex: 999, animation: "toastIn .3s ease",
    boxShadow: "0 8px 30px rgba(34,197,94,.35)",
  },
  header: {
    borderBottom: "1px solid rgba(255,255,255,.06)",
    backdropFilter: "blur(12px)", background: "rgba(15,23,42,.7)",
    position: "sticky", top: 0, zIndex: 50,
  },
  headerInner: {
    maxWidth: 1100, margin: "0 auto", padding: "16px 24px",
    display: "flex", justifyContent: "space-between", alignItems: "center",
    flexWrap: "wrap" as const, gap: 12,
  },
  headerRight: { display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" as const },
  logo: {
    width: 42, height: 42, borderRadius: 12,
    background: "linear-gradient(135deg, #6366f1, #a855f7)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: "'Space Mono', monospace", fontWeight: 700, fontSize: 20, color: "#fff",
  },
  title: { margin: 0, fontSize: 20, fontWeight: 700, letterSpacing: "-0.02em" },
  subtitle: {
    margin: 0, fontSize: 12, color: "#94a3b8",
    letterSpacing: "0.05em", textTransform: "uppercase" as const,
  },
  userBadge: {
    display: "flex", alignItems: "center", gap: 10,
    background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)",
    borderRadius: 10, padding: "8px 14px",
  },
  avatar: {
    width: 32, height: 32, borderRadius: 8,
    background: "linear-gradient(135deg, #f59e0b, #ef4444)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 12, fontWeight: 700, color: "#fff",
  },
  userName: { fontSize: 14, fontWeight: 600, color: "#e2e8f0", display: "block" },
  rolePill: {
    fontSize: 10, fontWeight: 700, color: "#a855f7", textTransform: "uppercase" as const,
    letterSpacing: "0.06em",
  },
  addBtn: {
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)", border: "none",
    color: "#fff", padding: "10px 20px", borderRadius: 10, fontWeight: 600,
    fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center",
    gap: 8, boxShadow: "0 4px 20px rgba(99,102,241,.3)", fontFamily: "inherit",
  },
  main: { maxWidth: 1100, margin: "0 auto", padding: "32px 24px 60px" },
  statsRow: { display: "flex", gap: 16, marginBottom: 32 },
  statCard: {
    background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)",
    borderRadius: 14, padding: "20px 28px",
    display: "flex", flexDirection: "column" as const, gap: 4, minWidth: 140,
  },
  statNum: {
    fontSize: 32, fontWeight: 700, fontFamily: "'Space Mono', monospace",
    background: "linear-gradient(135deg, #6366f1, #a855f7)",
    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
  },
  statLabel: {
    fontSize: 13, color: "#94a3b8",
    textTransform: "uppercase" as const, letterSpacing: "0.08em",
  },
  empty: { textAlign: "center" as const, padding: "80px 20px" },
  emptyTitle: { fontSize: 20, fontWeight: 700, margin: "0 0 6px", color: "#e2e8f0" },
  emptyDesc: { color: "#94a3b8", margin: 0, fontSize: 14 },
  grid: {
    display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20,
  },
  card: {
    background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)",
    borderRadius: 16, padding: 24, animation: "fadeSlideUp .45s ease both",
  },
  cardHeader: { display: "flex", alignItems: "center", gap: 10, marginBottom: 10 },
  cardDot: {
    width: 10, height: 10, borderRadius: "50%",
    background: "linear-gradient(135deg, #6366f1, #a855f7)",
    flexShrink: 0, animation: "pulse 2.5s infinite",
  },
  cardTitle: { margin: 0, fontSize: 17, fontWeight: 700, letterSpacing: "-0.01em" },
  cardDesc: { margin: "0 0 12px", fontSize: 14, color: "#94a3b8", lineHeight: 1.55 },
  cardId: {
    fontSize: 11, fontFamily: "'Space Mono', monospace",
    color: "#475569", marginBottom: 16,
  },
  cardActions: { display: "flex", gap: 8, flexWrap: "wrap" as const },
  selectBtn: {
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)", border: "none",
    color: "#fff", padding: "7px 14px", borderRadius: 8, fontSize: 13,
    cursor: "pointer", fontFamily: "inherit", fontWeight: 600,
  },
  editBtn: {
    background: "rgba(99,102,241,.15)", border: "1px solid rgba(99,102,241,.25)",
    color: "#a5b4fc", padding: "7px 14px", borderRadius: 8, fontSize: 13,
    cursor: "pointer", fontFamily: "inherit",
  },
  deleteBtn: {
    background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.2)",
    color: "#fca5a5", padding: "7px 14px", borderRadius: 8, fontSize: 13,
    cursor: "pointer", fontFamily: "inherit",
  },
};
