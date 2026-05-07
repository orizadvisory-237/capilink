"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { StatutScoring } from "@/lib/types";
import { STATUTS_SCORING } from "@/lib/constants";
import { ChevronDown } from "lucide-react";

interface SuiviStatutProps {
  statutActuel: StatutScoring;
  onStatutChange: (statut: StatutScoring) => void;
  tousLesStatuts?: boolean;
}

const STATUTS_ORDRE: StatutScoring[] = [
  StatutScoring.EN_ATTENTE,
  StatutScoring.EN_COURS,
  StatutScoring.PRIORITAIRE,
  StatutScoring.STANDARD,
  StatutScoring.ACCOMPAGNEMENT,
  StatutScoring.REJETE,
];

export function SuiviStatut({ statutActuel, onStatutChange, tousLesStatuts = true }: SuiviStatutProps) {
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState<StatutScoring | null>(null);

  const current = STATUTS_SCORING[statutActuel];
  const options = tousLesStatuts
    ? STATUTS_ORDRE.filter((s) => s !== statutActuel)
    : STATUTS_ORDRE.filter((s) => s !== statutActuel);

  const handleSelect = (statut: StatutScoring) => {
    setOpen(false);
    setConfirming(statut);
  };

  const handleConfirm = () => {
    if (confirming) {
      onStatutChange(confirming);
      setConfirming(null);
    }
  };

  return (
    <>
      <div className="relative inline-block">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2 px-3 py-1.5 border rounded-lg text-sm hover:bg-gray-50 transition-colors"
        >
          <span className={cn("px-2 py-0.5 text-xs rounded-full font-medium", current?.couleur)}>
            {current?.label}
          </span>
          <ChevronDown size={14} className="text-[#6B7280]" />
        </button>

        {open && (
          <div className="absolute top-full left-0 mt-1 bg-white border rounded-lg shadow-lg z-20 min-w-[220px]">
            {options.map((statut) => {
              const cfg = STATUTS_SCORING[statut];
              return (
                <button
                  key={statut}
                  onClick={() => handleSelect(statut)}
                  className="w-full text-left flex items-center gap-2 px-3 py-2.5 hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg"
                >
                  <span className={cn("px-2 py-0.5 text-[10px] rounded-full font-medium", cfg.couleur)}>
                    {cfg.label}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Modale de confirmation */}
      {confirming && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-sm w-full p-6 shadow-xl">
            <h3 className="font-bold text-[#0A1628] mb-2">Confirmer le changement de statut</h3>
            <p className="text-sm text-[#6B7280] mb-4">
              Vous allez changer le statut vers{" "}
              <span className={cn("px-2 py-0.5 text-xs rounded-full font-medium", STATUTS_SCORING[confirming]?.couleur)}>
                {STATUTS_SCORING[confirming]?.label}
              </span>
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirming(null)}
                className="flex-1 border rounded-lg py-2 text-sm text-[#6B7280] hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 bg-[#0A1628] text-white rounded-lg py-2 text-sm font-medium hover:bg-[#0A1628]/90"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
