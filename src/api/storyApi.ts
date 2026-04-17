import { Story, StoryCreateDTO, StoryUpdateDTO } from "../models/Story";
import { store } from "../storage";

class StoryApi {
  getAll(): Story[] {
    return store.getAll<Story>("stories");
  }

  getByProject(projectId: string): Story[] {
    return this.getAll().filter((s) => s.projectId === projectId);
  }

  getById(id: string): Story | undefined {
    return this.getAll().find((s) => s.id === id);
  }

  async create(data: StoryCreateDTO): Promise<Story> {
    const newStory: Story = {
      id: crypto.randomUUID(),
      name: data.name,
      description: data.description,
      priority: data.priority,
      projectId: data.projectId,
      createdAt: new Date().toISOString(),
      status: data.status,
      ownerId: data.ownerId,
    };
    await store.upsert("stories", newStory);
    return newStory;
  }

  async update(id: string, data: StoryUpdateDTO): Promise<Story | null> {
    const existing = this.getById(id);
    if (!existing) return null;
    const updated = { ...existing, ...data };
    await store.upsert("stories", updated);
    return updated;
  }

  async delete(id: string): Promise<void> {
    await store.remove("stories", id);
  }
}

export const storyApi = new StoryApi();
