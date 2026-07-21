import test from "node:test";
import assert from "node:assert/strict";
import { chromium } from "playwright";

const BASE_URL = process.env.BASE_URL || "http://localhost:3011";

test("RC smoke: le wizard estimation passe de l'étape 1 à l'étape 2", async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  try {
    await page.goto(`${BASE_URL}/estimation`, { waitUntil: "networkidle", timeout: 30000 });
    await page.getByText("Appartement", { exact: true }).click();

    const nextButton = page.getByRole("button", { name: /suivant/i });
    assert.equal(await nextButton.isDisabled(), false, "Le bouton Suivant doit être actif après sélection");

    await nextButton.click();
    const stepTwoHeading = page.getByText(/Caractéristiques du bien/i);
    assert.equal(await stepTwoHeading.isVisible(), true, "L'étape 2 doit devenir visible");
  } finally {
    await page.close();
    await browser.close();
  }
});
