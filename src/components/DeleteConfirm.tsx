interface DeleteConfirmProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteConfirm({ onConfirm, onCancel }: DeleteConfirmProps) {
  return (
    <div style={styles.overlay} onClick={onCancel}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 style={styles.title}>Potwierdź usunięcie</h2>
        <p style={styles.desc}>
          Czy na pewno chcesz usunąć ten projekt? Tej operacji nie można cofnąć.
        </p>
        <div style={styles.actions}>
          <button style={styles.cancelBtn} onClick={onCancel}>
            Anuluj
          </button>
          <button style={styles.deleteBtn} onClick={onConfirm}>
            Tak, usuń
          </button>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,.6)",
    backdropFilter: "blur(6px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
    padding: 20,
  },
  modal: {
    background: "#1e293b",
    border: "1px solid rgba(255,255,255,.1)",
    borderRadius: 18,
    padding: 32,
    width: "100%",
    maxWidth: 420,
    animation: "fadeSlideUp .3s ease",
  },
  title: {
    margin: "0 0 12px",
    fontSize: 22,
    fontWeight: 700,
    color: "#ef4444",
  },
  desc: {
    color: "#94a3b8",
    margin: "0 0 24px",
    fontSize: 15,
    lineHeight: 1.5,
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
  },
  cancelBtn: {
    background: "transparent",
    border: "1px solid rgba(255,255,255,.12)",
    color: "#94a3b8",
    padding: "10px 20px",
    borderRadius: 10,
    fontSize: 14,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  deleteBtn: {
    background: "linear-gradient(135deg, #ef4444, #dc2626)",
    border: "none",
    color: "#fff",
    padding: "10px 20px",
    borderRadius: 10,
    fontWeight: 600,
    fontSize: 14,
    cursor: "pointer",
    fontFamily: "inherit",
    boxShadow: "0 4px 20px rgba(239,68,68,.3)",
  },
};
