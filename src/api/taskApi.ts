import { Task, TaskCreateDTO, TaskUpdateDTO } from "../models/Task";

const STORAGE_KEY = "manageme_tasks";

class TaskApi {
  getAll(): Task[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Task[]) : [];
    } catch {
      return [];
    }
  }

  getByStory(storyId: string): Task[] {
    return this.getAll().filter((t) => t.storyId === storyId);
  }

  getById(id: string): Task | undefined {
    return this.getAll().find((t) => t.id === id);
  }

  private save(tasks: Task[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }

  create(data: TaskCreateDTO): Task {
    const tasks = this.getAll();
    const newTask: Task = {
      id: crypto.randomUUID(),
      name: data.name,
      description: data.description,
      priority: data.priority,
      storyId: data.storyId,
      estimatedHours: data.estimatedHours,
      status: "todo",
      createdAt: new Date().toISOString(),
    };
    tasks.push(newTask);
    this.save(tasks);
    return newTask;
  }

  update(id: string, data: TaskUpdateDTO): Task | null {
    const tasks = this.getAll();
    const idx = tasks.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    tasks[idx] = { ...tasks[idx], ...data };
    this.save(tasks);
    return tasks[idx];
  }

  assignUser(id: string, userId: string): Task | null {
    const tasks = this.getAll();
    const idx = tasks.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    tasks[idx] = {
      ...tasks[idx],
      assignedUserId: userId,
      status: "doing",
      startedAt: new Date().toISOString(),
    };
    this.save(tasks);
    return tasks[idx];
  }

  markDone(id: string): Task | null {
    const tasks = this.getAll();
    const idx = tasks.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    tasks[idx] = {
      ...tasks[idx],
      status: "done",
      finishedAt: new Date().toISOString(),
    };
    this.save(tasks);
    return tasks[idx];
  }

  delete(id: string): void {
    const tasks = this.getAll().filter((t) => t.id !== id);
    this.save(tasks);
  }
}

export const taskApi = new TaskApi();
