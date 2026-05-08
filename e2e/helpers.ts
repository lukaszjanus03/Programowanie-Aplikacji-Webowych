import { Page, expect } from "@playwright/test";

/**
 * Wstawia świeży stan przed każdym testem:
 *  - czyści dane biznesowe (projekty, historyjki, zadania, powiadomienia)
 *  - zachowuje stan logowania (klucze users + current_user_id)
 *  - przeładowuje stronę
 *
 * Dzięki temu testy są niezależne od siebie (slajd: "Testy są niezależne…").
 */
export async function resetAppData(page: Page) {
  await page.goto("/");
  await page.evaluate(() => {
    const KEEP = ["manageme_users", "manageme_settings"];
    const all = Object.keys(localStorage);
    for (const key of all) {
      if (!KEEP.includes(key)) localStorage.removeItem(key);
    }
    // W settings zostaw tylko current_user_id (logowanie), wyczyść active_project
    try {
      const raw = localStorage.getItem("manageme_settings");
      if (raw) {
        const s = JSON.parse(raw) as Record<string, string>;
        delete s.active_project;
        localStorage.setItem("manageme_settings", JSON.stringify(s));
      }
    } catch {
      // ignore
    }
  });
  await page.reload();
  // Po odświeżeniu wracamy na widok projektów — czekamy na header z przyciskiem.
  await expect(page.getByTestId("project-create-btn")).toBeVisible();
}

/**
 * Zamyka modal z powiadomieniem, jeśli aktualnie jest widoczny.
 *
 * Po niektórych akcjach (utworzenie projektu, zadania, zmiana statusu na done,
 * przypisanie usera) `notificationService` emituje notyfikację o priority
 * medium/high — App pokazuje wtedy `NotificationDialog`, który nakłada
 * `modal-overlay` i blokuje kolejne kliknięcia. W produkcji to OK,
 * ale w testach musimy go domknąć.
 */
export async function dismissNotificationDialogIfShown(page: Page, timeout = 500) {
  const dialog = page.getByTestId("notification-dialog");
  try {
    await dialog.waitFor({ state: "visible", timeout });
  } catch {
    return;
  }
  await page.getByTestId("notification-dialog-close").click();
  await expect(dialog).toBeHidden();
}

/** Tworzy projekt i zwraca obietnicę gdy karta projektu jest widoczna. */
export async function createProject(page: Page, name: string, description = "") {
  await page.getByTestId("project-create-btn").click();
  await expect(page.getByTestId("project-form")).toBeVisible();
  await page.getByTestId("project-name").fill(name);
  if (description) await page.getByTestId("project-description").fill(description);
  await page.getByTestId("project-submit").click();
  await expect(page.getByTestId("project-form")).toBeHidden();
  await expect(page.locator(`[data-testid="project-card"][data-project-name="${name}"]`)).toBeVisible();
  // Admin tworzący projekt sam dla siebie dostaje powiadomienie high — zamykamy je.
  await dismissNotificationDialogIfShown(page);
}

/** Wchodzi w projekt o podanej nazwie (klika "Wybierz"). */
export async function openProject(page: Page, name: string) {
  await page
    .locator(`[data-testid="project-card"][data-project-name="${name}"]`)
    .getByTestId("project-select-btn")
    .click();
  // Po wejściu do projektu pojawia się przycisk "Nowa historyjka"
  await expect(page.getByTestId("story-create-btn")).toBeVisible();
}

/** Tworzy historyjkę w aktualnym projekcie. */
export async function createStory(page: Page, name: string, description = "") {
  await page.getByTestId("story-create-btn").click();
  await expect(page.getByTestId("story-form")).toBeVisible();
  await page.getByTestId("story-name").fill(name);
  if (description) await page.getByTestId("story-description").fill(description);
  await page.getByTestId("story-submit").click();
  await expect(page.getByTestId("story-form")).toBeHidden();
  await expect(page.locator(`[data-testid="story-card"][data-story-name="${name}"]`)).toBeVisible();
}

/** Otwiera Kanban danej historyjki. */
export async function openKanban(page: Page, storyName: string) {
  await page
    .locator(`[data-testid="story-card"][data-story-name="${storyName}"]`)
    .getByTestId("story-kanban-btn")
    .click();
  await expect(page.getByTestId("task-create-btn")).toBeVisible();
}

/** Tworzy zadanie w aktualnym Kanbanie. */
export async function createTask(page: Page, name: string, description = "") {
  await page.getByTestId("task-create-btn").click();
  await expect(page.getByTestId("task-form")).toBeVisible();
  await page.getByTestId("task-name").fill(name);
  if (description) await page.getByTestId("task-description").fill(description);
  await page.getByTestId("task-submit").click();
  await expect(page.getByTestId("task-form")).toBeHidden();
  await expect(page.locator(`[data-testid="task-card"][data-task-name="${name}"]`)).toBeVisible();
  // Owner historyjki (super admin) dostaje powiadomienie medium — zamykamy je.
  await dismissNotificationDialogIfShown(page);
}

/** Lokator karty zadania o podanej nazwie. */
export function taskCard(page: Page, name: string) {
  return page.locator(`[data-testid="task-card"][data-task-name="${name}"]`);
}

/** Lokator karty historyjki o podanej nazwie. */
export function storyCard(page: Page, name: string) {
  return page.locator(`[data-testid="story-card"][data-story-name="${name}"]`);
}

/** Lokator karty projektu o podanej nazwie. */
export function projectCard(page: Page, name: string) {
  return page.locator(`[data-testid="project-card"][data-project-name="${name}"]`);
}
