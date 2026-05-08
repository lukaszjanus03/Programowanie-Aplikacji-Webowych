import { test as setup, expect } from "@playwright/test";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

/**
 * Loguje super admina raz i zapisuje stan localStorage do pliku.
 * Wszystkie testy w innych projektach dziedziczą ten stan.
 *
 * Uwaga: e-mail super admina musi być zgodny z `SUPER_ADMIN_EMAIL`
 * w `src/config.ts`. Jeśli zmienisz tam wartość, zaktualizuj też tutaj.
 */
const SUPER_ADMIN_EMAIL = "lukasz.janus03@example.com";
const SUPER_ADMIN_NAME = "Łukasz Janus";

// W ES modułach `__dirname` nie jest zdefiniowane — wyliczamy je z `import.meta.url`.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const authFile = path.join(__dirname, ".auth", "admin.json");

setup("zaloguj super admina", async ({ page }) => {
  // Upewnij się że katalog na zapisany stan istnieje
  fs.mkdirSync(path.dirname(authFile), { recursive: true });

  await page.goto("/");

  // Czyste localStorage — żaden inny user nie zostaje z poprzedniego runa
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  // Ekran logowania (tryb deweloperski, bez Google Client ID)
  await expect(page.getByText("Zaloguj się, aby kontynuować")).toBeVisible();
  await expect(page.getByText("Tryb deweloperski")).toBeVisible();

  await page.getByTestId("login-email").fill(SUPER_ADMIN_EMAIL);
  await page.getByTestId("login-name").fill(SUPER_ADMIN_NAME);
  await page.getByTestId("login-submit").click();

  // Po zalogowaniu super admin trafia od razu do widoku projektów —
  // przycisk "Nowy projekt" pojawia się tylko gdy user ma rolę admin/devops/developer.
  await expect(page.getByTestId("project-create-btn")).toBeVisible();

  // Zapis stanu sesji (localStorage + cookies) do pliku, którego użyją inne testy.
  await page.context().storageState({ path: authFile });
});
