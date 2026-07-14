"use client";

import { useState } from "react";
import { formatPrix } from "@/lib/utils";
import OptionForm from "./OptionForm";

interface Lot {
  id: string;
  numero: string;
  type: string;
  surface: number;
  etage: number | null;
  orientation: string | null;
  prix: number;
  statut: string;
}

interface LotGridProps {
  lots: Lot[];
}

const statutStyles: Record<string, string> = {
  DISPONIBLE: "bg-green-50 text-green-700",
  OPTION: "bg-orange-50 text-orange-700",
  RESERVE: "bg-blue-50 text-blue-700",
  VENDU: "bg-red-50 text-red-700",
};

const statutLabels: Record<string, string> = {
  DISPONIBLE: "Disponible",
  OPTION: "Option",
  RESERVE: "Reserve",
  VENDU: "Vendu",
};

export default function LotGrid({ lots }: LotGridProps) {
  const [optionLot, setOptionLot] = useState<Lot | null>(null);

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left">
              <th className="px-3 py-2 font-semibold text-gray-600">N&deg;</th>
              <th className="px-3 py-2 font-semibold text-gray-600">Type</th>
              <th className="px-3 py-2 font-semibold text-gray-600">Surface</th>
              <th className="px-3 py-2 font-semibold text-gray-600">Etage</th>
              <th className="px-3 py-2 font-semibold text-gray-600">Orientation</th>
              <th className="px-3 py-2 font-semibold text-gray-600">Prix</th>
              <th className="px-3 py-2 font-semibold text-gray-600">Statut</th>
              <th className="px-3 py-2 font-semibold text-gray-600"></th>
            </tr>
          </thead>
          <tbody>
            {lots.map((lot) => (
              <tr key={lot.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                <td className="px-3 py-2.5 font-medium text-gray-900">{lot.numero}</td>
                <td className="px-3 py-2.5 text-gray-700">{lot.type}</td>
                <td className="px-3 py-2.5 text-gray-700">{lot.surface} m&sup2;</td>
                <td className="px-3 py-2.5 text-gray-700">
                  {lot.etage != null ? (lot.etage === 0 ? "RDC" : `${lot.etage}`) : "-"}
                </td>
                <td className="px-3 py-2.5 text-gray-700">{lot.orientation || "-"}</td>
                <td className="px-3 py-2.5 font-semibold text-gray-900">{formatPrix(lot.prix)}</td>
                <td className="px-3 py-2.5">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statutStyles[lot.statut] || "bg-gray-100 text-gray-600"}`}>
                    {statutLabels[lot.statut] || lot.statut}
                  </span>
                </td>
                <td className="px-3 py-2.5">
                  {lot.statut === "DISPONIBLE" && (
                    <button
                      onClick={() => setOptionLot(lot)}
                      className="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors whitespace-nowrap"
                    >
                      Poser une option
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {optionLot && (
        <OptionForm
          lotId={optionLot.id}
          lotNumero={optionLot.numero}
          onClose={() => setOptionLot(null)}
        />
      )}
    </>
  );
}
