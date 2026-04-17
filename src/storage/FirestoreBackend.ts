import {
  collection as fsCollection,
  doc,
  deleteDoc,
  getDoc,
  getDocs,
  setDoc,
} from "firebase/firestore";
import { getDb } from "./firebase";
import {
  CollectionName,
  RecordWithId,
  StorageBackend,
} from "./StorageBackend";

const FIRESTORE_COLLECTION: Record<CollectionName, string> = {
  projects:      "projects",
  stories:       "stories",
  tasks:         "tasks",
  notifications: "notifications",
  users:         "users",
  settings:      "settings",
};

/**
 * Implementacja backendu oparta o Google Cloud Firestore.
 * Każdy rekord z aplikacji zapisywany jest jako dokument z id = record.id.
 * Ustawienia (bieżący user, aktywny projekt) trzymane są w kolekcji
 * `settings`, każda pod osobnym dokumentem z polem `value`.
 */
export class FirestoreBackend implements StorageBackend {
  async loadAll<T extends RecordWithId>(collectionName: CollectionName): Promise<T[]> {
    const db = getDb();
    const ref = fsCollection(db, FIRESTORE_COLLECTION[collectionName]);
    const snap = await getDocs(ref);
    return snap.docs.map((d) => d.data() as T);
  }

  async upsert<T extends RecordWithId>(collectionName: CollectionName, record: T): Promise<void> {
    const db = getDb();
    const ref = doc(db, FIRESTORE_COLLECTION[collectionName], record.id);
    // Klonujemy, żeby nie serializować metod/referencji; Firestore radzi sobie z
    // obiektami prostymi, ale undefined w polach nie jest dozwolone → wycinamy.
    const clean: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(record)) {
      if (v !== undefined) clean[k] = v;
    }
    await setDoc(ref, clean);
  }

  async remove(collectionName: CollectionName, id: string): Promise<void> {
    const db = getDb();
    await deleteDoc(doc(db, FIRESTORE_COLLECTION[collectionName], id));
  }

  async getSetting(key: string): Promise<string | null> {
    const db = getDb();
    const ref = doc(db, FIRESTORE_COLLECTION.settings, key);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    const data = snap.data() as { value?: string | null };
    return data.value ?? null;
  }

  async setSetting(key: string, value: string | null): Promise<void> {
    const db = getDb();
    const ref = doc(db, FIRESTORE_COLLECTION.settings, key);
    if (value === null) await deleteDoc(ref);
    else await setDoc(ref, { value });
  }
}
