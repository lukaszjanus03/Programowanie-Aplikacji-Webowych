import { Project, ProjectCreateDTO, ProjectUpdateDTO } from "../models/Project";

const STORAGE_KEY = "manageme_projects";

class ProjectApi {
  getAll(): Project[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Project[]) : [];
    } catch {
      return [];
    }
  }

  getById(id: string): Project | undefined {
    return this.getAll().find((p) => p.id === id);
  }

  private save(projects: Project[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  }

  create(data: ProjectCreateDTO): Project {
    const projects = this.getAll();
    const newProject: Project = {
      id: crypto.randomUUID(),
      name: data.name,
      description: data.description,
    };
    projects.push(newProject);
    this.save(projects);
    return newProject;
  }

  update(id: string, data: ProjectUpdateDTO): Project | null {
    const projects = this.getAll();
    const idx = projects.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    projects[idx] = { ...projects[idx], ...data };
    this.save(projects);
    return projects[idx];
  }

  delete(id: string): void {
    const projects = this.getAll().filter((p) => p.id !== id);
    this.save(projects);
  }
}

// Singleton – w przyszłości podmienisz implementację na NoSQL
export const projectApi = new ProjectApi();
