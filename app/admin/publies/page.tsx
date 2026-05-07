"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DossierTable } from "@/components/admin/DossierTable";
import { Loader2 } from "lucide-react";

export default function PubliesPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [publies, setPublies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPublies = async () => {
      try {
        const res = await fetch("/api/projets/admin?limit=100");
        if (!res.ok) throw new Error("Erreur chargement");
        const data = await res.json();
        if (data.success) {
          // Filter published projects (PRIORITAIRE or STANDARD with published=true)
          const filtered = data.projets.filter(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (p: any) => ["PRIORITAIRE", "STANDARD"].includes(p.statutScoring) && p.published
          );
          // Map to DossierAdmin shape for DossierTable compatibility
          setPublies(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            filtered.map((p: any) => ({
              id: p.id,
              reference: p.reference,
              projetId: p.id,
              titre: p.titre,
              secteur: p.secteur,
              porteurPrenom: p.porteur?.prenom || "",
              porteurNom: p.porteur?.nom || "",
              porteurVille: p.porteur?.ville || "",
              forfait: p.forfait,
              montantRecherche: Number(p.montantRecherche),
              statut: p.statutScoring,
              paiementConfirme: p.paiementStatut === "CONFIRME",
              soumisLe: p.createdAt,
              analysteId: p.scoring?.analysteId || null,
              scoreTotal: p.scoreTotal,
            }))
          );
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPublies();
  }, []);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#0A1628]">Projets publiés</h1>
          <p className="text-sm text-[#6B7280]">
            {isLoading ? "Chargement…" : `${publies.length} projets sur la vitrine`}
          </p>
        </div>
        <Link href="/vitrine" className="text-sm text-[#C9A84C] hover:underline">Voir la vitrine →</Link>
      </div>
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-[#C9A84C]" />
        </div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <DossierTable dossiers={publies} />
        </div>
      )}
    </div>
  );
}
