import { prisma } from "@/lib/prisma";

export type SiteSettingInputType = "text" | "textarea" | "number" | "email" | "tel";

export interface SiteSettingDefinition {
  key: string;
  label: string;
  group: string;
  inputType: SiteSettingInputType;
  defaultValue: string;
  description?: string;
}

export const SITE_SETTING_DEFINITIONS: SiteSettingDefinition[] = [
  {
    key: "agency_name",
    label: "Nom de l'agence",
    group: "Identite",
    inputType: "text",
    defaultValue: "Immelio Transaction",
  },
  {
    key: "agency_phone",
    label: "Telephone principal",
    group: "Identite",
    inputType: "tel",
    defaultValue: "07 71 55 64 83",
  },
  {
    key: "agency_email",
    label: "Email principal",
    group: "Identite",
    inputType: "email",
    defaultValue: "tf.immopro@gmail.com",
  },
  {
    key: "agency_city",
    label: "Ville / zone",
    group: "Identite",
    inputType: "text",
    defaultValue: "Lyon, France",
  },
  {
    key: "agency_address_note",
    label: "Sous-texte adresse",
    group: "Identite",
    inputType: "text",
    defaultValue: "Agence nationale — interventions dans toute la France",
  },
  {
    key: "contact_hours",
    label: "Horaires de contact",
    group: "Identite",
    inputType: "text",
    defaultValue: "Lun - Ven : 9h - 19h | Sam : 10h - 17h",
  },
  {
    key: "footer_description",
    label: "Description footer",
    group: "Contenu public",
    inputType: "textarea",
    defaultValue:
      "Votre agence immobiliere de confiance. Nous vous accompagnons dans tous vos projets immobiliers avec professionnalisme et transparence.",
  },
  {
    key: "hero_title_line_1",
    label: "Hero ligne 1",
    group: "Page d'accueil",
    inputType: "text",
    defaultValue: "Trouvez le bien",
  },
  {
    key: "hero_title_highlight",
    label: "Hero mot mis en avant",
    group: "Page d'accueil",
    inputType: "text",
    defaultValue: "ideal",
  },
  {
    key: "hero_title_line_2",
    label: "Hero ligne 2",
    group: "Page d'accueil",
    inputType: "text",
    defaultValue: "avec Immelio Transaction",
  },
  {
    key: "hero_subtitle",
    label: "Hero sous-titre",
    group: "Page d'accueil",
    inputType: "textarea",
    defaultValue:
      "Votre partenaire immobilier de confiance. Appartements, maisons, locaux professionnels — nous avons le bien qu'il vous faut.",
  },
  {
    key: "homepage_stats_biens",
    label: "Compteur biens",
    group: "Page d'accueil",
    inputType: "number",
    defaultValue: "150",
  },
  {
    key: "homepage_stats_partenaires",
    label: "Compteur partenaires",
    group: "Page d'accueil",
    inputType: "number",
    defaultValue: "50",
  },
  {
    key: "homepage_stats_villes",
    label: "Compteur villes",
    group: "Page d'accueil",
    inputType: "number",
    defaultValue: "30",
  },
  {
    key: "homepage_stats_clients",
    label: "Compteur clients",
    group: "Page d'accueil",
    inputType: "number",
    defaultValue: "500",
  },
  {
    key: "partner_space_pitch",
    label: "Promesse espace partenaire",
    group: "Partenaires",
    inputType: "textarea",
    defaultValue:
      "Accedez a vos documents, vos options, vos demandes et vos outils de suivi dans un espace partenaire plus complet.",
  },
  {
    key: "about_hero_subtitle",
    label: "Sous-titre de l'en-tête",
    group: "Page À propos",
    inputType: "textarea",
    defaultValue:
      "Une agence immobilière nouvelle génération, fondée sur la confiance, l'expertise et l'accompagnement personnalisé.",
  },
  {
    key: "about_story_label",
    label: "Petit label au-dessus du titre",
    group: "Page À propos",
    inputType: "text",
    defaultValue: "Notre histoire",
  },
  {
    key: "about_story_title",
    label: "Titre de la section histoire",
    group: "Page À propos",
    inputType: "text",
    defaultValue: "L'immobilier autrement",
  },
  {
    key: "about_story_paragraph_1",
    label: "Histoire — paragraphe 1",
    group: "Page À propos",
    inputType: "textarea",
    defaultValue:
      "Immelio Transaction est née d'une conviction simple : l'immobilier mérite mieux. Mieux qu'un service impersonnel. Mieux qu'un accompagnement approximatif. Mieux qu'une relation qui s'arrête à la signature.",
  },
  {
    key: "about_story_paragraph_2",
    label: "Histoire — paragraphe 2",
    group: "Page À propos",
    inputType: "textarea",
    defaultValue:
      "Fondée par des passionnés de l'immobilier, notre agence place l'humain au coeur de chaque transaction. Que vous soyez un primo-accédant, un investisseur chevronné ou un professionnel du secteur, nous adaptons notre approche à vos besoins.",
  },
  {
    key: "about_story_paragraph_3",
    label: "Histoire — paragraphe 3",
    group: "Page À propos",
    inputType: "textarea",
    defaultValue:
      "Basés à Lyon et opérant sur l'ensemble du territoire français, nous combinons expertise locale et vision nationale pour vous offrir les meilleures opportunités.",
  },
  {
    key: "about_stats_satisfaction",
    label: "Taux de clients satisfaits (%)",
    group: "Page À propos",
    inputType: "number",
    defaultValue: "98",
  },
  {
    key: "about_stats_delai",
    label: "Délai moyen de vente (jours)",
    group: "Page À propos",
    inputType: "number",
    defaultValue: "30",
  },
  {
    key: "about_cta_title",
    label: "Titre du bandeau d'appel à l'action",
    group: "Page À propos",
    inputType: "text",
    defaultValue: "Prêt à concrétiser votre projet ?",
  },
  {
    key: "about_cta_subtitle",
    label: "Sous-titre du bandeau d'appel à l'action",
    group: "Page À propos",
    inputType: "textarea",
    defaultValue: "Que vous souhaitiez acheter, vendre ou investir, notre équipe est là pour vous.",
  },
];

export type SiteSettingsMap = Record<string, string>;

export function getDefaultSiteSettings(): SiteSettingsMap {
  return Object.fromEntries(
    SITE_SETTING_DEFINITIONS.map((definition) => [definition.key, definition.defaultValue]),
  );
}

export async function getSiteSettings(): Promise<SiteSettingsMap> {
  const defaults = getDefaultSiteSettings();
  const settings = await prisma.siteSetting.findMany();

  for (const setting of settings) {
    defaults[setting.key] = setting.value;
  }

  return defaults;
}

export async function getAdminSiteSettings() {
  const values = await getSiteSettings();

  return SITE_SETTING_DEFINITIONS.map((definition) => ({
    ...definition,
    value: values[definition.key] ?? definition.defaultValue,
  }));
}
