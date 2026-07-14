import { NextRequest, NextResponse } from "next/server";
import { verifyAuth, unauthorizedResponse } from "@/lib/auth";
import { getAdminSiteSettings, SITE_SETTING_DEFINITIONS } from "@/lib/siteSettings";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export async function GET(req: NextRequest) {
  const authUser = await verifyAuth(req, "ADMIN");
  if (!authUser) return unauthorizedResponse();

  const settings = await getAdminSiteSettings();
  return NextResponse.json({ settings });
}

export async function PUT(req: NextRequest) {
  const authUser = await verifyAuth(req, "ADMIN");
  if (!authUser) return unauthorizedResponse();

  try {
    const body = await req.json();
    const updates = Array.isArray(body?.settings) ? body.settings : [];

    const allowedKeys = new Set(SITE_SETTING_DEFINITIONS.map((definition) => definition.key));
    const definitions = new Map(
      SITE_SETTING_DEFINITIONS.map((definition) => [definition.key, definition]),
    );

    for (const update of updates) {
      if (!update?.key || !allowedKeys.has(update.key)) continue;

      const definition = definitions.get(update.key);
      if (!definition) continue;

      await prisma.siteSetting.upsert({
        where: { key: update.key },
        update: {
          value: String(update.value ?? ""),
          label: definition.label,
          group: definition.group,
          inputType: definition.inputType,
          description: definition.description ?? null,
        },
        create: {
          key: update.key,
          label: definition.label,
          value: String(update.value ?? ""),
          group: definition.group,
          inputType: definition.inputType,
          description: definition.description ?? null,
        },
      });
    }

    const settings = await getAdminSiteSettings();
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    logger.error("Erreur mise a jour site settings", { error: String(error) });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
