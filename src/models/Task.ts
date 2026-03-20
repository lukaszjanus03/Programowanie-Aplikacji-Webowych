import { Priority } from "./Story";

export type TaskStatus = "todo" | "doing" | "done";

export interface Task {
  id: string;
  name: string;
  description: string;
  priority: Priority;
  storyId: string;
  estimatedHours: number;
  status: TaskStatus;
  createdAt: string;
  startedAt?: string;
  finishedAt?: string;
  assignedUserId?: string;
}

export type TaskCreateDTO = Omit<Task, "id" | "createdAt" | "startedAt" | "finishedAt" | "assignedUserId">;
export type TaskUpdateDTO = Partial<Omit<Task, "id" | "createdAt">>;
