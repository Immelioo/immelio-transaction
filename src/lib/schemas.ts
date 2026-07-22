import { z } from "zod";

// ============================================
// HELPERS
// ============================================

const sanitizedString = (max = 500) =>
  z.string().trim().min(1).max(max).transform((s) =>
    s.replace(/[<>]/g, "")  // Supprime < > pour éviter XSS basique
  );

const phoneRegex = /^[0-9\s\+\-\.\(\)]{6,20}$/;
const postalCodeRegex = /^[0-9]{5}$/;

// ============================================
// AUTH
// ============================================

export const loginSchema = z.object({
  email: z.string().trim().email("Email invalide").max(255),
  password: z.string().min(1, "Mot de passe requis").max(128),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1).max(128),
  newPassword: z.string().min(8, "8 caractères minimum").max(128),
});

// ============================================
// CONTACT & FORMULAIRES PUBLICS
// ============================================

export const contactSchema = z.object({
  nom: sanitizedString(100),
  email: z.string().trim().email("Email invalide").max(255),
  telephone: z.string().trim().regex(phoneRegex, "Téléphone invalide").optional().or(z.literal("")),
  sujet: sanitizedString(200),
  message: sanitizedString(2000),
});

export const devenirPartenaireSchema = z.object({
  prenom: sanitizedString(100),
  nom: sanitizedString(100),
  email: z.string().trim().email("Email invalide").max(255),
  telephone: z.string().trim().regex(phoneRegex, "Téléphone invalide").optional().or(z.literal("")),
  entreprise: sanitizedString(200),
  message: z.string().trim().max(2000).optional(),
});

export const visiteSchema = z.object({
  bienId: z.string().cuid("ID bien invalide"),
  nom: sanitizedString(100),
  prenom: sanitizedString(100),
  email: z.string().trim().email("Email invalide").max(255),
  telephone: z.string().trim().regex(phoneRegex, "Téléphone invalide"),
  dateSouhaitee: z.string().refine((d) => !isNaN(Date.parse(d)), "Date invalide"),
  creneau: z.enum(["MATIN", "APRES_MIDI", "SOIR"]),
  message: z.string().trim().max(1000).optional(),
  financement: z.string().trim().max(100).optional(),
  apport: z.string().trim().max(100).optional(),
});

export const demandeRechercheSchema = z.object({
  type: z.enum(["APPARTEMENT", "MAISON", "STUDIO", "LOFT", "COMMERCE", "BUREAU"]),
  transaction: z.enum(["VENTE", "LOCATION"]),
  budgetMin: z.number().min(0).max(100_000_000).optional(),
  budgetMax: z.number().min(0).max(100_000_000).optional(),
  surfaceMin: z.number().min(0).max(10_000).optional(),
  surfaceMax: z.number().min(0).max(10_000).optional(),
  nbPiecesMin: z.number().int().min(1).max(20).optional(),
  ville: sanitizedString(100).optional().or(z.literal("")),
  codePostal: z.string().trim().regex(postalCodeRegex, "Code postal invalide (5 chiffres)").optional().or(z.literal("")),
  description: z.string().trim().max(2000).optional(),
  // Infos contact
  nom: sanitizedString(100),
  prenom: sanitizedString(100),
  email: z.string().trim().email("Email invalide").max(255),
  telephone: z.string().trim().regex(phoneRegex, "Téléphone invalide").optional().or(z.literal("")),
});

export const estimationSchema = z.object({
  type: z.enum(["APPARTEMENT", "MAISON", "STUDIO", "COMMERCE", "BUREAU", "TERRAIN"]),
  surface: z.coerce.number().positive("Surface invalide").max(10_000),
  nbPieces: z.coerce.number().int().min(1).max(50),
  nbChambres: z.union([z.coerce.number().int().min(0).max(50), z.literal(""), z.null()]).optional(),
  etage: z.union([z.coerce.number().int().min(-5).max(200), z.literal(""), z.null()]).optional(),
  anneeConstruction: z.union([
    z.coerce.number().int().min(1800).max(new Date().getFullYear()),
    z.literal(""),
    z.null(),
  ]).optional(),
  etat: z.string().trim().max(50).optional().or(z.literal("")),
  parking: z.boolean().optional().default(false),
  terrasse: z.boolean().optional().default(false),
  balcon: z.boolean().optional().default(false),
  cave: z.boolean().optional().default(false),
  piscine: z.boolean().optional().default(false),
  ascenseur: z.boolean().optional().default(false),
  adresse: z.string().trim().max(300).optional().or(z.literal("")),
  codePostal: z.string().trim().regex(postalCodeRegex, "Code postal invalide (5 chiffres)"),
  ville: sanitizedString(100),
  nom: sanitizedString(100),
  prenom: z.string().trim().max(100).optional().or(z.literal("")),
  email: z.string().trim().email("Email invalide").max(255),
  telephone: z.string().trim().regex(phoneRegex, "Téléphone invalide").optional().or(z.literal("")),
  commentaire: z.string().trim().max(2000).optional().or(z.literal("")),
});

// ============================================
// ADMIN — BIENS
// ============================================

export const bienSchema = z.object({
  titre: sanitizedString(200),
  description: z.string().trim().min(10).max(5000),
  type: z.enum(["APPARTEMENT", "MAISON", "STUDIO", "LOFT", "COMMERCE", "BUREAU"]),
  transaction: z.enum(["VENTE", "LOCATION"]),
  prix: z.coerce.number().positive("Prix doit être positif").max(100_000_000),
  surface: z.coerce.number().positive("Surface doit être positive").max(10_000),
  nbPieces: z.coerce.number().int().min(1).max(50),
  nbChambres: z.coerce.number().int().min(0).max(50).optional().default(0),
  etage: z.coerce.number().int().min(-5).max(200).nullable().optional(),
  adresse: sanitizedString(300),
  codePostal: z.string().trim().regex(postalCodeRegex, "Code postal invalide"),
  ville: sanitizedString(100),
  latitude: z.coerce.number().min(-90).max(90).nullable().optional(),
  longitude: z.coerce.number().min(-180).max(180).nullable().optional(),
  statut: z.enum(["DISPONIBLE", "EN_OPTION", "SOUS_COMPROMIS", "VENDU"]).optional().default("DISPONIBLE"),
  disponible: z.boolean().optional().default(true),
  enVedette: z.boolean().optional().default(false),
  dpe: z.enum(["A", "B", "C", "D", "E", "F", "G"]).nullable().optional(),
  ges: z.enum(["A", "B", "C", "D", "E", "F", "G"]).nullable().optional(),
  anneeConstruction: z.coerce.number().int().min(1800).max(new Date().getFullYear()).nullable().optional(),
  parking: z.boolean().optional().default(false),
  balcon: z.boolean().optional().default(false),
  terrasse: z.boolean().optional().default(false),
  ascenseur: z.boolean().optional().default(false),
  gardien: z.boolean().optional().default(false),
  piscine: z.boolean().optional().default(false),
  cave: z.boolean().optional().default(false),
  meuble: z.boolean().optional().default(false),
  digicode: z.boolean().optional().default(false),
  doubleVitrage: z.boolean().optional().default(false),
  fibreOptique: z.boolean().optional().default(false),
  alarme: z.boolean().optional().default(false),
  cuisineEquipee: z.boolean().optional().default(false),
  parquet: z.boolean().optional().default(false),
  handicapAcces: z.boolean().optional().default(false),
  portailAutomatique: z.boolean().optional().default(false),
  chargesmensuelles: z.coerce.number().min(0).max(100_000).nullable().optional(),
  honoraires: z.coerce.number().min(0).max(100_000).nullable().optional(),
  commissionPartenaire: z.coerce.number().min(0).max(100).nullable().optional(),
  photoUrls: z.union([z.string(), z.array(z.union([z.string(), z.object({ url: z.string(), nom: z.string().optional() })]))]).optional(),
});

// ============================================
// ADMIN — PROGRAMMES
// ============================================

export const programmeSchema = z.object({
  nom: sanitizedString(200),
  description: z.string().trim().min(10).max(5000),
  promoteur: sanitizedString(200),
  adresse: sanitizedString(300),
  codePostal: z.string().trim().regex(postalCodeRegex, "Code postal invalide"),
  ville: sanitizedString(100),
  datelivraison: z.string().trim().max(50).nullable().optional(),
  statut: z.enum(["EN_COMMERCIALISATION", "BIENTOT", "LIVRE"]).optional().default("EN_COMMERCIALISATION"),
  nbLotsTotal: z.coerce.number().int().min(0).max(10_000).optional().default(0),
  prixMin: z.coerce.number().min(0).nullable().optional(),
  prixMax: z.coerce.number().min(0).nullable().optional(),
  surfaceMin: z.coerce.number().min(0).nullable().optional(),
  surfaceMax: z.coerce.number().min(0).nullable().optional(),
  normeRT: z.string().trim().max(50).nullable().optional(),
  parking: z.boolean().optional().default(false),
  terrasse: z.boolean().optional().default(false),
  balcon: z.boolean().optional().default(false),
  piscine: z.boolean().optional().default(false),
  jardin: z.boolean().optional().default(false),
  enVedette: z.boolean().optional().default(false),
  commissionPartenaire: z.coerce.number().min(0).max(100).nullable().optional(),
});

export const photoProgrammeSchema = z.object({
  url: z.string().trim().min(1).max(2000),
  nom: z.string().trim().max(200).optional(),
  type: z.enum(["PHOTO", "PLAN", "VUE_3D"]).optional().default("PHOTO"),
});

export const documentProgrammeSchema = z.object({
  nom: sanitizedString(200),
  type: z.enum(["PLAQUETTE", "PLAN", "NOTICE_DESCRIPTIVE", "GRILLE_PRIX", "AUTRE"]).optional().default("AUTRE"),
  url: z.string().trim().min(1).max(2000),
  taille: z.coerce.number().min(0).optional().default(0),
  public: z.boolean().optional().default(true),
});

export const lotSchema = z.object({
  id: z.string().cuid().optional(),
  numero: sanitizedString(50),
  type: z.enum(["STUDIO", "T1", "T2", "T3", "T4", "T5"]),
  surface: z.coerce.number().positive().max(10_000),
  etage: z.coerce.number().int().min(-5).max(200),
  orientation: z.string().trim().max(50).nullable().optional(),
  prix: z.coerce.number().positive().max(100_000_000),
  nbChambres: z.coerce.number().int().min(0).max(50).optional().default(0),
  terrasse: z.coerce.number().min(0).max(1000).nullable().optional(),
  balcon: z.coerce.number().min(0).max(1000).nullable().optional(),
  jardin: z.coerce.number().min(0).max(10_000).nullable().optional(),
  parking: z.boolean().optional().default(false),
  statut: z.enum(["DISPONIBLE", "RESERVE", "OPTION", "VENDU"]).optional().default("DISPONIBLE"),
  planUrl: z.string().trim().max(2000).nullable().optional(),
});

// ============================================
// ADMIN — PARTENAIRES
// ============================================

export const partenaireSchema = z.object({
  email: z.string().trim().email("Email invalide").max(255),
  nom: sanitizedString(100),
  prenom: sanitizedString(100),
  telephone: z.string().trim().regex(phoneRegex, "Téléphone invalide").optional().or(z.literal("")),
  entreprise: sanitizedString(200),
  password: z.string().min(8, "8 caractères minimum").max(128).optional(),
});

export const partenaireUpdateSchema = partenaireSchema.partial();

// ============================================
// ADMIN — TÉMOIGNAGES (CMS contenu public)
// ============================================

export const temoignageSchema = z.object({
  nom: sanitizedString(100),
  ville: sanitizedString(100),
  texte: z.string().trim().min(10).max(1000),
  note: z.coerce.number().int().min(1).max(5).optional().default(5),
  ordre: z.coerce.number().int().min(0).max(1000).optional().default(0),
  visible: z.boolean().optional().default(true),
});

// ============================================
// ADMIN — LEADS (CRM)
// ============================================

export const leadSchema = z.object({
  nom: sanitizedString(100),
  prenom: sanitizedString(100),
  email: z.string().trim().email("Email invalide").max(255),
  telephone: z.string().trim().regex(phoneRegex, "Téléphone invalide").optional().or(z.literal("")),
  source: z.enum(["SITE_WEB", "PARTENAIRE", "RECOMMANDATION", "APPEL_ENTRANT", "RESEAU_SOCIAL", "AUTRE"]),
  notes: z.string().trim().max(5000).optional().or(z.literal("")),
});

export const activiteSchema = z.object({
  type: z.enum(["APPEL", "EMAIL", "VISITE", "NOTE", "RELANCE", "OFFRE", "AUTRE"]),
  description: sanitizedString(1000),
  dateEcheance: z.string().trim().optional().refine((d) => !d || !isNaN(Date.parse(d)), "Date invalide"),
});

// ============================================
// PARTENAIRE — DOCUMENTS & OPTIONS
// ============================================

export const documentPartenaireSchema = z.object({
  nom: sanitizedString(200),
  type: z.enum(["MANDAT", "COMPROMIS", "OFFRE", "RESERVATION", "FINANCEMENT", "CARTE_T", "KBIS", "CONTRAT_PARTENARIAT", "AUTRE"]),
  url: z.string().trim().min(1).max(2000),
  taille: z.coerce.number().min(0).max(50_000_000).optional().default(0),
  bienId: z.string().cuid().nullable().optional(),
  lotId: z.string().cuid().nullable().optional(),
  commentaire: z.string().trim().max(2000).optional().or(z.literal("")),
});

export const optionSchema = z.object({
  lotId: z.string().cuid("ID lot invalide"),
  message: z.string().trim().max(1000).optional().or(z.literal("")),
});

// ============================================
// MESSAGERIE INTERNE — ADMIN ↔ PARTENAIRE
// ============================================

export const messageSchema = z.object({
  // Requis quand l'expéditeur est ADMIN (choix du partenaire destinataire).
  // Ignoré côté serveur quand l'expéditeur est PARTENAIRE (toujours adressé à l'agence).
  destinataireId: z.string().cuid("ID destinataire invalide").optional(),
  contenu: sanitizedString(3000),
});
