import test from "node:test";
import assert from "node:assert/strict";
import { chromium } from "playwright";
import { PrismaClient } from "@prisma/client";

const BASE_URL = process.env.BASE_URL || "http://localhost:3011";
const RUN_DB_E2E = process.env.RUN_DB_E2E === "1";

(RUN_DB_E2E ? test : test.skip)("RC E2E: le funnel estimation va jusqu'au succès et crée un lead", async () => {
  const prisma = new PrismaClient();
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const marker = `estimation-rc-${Date.now()}@example.com`;

  try {
    await page.goto(`${BASE_URL}/estimation`, { waitUntil: "networkidle", timeout: 30000 });
    await page.getByRole("button", { name: "Appartement" }).click();
    await page.getByRole("heading", { name: "Caractéristiques du bien" }).waitFor({ timeout: 5000 });

    await page.getByLabel("Surface (m²) *").fill("75");
    await page.getByLabel("Nombre de pièces *").fill("3");
    await page.getByRole("button", { name: "Suivant" }).click();

    await page.getByRole("heading", { name: "Localisation du bien" }).waitFor({ timeout: 5000 });
    await page.getByLabel("Code postal *").fill("69001");
    await page.getByLabel("Ville *").fill("Lyon");
    await page.getByRole("button", { name: "Suivant" }).click();

    await page.getByRole("heading", { name: "Vos coordonnées" }).waitFor({ timeout: 5000 });
    await page.getByLabel("Nom *").fill("RC Test");
    await page.getByLabel("Prénom").fill("Audit");
    await page.getByLabel("Email *").fill(marker);
    await page.getByLabel("Téléphone").fill("0600000000");
    await page.getByLabel("Commentaire (optionnel)").fill("Test automatique RC estimation");
    await page.getByRole("button", { name: /Obtenir mon estimation gratuite/i }).click();

    await page.getByRole("heading", { name: "Demande envoyée !" }).waitFor({ timeout: 10000 });

    const lead = await prisma.lead.findFirst({ where: { email: marker } });
    assert.ok(lead, "Le lead d'estimation doit être créé");
    assert.equal(lead?.source, "SITE_WEB");
    assert.match(lead?.notes || "", /\[ESTIMATION\]/);
  } finally {
    const lead = await prisma.lead.findFirst({ where: { email: marker } });
    if (lead) {
      await prisma.activite.deleteMany({ where: { leadId: lead.id } });
      await prisma.lead.delete({ where: { id: lead.id } });
    }

    await page.close();
    await browser.close();
    await prisma.$disconnect();
  }
});
