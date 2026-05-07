"use client";

import { useEffect, useState } from "react";
import { formatFCFA } from "@/lib/utils";
import { Loader2 } from "lucide-react";

// ─── SVG Charts ─────────────────────────────────────────────────

function EntonnorSVG({ data }: { data: { label: string; val: number; color: string }[] }) {
  const max = data[0]?.val || 1;
  return (
    <div className="space-y-1.5">
      {data.map((e, i) => {
        const pct = (e.val / max) * 100;
        return (
          <div key={i} className="flex items-center gap-3 text-sm">
            <span className="w-44 text-[#6B7280] text-xs text-right truncate">{e.label}</span>
            <div className="flex-1 bg-gray-100 rounded">
              <div className="h-7 rounded flex items-center justify-end pr-2" style={{ width: `${Math.max(pct, 8)}%`, backgroundColor: e.color }}>
                <span className="text-white text-xs font-bold">{e.val}</span>
              </div>
            </div>
            <span className="text-xs text-[#6B7280] w-10">{Math.round(pct)}%</span>
          </div>
        );
      })}
    </div>
  );
}

function HistogrammeScores({ data }: { data: { label: string; count: number; color: string }[] }) {
  const max = Math.max(...data.map((t) => t.count), 1);
  const total = data.reduce((s, t) => s + t.count, 0) || 1;
  return (
    <div className="space-y-2">
      {data.map((t, i) => (
        <div key={i} className="flex items-center gap-3 text-sm">
          <span className="text-xs text-[#6B7280] w-40">{t.label}</span>
          <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
            <div className="h-5 rounded-full flex items-center justify-end pr-2" style={{ width: `${(t.count / max) * 100}%`, backgroundColor: t.color }}>
              <span className="text-white text-[10px] font-bold">{t.count}</span>
            </div>
          </div>
          <span className="text-xs text-[#6B7280]">{Math.round((t.count / total) * 100)}%</span>
        </div>
      ))}
    </div>
  );
}

function CamembertSVG({ data }: { data: { label: string; pct: number; color: string }[] }) {
  let cumul = 0;
  const R = 60;
  const CX = 80;
  const CY = 80;
  const segments = data.map((d) => {
    const startAngle = (cumul / 100) * 360 - 90;
    const endAngle = ((cumul + d.pct) / 100) * 360 - 90;
    const s = (Math.PI * startAngle) / 180;
    const e = (Math.PI * endAngle) / 180;
    const x1 = CX + R * Math.cos(s), y1 = CY + R * Math.sin(s);
    const x2 = CX + R * Math.cos(e), y2 = CY + R * Math.sin(e);
    const large = d.pct > 50 ? 1 : 0;
    const path = `M${CX},${CY} L${x1},${y1} A${R},${R},0,${large},1,${x2},${y2} Z`;
    cumul += d.pct;
    return { ...d, path };
  });
  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 160 160" className="w-36 h-36">
        {segments.map((s, i) => <path key={i} d={s.path} fill={s.color} />)}
      </svg>
      <div className="space-y-1">
        {segments.map((s, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
            <span className="text-[#6B7280]">{s.label}</span>
            <span className="font-bold text-[#0A1628]">{s.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildEntonnoir(stats: any) {
  return [
    { label: "Dossiers reçus", val: stats.totalProjets, color: "#0A1628" },
    { label: "En cours d'analyse", val: stats.projetsEnCours, color: "#1a2f4a" },
    { label: "Publiés", val: stats.projetsPublies, color: "#C9A84C" },
    { label: "Contacts investisseurs", val: stats.totalContacts, color: "#b09240" },
    { label: "Deals en cours", val: (stats.projetsParStatut || []).find((p: { statut: string }) => p.statut === "DEAL_EN_COURS")?.count || 0, color: "#2D6A4F" },
  ];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildSecteurChart(stats: any) {
  const COLORS = ["#0A1628", "#C9A84C", "#2D6A4F", "#6B7280", "#94a3b8", "#1a2f4a", "#b09240", "#3b82f6", "#ef4444", "#8b5cf6"];
  const secteurs = stats.projetsParSecteur || [];
  const total = secteurs.reduce((s: number, p: { count: number }) => s + p.count, 0) || 1;
  return secteurs.map((p: { secteur: string; count: number }, i: number) => ({
    label: p.secteur,
    pct: Math.round((p.count / total) * 100),
    color: COLORS[i % COLORS.length],
  }));
}

export default function StatistiquesPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/stats/dashboard");
        if (!res.ok) throw new Error("Erreur chargement");
        const data = await res.json();
        if (data.success) {
          setStats(data.stats);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 size={28} className="animate-spin text-[#C9A84C]" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-20">
        <p className="text-[#6B7280]">Impossible de charger les statistiques.</p>
      </div>
    );
  }

  const tauxPublication = stats.totalProjets > 0
    ? Math.round((stats.projetsPublies / stats.totalProjets) * 100)
    : 0;

  const entonnoir = buildEntonnoir(stats);
  const secteurData = buildSecteurChart(stats);

  // Score distribution from projetsParStatut
  const statutCounts = Object.fromEntries(
    (stats.projetsParStatut || []).map((p: { statut: string; count: number }) => [p.statut, p.count])
  );
  const scoreDistribution = [
    { label: "Rejeté", count: statutCounts["REJETE"] || 0, color: "#C0392B" },
    { label: "Accompagnement", count: statutCounts["ACCOMPAGNEMENT"] || 0, color: "#f59e0b" },
    { label: "Standard", count: statutCounts["STANDARD"] || 0, color: "#0A1628" },
    { label: "Prioritaire", count: statutCounts["PRIORITAIRE"] || 0, color: "#2D6A4F" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-[#0A1628]">Statistiques</h1>
      </div>

      {/* KPIs globaux */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: "Dossiers reçus", val: stats.totalProjets.toString() },
          { label: "Taux publication", val: `${tauxPublication}%` },
          { label: "Porteurs inscrits", val: stats.totalPorteurs.toString() },
          { label: "Total vues", val: stats.totalVues.toLocaleString("fr-FR") },
          { label: "Mises en relation", val: stats.totalContacts.toString() },
          { label: "Contacts nouveaux", val: stats.contactsNouveau.toString() },
        ].map((k) => (
          <div key={k.label} className="bg-white rounded-lg border p-4 text-center">
            <p className="text-2xl font-bold text-[#C9A84C]">{k.val}</p>
            <p className="text-[10px] text-[#6B7280] mt-1">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border p-5">
          <h2 className="font-bold text-[#0A1628] mb-4">Entonnoir de conversion</h2>
          <EntonnorSVG data={entonnoir} />
        </div>
        <div className="bg-white rounded-lg border p-5">
          <h2 className="font-bold text-[#0A1628] mb-4">Distribution par statut scoring</h2>
          <HistogrammeScores data={scoreDistribution} />
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border p-5">
          <h2 className="font-bold text-[#0A1628] mb-4">Répartition par secteur</h2>
          {secteurData.length > 0 ? (
            <CamembertSVG data={secteurData} />
          ) : (
            <p className="text-sm text-[#6B7280] text-center py-8">Aucune donnée disponible</p>
          )}
        </div>

        {/* Derniers projets */}
        <div className="bg-white rounded-lg border p-5">
          <h2 className="font-bold text-[#0A1628] mb-4">Derniers dossiers reçus</h2>
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr>
                <th className="text-left py-2 text-xs text-[#6B7280] font-medium">Référence</th>
                <th className="text-left py-2 text-xs text-[#6B7280] font-medium">Projet</th>
                <th className="text-left py-2 text-xs text-[#6B7280] font-medium">Porteur</th>
                <th className="text-center py-2 text-xs text-[#6B7280] font-medium">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(stats.derniersProjets || []).map((p: any) => (
                <tr key={p.id}>
                  <td className="py-2 text-xs font-mono text-[#6B7280]">{p.reference}</td>
                  <td className="py-2 font-medium text-[#0A1628] text-xs">{p.titre}</td>
                  <td className="py-2 text-xs text-[#6B7280]">{p.porteur?.prenom} {p.porteur?.nom?.charAt(0)}.</td>
                  <td className="py-2 text-center">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-[#6B7280]">{p.statutScoring}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Revenus */}
      <div className="bg-white rounded-lg border p-5">
        <h2 className="font-bold text-[#0A1628] mb-4">💰 Revenus confirmés (administrateur)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
          <div className="text-center border rounded-lg p-4">
            <p className="text-lg font-bold text-[#0A1628]">{formatFCFA(stats.revenusConfirmes)}</p>
            <p className="text-xs font-medium text-[#C9A84C] mt-1">Frais de listing perçus</p>
            <p className="text-[10px] text-[#6B7280] mt-1">Paiements confirmés</p>
          </div>
          <div className="text-center border rounded-lg p-4">
            <p className="text-lg font-bold text-[#0A1628]">{stats.projetsPublies}</p>
            <p className="text-xs font-medium text-[#C9A84C] mt-1">Projets publiés</p>
            <p className="text-[10px] text-[#6B7280] mt-1">Sur la vitrine investisseur</p>
          </div>
          <div className="text-center border rounded-lg p-4">
            <p className="text-lg font-bold text-[#0A1628]">{stats.totalContacts}</p>
            <p className="text-xs font-medium text-[#C9A84C] mt-1">Mises en relation</p>
            <p className="text-[10px] text-[#6B7280] mt-1">Contacts investisseurs reçus</p>
          </div>
        </div>
      </div>
    </div>
  );
}
