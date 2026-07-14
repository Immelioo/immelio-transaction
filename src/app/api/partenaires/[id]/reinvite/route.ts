import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";
import { verifyAuth, unauthorizedResponse } from "@/lib/auth";
import { sendEmail, emailInvitationPartenaire } from "@/lib/email";
import { logger } from "@/lib/logger";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authUser = await verifyAuth(req, "ADMIN");
  if (!authUser) return unauthorizedResponse();

  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true, email: true, nom: true, prenom: true,
      entreprise: true, codeAcces: true, role: true, password: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "Partenaire introuvable" }, { status: 404 });
  }

  if (user.role !== "PARTENAIRE") {
    return NextResponse.json({ error: "Cet utilisateur n'est pas un partenaire" }, { status: 400 });
  }

  // Compte déjà activé (a un mot de passe réel)
  if (user.password && user.password.length > 0) {
    return NextResponse.json(
      { error: "Ce compte est déjà activé. Utilisez la fonction de réinitialisation de mot de passe." },
      { status: 409 }
    );
  }

  // Générer un nouveau token d'invitation (48h)
  const inviteToken = randomBytes(32).toString("hex");
  const inviteTokenExpiry = new Date(Date.now() + 48 * 60 * 60 * 1000);

  await prisma.user.update({
    where: { id },
    data: { inviteToken, inviteTokenExpiry },
  });

  const siteUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const inviteUrl = `${siteUrl}/pro/setup?token=${inviteToken}`;

  const inviteEmail = emailInvitationPartenaire({
    prenom: user.prenom || "",
    nom: user.nom,
    email: user.email,
    entreprise: user.entreprise || "",
    codeAcces: user.codeAcces || "",
    inviteUrl,
  });

  sendEmail({
    to: user.email,
    subject: inviteEmail.subject,
    html: inviteEmail.html,
  }).catch((err) => logger.error("Erreur email réinvitation partenaire", { error: String(err) }));

  logger.info("Réinvitation partenaire", { partnerId: id, adminId: authUser.id });

  return NextResponse.json({ success: true, message: "Invitation renvoyée avec succès" });
}
