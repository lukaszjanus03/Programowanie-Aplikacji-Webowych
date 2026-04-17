# ManageMe - Aplikacja do zarządzania projektami

## Uruchomienie

```bash
npm install
npm run dev
```

Aplikacja uruchomi się na `http://localhost:5173`.

---

## Lab 7 — wybór magazynu danych

W pliku konfiguracji (`.env` / `.env.local`) można wybrać gdzie aplikacja
trzyma dane.

Zmienna **`VITE_STORAGE_MODE`**:

- `local` *(domyślnie)* — wszystko w `localStorage` przeglądarki
- `firestore` — Google Cloud Firestore (baza NoSQL)

W trybie `firestore` wymagane są pozostałe zmienne `VITE_FIREBASE_*`
(patrz `.env.example`).

### Dołączony plik `.env.local`

Do zipa dołączyłem `.env.local` z kluczami do już utworzonego projektu
Firebase `manage-me-pap`. Dzięki temu po `npm install && npm run dev`
aplikacja od razu łączy się z Firestore — nie trzeba nic konfigurować.

Jeśli chcesz wrócić do localStorage, zmień w `.env.local`:

```
VITE_STORAGE_MODE=local
```

…albo skasuj plik `.env.local` i stwórz `.env` z własną konfiguracją.

### Własny projekt Firebase (instrukcja)

1. [Firebase Console](https://console.firebase.google.com) → *Add project*
2. *Build → Firestore Database → Create database* → lokalizacja `eur3`,
   tryb **Test mode**
3. *Project settings → Your apps → `</>`* (Web) → *Register app*
4. Skopiuj `firebaseConfig` do pliku `.env.local`:

```
VITE_STORAGE_MODE=firestore
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=twoj-projekt.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=twoj-projekt
VITE_FIREBASE_STORAGE_BUCKET=twoj-projekt.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

---

## Lab 6 — logowanie

### Super admin

Adres e-mail zdefiniowany w `src/config.ts` jest jedynym kontem, które
otrzymuje rolę `admin` od razu po pierwszym zalogowaniu:

```ts
export const SUPER_ADMIN_EMAIL = "lukasz.janus03@example.com";
```

Zmień na swój adres (ten, którym logujesz się przez Google) zanim pierwszy
raz uruchomisz aplikację.

### Role

- **guest** — domyślna rola nowego użytkownika; widzi tylko ekran
  „Oczekiwanie na zatwierdzenie konta"
- **developer** / **devops** — pełny dostęp do aplikacji
- **admin** — dodatkowo widok **Użytkownicy** (zmiana roli, blokada konta)

### Google OAuth

Jeśli `VITE_GOOGLE_CLIENT_ID` jest pusty — logowanie działa w trybie dev
(wystarczy wpisać e-mail). Żeby włączyć prawdziwy OAuth, wygeneruj Client ID
w Google Cloud Console (Web application, authorized origin:
`http://localhost:5173`) i wklej do `.env.local`.

---

## Architektura magazynu (Lab 7)

```
src/storage/
├── StorageBackend.ts       ← wspólny interfejs (loadAll/upsert/remove/settings)
├── LocalStorageBackend.ts  ← implementacja dla localStorage
├── FirestoreBackend.ts     ← implementacja dla Firestore
├── firebase.ts             ← lazy init Firebase SDK
└── index.ts                ← factory + in-memory `store` z bootstrap()
```

Na starcie `Bootstrap.tsx` wywołuje `store.bootstrap()` — ładuje wszystkie
kolekcje (projects / stories / tasks / notifications / users) do pamięci
**jednorazowo**, równolegle. Dzięki temu komponenty dalej czytają dane
synchronicznie (np. `projectApi.getAll()`), a zapisy propagują się do backendu
asynchronicznie (optymistyczna aktualizacja cache).

Każda warstwa API (`projectApi`, `storyApi`, `taskApi`, `notificationApi`,
`userManager`) korzysta z tego samego `store`, więc podmiana backendu
(localStorage ↔ Firestore) nie wymaga zmian w komponentach.

## Struktura projektu

```
src/
├── storage/            ← Lab 7: warstwa magazynu (local / Firestore)
├── auth/               ← Lab 6: AuthContext + Google OAuth
├── api/                ← projectApi, storyApi, taskApi, notificationApi, userManager, activeProjectApi
├── models/             ← User, Project, Story, Task, Notification
├── services/           ← notificationService
├── components/         ← LoginView, PendingApprovalView, BlockedView, UsersView,
│                         ProjectForm, StoryBoard, KanbanBoard, TaskDetail, TaskForm,
│                         Notification*, DeleteConfirm
├── config.ts           ← SUPER_ADMIN_EMAIL, STORAGE_MODE, FIREBASE_CONFIG
├── Bootstrap.tsx       ← loader czekający na store.bootstrap()
├── ThemeContext.tsx
├── App.tsx
└── main.tsx
```
