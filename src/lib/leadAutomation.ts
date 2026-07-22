import { prisma } from "@/lib/prisma";

type AutoConfig = { type: string; description: string; hoursDeadline: number };

const AUTO_ACTIVITY: Record<string, AutoConfig> = {
  CONTACT: {
    type: "APPEL",
    description: "Rappeler suite au message de contact — qualifier le besoin",
    hoursDeadline: 24,
  },
  ESTIMATION: {
    type: "APPEL",
    description: "Rappeler pour l'estimation — qualifier le projet et proposer un RDV",
    hoursDeadline: 48,
  },
  VISITE: {
    type: "RENDEZ_VOUS",
    description: "Confirmer la demande de visite et planifier le créneau",
    hoursDeadline: 24,
  },
  RECHERCHE: {
    type: "APPEL",
    description: "Qualifier la demande de recherche et proposer des biens correspondants",
    hoursDeadline: 48,
  },
  PARTENARIAT: {
    type: "APPEL",
    description: "Contacter le prospect partenaire — présenter l'offre B2B et valider l'intérêt",
    hoursDeadline: 48,
  },
};

export async function createAutoActivity(leadId: string, source: string): Promise<void> {
  const config = AUTO_ACTIVITY[source];
  if (!config) return;

  const dateEcheance = new Date();
  dateEcheance.setHours(dateEcheance.getHours() + config.hoursDeadline);

  await prisma.activite.create({
    data: {
      leadId,
      type: config.type,
      description: config.description,
      dateEcheance,
      effectuee: false,
    },
  });
}
