import { useState, useEffect, useCallback } from "react";
import { Task } from "../models/Task";
import { Story } from "../models/Story";
import { User } from "../models/User";
import { taskApi } from "../api/taskApi";
import { storyApi } from "../api/storyApi";
import { userManager } from "../api/userManager";
import { notificationService } from "../services/notificationService";
import { useTheme } from "../ThemeContext";

interface TaskDetailProps {
  taskId: string;
  onBack: () => void;
  onUpdated: () => void;
}

const PRIO_MAP = {
  low:    { label: "Niski",  color: "text-slate-400",  border: "border-slate-400" },
  medium: { label: "Średni", color: "text-amber-400",  border: "border-amber-400" },
  high:   { label: "Wysoki", color: "text-red-400",    border: "border-red-400"   },
};

const STATUS_MAP = {
  todo:  { label: "To Do",     color: "text-amber-400",   bg: "bg-amber-400/10"   },
  doing: { label: "W trakcie", color: "text-blue-400",    bg: "bg-blue-400/10"    },
  done:  { label: "Gotowe",    color: "text-emerald-400", bg: "bg-emerald-400/10" },
};

const ROLE_MAP = {
  admin:     { label: "Admin",     color: "text-purple-400", border: "border-purple-400" },
  developer: { label: "Developer", color: "text-blue-400",   border: "border-blue-400"  },
  devops:    { label: "DevOps",    color: "text-amber-400",  border: "border-amber-400" },
};

export default function TaskDetail({ taskId, onBack, onUpdated }: TaskDetailProps) {
  const [task, setTask] = useState<Task | null>(null);
  const [story, setStory] = useState<Story | null>(null);
  const [assignedUser, setAssignedUser] = useState<User | undefined>(undefined);
  const [assignableUsers, setAssignableUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [toast, setToast] = useState<string | null>(null);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const reload = useCallback(() => {
    const t = taskApi.getById(taskId);
    if (!t) return;
    setTask(t);
    const s = storyApi.getById(t.storyId);
    setStory(s ?? null);
    if (t.assignedUserId) setAssignedUser(userManager.getUserById(t.assignedUserId));
    setAssignableUsers(userManager.getAssignableUsers());
  }, [taskId]);

  useEffect(() => { reload(); }, [reload]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2400);
    return () => clearTimeout(t);
  }, [toast]);

  const handleAssign = () => {
    if (!selectedUserId || !task) return;
    taskApi.assignUser(task.id, selectedUserId);
    if (story && story.status === "todo") storyApi.update(story.id, { status: "doing" });

    // Notification: user assigned to task
    const assignee = userManager.getUserById(selectedUserId);
    if (assignee && story) {
      const assigneeName = `${assignee.firstName} ${assignee.lastName}`;
      notificationService.notifyUserAssigned(assigneeName, task.name, "zadanie", assignee.id);
      // Notify story owner about status change (doing)
      notificationService.notifyTaskStatusChanged(task.name, story.name, "doing", story.ownerId);
    }

    setToast("Zadanie przypisane ✓");
    reload();
    onUpdated();
  };

  const handleMarkDone = () => {
    if (!task) return;
    taskApi.markDone(task.id);
    if (story) {
      const allTasks = taskApi.getByStory(story.id);
      const allUpdated = allTasks.map((t) => (t.id === task.id ? { ...t, status: "done" as const } : t));
      if (allUpdated.every((t) => t.status === "done")) storyApi.update(story.id, { status: "done" });
      // Notification: task status changed to done
      notificationService.notifyTaskStatusChanged(task.name, story.name, "done", story.ownerId);
    }
    setToast("Zadanie zakończone ✓");
    reload();
    onUpdated();
  };

  if (!task) return <div className={`p-10 text-sm ${isDark ? "text-slate-500" : "text-slate-400"}`}>Ładowanie...</div>;

  const prio = PRIO_MAP[task.priority];
  const status = STATUS_MAP[task.status];
  const fmt = (iso?: string) => iso ? new Date(iso).toLocaleString("pl-PL") : "—";

  const cardCls = `rounded-2xl border p-6 ${isDark ? "bg-white/5 border-white/10" : "bg-white border-slate-200 shadow-sm"}`;
  const inputCls = `form-input ${isDark ? "bg-white/5 border-white/10 text-slate-100" : "bg-slate-50 border-slate-200 text-slate-900"}`;

  return (
    <div className="pb-10">
      {toast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-white px-6 py-2.5 rounded-xl font-semibold text-sm shadow-xl shadow-emerald-500/30 animate-toast-in">
          {toast}
        </div>
      )}

      {/* Top bar */}
      <div className="flex items-center gap-4 mb-7">
        <button
          className={`px-4 py-2 rounded-lg text-sm border transition-colors ${isDark ? "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10" : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50 shadow-sm"}`}
          onClick={onBack}
        >
          ← Kanban
        </button>
        <h2 className={`text-xl font-bold tracking-tight ${isDark ? "text-slate-100" : "text-slate-900"}`}>Szczegóły zadania</h2>
      </div>

      <div className="grid gap-5" style={{ gridTemplateColumns: "1fr 360px" }}>
        {/* Left: main info */}
        <div className={cardCls}>
          <div className="flex gap-2.5 mb-4">
            <span className={`text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-md ${status.color} ${status.bg}`}>
              {status.label}
            </span>
            <span className={`text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-md border ${prio.color} ${prio.border}`}>
              {prio.label}
            </span>
          </div>

          <h3 className={`text-2xl font-bold mb-2.5 ${isDark ? "text-slate-100" : "text-slate-900"}`}>{task.name}</h3>
          {task.description && (
            <p className={`text-sm leading-relaxed mb-5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>{task.description}</p>
          )}

          <div className={`flex flex-col divide-y ${isDark ? "divide-white/5" : "divide-slate-100"}`}>
            {[
              ["Historyjka", story ? story.name : "—"],
              ["Szacowany czas", `${task.estimatedHours} h`],
              ["Data dodania", fmt(task.createdAt)],
              ["Data startu", fmt(task.startedAt)],
              ["Data zakończenia", fmt(task.finishedAt)],
            ].map(([label, value]) => (
              <div key={label} className="flex gap-3 py-2.5">
                <span className={`text-sm min-w-44 ${isDark ? "text-slate-500" : "text-slate-400"}`}>{label}</span>
                <span className={`text-sm font-medium ${isDark ? "text-slate-200" : "text-slate-800"}`}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: assignment */}
        <div>
          <div className={cardCls}>
            <h4 className={`text-sm font-bold mb-4 ${isDark ? "text-slate-100" : "text-slate-900"}`}>👤 Przypisana osoba</h4>

            {assignedUser ? (
              <div className="flex items-center gap-3.5 mb-4">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-sm text-white shrink-0">
                  {assignedUser.firstName[0]}{assignedUser.lastName[0]}
                </div>
                <div>
                  <div className={`text-sm font-semibold mb-1 ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                    {assignedUser.firstName} {assignedUser.lastName}
                  </div>
                  <span className={`text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${ROLE_MAP[assignedUser.role].color} ${ROLE_MAP[assignedUser.role].border}`}>
                    {ROLE_MAP[assignedUser.role].label}
                  </span>
                </div>
              </div>
            ) : (
              <p className={`text-sm mb-4 ${isDark ? "text-slate-600" : "text-slate-400"}`}>Brak przypisanej osoby</p>
            )}

            {task.status === "todo" && (
              <div className={`border-t pt-4 ${isDark ? "border-white/[0.07]" : "border-slate-100"}`}>
                <label className={`form-label ${isDark ? "text-slate-400" : "text-slate-500"}`}>Przypisz osobę</label>
                <select className={`${inputCls} mb-3`} value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)}>
                  <option value="">— wybierz —</option>
                  {assignableUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.firstName} {u.lastName} ({ROLE_MAP[u.role].label})
                    </option>
                  ))}
                </select>
                <button
                  className={`w-full btn-primary justify-center ${!selectedUserId ? "opacity-45 cursor-not-allowed" : ""}`}
                  onClick={handleAssign}
                  disabled={!selectedUserId}
                >
                  Przypisz i rozpocznij
                </button>
              </div>
            )}
          </div>

          {task.status === "doing" && (
            <div className={`${cardCls} mt-4`}>
              <h4 className={`text-sm font-bold mb-2 ${isDark ? "text-slate-100" : "text-slate-900"}`}>✅ Zakończ zadanie</h4>
              <p className={`text-xs leading-relaxed mb-4 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Kliknięcie zakończy zadanie i uzupełni datę zakończenia.
              </p>
              <button
                className="w-full px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg shadow-emerald-500/30 hover:opacity-90 transition-opacity cursor-pointer"
                onClick={handleMarkDone}
              >
                Oznacz jako gotowe
              </button>
            </div>
          )}

          {task.status === "done" && (
            <div className={`mt-4 rounded-2xl border p-6 ${isDark ? "bg-emerald-500/5 border-emerald-500/25" : "bg-emerald-50 border-emerald-200"}`}>
              <div className="text-3xl mb-2">🎉</div>
              <p className="text-emerald-500 font-bold text-sm mb-1">Zadanie zostało zakończone</p>
              <p className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>{fmt(task.finishedAt)}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
