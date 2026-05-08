import { test, expect } from "@playwright/test";
import {
  createProject,
  createStory,
  createTask,
  dismissNotificationDialogIfShown,
  openKanban,
  openProject,
  projectCard,
  resetAppData,
  storyCard,
  taskCard,
} from "./helpers";

/**
 * Pełny scenariusz biznesowy: zalogowany admin przechodzi całą ścieżkę
 * tworzenia struktury projektu — projekt → historyjka → zadanie — następnie
 * sprzątając wszystko po sobie.
 *
 * To jest ten "test sprawdzający kluczowy proces biznesowy" o którym mówi
 * wykładowca na slajdzie 3.
 */
test.describe("Pełny scenariusz E2E", () => {
  test.beforeEach(async ({ page }) => {
    await resetAppData(page);
  });

  test("admin przechodzi cykl: projekt → historyjka → zadanie → cleanup", async ({ page }) => {
    // 1. Tworzymy projekt
    await createProject(page, "Aplikacja mobilna", "Wersja MVP na Androida");
    await expect(projectCard(page, "Aplikacja mobilna")).toBeVisible();

    // 2. Wchodzimy w niego
    await openProject(page, "Aplikacja mobilna");

    // 3. Tworzymy historyjkę
    await createStory(page, "Onboarding nowego użytkownika", "Trzy ekrany + skip");
    await expect(storyCard(page, "Onboarding nowego użytkownika")).toBeVisible();

    // 4. Otwieramy Kanban i tworzymy zadanie
    await openKanban(page, "Onboarding nowego użytkownika");
    await createTask(page, "Projekt UI ekranów", "Figma + handoff");
    await expect(taskCard(page, "Projekt UI ekranów")).toHaveAttribute("data-task-status", "todo");

    // 5. Edytujemy zadanie
    await taskCard(page, "Projekt UI ekranów").getByTestId("task-edit-btn").click();
    await page.getByTestId("task-name").fill("Projekt UI – 3 ekrany");
    await page.getByTestId("task-hours").fill("16");
    await page.getByTestId("task-priority").selectOption("high");
    await page.getByTestId("task-submit").click();
    await expect(taskCard(page, "Projekt UI – 3 ekrany")).toBeVisible();

    // 6. Usuwamy zadanie
    await taskCard(page, "Projekt UI – 3 ekrany").getByTestId("task-delete-btn").click();
    await page.getByTestId("delete-confirm-btn").click();
    await expect(taskCard(page, "Projekt UI – 3 ekrany")).toHaveCount(0);
    // Skasowanie zadania emituje powiadomienie medium do ownera historyjki (= super admina).
    await dismissNotificationDialogIfShown(page);

    // 7. Wracamy na widok historyjek (klikając "← Historyjki" w nagłówku Kanbana)
    await page.getByRole("button", { name: /Historyjki/ }).click();
    await expect(storyCard(page, "Onboarding nowego użytkownika")).toBeVisible();

    // 8. Usuwamy historyjkę
    await storyCard(page, "Onboarding nowego użytkownika").getByTestId("story-delete-btn").click();
    await page.getByTestId("delete-confirm-btn").click();
    await expect(storyCard(page, "Onboarding nowego użytkownika")).toHaveCount(0);

    // 9. Wracamy na widok projektów
    await page.getByRole("button", { name: /Projekty/ }).click();
    await expect(projectCard(page, "Aplikacja mobilna")).toBeVisible();

    // 10. Usuwamy projekt — pełen cleanup
    await projectCard(page, "Aplikacja mobilna").getByTestId("project-delete-btn").click();
    await page.getByTestId("delete-confirm-btn").click();
    await expect(projectCard(page, "Aplikacja mobilna")).toHaveCount(0);
  });
});
