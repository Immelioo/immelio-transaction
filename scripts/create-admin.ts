/**
 * Crée (ou met à jour le mot de passe d'un) compte ADMIN en production.
 * Ne touche à aucune autre donnée — contrairement à prisma/seed.ts (qui est un seed de
 * démo bloqué en production).
 *
 * Usage :
 *   ADMIN_EMAIL="vous@exemple.fr" ADMIN_PASSWORD="MotDePasseFort123!" npx tsx scripts/create-admin.ts
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const nom = process.env.ADMIN_NOM || "Admin";
  const prenom = process.env.ADMIN_PRENOM || "Admin";

  if (!email || !password) {
    throw new Error(
      "ADMIN_EMAIL et ADMIN_PASSWORD sont requis.\n" +
      'Exemple : ADMIN_EMAIL="vous@exemple.fr" ADMIN_PASSWORD="MotDePasseFort123!" npx tsx scripts/create-admin.ts'
    );
  }
  if (password.length < 8) {
    throw new Error("ADMIN_PASSWORD doit contenir au moins 8 caractères.");
  }

  const hash = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: { password: hash, role: "ADMIN" },
    create: { email, password: hash, nom, prenom, role: "ADMIN" },
  });

  console.log(`✅ Compte ADMIN prêt : ${user.email} (id: ${user.id})`);
}

main()
  .catch((e) => {
    console.error("❌", e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
