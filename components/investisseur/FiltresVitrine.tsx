"use client";

import { cn } from "@/lib/utils";
import { formatFCFA } from "@/lib/utils";
import { SECTEURS_ACTIVITE, TYPES_FINANCEMENT } from "@/lib/constants";
import type { FiltresVitrineExtended, SecteurActivite, BesoinsFinancement, StadeDeveloppement } from "@/lib/types";
import { X, SlidersHorizontal } from "lucide-react";
import { useState } from "react";

const ZONES = ["Yaoundé", "Douala", "Bafoussam", "Garoua", "Kribi", "Ngaoundéré", "National", "Sous-régional CEMAC"];
const STADES: { value: StadeDeveloppement; label: string }[] = [
  { value: "IDEE", label: "💡 Idée" },
  { value: "DEMARRAGE", label: "🌱 Démarrage" },
  { value: "CROISSANCE", label: "📈 Croissance" },
  { value: "EXPANSION", label: "🏢 Expansion" },
];

interface Props {
  filtres: FiltresVitrineExtended;
  onChange: (filtres: Partial<FiltresVitrineExtended>) => void;
  onReset: () => void;
  totalResultats: number;
}

export function FiltresVitrine({ filtres, onChange, onReset, totalResultats }: Props) {
  const [open, setOpen] = useState(false);

  const toggleArray = <T,>(arr: T[], item: T) =>
    arr.includes(item) ? arr.filter((v) => v !== item) : [...arr, item];

  const content = (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-[#0A1628]">Filtres</h3>
        <span className="text-xs bg-[#C9A84C]/10 text-[#C9A84C] px-2 py-0.5 rounded-full font-medium">
          {totalResultats} projet{totalResultats > 1 ? "s" : ""}
        </span>
      </div>

      {/* Secteur */}
      <div>
        <p className="text-sm font-medium text-[#0A1628] mb-2">Secteur d&apos;activité</p>
        <div className="space-y-1 max-h-48 overflow-y-auto">
          {SECTEURS_ACTIVITE.map((s) => (
            <label key={s.id} className="flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="checkbox"
                checked={filtres.secteurs.includes(s.id)}
                onChange={() => onChange({ secteurs: toggleArray(filtres.secteurs, s.id) })}
              />
              <span>{s.icon} {s.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Type financement */}
      <div>
        <p className="text-sm font-medium text-[#0A1628] mb-2">Type de financement</p>
        <div className="space-y-1">
          {TYPES_FINANCEMENT.map((t) => (
            <label key={t.id} className="flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="checkbox"
                checked={filtres.typesFinancement.includes(t.id)}
                onChange={() => onChange({ typesFinancement: toggleArray(filtres.typesFinancement, t.id) })}
              />
              <span>{t.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Ticket slider */}
      <div>
        <p className="text-sm font-medium text-[#0A1628] mb-2">Ticket d&apos;investissement</p>
        <div className="space-y-2">
          <input
            type="range"
            min={5000000} max={500000000} step={5000000}
            value={filtres.montantMin}
            onChange={(e) => onChange({ montantMin: Number(e.target.value) })}
            className="w-full accent-[#C9A84C]"
          />
          <input
            type="range"
            min={5000000} max={500000000} step={5000000}
            value={filtres.montantMax}
            onChange={(e) => onChange({ montantMax: Number(e.target.value) })}
            className="w-full accent-[#C9A84C]"
          />
          <div className="flex justify-between text-xs text-[#6B7280]">
            <span>{formatFCFA(filtres.montantMin)}</span>
            <span>{formatFCFA(filtres.montantMax)}</span>
          </div>
        </div>
      </div>

      {/* Stade */}
      <div>
        <p className="text-sm font-medium text-[#0A1628] mb-2">Stade de développement</p>
        <div className="space-y-1">
          {STADES.map((s) => (
            <label key={s.value} className="flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="checkbox"
                checked={filtres.stades.includes(s.value)}
                onChange={() => onChange({ stades: toggleArray(filtres.stades, s.value) })}
              />
              <span>{s.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Zone */}
      <div>
        <p className="text-sm font-medium text-[#0A1628] mb-2">Zone géographique</p>
        <div className="space-y-1 max-h-36 overflow-y-auto">
          {ZONES.map((z) => (
            <label key={z} className="flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="checkbox"
                checked={filtres.zones.includes(z)}
                onChange={() => onChange({ zones: toggleArray(filtres.zones, z) })}
              />
              <span>{z}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Score min */}
      <div>
        <p className="text-sm font-medium text-[#0A1628] mb-2">Score Oriz minimum : {filtres.scoreMin}/100</p>
        <input
          type="range"
          min={52} max={100} step={1}
          value={filtres.scoreMin}
          onChange={(e) => onChange({ scoreMin: Number(e.target.value) })}
          className="w-full accent-[#C9A84C]"
        />
      </div>

      {/* Prioritaires uniquement */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={filtres.prioritairesUniquement}
          onChange={() => onChange({ prioritairesUniquement: !filtres.prioritairesUniquement })}
        />
        <span className="text-sm font-medium">⭐ Prioritaires uniquement</span>
      </label>

      <button
        onClick={onReset}
        className="w-full text-sm text-[#6B7280] hover:text-[#C0392B] border rounded py-2 transition-colors"
      >
        Réinitialiser les filtres
      </button>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:block w-72 flex-shrink-0">
        <div className="sticky top-4 card p-5 bg-white">{content}</div>
      </div>

      {/* Mobile trigger */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 z-40 bg-[#0A1628] text-white p-3 rounded-full shadow-lg"
        aria-label="Ouvrir les filtres"
      >
        <SlidersHorizontal size={20} />
      </button>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setOpen(false)}>
          <div
            className="absolute inset-y-0 left-0 w-80 bg-[#F8F6F1] p-6 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-lg text-[#0A1628]">Filtres</h2>
              <button onClick={() => setOpen(false)} aria-label="Fermer">
                <X size={20} />
              </button>
            </div>
            {content}
          </div>
        </div>
      )}
    </>
  );
}
