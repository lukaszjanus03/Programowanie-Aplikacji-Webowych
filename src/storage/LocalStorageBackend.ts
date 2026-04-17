import {
  CollectionName,
  RecordWithId,
  StorageBackend,
} from "./StorageBackend";

const COLLECTION_KEY: Record<CollectionName, string> = {
  projects:      "manageme_projects",
  stories:       "manageme_stories",
  tasks:         "manageme_tasks",
  notifications: "manageme_notifications",
  users:         "manageme_users",
  settings:      "manageme_settings",
};

export class LocalStorageBackend implements StorageBackend {
  private read<T>(collection: CollectionName): T[] {
    try {
      const raw = localStorage.getItem(COLLECTION_KEY[collection]);
      return raw ? (JSON.parse(raw) as T[]) : [];
    } catch {
      return [];
    }
  }

  private write<T>(collection: CollectionName, data: T[]): void {
    localStorage.setItem(COLLECTION_KEY[collection], JSON.stringify(data));
  }

  async loadAll<T extends RecordWithId>(collection: CollectionName): Promise<T[]> {
    return this.read<T>(collection);
  }

  async upsert<T extends RecordWithId>(collection: CollectionName, record: T): Promise<void> {
    const items = this.read<T>(collection);
    const idx = items.findIndex((x) => x.id === record.id);
    if (idx === -1) items.push(record);
    else items[idx] = record;
    this.write(collection, items);
  }

  async remove(collection: CollectionName, id: string): Promise<void> {
    const items = this.read<RecordWithId>(collection).filter((x) => x.id !== id);
    this.write(collection, items);
  }

  async getSetting(key: string): Promise<string | null> {
    try {
      const raw = localStorage.getItem(COLLECTION_KEY.settings);
      if (!raw) return null;
      const obj = JSON.parse(raw) as Record<string, string>;
      return obj[key] ?? null;
    } catch {
      return null;
    }
  }

  async setSetting(key: string, value: string | null): Promise<void> {
    let obj: Record<string, string> = {};
    try {
      const raw = localStorage.getItem(COLLECTION_KEY.settings);
      if (raw) obj = JSON.parse(raw) as Record<string, string>;
    } catch {
      // noop
    }
    if (value === null) delete obj[key];
    else obj[key] = value;
    localStorage.setItem(COLLECTION_KEY.settings, JSON.stringify(obj));
  }
}
