import { Story, StoryCreateDTO, StoryUpdateDTO } from "../models/Story";

const STORAGE_KEY = "manageme_stories";

class StoryApi {
  getAll(): Story[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Story[]) : [];
    } catch {
      return [];
    }
  }

  getByProject(projectId: string): Story[] {
    return this.getAll().filter((s) => s.projectId === projectId);
  }

  getById(id: string): Story | undefined {
    return this.getAll().find((s) => s.id === id);
  }

  private save(stories: Story[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stories));
  }

  create(data: StoryCreateDTO): Story {
    const stories = this.getAll();
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
    stories.push(newStory);
    this.save(stories);
    return newStory;
  }

  update(id: string, data: StoryUpdateDTO): Story | null {
    const stories = this.getAll();
    const idx = stories.findIndex((s) => s.id === id);
    if (idx === -1) return null;
    stories[idx] = { ...stories[idx], ...data };
    this.save(stories);
    return stories[idx];
  }

  delete(id: string): void {
    const stories = this.getAll().filter((s) => s.id !== id);
    this.save(stories);
  }
}

export const storyApi = new StoryApi();
