import { useState, useEffect, useCallback } from "react";
import { Project } from "./models/Project";
import { Notification } from "./models/Notification";
import { projectApi } from "./api/projectApi";
import { activeProjectApi } from "./api/activeProjectApi";
import { notificationApi } from "./api/notificationApi";
import { userManager } from "./api/userManager";
import { notificationService } from "./services/notificationService";
import { useTheme } from "./ThemeContext";
import ProjectForm from "./components/ProjectForm";
import DeleteConfirm from "./components/DeleteConfirm";
import StoryBoard from "./components/StoryBoard";
import NotificationBadge from "./components/NotificationBadge";
import NotificationList from "./components/NotificationList";
import NotificationDetail from "./components/NotificationDetail";
import NotificationDialog from "./components/NotificationDialog";

type View =
  | { kind: "projects" }
  | { kind: "stories" }
  | { kind: "notifications" }
  | { kind: "notificationDetail"; id: string };

export default function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [view, setView] = useState<View>({ kind: "projects" });
  const [unreadCount, setUnreadCount] = useState(0);
  const [dialogNotification, setDialogNotification] = useState<Notification | null>(null);

  const { theme, toggleTheme } = useTheme();
  const user = userManager.getLoggedUser();
  const reload = useCallback(() => setProjects(projectApi.getAll()), []);
  const isDark = theme === "dark";

  const refreshNotifications = useCallback(() => {
    setUnreadCount(notificationApi.getUnreadCount(user.id));
  }, [user.id]);

  useEffect(() => {
    reload();
    refreshNotifications();
    const saved = activeProjectApi.get();
    if (saved) {
      setActiveProjectId(saved);
      setView({ kind: "stories" });
    }
  }, [reload, refreshNotifications]);

  // Subscribe to real-time notification events
  useEffect(() => {
    const unsub = notificationService.subscribe((notification) => {
      refreshNotifications();
      // Show dialog for medium and high priority notifications for the current user
      if (
        notification.recipientId === user.id &&
        (notification.prority === "medium" || notification.prority === "high")
      ) {
        setDialogNotification(notification);
      }
    });
    return unsub;
  }, [refreshNotifications, user.id]);

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
      notificationService.notifyProjectCreated(name);
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
        setView({ kind: "projects" });
      }
      reload();
      setDeleteId(null);
      setToast("Projekt usunięty");
    }
  };

  const selectProject = (id: string) => {
    activeProjectApi.set(id);
    setActiveProjectId(id);
    setView({ kind: "stories" });
  };

  const goBackToProjects = () => {
    activeProjectApi.clear();
    setActiveProjectId(null);
    setView({ kind: "projects" });
  };

  const openNotifications = () => {
    setView({ kind: "notifications" });
    setActiveProjectId(null);
    activeProjectApi.clear();
  };

  const openNotificationDetail = (id: string) => {
    setDialogNotification(null);
    setView({ kind: "notificationDetail", id });
  };

  const backFromNotificationDetail = () => {
    setView({ kind: "notifications" });
  };

  const backFromNotifications = () => {
    setView({ kind: "projects" });
  };

  const activeProject = projects.find((p) => p.id === activeProjectId);

  const renderMain = () => {
    if (view.kind === "notificationDetail") {
      const n = notificationApi.getById(view.id);
      if (!n) return <p className={`text-sm ${isDark ? "text-slate-500" : "text-slate-400"}`}>Nie znaleziono powiadomienia.</p>;
      return (
        <NotificationDetail
          notification={n}
          onBack={backFromNotificationDetail}
          onRefresh={refreshNotifications}
        />
      );
    }

    if (view.kind === "notifications") {
      const notifications = notificationApi.getByRecipient(user.id);
      return (
        <NotificationList
          notifications={notifications}
          onBack={backFromNotifications}
          onSelect={openNotificationDetail}
          onRefresh={refreshNotifications}
          userId={user.id}
        />
      );
    }

    if (view.kind === "stories" && activeProject) {
      return (
        <StoryBoard
          projectId={activeProject.id}
          projectName={activeProject.name}
          onBack={goBackToProjects}
        />
      );
    }

    // Default: projects view
    return (
      <>
        {/* Stats */}
        <div className="flex gap-4 mb-8">
          <div className={`rounded-2xl px-7 py-5 border flex flex-col gap-1 min-w-[140px] ${
            isDark ? "bg-white/5 border-white/10" : "bg-white border-slate-200 shadow-sm"
          }`}>
            <span className="text-3xl font-bold font-mono bg-gradient-to-br from-indigo-400 to-purple-500 bg-clip-text text-transparent">
              {projects.length}
            </span>
            <span className={`text-xs uppercase tracking-widest font-semibold ${isDark ? "text-slate-500" : "text-slate-400"}`}>
              Projektów
            </span>
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📁</div>
            <p className={`text-xl font-bold mb-2 ${isDark ? "text-slate-200" : "text-slate-800"}`}>
              Brak projektów
            </p>
            <p className={`text-sm ${isDark ? "text-slate-500" : "text-slate-400"}`}>
              Kliknij „Nowy projekt" aby rozpocząć
            </p>
          </div>
        ) : (
          <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))" }}>
            {projects.map((p, i) => (
              <div
                key={p.id}
                className={`rounded-2xl p-6 border animate-fade-slide-up transition-colors ${
                  isDark
                    ? "bg-white/5 border-white/10 hover:bg-white/[0.08]"
                    : "bg-white border-slate-200 shadow-sm hover:shadow-md"
                }`}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 shrink-0 animate-pulse-glow" />
                  <h3 className={`text-base font-bold tracking-tight ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                    {p.name}
                  </h3>
                </div>
                <p className={`text-sm mb-3 leading-relaxed ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  {p.description || "Brak opisu"}
                </p>
                <div className={`text-xs font-mono mb-5 ${isDark ? "text-slate-600" : "text-slate-400"}`}>
                  ID: {p.id.slice(0, 8)}…
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button className="btn-primary text-xs px-3.5 py-1.5" onClick={() => selectProject(p.id)}>
                    🚀 Wybierz
                  </button>
                  <button
                    className={`px-3.5 py-1.5 rounded-lg text-xs border transition-colors ${
                      isDark
                        ? "bg-indigo-500/10 border-indigo-500/25 text-indigo-300 hover:bg-indigo-500/20"
                        : "bg-indigo-50 border-indigo-200 text-indigo-600 hover:bg-indigo-100"
                    }`}
                    onClick={() => openEdit(p)}
                  >
                    ✏️ Edytuj
                  </button>
                  <button
                    className={`px-3.5 py-1.5 rounded-lg text-xs border transition-colors ${
                      isDark
                        ? "bg-red-500/10 border-red-500/20 text-red-300 hover:bg-red-500/15"
                        : "bg-red-50 border-red-200 text-red-500 hover:bg-red-100"
                    }`}
                    onClick={() => handleDeleteRequest(p.id)}
                  >
                    🗑 Usuń
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </>
    );
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${
      isDark
        ? "bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 text-slate-200"
        : "bg-gradient-to-br from-slate-100 via-indigo-50 to-slate-100 text-slate-900"
    }`}>

      {/* Toast */}
      {toast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-white px-6 py-2.5 rounded-xl font-semibold text-sm shadow-xl shadow-emerald-500/30 animate-toast-in">
          {toast}
        </div>
      )}

      {/* Notification Dialog (medium/high priority) */}
      {dialogNotification && (
        <NotificationDialog
          notification={dialogNotification}
          onClose={() => setDialogNotification(null)}
          onViewDetail={openNotificationDetail}
        />
      )}

      {/* Header */}
      <header className={`sticky top-0 z-40 border-b backdrop-blur-xl transition-colors duration-300 ${
        isDark
          ? "border-white/5 bg-slate-950/70"
          : "border-slate-200/60 bg-white/70"
      }`}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between flex-wrap gap-3">
          {/* Logo + title */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => { goBackToProjects(); }}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-mono font-bold text-xl text-white shadow-lg shadow-indigo-500/30">
              M
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight leading-none">ManageMe</h1>
              <p className={`text-xs uppercase tracking-widest mt-0.5 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                Zarządzanie projektami
              </p>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3 flex-wrap">
            {view.kind === "projects" && (
              <button className="btn-primary" onClick={openCreate}>
                <span className="text-lg leading-none">+</span>
                <span>Nowy projekt</span>
              </button>
            )}

            {/* Notifications link in menu */}
            <button
              className={`px-4 py-2 rounded-xl text-sm border transition-colors ${
                view.kind === "notifications" || view.kind === "notificationDetail"
                  ? isDark
                    ? "bg-indigo-500/15 border-indigo-500/30 text-indigo-300"
                    : "bg-indigo-50 border-indigo-200 text-indigo-600"
                  : isDark
                    ? "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
                    : "bg-black/5 border-black/10 text-slate-500 hover:bg-black/10"
              }`}
              onClick={openNotifications}
            >
              📋 Powiadomienia
            </button>

            {/* Notification bell badge */}
            <NotificationBadge count={unreadCount} onClick={openNotifications} />

            {/* Dark mode toggle */}
            <button
              onClick={toggleTheme}
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-colors ${
                isDark
                  ? "bg-white/5 border border-white/10 hover:bg-white/10"
                  : "bg-black/5 border border-black/10 hover:bg-black/10"
              }`}
              title={isDark ? "Tryb jasny" : "Tryb ciemny"}
            >
              {isDark ? "☀️" : "🌙"}
            </button>

            {/* User badge */}
            <div className={`flex items-center gap-2.5 px-4 py-2 rounded-xl border ${
              isDark
                ? "bg-white/5 border-white/10"
                : "bg-black/5 border-black/10"
            }`}>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-red-500 flex items-center justify-center text-xs font-bold text-white">
                {user.firstName[0]}{user.lastName[0]}
              </div>
              <div>
                <span className={`text-sm font-semibold block leading-none ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                  {user.firstName} {user.lastName}
                </span>
                <span className="text-xs font-bold text-purple-500 uppercase tracking-widest">
                  {user.role}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-6 py-8 pb-16">
        {renderMain()}
      </main>

      {formOpen && (
        <ProjectForm project={editingProject} onSubmit={handleSubmit} onCancel={closeForm} />
      )}
      {deleteId && (
        <DeleteConfirm onConfirm={handleDeleteConfirm} onCancel={() => setDeleteId(null)} />
      )}
    </div>
  );
}
