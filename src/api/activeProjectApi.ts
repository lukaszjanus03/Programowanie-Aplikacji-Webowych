const ACTIVE_KEY = "manageme_active_project";

class ActiveProjectApi {
  get(): string | null {
    return localStorage.getItem(ACTIVE_KEY);
  }

  set(projectId: string): void {
    localStorage.setItem(ACTIVE_KEY, projectId);
  }

  clear(): void {
    localStorage.removeItem(ACTIVE_KEY);
  }
}

export const activeProjectApi = new ActiveProjectApi();
