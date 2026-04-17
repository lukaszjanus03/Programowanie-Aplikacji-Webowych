import { IS_FIREBASE_CONFIGURED, STORAGE_MODE, StorageMode } from "../config";
import { FirestoreBackend } from "./FirestoreBackend";
import { LocalStorageBackend } from "./LocalStorageBackend";
import { CollectionName, RecordWithId, StorageBackend } from "./StorageBackend";

const OVERRIDE_KEY = "manageme_storage_mode_override";

/**
 * Pozwala użytkownikowi wybrać tryb magazynu przez UI (przełącznik w headerze).
 * Wartość trzymana w localStorage (zawsze dostępnym) i nadpisuje wartość z .env.
 * Pusta / nieznana wartość = brak nadpisania (używamy VITE_STORAGE_MODE).
 */
function readOverride(): StorageMode | null {
  try {
    const raw = localStorage.getItem(OVERRIDE_KEY);
    if (raw === "local" || raw === "firestore") return raw;
    return null;
  } catch {
    return null;
  }
}

export function getStorageOverride(): StorageMode | null {
  return readOverride();
}

export function setStorageOverride(mode: StorageMode | null): void {
  try {
    if (mode === null) localStorage.removeItem(OVERRIDE_KEY);
    else localStorage.setItem(OVERRIDE_KEY, mode);
  } catch {
    // noop — np. localStorage wyłączony
  }
}

const OVERRIDE = readOverride();
const REQUESTED_MODE: StorageMode = OVERRIDE ?? STORAGE_MODE;

/**
 * Efektywny tryb przechowywania:
 *  - "firestore" tylko gdy wybrany I mamy klucze Firebase
 *  - w pozostałych wypadkach: localStorage
 */
export const EFFECTIVE_STORAGE_MODE: StorageMode =
  REQUESTED_MODE === "firestore" && IS_FIREBASE_CONFIGURED ? "firestore" : "local";

/** Tryb, który użytkownik *chciał* ustawić (niekoniecznie aktywny, jeśli
 *  Firebase nie jest skonfigurowany). Przydatne dla UI. */
export const REQUESTED_STORAGE_MODE: StorageMode = REQUESTED_MODE;

function createBackend(): StorageBackend {
  if (EFFECTIVE_STORAGE_MODE === "firestore") {
    return new FirestoreBackend();
  }
  return new LocalStorageBackend();
}

export const backend: StorageBackend = createBackend();

/**
 * Store trzyma w pamięci kopie wszystkich kolekcji. Pozwala to API czytać
 * dane synchronicznie (jak dotąd z localStorage), a zapisy propaguje do
 * backendu asynchronicznie.
 *
 * Na start aplikacji trzeba wywołać `store.bootstrap()` — ono dociąga dane.
 * Metody write (upsert/remove) są async, ale update cache dzieje się od razu,
 * więc UI nie czeka.
 */
class Store {
  private cache: Partial<Record<CollectionName, RecordWithId[]>> = {};
  private bootstrapped = false;

  async bootstrap(): Promise<void> {
    if (this.bootstrapped) return;
    const cols: CollectionName[] = ["projects", "stories", "tasks", "notifications", "users"];
    const results = await Promise.all(cols.map((c) => backend.loadAll(c)));
    cols.forEach((c, i) => {
      this.cache[c] = results[i];
    });
    this.bootstrapped = true;
  }

  isReady(): boolean {
    return this.bootstrapped;
  }

  getAll<T extends RecordWithId>(collection: CollectionName): T[] {
    return (this.cache[collection] as T[] | undefined) ?? [];
  }

  async upsert<T extends RecordWithId>(collection: CollectionName, record: T): Promise<void> {
    const list = [...(this.cache[collection] ?? [])];
    const idx = list.findIndex((x) => x.id === record.id);
    if (idx === -1) list.push(record);
    else list[idx] = record;
    this.cache[collection] = list;
    await backend.upsert(collection, record);
  }

  async remove(collection: CollectionName, id: string): Promise<void> {
    this.cache[collection] = (this.cache[collection] ?? []).filter((x) => x.id !== id);
    await backend.remove(collection, id);
  }

  async getSetting(key: string): Promise<string | null> {
    return backend.getSetting(key);
  }

  async setSetting(key: string, value: string | null): Promise<void> {
    await backend.setSetting(key, value);
  }
}

export const store = new Store();
