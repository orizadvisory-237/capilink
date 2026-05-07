"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { formatFCFA } from "@/lib/utils";
import type { ProjetMock } from "@/lib/types";
import { SECTEURS_ACTIVITE } from "@/lib/constants";
import { Bookmark, ArrowRight, Eye } from "lucide-react";

interface ProjetCardProps {
  projet: ProjetMock;
  compact?: boolean;
  enregistre?: boolean;
  onToggleEnregistre?: (id: string) => void;
}

const STADE_LABELS: Record<string, string> = {
  IDEE: "💡 Idée",
  DEMARRAGE: "🌱 Démarrage",
  CROISSANCE: "📈 Croissance",
  EXPANSION: "🏢 Expansion",
};

const FINANCEMENT_LABELS: Record<string, string> = {
  EQUITY: "Capital",
  DETTE: "Dette",
  SUBVENTION: "Subvention",
  LEASING: "Leasing",
  MIXTE: "Mixte",
};

export function ProjetCard({ projet, enregistre, onToggleEnregistre }: ProjetCardProps) {
  const secteur = SECTEURS_ACTIVITE.find((s) => s.id === projet.secteur);
  const scorePct = (projet.scoreTotal / 100) * 100;

  return (
    <div
      className={cn(
        "group relative flex flex-col bg-white rounded-lg border overflow-hidden transition-all hover:shadow-lg hover:-translate-y-0.5",
        projet.statutScoring === "PRIORITAIRE"
          ? "border-t-[3px] border-t-[#C9A84C] border-gray-200"
          : "border-t-[3px] border-t-[#0A1628] border-gray-200"
      )}
    >
      {/* Badge statut */}
      <div className="absolute top-3 right-3 z-10 flex gap-1">
        {onToggleEnregistre && (
          <button
            onClick={(e) => { e.preventDefault(); onToggleEnregistre(projet.id); }}
            className={cn(
              "p-1.5 rounded-full transition-colors",
              enregistre ? "bg-[#C9A84C] text-white" : "bg-white/80 text-[#6B7280] hover:bg-gray-100"
            )}
            aria-label={enregistre ? "Retirer des favoris" : "Enregistrer"}
          >
            <Bookmark size={14} fill={enregistre ? "currentColor" : "none"} />
          </button>
        )}
        <span
          className={cn(
            "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
            projet.statutScoring === "PRIORITAIRE"
              ? "bg-[#C9A84C]/10 text-[#C9A84C]"
              : "bg-[#0A1628]/10 text-[#0A1628]"
          )}
        >
          {projet.statutScoring === "PRIORITAIRE" ? "⭐ Prioritaire" : "Standard"}
        </span>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        {/* Titre */}
        <h3 className="font-serif font-bold text-[#0A1628] text-lg leading-tight line-clamp-2 mb-2 pr-20">
          {projet.titre}
        </h3>

        {/* Méta */}
        <div className="flex items-center gap-2 text-xs text-[#6B7280] mb-3">
          <span>{secteur?.icon} {secteur?.label}</span>
          <span>·</span>
          <span>{projet.ville}</span>
        </div>

        {/* Description */}
        <p className="text-sm text-[#6B7280] line-clamp-3 mb-4 flex-1">
          {projet.description}
        </p>

        <div className="border-t pt-4 space-y-3">
          {/* Montant + type */}
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-[#C9A84C]">{formatFCFA(projet.montantRecherche)}</span>
            <span className="text-xs px-2 py-0.5 border rounded-full text-[#6B7280]">
              {FINANCEMENT_LABELS[projet.typeFinancement] || projet.typeFinancement}
            </span>
          </div>

          {/* Score barre */}
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-[#C9A84C] h-1.5 rounded-full transition-all"
                style={{ width: `${scorePct}%` }}
              />
            </div>
            <span className="text-xs font-bold text-[#0A1628]">{projet.scoreTotal}/100</span>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#6B7280]">{STADE_LABELS[projet.stade]}</span>
            <Link
              href={`/projet/${projet.id}`}
              className="inline-flex items-center gap-1 text-sm font-medium text-[#0A1628] hover:text-[#C9A84C] transition-colors"
            >
              Voir le projet <ArrowRight size={14} />
            </Link>
          </div>

          {/* Vues */}
          <div className="flex items-center gap-1 text-[10px] text-[#6B7280]">
            <Eye size={10} /> {projet.nombreVues} vues
          </div>
        </div>
      </div>
    </div>
  );
}
