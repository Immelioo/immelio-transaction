import { prisma } from "@/lib/prisma";

export interface PartnershipRequestInput {
  prenom: string;
  nom: string;
  email: string;
  telephone?: string | null;
  entreprise: string;
  ville?: string | null;
  message?: string | null;
  origin: "SITE_PUBLIC" | "PORTAIL_PARTENAIRE";
}

export async function createPartnershipRequest(input: PartnershipRequestInput) {
  const email = input.email.toLowerCase();

  let contact = await prisma.contact.findFirst({
    where: { email },
    orderBy: { createdAt: "desc" },
  });

  const notes = [input.ville ? `Ville: ${input.ville}` : null].filter(Boolean).join("\n");

  if (!contact) {
    contact = await prisma.contact.create({
      data: {
        nom: input.nom,
        prenom: input.prenom,
        telephone: input.telephone || null,
        email,
        entreprise: input.entreprise,
        notes: notes || null,
      },
    });
  } else {
    contact = await prisma.contact.update({
      where: { id: contact.id },
      data: {
        nom: input.nom,
        prenom: input.prenom,
        telephone: input.telephone || null,
        entreprise: input.entreprise,
        notes: notes || contact.notes || null,
      },
    });
  }

  const dossier = await prisma.dossier.create({
    data: {
      titre: `Demande de partenariat - ${input.entreprise}`,
      type: "PARTENARIAT",
      statut: "NOUVELLE",
      notes: [
        `Origine: ${input.origin === "PORTAIL_PARTENAIRE" ? "portail partenaire" : "site public"}`,
        input.ville ? `Ville: ${input.ville}` : null,
        input.message ? `Message: ${input.message}` : null,
      ]
        .filter(Boolean)
        .join("\n"),
      contactId: contact.id,
    },
  });

  const lead = await prisma.lead.create({
    data: {
      nom: input.nom,
      prenom: input.prenom,
      email,
      telephone: input.telephone || null,
      source: input.origin === "PORTAIL_PARTENAIRE" ? "PARTENAIRE" : "SITE_WEB",
      statut: "NOUVEAU",
      notes: [
        "Demande de partenariat",
        `Entreprise: ${input.entreprise}`,
        input.ville ? `Ville: ${input.ville}` : null,
        input.message ? `Message: ${input.message}` : null,
      ]
        .filter(Boolean)
        .join("\n"),
    },
  });

  return { contact, dossier, lead };
}
