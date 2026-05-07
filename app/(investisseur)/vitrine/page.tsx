"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ProjetCard } from "@/components/investisseur/ProjetCard";
import { FiltresVitrine } from "@/components/investisseur/FiltresVitrine";
import { useInvestisseurStore } from "@/lib/stores/investisseur-store";
import type { FiltresVitrineExtended, ProjetMock } from "@/lib/types";
import { ChevronLeft, ChevronRight } from "lucide-react";

const PER_PAGE = 9;

const TRI_OPTIONS = [
  { value: "score", label: "Score Oriz (décroissant)" },
  { value: "recent", label: "Plus récents" },
  { value: "ticket_asc", label: "Ticket croissant" },
  { value: "ticket_desc", label: "Ticket décroissant" },
];

export default function VitrinePage() {
  const searchParams = useSearchParams();
  const { filtresActifs, setFiltres, resetFiltres, projetsEnregistres, toggleProjetEnregistre } = useInvestisseurStore();

  const [tri, setTri] = useState(searchParams.get("tri") || "recent");
  const [page, setPage] = useState(1);
  const [onglet, setOnglet] = useState<"tous" | "prioritaires" | "favoris">(
    searchParams.get("onglet") === "prioritaires" ? "prioritaires" : "tous"
  );

  const [projets, setProjets] = useState<ProjetMock[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Apply onglet to filtres
  const effectiveFiltres = useMemo<FiltresVitrineExtended>(() => ({
    ...filtresActifs,
    prioritairesUniquement: onglet === "prioritaires" || filtresActifs.prioritairesUniquement,
  }), [filtresActifs, onglet]);

  // Fetch logic
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const fetchProjets = async () => {
      try {
        if (onglet === "favoris" && projetsEnregistres.length === 0) {
          if (isMounted) {
            setProjets([]);
            setTotal(0);
            setTotalPages(0);
            setIsLoading(false);
          }
          return;
        }

        const query = new URLSearchParams();
        query.append("page", page.toString());
        query.append("limit", PER_PAGE.toString());
        query.append("tri", tri);

        if (onglet === "favoris") query.append("ids", projetsEnregistres.join(","));

        if (effectiveFiltres.secteurs.length > 0) query.append("secteurs", effectiveFiltres.secteurs.join(","));
        if (effectiveFiltres.typesFinancement.length > 0) query.append("types", effectiveFiltres.typesFinancement.join(","));
        if (effectiveFiltres.stades.length > 0) query.append("stades", effectiveFiltres.stades.join(","));
        if (effectiveFiltres.montantMin > 0) query.append("montantMin", effectiveFiltres.montantMin.toString());
        if (effectiveFiltres.montantMax < 500000000) query.append("montantMax", effectiveFiltres.montantMax.toString());
        if (effectiveFiltres.scoreMin > 0) query.append("scoreMin", effectiveFiltres.scoreMin.toString());
        if (effectiveFiltres.prioritairesUniquement) query.append("prioritaires", "true");

        const res = await fetch(`/api/projets/vitrine?${query.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch");

        const data = await res.json();
        if (data.success && isMounted) {
          setProjets(data.projets);
          setTotal(data.pagination.total);
          setTotalPages(data.pagination.totalPages);
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchProjets();
    return () => { isMounted = false; };
  }, [effectiveFiltres, page, tri, onglet, projetsEnregistres]);

  const handleFiltresChange = (partial: Partial<FiltresVitrineExtended>) => {
    setFiltres(partial);
    setPage(1);
  };

  const handleReset = () => {
    resetFiltres();
    setOnglet("tous");
    setTri("recent");
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-[#F8F6F1]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#0A1628]">
            Projets en recherche de financement
          </h1>
          <p className="text-sm text-[#6B7280] mt-2 max-w-2xl">
            Tous les projets publiés sur Capilink ont été scorés indépendamment par Oriz Advisory.
            Score minimum de publication : 52/100.
          </p>
          <div className="flex items-center gap-4 mt-4">
            <span className="text-xs bg-[#0A1628]/10 text-[#0A1628] px-3 py-1 rounded-full font-medium">
              {isLoading ? "..." : total} projet{total > 1 ? "s" : ""} disponible{total > 1 ? "s" : ""}
            </span>
            <div className="flex gap-1 bg-white rounded-lg border p-0.5">
              <button
                onClick={() => { setOnglet("tous"); setPage(1); }}
                className={`px-4 py-1.5 text-sm rounded-md transition-colors ${
                  onglet === "tous" ? "bg-[#0A1628] text-white" : "text-[#6B7280]"
                }`}
              >
                Tous les projets
              </button>
              <button
                onClick={() => { setOnglet("prioritaires"); setPage(1); }}
                className={`px-4 py-1.5 text-sm rounded-md transition-colors ${
                  onglet === "prioritaires" ? "bg-[#C9A84C] text-[#0A1628]" : "text-[#6B7280]"
                }`}
              >
                ⭐ Prioritaires
              </button>
              <button
                onClick={() => { setOnglet("favoris"); setPage(1); }}
                className={`px-4 py-1.5 text-sm rounded-md transition-colors ${
                  onglet === "favoris" ? "bg-[#2D6A4F] text-white" : "text-[#6B7280] hover:bg-gray-100"
                }`}
              >
                🔖 Mes favoris
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Filtres sidebar */}
          <FiltresVitrine
            filtres={filtresActifs}
            onChange={handleFiltresChange}
            onReset={handleReset}
            totalResultats={total}
          />

          {/* Main content */}
          <div className="flex-1">
            {/* Tri select */}
            <div className="flex justify-end mb-4">
              <select
                value={tri}
                onChange={(e) => {
                  setTri(e.target.value);
                  setPage(1);
                }}
                className="border rounded px-3 py-1.5 text-sm bg-white"
              >
                {TRI_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {/* Grille */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-80 bg-gray-200 animate-pulse rounded-xl" />
                ))}
              </div>
            ) : projets.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {projets.map((p) => (
                  <ProjetCard
                    key={p.id}
                    projet={p}
                    enregistre={projetsEnregistres.includes(p.id)}
                    onToggleEnregistre={toggleProjetEnregistre}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-4xl mb-4">🔍</p>
                <p className="text-lg font-medium text-[#0A1628]">Aucun projet ne correspond à vos critères</p>
                <p className="text-sm text-[#6B7280] mt-1">Essayez d&apos;élargir votre recherche.</p>
                <button onClick={handleReset} className="mt-4 text-sm text-[#C9A84C] hover:underline font-medium">
                  Réinitialiser les filtres
                </button>
              </div>
            )}

            {/* Pagination */}
            {!isLoading && totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded border disabled:opacity-30"
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className={`w-8 h-8 rounded text-sm ${
                      n === page ? "bg-[#0A1628] text-white" : "border text-[#6B7280] hover:bg-gray-100"
                    }`}
                  >
                    {n}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded border disabled:opacity-30"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
