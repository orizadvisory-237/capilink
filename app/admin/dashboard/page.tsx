"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { StatCard } from "@/components/admin/StatCard";
import { DossierTable, type DossierAdmin } from "@/components/admin/DossierTable";
import { HistoriqueTimeline, type ActionHistorique } from "@/components/admin/HistoriqueTimeline";
import { SECTEURS_ACTIVITE } from "@/lib/constants";
import { Loader2 } from "lucide-react";

// Données SVG graphique mensuel (sera alimenté dynamiquement dans une version ultérieure)
const MAX_BAR = 15;
const BAR_W = 20;
const GAP = 8;
const GROUP_W = BAR_W * 2 + GAP;
const GROUP_GAP = 24;
const SVG_H = 120;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ActiviteChart({ data }: { data: { mois: string; recus: number; publies: number }[] }) {
  const SVG_W_LOCAL = data.length * (GROUP_W + GROUP_GAP) + 40;
  const max = Math.max(...data.map((d) => Math.max(d.recus, d.publies)), 1);
  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${SVG_W_LOCAL} ${SVG_H + 40}`} className="w-full max-w-lg mx-auto">
        {/* Grille */}
        {[0, Math.round(max / 3), Math.round(max * 2 / 3), max].map((v) => {
          const y = SVG_H - (v / max) * SVG_H;
          return (
            <g key={v}>
              <line x1={30} x2={SVG_W_LOCAL - 10} y1={y} y2={y} stroke="#e5e7eb" strokeWidth="0.5" />
              <text x={25} y={y + 3} textAnchor="end" fontSize="8" fill="#9ca3af">{v}</text>
            </g>
          );
        })}
        {/* Barres */}
        {data.map((d, i) => {
          const x = 35 + i * (GROUP_W + GROUP_GAP);
          const hRecus = (d.recus / max) * SVG_H;
          const hPublies = (d.publies / max) * SVG_H;
          return (
            <g key={d.mois}>
              <rect x={x} y={SVG_H - hRecus} width={BAR_W} height={hRecus} fill="#0A1628" rx="2" />
              <rect x={x + BAR_W + GAP} y={SVG_H - hPublies} width={BAR_W} height={hPublies} fill="#C9A84C" rx="2" />
              <text x={x + GROUP_W / 2} y={SVG_H + 14} textAnchor="middle" fontSize="9" fill="#6B7280">{d.mois}</text>
            </g>
          );
        })}
        {/* Légende */}
        <g transform={`translate(35, ${SVG_H + 28})`}>
          <rect width="10" height="10" fill="#0A1628" rx="2" />
          <text x={14} y={8} fontSize="9" fill="#6B7280">Dossiers reçus</text>
          <rect x={90} width="10" height="10" fill="#C9A84C" rx="2" />
          <text x={104} y={8} fontSize="9" fill="#6B7280">Projets publiés</text>
        </g>
      </svg>
    </div>
  );
}

function SecteursBars({ data }: { data: { secteur: string; count: number }[] }) {
  const max = data[0]?.count || 1;
  return (
    <div className="space-y-2">
      {data.map(({ secteur: secteurKey, count }) => {
        const secteur = SECTEURS_ACTIVITE.find((s) => s.id === secteurKey);
        const pct = (count / max) * 100;
        return (
          <div key={secteurKey} className="flex items-center gap-3 text-sm">
            <span className="w-32 text-[#6B7280] text-xs truncate">{secteur?.icon} {secteur?.label || secteurKey}</span>
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div className="bg-[#C9A84C] h-2 rounded-full" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-xs font-bold text-[#0A1628] w-4">{count}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function DashboardPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [stats, setStats] = useState<any>(null);
  const [recentDossiers, setRecentDossiers] = useState<DossierAdmin[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch stats + recent dossiers in parallel
        const [statsRes, dossiersRes] = await Promise.all([
          fetch("/api/stats/dashboard"),
          fetch("/api/projets/admin?limit=5&statut=EN_ATTENTE"),
        ]);

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          if (statsData.success) setStats(statsData.stats);
        }

        if (dossiersRes.ok) {
          const dossiersData = await dossiersRes.json();
          if (dossiersData.success) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setRecentDossiers(dossiersData.projets.map((p: any) => ({
              id: p.id,
              reference: p.reference || "—",
              projetId: p.id,
              titre: p.titre,
              secteur: p.secteur,
              porteurPrenom: p.porteur?.prenom || "",
              porteurNom: p.porteur?.nom || "",
              porteurVille: p.porteur?.ville || "",
              forfait: p.forfait || "STARTER",
              montantRecherche: Number(p.montantRecherche),
              statut: p.statutScoring || "EN_ATTENTE",
              paiementConfirme: p.paiementStatut === "CONFIRME",
              soumisLe: p.createdAt,
              analysteId: p.scoring?.analysteId || null,
              scoreTotal: p.scoreTotal,
            })));
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 size={28} className="animate-spin text-[#C9A84C]" />
      </div>
    );
  }

  const enAttente = stats?.projetsEnAttente || 0;
  const enCours = stats?.projetsEnCours || 0;
  const publies = stats?.projetsPublies || 0;
  const miseEnRelation = stats?.totalContacts || 0;

  // Build activity chart from contactsParMois
  const MOIS_LABELS = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];
  const chartData = (stats?.contactsParMois || []).map((m: { mois: string; total: number }) => ({
    mois: MOIS_LABELS[new Date(m.mois).getMonth()] || "?",
    recus: m.total,
    publies: Math.round(m.total * 0.6), // approximation
  }));

  // Sector data
  const secteurData = (stats?.projetsParSecteur || []).slice(0, 6);

  // Build historique from derniersProjets
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const historique: ActionHistorique[] = (stats?.derniersProjets || []).map((p: any, i: number) => ({
    id: `hist_${i}`,
    type: "SOUMISSION" as const,
    texte: `Dossier ${p.reference} — ${p.titre} (${p.porteur?.prenom} ${p.porteur?.nom?.charAt(0) || ""})`,
    timestamp: p.createdAt,
  }));

  return (
    <div className="space-y-6">
      {/* Bandeau urgence */}
      {recentDossiers.length > 0 && (
        <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
          <p className="text-sm text-amber-800 font-medium">
            📥 {enAttente} dossier{enAttente > 1 ? "s" : ""} en attente de traitement
          </p>
          <Link href="/admin/dossiers?statut=EN_ATTENTE" className="text-xs text-amber-700 font-bold hover:underline">
            Voir les dossiers →
          </Link>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icone="📥" valeur={enAttente} label="Dossiers en attente" couleur="gold" />
        <StatCard icone="🔍" valeur={enCours} label="Scorings en cours" couleur="navy" />
        <StatCard icone="✅" valeur={publies} label="Projets publiés" couleur="green" />
        <StatCard icone="🤝" valeur={miseEnRelation} label="Mises en relation" couleur="gold" />
      </div>

      {/* Graphique + Secteurs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border p-5">
          <h2 className="font-bold text-[#0A1628] mb-4">Activité récente</h2>
          {chartData.length > 0 ? (
            <ActiviteChart data={chartData} />
          ) : (
            <p className="text-sm text-[#6B7280] text-center py-8">Pas encore de données</p>
          )}
        </div>
        <div className="bg-white rounded-lg border p-5">
          <h2 className="font-bold text-[#0A1628] mb-4">Répartition par secteur</h2>
          {secteurData.length > 0 ? (
            <SecteursBars data={secteurData} />
          ) : (
            <p className="text-sm text-[#6B7280] text-center py-8">Pas encore de données</p>
          )}
        </div>
      </div>

      {/* File d'attente + Historique */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg border">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="font-bold text-[#0A1628]">File d&apos;attente prioritaire</h2>
            <Link href="/admin/dossiers" className="text-xs text-[#C9A84C] hover:underline">Voir tout →</Link>
          </div>
          {recentDossiers.length > 0 ? (
            <DossierTable dossiers={recentDossiers} />
          ) : (
            <p className="text-sm text-[#6B7280] text-center py-8">Aucun dossier en attente</p>
          )}
        </div>

        <div className="bg-white rounded-lg border">
          <div className="p-4 border-b">
            <h2 className="font-bold text-[#0A1628]">Activité récente</h2>
          </div>
          <div className="p-4">
            {historique.length > 0 ? (
              <HistoriqueTimeline actions={historique} max={8} />
            ) : (
              <p className="text-sm text-[#6B7280] text-center py-4">Aucune activité récente</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
