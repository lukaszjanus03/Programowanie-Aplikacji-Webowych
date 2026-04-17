import { Project, ProjectCreateDTO, ProjectUpdateDTO } from "../models/Project";
import { store } from "../storage";

class ProjectApi {
  getAll(): Project[] {
    return store.getAll<Project>("projects");
  }

  getById(id: string): Project | undefined {
    return this.getAll().find((p) => p.id === id);
  }

  async create(data: ProjectCreateDTO): Promise<Project> {
    const newProject: Project = {
      id: crypto.randomUUID(),
      name: data.name,
      description: data.description,
    };
    await store.upsert("projects", newProject);
    return newProject;
  }

  async update(id: string, data: ProjectUpdateDTO): Promise<Project | null> {
    const existing = this.getById(id);
    if (!existing) return null;
    const updated = { ...existing, ...data };
    await store.upsert("projects", updated);
    return updated;
  }

  async delete(id: string): Promise<void> {
    await store.remove("projects", id);
  }
}

export const projectApi = new ProjectApi();
