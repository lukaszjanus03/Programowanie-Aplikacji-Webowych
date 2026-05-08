import { test, expect } from "@playwright/test";
import {
  createProject,
  createStory,
  createTask,
  dismissNotificationDialogIfShown,
  openKanban,
  openProject,
  resetAppData,
  taskCard,
} from "./helpers";

test.describe("Zadania — CRUD i zmiana statusu", () => {
  test.beforeEach(async ({ page }) => {
    await resetAppData(page);
    await createProject(page, "Projekt testowy");
    await openProject(page, "Projekt testowy");
    await createStory(page, "Historyjka testowa");
    await openKanban(page, "Historyjka testowa");
  });

  test("użytkownik tworzy nowe zadanie (status todo)", async ({ page }) => {
    await createTask(page, "Setup CI/CD", "Konfiguracja pipeline");

    const card = taskCard(page, "Setup CI/CD");
    await expect(card.getByTestId("task-card-name")).toHaveText("Setup CI/CD");
    await expect(card).toHaveAttribute("data-task-status", "todo");
  });

  test("użytkownik edytuje zadanie", async ({ page }) => {
    await createTask(page, "Stara nazwa zadania");

    await taskCard(page, "Stara nazwa zadania").getByTestId("task-edit-btn").click();
    await expect(page.getByTestId("task-form")).toBeVisible();

    await page.getByTestId("task-name").fill("Nowa nazwa zadania");
    await page.getByTestId("task-priority").selectOption("high");
    await page.getByTestId("task-hours").fill("8");
    await page.getByTestId("task-submit").click();

    await expect(page.getByTestId("task-form")).toBeHidden();
    await expect(taskCard(page, "Nowa nazwa zadania")).toBeVisible();
    await expect(taskCard(page, "Stara nazwa zadania")).toHaveCount(0);
  });

  test("zmiana statusu: todo → doing po przypisaniu osoby", async ({ page }) => {
    await createTask(page, "Implementacja API");

    // Lista przypisywalnych użytkowników to tylko developerzy/devops, a my mamy
    // tylko super admina. Dorzucamy testowego developera bezpośrednio do
    // `localStorage`. UWAGA: `store.cache` w aplikacji jest hydratowane raz
    // przy bootstrapie, więc po wstrzyknięciu trzeba zreloadować stronę,
    // żeby user pojawił się na liście do przypisania.
    await page.evaluate(() => {
      const raw = localStorage.getItem("manageme_users") ?? "[]";
      const users = JSON.parse(raw) as Array<Record<string, unknown>>;
      users.push({
        id: "test-dev-1",
        firstName: "Anna",
        lastName: "Developer",
        email: "anna.dev@example.com",
        role: "developer",
        isBlocked: false,
      });
      localStorage.setItem("manageme_users", JSON.stringify(users));
    });
    await page.reload();

    // Po reloadzie wracamy na widok historyjek — wchodzimy znów w Kanban.
    await openKanban(page, "Historyjka testowa");

    await taskCard(page, "Implementacja API").getByTestId("task-detail-btn").click();

    // Playwright `selectOption` z obiektem oczekuje stringa, nie regexa —
    // wybieramy po `value`, czyli po ID usera.
    await page.getByTestId("task-assign-select").selectOption("test-dev-1");
    await page.getByTestId("task-assign-submit").click();
    // Po przypisaniu leci wysokopriorytetowe powiadomienie do przypisanej osoby —
    // jeśli odbiorca jest tym samym userem, blokuje to dalsze kliknięcia.
    await dismissNotificationDialogIfShown(page);

    // Wracamy na Kanban i sprawdzamy że zadanie zmieniło status na "doing"
    await page.getByTestId("task-detail-back").click();
    await expect(taskCard(page, "Implementacja API")).toHaveAttribute("data-task-status", "doing");
  });

  test("zmiana statusu: doing → done po oznaczeniu jako gotowe", async ({ page }) => {
    await createTask(page, "Wdrożenie produkcyjne");

    // Najpierw musimy mieć zadanie w stanie "doing" — przeskakujemy bezpośrednio
    // ustawiając status w localStorage (testujemy zmianę doing→done, nie todo→doing).
    await page.evaluate((taskName) => {
      const raw = localStorage.getItem("manageme_tasks") ?? "[]";
      const tasks = JSON.parse(raw) as Array<Record<string, unknown>>;
      const t = tasks.find((x) => (x as { name: string }).name === taskName);
      if (t) {
        (t as { status: string }).status = "doing";
        (t as { startedAt: string }).startedAt = new Date().toISOString();
        (t as { assignedUserId: string }).assignedUserId = "test-user";
      }
      localStorage.setItem("manageme_tasks", JSON.stringify(tasks));
    }, "Wdrożenie produkcyjne");
    await page.reload();

    // Po reloadzie wracamy na widok historyjek (active_project jest persistowany,
    // ale aktywny Kanban — już nie). Wchodzimy z powrotem w Kanban tej historyjki.
    await openKanban(page, "Historyjka testowa");

    await taskCard(page, "Wdrożenie produkcyjne").getByTestId("task-detail-btn").click();
    await page.getByTestId("task-markdone-btn").click();
    // markdone emituje medium — zamykamy dialog zanim wrócimy na kanban.
    await dismissNotificationDialogIfShown(page);

    // Wracamy na Kanban i sprawdzamy że zadanie ma status "done"
    await page.getByTestId("task-detail-back").click();
    await expect(taskCard(page, "Wdrożenie produkcyjne")).toHaveAttribute("data-task-status", "done");
  });

  test("użytkownik usuwa zadanie po potwierdzeniu", async ({ page }) => {
    await createTask(page, "Do usunięcia");

    await taskCard(page, "Do usunięcia").getByTestId("task-delete-btn").click();
    await expect(page.getByTestId("delete-confirm")).toBeVisible();
    await page.getByTestId("delete-confirm-btn").click();

    await expect(page.getByTestId("delete-confirm")).toBeHidden();
    await expect(taskCard(page, "Do usunięcia")).toHaveCount(0);
  });
});
