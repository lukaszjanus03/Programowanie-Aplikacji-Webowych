import { User, UserRole } from "../models/User";
import { store } from "../storage";

const CURRENT_USER_KEY = "current_user_id";

class UserManager {
  getAll(): User[] {
    return store.getAll<User>("users");
  }

  getById(id: string): User | undefined {
    return this.getAll().find((u) => u.id === id);
  }

  /** Alias zachowany dla kompatybilności z istniejącymi komponentami. */
  getUserById(id: string): User | undefined {
    return this.getById(id);
  }

  getByEmail(email: string): User | undefined {
    const needle = email.toLowerCase();
    return this.getAll().find((u) => u.email.toLowerCase() === needle);
  }

  async create(data: Omit<User, "id">): Promise<User> {
    const newUser: User = { ...data, id: crypto.randomUUID() };
    await store.upsert("users", newUser);
    return newUser;
  }

  async updateRole(id: string, role: UserRole): Promise<User | undefined> {
    const existing = this.getById(id);
    if (!existing) return undefined;
    const updated: User = { ...existing, role };
    await store.upsert("users", updated);
    return updated;
  }

  async setBlocked(id: string, isBlocked: boolean): Promise<User | undefined> {
    const existing = this.getById(id);
    if (!existing) return undefined;
    const updated: User = { ...existing, isBlocked };
    await store.upsert("users", updated);
    return updated;
  }

  /** Użytkownicy, których można przypisać do zadań (developer + devops, odblokowani). */
  getAssignableUsers(): User[] {
    return this.getAll().filter(
      (u) => !u.isBlocked && (u.role === "developer" || u.role === "devops")
    );
  }

  getAdmins(): User[] {
    return this.getAll().filter((u) => !u.isBlocked && u.role === "admin");
  }

  getFullName(user: User): string {
    return `${user.firstName} ${user.lastName}`;
  }

  // --- zapamiętywanie aktualnie zalogowanego użytkownika ---
  private currentUserIdCache: string | null = null;
  private currentUserLoaded = false;

  async bootstrapCurrentUser(): Promise<void> {
    this.currentUserIdCache = await store.getSetting(CURRENT_USER_KEY);
    this.currentUserLoaded = true;
  }

  getCurrentUserId(): string | null {
    return this.currentUserLoaded ? this.currentUserIdCache : null;
  }

  setCurrentUserId(id: string | null): void {
    this.currentUserIdCache = id;
    this.currentUserLoaded = true;
    void store.setSetting(CURRENT_USER_KEY, id);
  }
}

export const userManager = new UserManager();
