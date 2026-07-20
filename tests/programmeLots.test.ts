import test from "node:test";
import assert from "node:assert/strict";
import { planProgrammeLotChanges } from "../src/lib/programmeLots";

test("planProgrammeLotChanges bloque la suppression implicite d'un lot déjà optionné", () => {
  const plan = planProgrammeLotChanges(
    [
      { id: "lot-a", optionCount: 2 },
      { id: "lot-b", optionCount: 0 },
    ],
    [
      {
        id: "lot-b",
        numero: "B102",
        type: "T2",
        surface: 48,
        etage: 1,
        orientation: "SUD",
        prix: 260000,
        nbChambres: 1,
        terrasse: null,
        balcon: null,
        jardin: null,
        parking: false,
        statut: "DISPONIBLE",
        planUrl: null,
      },
    ],
  );

  assert.deepEqual(plan.blocked, [{ id: "lot-a", optionCount: 2 }]);
  assert.deepEqual(plan.toDelete, []);
  assert.equal(plan.toUpdate.length, 1);
});

test("planProgrammeLotChanges distingue création, mise à jour et suppression saine", () => {
  const plan = planProgrammeLotChanges(
    [
      { id: "lot-a", optionCount: 0 },
      { id: "lot-b", optionCount: 0 },
    ],
    [
      {
        id: "lot-a",
        numero: "A101",
        type: "T3",
        surface: 67,
        etage: 2,
        orientation: "EST",
        prix: 390000,
        nbChambres: 2,
        terrasse: 8,
        balcon: null,
        jardin: null,
        parking: true,
        statut: "DISPONIBLE",
        planUrl: null,
      },
      {
        numero: "C301",
        type: "T4",
        surface: 89,
        etage: 3,
        orientation: "OUEST",
        prix: 510000,
        nbChambres: 3,
        terrasse: 15,
        balcon: null,
        jardin: null,
        parking: true,
        statut: "DISPONIBLE",
        planUrl: null,
      },
    ],
  );

  assert.deepEqual(plan.blocked, []);
  assert.deepEqual(plan.toDelete, ["lot-b"]);
  assert.equal(plan.toUpdate.length, 1);
  assert.equal(plan.toCreate.length, 1);
});
