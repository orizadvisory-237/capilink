"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { DossierTable, type DossierAdmin } from "@/components/admin/DossierTable";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Download, Search, RefreshCw } from "lucide-react";

const TABS = [
  { key: "TOUS", label: "Tous" },
  { key: "EN_ATTENTE", label: "En attente" },
  { key: "EN_COURS", label: "En cours" },
  { key: "PRIORITAIRE", label: "Prioritaire" },
  { key: "STANDARD", label: "Standard" },
  { key: "ACCOMPAGNEMENT", label: "Accompagnement" },
  { key: "REJETE", label: "Rejeté" },
] as const;

const PER_PAGE = 15;

export default function DossiersPage() {
  const [onglet, setOnglet] = useState<string>("TOUS");
  const [search, setSearch] = useState("");
  const [tri, setTri] = useState("date");
  const [page, setPage] = useState(1);

  const [dossiersList, setDossiersList] = useState<DossierAdmin[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Pour éviter trop de requêtes sur la frappe, on debouce la recherche
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Retour à la première page quand on cherche
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch logic
  const fetchDossiers = useCallback(async () => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams();
      query.append("page", page.toString());
      query.append("limit", PER_PAGE.toString());
      if (onglet !== "TOUS") query.append("statut", onglet);
      if (debouncedSearch.trim()) query.append("q", debouncedSearch);

      const res = await fetch(`/api/projets/admin?${query.toString()}`);
      if (!res.ok) throw new Error("Erreur BDD");

      const data = await res.json();
      if (data.success) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mappedData: DossierAdmin[] = data.projets.map((p: any) => ({
          id: p.id,
          reference: p.reference || "A DEFINIR",
          projetId: p.id,
          titre: p.titre,
          secteur: p.secteur,
          porteurPrenom: p.porteur?.prenom || "A",
          porteurNom: p.porteur?.nom || "Z",
          porteurVille: p.porteur?.ville || "Non précisée",
          forfait: p.forfait || "STARTER",
          montantRecherche: parseInt(p.montantRecherche, 10),
          statut: p.statutScoring || "EN_ATTENTE",
          paiementConfirme: p.paiementStatut === "COMPLETER" || p.paiementStatut === "EN_ATTENTE" ? false : true,
          soumisLe: p.createdAt,
          analysteId: p.scoring?.analysteId || null,
          scoreTotal: p.scoreTotal,
        }));
        setDossiersList(mappedData);
        setTotalItems(data.pagination.total);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [page, onglet, debouncedSearch]);

  useEffect(() => {
    fetchDossiers();
  }, [fetchDossiers]);

  // Sorting côté client (si on veut, car l'API les trie par date par défaut)
  const sorted = useMemo<DossierAdmin[]>(() => {
    const copy = [...dossiersList];
    switch (tri) {
      case "montant": return copy.sort((a, b) => b.montantRecherche - a.montantRecherche);
      case "statut": return copy.sort((a, b) => a.statut.localeCompare(b.statut));
      case "reference": return copy.sort((a, b) => a.reference.localeCompare(b.reference));
      default: return copy; // date is default from API
    }
  }, [dossiersList, tri]);

  const exporterCSV = () => {
    if (dossiersList.length === 0) return;
    const header = "Référence;Titre;Porteur;Ville;Secteur;Forfait;Montant;Statut;Paiement;Date soumission";
    const rows = dossiersList.map((d) =>
      [
        d.reference,
        `"${d.titre.replace(/"/g, '""')}"`,
        `${d.porteurPrenom} ${d.porteurNom}`,
        d.porteurVille,
        d.secteur,
        d.forfait,
        d.montantRecherche,
        d.statut,
        d.paiementConfirme ? "Confirmé" : "En attente",
        new Date(d.soumisLe).toLocaleDateString("fr-FR"),
      ].join(";")
    );
    const csv = "\uFEFF" + [header, ...rows].join("\n"); // BOM pour Excel FR
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `capilink-dossiers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      {/* En-tête */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#0A1628]">Dossiers entrants</h1>
          <p className="text-sm text-[#6B7280]">
            {isLoading ? "Chargement..." : `${totalItems} dossier${totalItems > 1 ? "s" : ""} dans la base.`}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchDossiers} className="flex items-center gap-2 px-4 py-2 border rounded-lg text-sm text-[#6B7280] hover:bg-gray-50 transition-colors">
            <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} /> Actualiser
          </button>
          <button onClick={exporterCSV} className="flex items-center gap-2 px-4 py-2 border rounded-lg text-sm text-[#6B7280] hover:bg-gray-50 transition-colors">
            <Download size={14} /> Exporter CSV
          </button>
        </div>
      </div>

      {/* Onglets statut */}
      <div className="flex gap-1 overflow-x-auto border-b pb-0">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setOnglet(tab.key); setPage(1); }}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 text-sm rounded-t-lg whitespace-nowrap transition-colors border-b-2",
              onglet === tab.key
                ? "border-[#C9A84C] text-[#0A1628] font-medium"
                : "border-transparent text-[#6B7280] hover:text-[#0A1628]"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Recherche + tri */}
      <div className="flex gap-3 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
          <Input
            placeholder="Rechercher par titre, ref..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <select
          value={tri}
          onChange={(e) => setTri(e.target.value)}
          className="border rounded px-3 py-2 text-sm bg-white"
        >
          <option value="date">Trier par date</option>
          <option value="montant">Trier par montant</option>
          <option value="statut">Trier par statut</option>
          <option value="reference">Trier par référence</option>
        </select>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-lg border overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex justify-center">
             <RefreshCw size={32} className="animate-spin text-gray-300" />
          </div>
        ) : sorted.length > 0 ? (
          <DossierTable dossiers={sorted} triColonne={tri} onTri={setTri} />
        ) : (
          <div className="text-center py-12">
            <p className="text-3xl mb-2">📂</p>
            <p className="text-[#6B7280]">Aucun dossier ne correspond à vos critères.</p>
          </div>
        )}
      </div>

      {/* Pagination serveur */}
      {!isLoading && totalPages > 1 && (
        <div className="flex justify-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() => setPage(n)}
              className={cn(
                "w-8 h-8 text-sm rounded",
                n === page ? "bg-[#0A1628] text-white" : "border text-[#6B7280] hover:bg-gray-50"
              )}
            >
              {n}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
