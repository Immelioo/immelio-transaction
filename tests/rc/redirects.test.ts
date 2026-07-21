import test from "node:test";
import assert from "node:assert/strict";
import { chromium } from "playwright";

const BASE_URL = process.env.BASE_URL || "http://localhost:3011";

test("RC smoke: /admin redirige directement vers /admin/login sans session", async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(`${BASE_URL}/admin`, { waitUntil: "domcontentloaded", timeout: 30000 });
    assert.equal(page.url(), `${BASE_URL}/admin/login`);
  } finally {
    await page.close();
    await browser.close();
  }
});

test("RC smoke: /admin/dashboard redirige vers /admin/login sans session", async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(`${BASE_URL}/admin/dashboard`, { waitUntil: "domcontentloaded", timeout: 30000 });
    assert.equal(page.url(), `${BASE_URL}/admin/login`);
  } finally {
    await page.close();
    await browser.close();
  }
});

test("RC smoke: /pro/dashboard redirige vers /pro/login sans session", async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(`${BASE_URL}/pro/dashboard`, { waitUntil: "domcontentloaded", timeout: 30000 });
    assert.equal(page.url(), `${BASE_URL}/pro/login`);
  } finally {
    await page.close();
    await browser.close();
  }
});
