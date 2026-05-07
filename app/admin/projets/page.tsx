"use client";

import { useEffect, useState, useMemo } from "react";
import { DossierTable, type DossierAdmin } from "@/components/admin/DossierTable";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Search, RefreshCw } from "lucide-react";

export default function ProjetsPage() {
  const [projets, setProjets] = useState<DossierAdmin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchProjets = async () => {
      try {
        const res = await fetch("/api/projets/admin?limit=100");
        if (!res.ok) throw new Error("Erreur chargement");
        const data = await res.json();
        if (data.success) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setProjets(data.projets.map((p: any) => ({
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
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjets();
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return projets;
    const q = search.toLowerCase();
    return projets.filter(
      (p) =>
        p.titre.toLowerCase().includes(q) ||
        p.reference.toLowerCase().includes(q) ||
        p.porteurNom.toLowerCase().includes(q)
    );
  }, [projets, search]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#0A1628]">Tous les projets</h1>
          <p className="text-sm text-[#6B7280]">
            {isLoading ? "Chargement…" : `${projets.length} projets au total`}
          </p>
        </div>
        <div className="relative max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
          <Input placeholder="Rechercher…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8" />
        </div>
      </div>
      <div className="bg-white rounded-lg border overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex justify-center">
            <RefreshCw size={28} className="animate-spin text-gray-300" />
          </div>
        ) : filtered.length > 0 ? (
          <DossierTable dossiers={filtered} />
        ) : (
          <div className="text-center py-12">
            <p className="text-3xl mb-2">📂</p>
            <p className="text-[#6B7280]">Aucun projet trouvé.</p>
          </div>
        )}
      </div>
    </div>
  );
}
