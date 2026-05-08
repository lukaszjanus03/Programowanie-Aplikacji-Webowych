import { test, expect } from "@playwright/test";
import { createProject, projectCard, resetAppData } from "./helpers";

test.describe("Projekty — CRUD", () => {
  test.beforeEach(async ({ page }) => {
    await resetAppData(page);
  });

  test("użytkownik tworzy nowy projekt", async ({ page }) => {
    await createProject(page, "Sklep internetowy", "MVP platformy e-commerce");

    const card = projectCard(page, "Sklep internetowy");
    await expect(card.getByTestId("project-card-name")).toHaveText("Sklep internetowy");
    await expect(card.getByTestId("project-card-description")).toHaveText("MVP platformy e-commerce");
  });

  test("użytkownik edytuje istniejący projekt", async ({ page }) => {
    await createProject(page, "Stara nazwa", "stary opis");

    await projectCard(page, "Stara nazwa").getByTestId("project-edit-btn").click();
    await expect(page.getByTestId("project-form")).toBeVisible();

    await page.getByTestId("project-name").fill("Nowa nazwa");
    await page.getByTestId("project-description").fill("nowy opis");
    await page.getByTestId("project-submit").click();

    await expect(page.getByTestId("project-form")).toBeHidden();
    await expect(projectCard(page, "Nowa nazwa")).toBeVisible();
    await expect(projectCard(page, "Stara nazwa")).toHaveCount(0);
    await expect(projectCard(page, "Nowa nazwa").getByTestId("project-card-description")).toHaveText("nowy opis");
  });

  test("użytkownik usuwa projekt po potwierdzeniu", async ({ page }) => {
    await createProject(page, "Do usunięcia");
    await expect(projectCard(page, "Do usunięcia")).toBeVisible();

    await projectCard(page, "Do usunięcia").getByTestId("project-delete-btn").click();
    await expect(page.getByTestId("delete-confirm")).toBeVisible();
    await page.getByTestId("delete-confirm-btn").click();

    await expect(page.getByTestId("delete-confirm")).toBeHidden();
    await expect(projectCard(page, "Do usunięcia")).toHaveCount(0);
  });

  test("użytkownik anuluje usuwanie i projekt zostaje", async ({ page }) => {
    await createProject(page, "Ważny projekt");

    await projectCard(page, "Ważny projekt").getByTestId("project-delete-btn").click();
    await page.getByTestId("delete-cancel").click();

    await expect(page.getByTestId("delete-confirm")).toBeHidden();
    await expect(projectCard(page, "Ważny projekt")).toBeVisible();
  });
});
