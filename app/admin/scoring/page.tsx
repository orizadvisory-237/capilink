"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { formatFCFA } from "@/lib/utils";
import { STATUTS_SCORING } from "@/lib/constants";
import { StatutScoring } from "@/lib/types";
import { Search, Loader2, Clock, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";

interface DossierScoring {
  id: string;
  reference: string;
  titre: string;
  secteur: string;
  porteurPrenom: string;
  porteurNom: string;
  forfait: "STARTER" | "GROWTH" | "PREMIUM";
  montantRecherche: number;
  statut: string;
  paiementConfirme: boolean;
  soumisLe: string;
  scoreTotal: number | null;
}

const FORFAIT_STYLES: Record<string, string> = {
  STARTER: "bg-gray-100 text-gray-700",
  GROWTH: "bg-blue-100 text-blue-700",
  PREMIUM: "bg-[#C9A84C]/10 text-[#C9A84C]",
};

const ONGLETS = [
  { key: "TOUS", label: "Tous" },
  { key: "EN_ATTENTE", label: "En attente" },
  { key: "EN_COURS", label: "En cours" },
] as const;

function joursDepuis(dateStr: string): number {
  return Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24)
  );
}

export default function ScoringIndexPage() {
  const [dossiers, setDossiers] = useState<DossierScoring[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [onglet, setOnglet] = useState("TOUS");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchDossiers = async () => {
      try {
        // Fetch dossiers EN_ATTENTE et EN_COURS
        const [resAttente, resCours] = await Promise.all([
          fetch("/api/projets/admin?statut=EN_ATTENTE&limit=100"),
          fetch("/api/projets/admin?statut=EN_COURS&limit=100"),
        ]);

        const allDossiers: DossierScoring[] = [];

        for (const res of [resAttente, resCours]) {
          if (res.ok) {
            const data = await res.json();
            if (data.success) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const mapped = data.projets.map((p: any) => ({
                id: p.id,
                reference: p.reference || "—",
                titre: p.titre,
                secteur: p.secteur,
                porteurPrenom: p.porteur?.prenom || "",
                porteurNom: p.porteur?.nom || "",
                forfait: p.forfait || "STARTER",
                montantRecherche: Number(p.montantRecherche),
                statut: p.statutScoring || "EN_ATTENTE",
                paiementConfirme: p.paiementStatut === "CONFIRME",
                soumisLe: p.createdAt,
                scoreTotal: p.scoreTotal,
              }));
              allDossiers.push(...mapped);
            }
          }
        }

        setDossiers(allDossiers);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDossiers();
  }, []);

  const filtered = useMemo(() => {
    let list = dossiers;
    if (onglet !== "TOUS") list = list.filter((d) => d.statut === onglet);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (d) =>
          d.titre.toLowerCase().includes(q) ||
          d.reference.toLowerCase().includes(q) ||
          d.porteurNom.toLowerCase().includes(q)
      );
    }
    // Tri par urgence : les plus anciens en premier
    return [...list].sort(
      (a, b) => new Date(a.soumisLe).getTime() - new Date(b.soumisLe).getTime()
    );
  }, [dossiers, onglet, search]);

  const counts = useMemo(() => ({
    TOUS: dossiers.length,
    EN_ATTENTE: dossiers.filter((d) => d.statut === "EN_ATTENTE").length,
    EN_COURS: dossiers.filter((d) => d.statut === "EN_COURS").length,
  }), [dossiers]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-[#0A1628]">En cours de scoring</h1>
        <p className="text-sm text-[#6B7280]">
          {isLoading
            ? "Chargement…"
            : `${dossiers.length} dossier${dossiers.length > 1 ? "s" : ""} à traiter`}
        </p>
      </div>

      {/* Onglets */}
      <div className="flex gap-1 overflow-x-auto border-b">
        {ONGLETS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setOnglet(tab.key)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 text-sm whitespace-nowrap border-b-2 transition-colors",
              onglet === tab.key
                ? "border-[#C9A84C] text-[#0A1628] font-medium"
                : "border-transparent text-[#6B7280]"
            )}
          >
            {tab.label}
            <span
              className={cn(
                "px-1.5 py-0.5 text-[10px] font-bold rounded-full",
                onglet === tab.key
                  ? "bg-[#C9A84C]/20 text-[#C9A84C]"
                  : "bg-gray-100 text-[#6B7280]"
              )}
            >
              {counts[tab.key as keyof typeof counts] || 0}
            </span>
          </button>
        ))}
      </div>

      {/* Recherche */}
      <div className="relative max-w-sm">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]"
        />
        <Input
          placeholder="Rechercher par titre, ref, porteur…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8"
        />
      </div>

      {/* Contenu */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-[#C9A84C]" />
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid gap-3">
          {filtered.map((d) => {
            const jours = joursDepuis(d.soumisLe);
            const urgent = jours > 7;
            const statut = STATUTS_SCORING[d.statut as StatutScoring];
            const enCours = d.statut === "EN_COURS";

            return (
              <Link
                key={d.id}
                href={`/admin/scoring/${d.id}`}
                className={cn(
                  "bg-white rounded-lg border p-4 hover:shadow-md transition-all group flex items-center gap-4",
                  urgent && "border-amber-300 bg-amber-50/30"
                )}
              >
                {/* Indicateur urgence */}
                <div
                  className={cn(
                    "w-1.5 h-12 rounded-full flex-shrink-0",
                    urgent
                      ? "bg-amber-500"
                      : enCours
                      ? "bg-blue-500"
                      : "bg-gray-300"
                  )}
                />

                {/* Infos principales */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-[#6B7280]">
                      {d.reference}
                    </span>
                    <span
                      className={cn(
                        "px-2 py-0.5 text-[10px] font-bold rounded-full uppercase",
                        FORFAIT_STYLES[d.forfait]
                      )}
                    >
                      {d.forfait}
                    </span>
                    {statut && (
                      <span
                        className={cn(
                          "px-2 py-0.5 text-[10px] font-medium rounded-full",
                          statut.couleur
                        )}
                      >
                        {statut.label}
                      </span>
                    )}
                    {urgent && (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-700">
                        ⚠ Urgent
                      </span>
                    )}
                  </div>
                  <p className="font-medium text-[#0A1628] truncate">
                    {d.titre}
                  </p>
                  <div className="flex items-center gap-4 mt-1 text-xs text-[#6B7280]">
                    <span>
                      {d.porteurPrenom} {d.porteurNom.charAt(0)}.
                    </span>
                    <span>{d.secteur}</span>
                    <span>{formatFCFA(d.montantRecherche)}</span>
                  </div>
                </div>

                {/* Délai + CTA */}
                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="text-right">
                    <div
                      className={cn(
                        "flex items-center gap-1 text-xs",
                        urgent ? "text-amber-600 font-medium" : "text-[#6B7280]"
                      )}
                    >
                      <Clock size={12} />
                      <span>
                        {jours === 0
                          ? "Aujourd'hui"
                          : `${jours} jour${jours > 1 ? "s" : ""}`}
                      </span>
                    </div>
                    {!d.paiementConfirme && (
                      <span className="text-[10px] text-amber-600">
                        ⚠ Paiement en attente
                      </span>
                    )}
                  </div>
                  <div
                    className={cn(
                      "px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors",
                      enCours
                        ? "bg-[#0A1628] text-white group-hover:bg-[#0A1628]/80"
                        : "bg-[#C9A84C] text-[#0A1628] group-hover:bg-[#b09240]"
                    )}
                  >
                    {enCours ? "Continuer" : "Démarrer"}
                    <ArrowRight size={12} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">✅</p>
          <p className="text-lg font-medium text-[#0A1628]">
            Aucun dossier en attente
          </p>
          <p className="text-sm text-[#6B7280] mt-1">
            Tous les dossiers ont été traités. Bravo !
          </p>
        </div>
      )}
    </div>
  );
}
