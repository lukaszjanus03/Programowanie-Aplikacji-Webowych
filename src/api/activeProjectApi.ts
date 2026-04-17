import { store } from "../storage";

/**
 * Pamięta aktywny projekt w ustawieniach store'a. W trybie localStorage
 * leży to w localStorage (jak dotąd), w trybie firestore — w kolekcji
 * `settings` z kluczem `active_project`.
 *
 * Interfejs synchroniczny zachowany dla wygody komponentów — wartość
 * cache'owana jest w pamięci procesu po pierwszym odczycie.
 */
class ActiveProjectApi {
  private readonly KEY = "active_project";
  private cache: string | null = null;
  private loaded = false;

  async bootstrap(): Promise<void> {
    this.cache = await store.getSetting(this.KEY);
    this.loaded = true;
  }

  get(): string | null {
    return this.loaded ? this.cache : null;
  }

  set(id: string): void {
    this.cache = id;
    this.loaded = true;
    void store.setSetting(this.KEY, id);
  }

  clear(): void {
    this.cache = null;
    this.loaded = true;
    void store.setSetting(this.KEY, null);
  }
}

export const activeProjectApi = new ActiveProjectApi();
