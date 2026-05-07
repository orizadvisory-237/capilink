"use client";

import Link from "next/link";
import { formatFCFA } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { STATUTS_SCORING } from "@/lib/constants";
import { StatutScoring } from "@/lib/types";
import { ArrowUpDown } from "lucide-react";

/** Shape attendue par DossierTable */
export interface DossierAdmin {
  id: string;
  reference: string;
  projetId: string;
  titre: string;
  secteur: string;
  porteurPrenom: string;
  porteurNom: string;
  porteurVille: string;
  forfait: "STARTER" | "GROWTH" | "PREMIUM";
  montantRecherche: number;
  statut: string;
  paiementConfirme: boolean;
  soumisLe: string;
  analysteId: string | null;
  scoreTotal: number | null;
}

interface DossierTableProps {
  dossiers: DossierAdmin[];
  triColonne?: string;
  onTri?: (col: string) => void;
}

const FORFAIT_STYLES = {
  STARTER: "bg-gray-100 text-gray-700",
  GROWTH: "bg-blue-100 text-blue-700",
  PREMIUM: "bg-[#C9A84C]/10 text-[#C9A84C]",
};

function ThSort({ col, label, triColonne, onTri }: { col: string; label: string; triColonne?: string; onTri?: (col: string) => void }) {
  return (
    <button
      onClick={() => onTri?.(col)}
      className="flex items-center gap-1 hover:text-[#C9A84C] transition-colors"
    >
      {label}
      <ArrowUpDown size={12} className={cn(triColonne === col ? "text-[#C9A84C]" : "text-gray-400")} />
    </button>
  );
}

function jourDepuis(dateStr: string): string {
  const now = new Date();
  const d = new Date(dateStr);
  const diff = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "aujourd'hui";
  if (diff === 1) return "il y a 1 jour";
  return `il y a ${diff} jours`;
}

export function DossierTable({ dossiers, triColonne, onTri }: DossierTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-y">
          <tr>
            <th className="text-left px-3 py-3 text-xs font-medium text-[#6B7280] whitespace-nowrap">
              <ThSort col="reference" label="Référence" triColonne={triColonne} onTri={onTri} />
            </th>
            <th className="text-left px-3 py-3 text-xs font-medium text-[#6B7280]">Projet</th>
            <th className="text-left px-3 py-3 text-xs font-medium text-[#6B7280]">Porteur</th>
            <th className="text-left px-3 py-3 text-xs font-medium text-[#6B7280]">Forfait</th>
            <th className="text-left px-3 py-3 text-xs font-medium text-[#6B7280]">
              <ThSort col="montant" label="Montant" triColonne={triColonne} onTri={onTri} />
            </th>
            <th className="text-left px-3 py-3 text-xs font-medium text-[#6B7280]">Statut</th>
            <th className="text-left px-3 py-3 text-xs font-medium text-[#6B7280]">
              <ThSort col="date" label="Soumis le" triColonne={triColonne} onTri={onTri} />
            </th>
            <th className="text-left px-3 py-3 text-xs font-medium text-[#6B7280]">Paiement</th>
            <th className="text-right px-3 py-3 text-xs font-medium text-[#6B7280]">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {dossiers.map((d) => {
            const statut = STATUTS_SCORING[d.statut as StatutScoring];
            const joursSoumis = Math.floor(
              (new Date().getTime() - new Date(d.soumisLe).getTime()) / (1000 * 60 * 60 * 24)
            );
            const urgent = joursSoumis > 7 && (d.statut === "EN_ATTENTE" || d.statut === "EN_COURS");

            return (
              <tr key={d.id} className={cn("hover:bg-gray-50 transition-colors", urgent && "bg-amber-50/50")}>
                <td className="px-3 py-3 font-mono text-xs text-[#6B7280] whitespace-nowrap">
                  {urgent && <span className="text-amber-500 mr-1">⚠</span>}
                  {d.reference}
                </td>
                <td className="px-3 py-3">
                  <p className="font-medium text-[#0A1628] line-clamp-1">{d.titre}</p>
                  <span className="text-[10px] text-[#6B7280]">{d.secteur}</span>
                </td>
                <td className="px-3 py-3 text-[#6B7280] whitespace-nowrap">
                  {d.porteurPrenom} {d.porteurNom.charAt(0)}.
                  <br />
                  <span className="text-[10px]">{d.porteurVille}</span>
                </td>
                <td className="px-3 py-3">
                  <span className={cn("px-2 py-0.5 text-[10px] font-bold rounded-full uppercase", FORFAIT_STYLES[d.forfait])}>
                    {d.forfait}
                  </span>
                </td>
                <td className="px-3 py-3 text-[#0A1628] font-medium whitespace-nowrap">
                  {formatFCFA(d.montantRecherche)}
                </td>
                <td className="px-3 py-3">
                  {statut && (
                    <span className={cn("px-2 py-0.5 text-[10px] font-medium rounded-full", statut.couleur)}>
                      {statut.label}
                    </span>
                  )}
                </td>
                <td className="px-3 py-3 text-[#6B7280] whitespace-nowrap text-xs">
                  {new Date(d.soumisLe).toLocaleDateString("fr-FR")}
                  <br />
                  <span className={cn("text-[10px]", urgent ? "text-amber-600 font-medium" : "text-[#6B7280]")}>
                    {jourDepuis(d.soumisLe)}
                  </span>
                </td>
                <td className="px-3 py-3">
                  {d.paiementConfirme ? (
                    <span className="text-[10px] font-medium text-[#2D6A4F]">✓ Confirmé</span>
                  ) : (
                    <span className="text-[10px] font-medium text-amber-600">⚠ En attente</span>
                  )}
                </td>
                <td className="px-3 py-3 text-right">
                  <div className="flex items-center justify-end gap-1 flex-wrap">
                    {(d.statut === "EN_ATTENTE") && (
                      <Link
                        href={`/admin/scoring/${d.projetId}`}
                        className="px-2 py-1 bg-[#C9A84C] text-[#0A1628] text-[10px] font-bold rounded hover:bg-[#b09240] transition-colors whitespace-nowrap"
                      >
                        Démarrer →
                      </Link>
                    )}
                    {(d.statut === "EN_COURS") && (
                      <Link
                        href={`/admin/scoring/${d.projetId}`}
                        className="px-2 py-1 bg-[#0A1628] text-white text-[10px] font-bold rounded hover:bg-[#0A1628]/80 transition-colors whitespace-nowrap"
                      >
                        Continuer →
                      </Link>
                    )}
                    {(d.statut === "PRIORITAIRE" || d.statut === "STANDARD") && (
                      <Link
                        href={`/admin/scoring/${d.projetId}/rapport`}
                        className="px-2 py-1 border border-[#0A1628] text-[#0A1628] text-[10px] rounded hover:bg-gray-50 transition-colors whitespace-nowrap"
                      >
                        Rapport
                      </Link>
                    )}
                    {d.statut === "ACCOMPAGNEMENT" && (
                      <span className="px-2 py-1 border text-[10px] rounded text-[#6B7280]">Contacter</span>
                    )}
                    {d.statut === "REJETE" && (
                      <Link
                        href={`/admin/scoring/${d.projetId}`}
                        className="px-2 py-1 border text-[10px] rounded text-[#6B7280] hover:bg-gray-50"
                      >
                        Réexaminer
                      </Link>
                    )}
                    <Link
                      href={`/projet/${d.projetId}`}
                      className="px-2 py-1 border text-[10px] rounded text-[#6B7280] hover:bg-gray-50 whitespace-nowrap"
                    >
                      Voir
                    </Link>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
