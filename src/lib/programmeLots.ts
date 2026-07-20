export interface ProgrammeLotInput {
  id?: string;
  numero: string;
  type: string;
  surface: number;
  etage: number;
  orientation?: string | null;
  prix: number;
  nbChambres: number;
  terrasse?: number | null;
  balcon?: number | null;
  jardin?: number | null;
  parking: boolean;
  statut: string;
  planUrl?: string | null;
}

export interface ExistingProgrammeLot {
  id: string;
  optionCount: number;
}

export interface ProgrammeLotChangePlan {
  toCreate: ProgrammeLotInput[];
  toUpdate: Array<Required<Pick<ProgrammeLotInput, "id">> & Omit<ProgrammeLotInput, "id">>;
  toDelete: string[];
  blocked: ExistingProgrammeLot[];
}

export function planProgrammeLotChanges(
  existingLots: ExistingProgrammeLot[],
  incomingLots: ProgrammeLotInput[],
): ProgrammeLotChangePlan {
  const existingById = new Map(existingLots.map((lot) => [lot.id, lot]));
  const incomingIds = new Set(
    incomingLots
      .map((lot) => lot.id)
      .filter((id): id is string => Boolean(id && existingById.has(id))),
  );

  const blocked = existingLots.filter(
    (lot) => !incomingIds.has(lot.id) && lot.optionCount > 0,
  );

  const toUpdate = incomingLots.filter(
    (lot): lot is Required<Pick<ProgrammeLotInput, "id">> & Omit<ProgrammeLotInput, "id"> =>
      Boolean(lot.id && existingById.has(lot.id)),
  );

  const toCreate = incomingLots.filter((lot) => !lot.id || !existingById.has(lot.id));

  const toDelete = existingLots
    .filter((lot) => !incomingIds.has(lot.id) && lot.optionCount === 0)
    .map((lot) => lot.id);

  return { toCreate, toUpdate, toDelete, blocked };
}
