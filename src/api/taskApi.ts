import { Task, TaskCreateDTO, TaskUpdateDTO } from "../models/Task";
import { store } from "../storage";

class TaskApi {
  getAll(): Task[] {
    return store.getAll<Task>("tasks");
  }

  getByStory(storyId: string): Task[] {
    return this.getAll().filter((t) => t.storyId === storyId);
  }

  getById(id: string): Task | undefined {
    return this.getAll().find((t) => t.id === id);
  }

  async create(data: TaskCreateDTO): Promise<Task> {
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
    await store.upsert("tasks", newTask);
    return newTask;
  }

  async update(id: string, data: TaskUpdateDTO): Promise<Task | null> {
    const existing = this.getById(id);
    if (!existing) return null;
    const updated: Task = { ...existing, ...data };
    await store.upsert("tasks", updated);
    return updated;
  }

  async assignUser(id: string, userId: string): Promise<Task | null> {
    const existing = this.getById(id);
    if (!existing) return null;
    const updated: Task = {
      ...existing,
      assignedUserId: userId,
      status: "doing",
      startedAt: new Date().toISOString(),
    };
    await store.upsert("tasks", updated);
    return updated;
  }

  async markDone(id: string): Promise<Task | null> {
    const existing = this.getById(id);
    if (!existing) return null;
    const updated: Task = {
      ...existing,
      status: "done",
      finishedAt: new Date().toISOString(),
    };
    await store.upsert("tasks", updated);
    return updated;
  }

  async delete(id: string): Promise<void> {
    await store.remove("tasks", id);
  }
}

export const taskApi = new TaskApi();
