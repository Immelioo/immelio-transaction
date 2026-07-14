export type Role = "CLIENT" | "PARTENAIRE" | "AGENT" | "ADMIN";

export type TypeBien = "APPARTEMENT" | "MAISON" | "STUDIO" | "LOFT" | "COMMERCE" | "BUREAU";

export type TypeTransaction = "VENTE" | "LOCATION";

export type StatutDemande = "NOUVELLE" | "EN_COURS" | "TRAITEE" | "ARCHIVEE";

export type StatutVisite = "EN_ATTENTE" | "CONFIRMEE" | "ANNULEE" | "EFFECTUEE";

export type StatutLead = "NOUVEAU" | "CONTACTE" | "QUALIFIE" | "PROPOSITION" | "NEGOCE" | "GAGNE" | "PERDU";

export type DPE = "A" | "B" | "C" | "D" | "E" | "F" | "G";

export interface FiltresBiens {
  type?: TypeBien;
  transaction?: TypeTransaction;
  ville?: string;
  prixMin?: number;
  prixMax?: number;
  surfaceMin?: number;
  surfaceMax?: number;
  nbPiecesMin?: number;
}
