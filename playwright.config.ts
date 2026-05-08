import { defineConfig, devices } from "@playwright/test";

/**
 * Konfiguracja Playwright dla testów e2e aplikacji ManageMe.
 *
 * - Uruchamia serwer dev (Vite) automatycznie przed testami.
 * - Wymusza tryb localStorage (`VITE_STORAGE_MODE=local`), żeby testy były
 *   izolowane i nie zostawiały śmieci w prawdziwej bazie Firestore.
 * - Wszystkie testy wymagające zalogowanego użytkownika korzystają z stanu
 *   przygotowanego przez `e2e/auth.setup.ts` (jednorazowe logowanie).
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [["html", { open: "never" }], ["list"]],

  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  projects: [
    // Setup loguje użytkownika i zapisuje stan localStorage do pliku.
    { name: "setup", testMatch: /auth\.setup\.ts/ },

    // Główne testy — dziedziczą stan zalogowanego użytkownika.
    {
      name: "chromium",
      dependencies: ["setup"],
      use: {
        ...devices["Desktop Chrome"],
        storageState: "e2e/.auth/admin.json",
      },
      testIgnore: /auth\.setup\.ts/,
    },
  ],

  webServer: {
    command: "npm run dev",
    url: "http://localhost:5173",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      VITE_STORAGE_MODE: "local",
      // Pusty CLIENT_ID → ekran logowania w trybie deweloperskim
      VITE_GOOGLE_CLIENT_ID: "",
    },
  },
});
