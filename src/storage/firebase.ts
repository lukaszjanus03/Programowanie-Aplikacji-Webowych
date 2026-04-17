import { initializeApp, FirebaseApp, getApps } from "firebase/app";
import { Firestore, getFirestore } from "firebase/firestore";
import { FIREBASE_CONFIG, IS_FIREBASE_CONFIGURED } from "../config";

let _app: FirebaseApp | null = null;
let _db: Firestore | null = null;

export function getFirebaseApp(): FirebaseApp {
  if (!IS_FIREBASE_CONFIGURED) {
    throw new Error(
      "Firebase nie jest skonfigurowany. Ustaw zmienne VITE_FIREBASE_* w pliku .env."
    );
  }
  if (_app) return _app;
  const existing = getApps();
  _app = existing.length > 0 ? existing[0] : initializeApp(FIREBASE_CONFIG);
  return _app;
}

export function getDb(): Firestore {
  if (_db) return _db;
  _db = getFirestore(getFirebaseApp());
  return _db;
}
