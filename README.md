# ManageMe - Aplikacja do zarządzania projektami

## Uruchomienie

```bash
npm install
npm run dev
```

Aplikacja uruchomi się na `http://localhost:5173`

## Struktura projektu

```
src/
├── api/
│   └── projectApi.ts       ← warstwa localStorage (do podmiany na NoSQL)
├── models/
│   └── Project.ts           ← interfejsy TypeScript
├── components/
│   ├── ProjectForm.tsx      ← modal tworzenia/edycji projektu
│   ├── ProjectCard.tsx      ← karta pojedynczego projektu
│   ├── ProjectList.tsx      ← grid z listą projektów
│   └── DeleteConfirm.tsx    ← modal potwierdzenia usunięcia
├── App.tsx                  ← główny komponent
└── main.tsx                 ← entry point
```

## Funkcjonalność CRUD

- **Create** – przycisk „Nowy projekt" otwiera formularz
- **Read** – projekty wyświetlane w gridzie kart
- **Update** – przycisk „Edytuj" na karcie projektu
- **Delete** – przycisk „Usuń" z potwierdzeniem

## Model danych

```typescript
interface Project {
  id: string;        // generowane przez crypto.randomUUID()
  name: string;
  description: string;
}
```

## API Layer

Klasa `ProjectApi` w `src/api/projectApi.ts` enkapsuluje całą komunikację
z localStorage. W przyszłości wystarczy podmienić implementację metod
na wywołania NoSQL (np. Firebase Firestore) bez zmian w komponentach.
