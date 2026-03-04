export interface Project {
  id: string;
  name: string;
  description: string;
}

export type ProjectCreateDTO = Omit<Project, "id">;
export type ProjectUpdateDTO = Partial<ProjectCreateDTO>;
