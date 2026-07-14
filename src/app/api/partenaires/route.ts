import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";
import { verifyAuth, unauthorizedResponse } from "@/lib/auth";
import { sendEmail, emailInvitationPartenaire } from "@/lib/email";
import { partenaireSchema } from "@/lib/schemas";
import { logger } from "@/lib/logger";

export async function GET(req: NextRequest) {
  const authUser = await verifyAuth(req, "ADMIN");
  if (!authUser) return unauthorizedResponse();

  const partenaires = await prisma.user.findMany({
    where: { role: "PARTENAIRE" },
    select: {
      id: true, email: true, nom: true, prenom: true,
      telephone: true, entreprise: true, codeAcces: true,
      contacte: true, dateContact: true, createdAt: true,
      inviteToken: true, // pour savoir si l'invitation est en attente
    },
    orderBy: { createdAt: "desc" },
  });

  // Masquer le token réel, exposer seulement le statut d'activation
  const result = partenaires.map(({ inviteToken, ...p }) => ({
    ...p,
    invitationEnAttente: !!inviteToken,
  }));

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const authUser = await verifyAuth(req, "ADMIN");
  if (!authUser) return unauthorizedResponse();

  try {
    const body = await req.json();

    const parsed = partenaireSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { email, nom, prenom, telephone, entreprise } = parsed.data;

    // Vérifier unicité email
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Un compte existe déjà avec cet email" }, { status: 409 });
    }

    // Token d'invitation sécurisé (48h d'expiration)
    const inviteToken = randomBytes(32).toString("hex");
    const inviteTokenExpiry = new Date(Date.now() + 48 * 60 * 60 * 1000);

    // Code d'accès unique (identifiant pro)
    const codeAcces = `PRO-${Date.now().toString(36).toUpperCase()}-${randomBytes(2).toString("hex").toUpperCase()}`;

    const newUser = await prisma.user.create({
      data: {
        email,
        password: "", // Aucun mot de passe — défini par le partenaire via le lien d'invitation
        nom,
        prenom,
        telephone: telephone || null,
        entreprise,
        role: "PARTENAIRE",
        codeAcces,
        contacte: false,
        inviteToken,
        inviteTokenExpiry,
      },
    });

    // Ajouter les documents éventuels
    if (body.documents && Array.isArray(body.documents)) {
      for (const doc of body.documents) {
        if (doc.nom && doc.url) {
          await prisma.document.create({
            data: {
              nom: doc.nom,
              type: doc.type || "AUTRE",
              url: doc.url,
              taille: 0,
              userId: newUser.id,
            },
          });
        }
      }
    }

    // Email d'invitation avec lien sécurisé — aucun mot de passe en clair
    const siteUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const inviteUrl = `${siteUrl}/pro/setup?token=${inviteToken}`;

    const inviteEmail = emailInvitationPartenaire({
      prenom,
      nom,
      email,
      entreprise,
      codeAcces,
      inviteUrl,
    });

    sendEmail({
      to: email,
      subject: inviteEmail.subject,
      html: inviteEmail.html,
    }).catch((err) => logger.error("Erreur email invitation partenaire", { error: String(err) }));

    logger.info("Partenaire créé", { userId: newUser.id, adminId: authUser.id });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _pw, inviteToken: _tk, ...userSafe } = newUser;
    return NextResponse.json({ ...userSafe, invitationEnAttente: true }, { status: 201 });
  } catch (error) {
    logger.error("Erreur création partenaire", { error: String(error) });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
