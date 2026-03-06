import { useState, useEffect, useCallback } from "react";
import { Story, StoryStatus, Priority } from "../models/Story";
import { storyApi } from "../api/storyApi";
import { userManager } from "../api/userManager";
import StoryForm from "./StoryForm";
import DeleteConfirm from "./DeleteConfirm";

interface StoryBoardProps {
  projectId: string;
  projectName: string;
  onBack: () => void;
}

const STATUS_CONFIG: Record<StoryStatus, { label: string; color: string; bg: string }> = {
  todo: { label: "📋 To Do", color: "#f59e0b", bg: "rgba(245,158,11,.1)" },
  doing: { label: "🔧 In Progress", color: "#3b82f6", bg: "rgba(59,130,246,.1)" },
  done: { label: "✅ Done", color: "#22c55e", bg: "rgba(34,197,94,.1)" },
};

const PRIORITY_LABELS: Record<Priority, { label: string; color: string }> = {
  low: { label: "Niski", color: "#94a3b8" },
  medium: { label: "Średni", color: "#f59e0b" },
  high: { label: "Wysoki", color: "#ef4444" },
};

export default function StoryBoard({ projectId, projectName, onBack }: StoryBoardProps) {
  const [stories, setStories] = useState<Story[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<StoryStatus | "all">("all");
  const [toast, setToast] = useState<string | null>(null);

  const reload = useCallback(() => {
    setStories(storyApi.getByProject(projectId));
  }, [projectId]);

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
    if (deleteId) {
      storyApi.delete(deleteId);
      reload();
      setDeleteId(null);
      setToast("Historyjka usunięta");
    }
  };

  const filtered = filterStatus === "all"
    ? stories
    : stories.filter((s) => s.status === filterStatus);

  const grouped: Record<StoryStatus, Story[]> = { todo: [], doing: [], done: [] };
  filtered.forEach((s) => grouped[s.status].push(s));

  return (
    <div>
      {/* Toast */}
      {toast && <div style={styles.toast}>{toast}</div>}

      {/* Top bar */}
      <div style={styles.topBar}>
        <div style={styles.topLeft}>
          <button style={styles.backBtn} onClick={onBack}>← Projekty</button>
          <h2 style={styles.projectTitle}>{projectName}</h2>
          <span style={styles.badge}>{stories.length} historyjek</span>
        </div>
        <button style={styles.addBtn} onClick={openCreate}>
          <span style={{ fontSize: 18 }}>+</span> Nowa historyjka
        </button>
      </div>

      {/* Filter */}
      <div style={styles.filterRow}>
        {(["all", "todo", "doing", "done"] as const).map((val) => (
          <button
            key={val}
            style={{
              ...styles.filterBtn,
              ...(filterStatus === val ? styles.filterActive : {}),
            }}
            onClick={() => setFilterStatus(val)}
          >
            {val === "all" ? "Wszystkie" : STATUS_CONFIG[val].label}
            <span style={styles.filterCount}>
              {val === "all" ? stories.length : stories.filter((s) => s.status === val).length}
            </span>
          </button>
        ))}
      </div>

      {/* Columns */}
      {filterStatus === "all" ? (
        <div style={styles.columns}>
          {(["todo", "doing", "done"] as const).map((status) => (
            <div key={status} style={styles.column}>
              <div style={{ ...styles.colHeader, borderColor: STATUS_CONFIG[status].color }}>
                <span>{STATUS_CONFIG[status].label}</span>
                <span style={styles.colCount}>{grouped[status].length}</span>
              </div>
              {grouped[status].length === 0 ? (
                <p style={styles.emptyCol}>Brak historyjek</p>
              ) : (
                grouped[status].map((s) => (
                  <StoryCard key={s.id} story={s} onEdit={openEdit} onDelete={setDeleteId} />
                ))
              )}
            </div>
          ))}
        </div>
      ) : (
        <div style={styles.singleList}>
          {filtered.length === 0 ? (
            <p style={styles.emptyCol}>Brak historyjek w tej kategorii</p>
          ) : (
            filtered.map((s) => (
              <StoryCard key={s.id} story={s} onEdit={openEdit} onDelete={setDeleteId} />
            ))
          )}
        </div>
      )}

      {/* Modals */}
      {formOpen && <StoryForm story={editingStory} onSubmit={handleSubmit} onCancel={closeForm} />}
      {deleteId && <DeleteConfirm onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />}
    </div>
  );
}

// ─── Story Card sub-component ───
function StoryCard({
  story, onEdit, onDelete,
}: {
  story: Story;
  onEdit: (s: Story) => void;
  onDelete: (id: string) => void;
}) {
  const prio = PRIORITY_LABELS[story.priority];
  return (
    <div style={styles.card}>
      <div style={styles.cardTop}>
        <span style={{ ...styles.prioBadge, color: prio.color, borderColor: prio.color }}>
          {prio.label}
        </span>
        <span style={styles.cardDate}>
          {new Date(story.createdAt).toLocaleDateString("pl-PL")}
        </span>
      </div>
      <h4 style={styles.cardTitle}>{story.name}</h4>
      {story.description && <p style={styles.cardDesc}>{story.description}</p>}
      <div style={styles.cardActions}>
        <button style={styles.editBtn} onClick={() => onEdit(story)}>✏️</button>
        <button style={styles.delBtn} onClick={() => onDelete(story.id)}>🗑</button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  toast: {
    position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)",
    background: "#22c55e", color: "#fff", padding: "10px 24px", borderRadius: 10,
    fontWeight: 600, fontSize: 14, zIndex: 999, animation: "toastIn .3s ease",
    boxShadow: "0 8px 30px rgba(34,197,94,.35)",
  },
  topBar: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    flexWrap: "wrap" as const, gap: 12, marginBottom: 24,
  },
  topLeft: { display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" as const },
  backBtn: {
    background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)",
    color: "#94a3b8", padding: "8px 14px", borderRadius: 8, fontSize: 13,
    cursor: "pointer", fontFamily: "inherit",
  },
  projectTitle: { margin: 0, fontSize: 22, fontWeight: 700, color: "#e2e8f0" },
  badge: {
    background: "rgba(99,102,241,.15)", color: "#a5b4fc", padding: "4px 10px",
    borderRadius: 6, fontSize: 12, fontWeight: 600,
  },
  addBtn: {
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)", border: "none",
    color: "#fff", padding: "10px 20px", borderRadius: 10, fontWeight: 600,
    fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center",
    gap: 8, boxShadow: "0 4px 20px rgba(99,102,241,.3)", fontFamily: "inherit",
  },
  filterRow: {
    display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" as const,
  },
  filterBtn: {
    background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)",
    color: "#94a3b8", padding: "8px 16px", borderRadius: 8, fontSize: 13,
    cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 8,
    transition: "all .15s",
  },
  filterActive: {
    background: "rgba(99,102,241,.15)", borderColor: "rgba(99,102,241,.3)",
    color: "#a5b4fc",
  },
  filterCount: {
    background: "rgba(255,255,255,.1)", padding: "2px 7px", borderRadius: 4,
    fontSize: 11, fontWeight: 700,
  },
  columns: {
    display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16,
  },
  column: {
    background: "rgba(255,255,255,.02)", borderRadius: 14,
    border: "1px solid rgba(255,255,255,.06)", padding: 16, minHeight: 200,
  },
  colHeader: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    paddingBottom: 12, marginBottom: 12,
    borderBottom: "2px solid", fontSize: 14, fontWeight: 700, color: "#e2e8f0",
  },
  colCount: {
    background: "rgba(255,255,255,.1)", padding: "2px 8px", borderRadius: 4,
    fontSize: 12,
  },
  singleList: { display: "flex", flexDirection: "column" as const, gap: 12 },
  emptyCol: { color: "#475569", fontSize: 13, textAlign: "center" as const, padding: 20 },
  card: {
    background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)",
    borderRadius: 12, padding: 16, marginBottom: 10,
    animation: "fadeSlideUp .35s ease both",
  },
  cardTop: {
    display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8,
  },
  prioBadge: {
    fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const,
    letterSpacing: "0.06em", padding: "3px 8px", borderRadius: 4,
    border: "1px solid",
  },
  cardDate: { fontSize: 11, color: "#475569", fontFamily: "'Space Mono', monospace" },
  cardTitle: { margin: "0 0 6px", fontSize: 15, fontWeight: 700, color: "#e2e8f0" },
  cardDesc: { margin: "0 0 10px", fontSize: 13, color: "#94a3b8", lineHeight: 1.5 },
  cardActions: { display: "flex", gap: 6 },
  editBtn: {
    background: "rgba(99,102,241,.12)", border: "1px solid rgba(99,102,241,.2)",
    color: "#a5b4fc", padding: "5px 10px", borderRadius: 6, fontSize: 12,
    cursor: "pointer", fontFamily: "inherit",
  },
  delBtn: {
    background: "rgba(239,68,68,.08)", border: "1px solid rgba(239,68,68,.15)",
    color: "#fca5a5", padding: "5px 10px", borderRadius: 6, fontSize: 12,
    cursor: "pointer", fontFamily: "inherit",
  },
};
