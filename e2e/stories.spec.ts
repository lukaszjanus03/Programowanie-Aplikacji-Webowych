import { test, expect } from "@playwright/test";
import { createProject, createStory, openProject, resetAppData, storyCard } from "./helpers";

test.describe("Historyjki — CRUD", () => {
  test.beforeEach(async ({ page }) => {
    await resetAppData(page);
    await createProject(page, "Projekt testowy");
    await openProject(page, "Projekt testowy");
  });

  test("użytkownik tworzy nową historyjkę", async ({ page }) => {
    await createStory(page, "Logowanie użytkownika", "Implementacja formularza logowania");

    const card = storyCard(page, "Logowanie użytkownika");
    await expect(card.getByTestId("story-card-name")).toHaveText("Logowanie użytkownika");
    await expect(card).toContainText("Implementacja formularza logowania");
  });

  test("użytkownik edytuje historyjkę", async ({ page }) => {
    await createStory(page, "Refactor", "stary opis");

    await storyCard(page, "Refactor").getByTestId("story-edit-btn").click();
    await expect(page.getByTestId("story-form")).toBeVisible();

    await page.getByTestId("story-name").fill("Refaktoryzacja kodu");
    await page.getByTestId("story-priority").selectOption("high");
    await page.getByTestId("story-submit").click();

    await expect(page.getByTestId("story-form")).toBeHidden();
    await expect(storyCard(page, "Refaktoryzacja kodu")).toBeVisible();
    await expect(storyCard(page, "Refactor")).toHaveCount(0);
  });

  test("użytkownik usuwa historyjkę po potwierdzeniu", async ({ page }) => {
    await createStory(page, "Do skasowania");

    await storyCard(page, "Do skasowania").getByTestId("story-delete-btn").click();
    await expect(page.getByTestId("delete-confirm")).toBeVisible();
    await page.getByTestId("delete-confirm-btn").click();

    await expect(page.getByTestId("delete-confirm")).toBeHidden();
    await expect(storyCard(page, "Do skasowania")).toHaveCount(0);
  });
});
