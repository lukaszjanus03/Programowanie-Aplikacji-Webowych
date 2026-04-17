/**
 * Wspólny interfejs backendu przechowywania danych.
 *
 * Każda "kolekcja" (projects, stories, tasks, notifications, users)
 * jest listą rekordów identyfikowanych przez pole `id`. Backend
 * odpowiada tylko za zapis/odczyt całej kolekcji — filtracje,
 * sortowania i relacje robią warstwy API wyżej.
 *
 * Obie implementacje (LocalStorage, Firestore) muszą zachowywać
 * ten sam kontrakt, żeby API aplikacji mogły być wymienne.
 */
export type CollectionName =
  | "projects"
  | "stories"
  | "tasks"
  | "notifications"
  | "users"
  | "settings";

export interface RecordWithId {
  id: string;
}

export interface StorageBackend {
  /** Pobiera całą kolekcję. */
  loadAll<T extends RecordWithId>(collection: CollectionName): Promise<T[]>;
  /** Zapisuje (upsert) pojedynczy rekord. */
  upsert<T extends RecordWithId>(collection: CollectionName, record: T): Promise<void>;
  /** Usuwa rekord o podanym id. */
  remove(collection: CollectionName, id: string): Promise<void>;
  /** Zapisuje wartość skalarnej konfiguracji (np. aktywny projekt / bieżący user). */
  getSetting(key: string): Promise<string | null>;
  setSetting(key: string, value: string | null): Promise<void>;
}
