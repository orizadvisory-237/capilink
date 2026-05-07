"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { SECTEURS_ACTIVITE } from "@/lib/constants";
import { formatFCFA } from "@/lib/utils";
import { ScoreGauge } from "@/components/porteur/ScoreGauge";
import { ScoreRadar } from "@/components/investisseur/ScoreRadar";
import { AlerteSecteur } from "@/components/investisseur/AlerteSecteur";
import { ModaleContact } from "@/components/investisseur/ModaleContact";
import { useInvestisseurStore } from "@/lib/stores/investisseur-store";
import {
  ArrowLeft, Eye, FileText, CheckCircle, Minus, MapPin,
  Calendar, MessageCircle, Tag,
} from "lucide-react";
import type { ProjetMock } from "@/lib/types";

const STADE_LABELS: Record<string, string> = {
  IDEE: "💡 Idée / Pré-création",
  DEMARRAGE: "🌱 Démarrage",
  CROISSANCE: "📈 Croissance",
  EXPANSION: "🏢 Expansion",
};

const FINANCEMENT_LABELS: Record<string, { label: string; desc: string }> = {
  EQUITY: { label: "Capital (Equity)", desc: "Entrée au capital avec partage des risques" },
  DETTE: { label: "Dette", desc: "Prêt avec conditions de remboursement" },
  SUBVENTION: { label: "Subvention", desc: "Fonds perdus / assistance technique" },
  LEASING: { label: "Leasing", desc: "Crédit-bail matériel" },
  MIXTE: { label: "Mixte", desc: "Combinaison dette + capital" },
};

const DIMENSIONS = [
  { key: "viabilitePorteur" as const, label: "Viabilité du porteur", max: 30 },
  { key: "modeleEconomique" as const, label: "Modèle économique", max: 25 },
  { key: "marcheTraction" as const, label: "Marché et traction", max: 20 },
  { key: "structurationJuridique" as const, label: "Structuration juridique", max: 15 },
  { key: "attractiviteInvestisseur" as const, label: "Attractivité investisseur", max: 10 },
];

export default function ProjetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [showContact, setShowContact] = useState(false);
  const { addConsultation } = useInvestisseurStore();

  const [projet, setProjet] = useState<ProjetMock | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchProjet = async () => {
      try {
        const res = await fetch(`/api/projets/vitrine/${id}`);
        if (!res.ok) throw new Error("Not found");
        const data = await res.json();
        
        if (data.success && isMounted) {
          setProjet(data.projet);
          addConsultation(data.projet.id);
        }
      } catch (error) {
        console.error("Projet introuvable", error);
        if (isMounted) setProjet(null);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchProjet();
    return () => { isMounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F6F1] flex justify-center items-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-gray-300 rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  if (!projet) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center">
        <p className="text-4xl mb-4">🔍</p>
        <p className="text-lg font-medium text-[#0A1628]">Projet introuvable</p>
        <Link href="/vitrine" className="text-sm text-[#C9A84C] hover:underline mt-2 inline-block">
          ← Retour à la vitrine
        </Link>
      </div>
    );
  }

  const secteur = SECTEURS_ACTIVITE.find((s) => s.id === projet.secteur);
  const financement = FINANCEMENT_LABELS[projet.typeFinancement || ""] || FINANCEMENT_LABELS["EQUITY"];

  return (
    <div className="min-h-screen bg-[#F8F6F1]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-[#6B7280] mb-6">
          <Link href="/vitrine" className="hover:text-[#0A1628]">Vitrine</Link>
          <span>›</span>
          <span>{secteur?.label}</span>
          <span>›</span>
          <span className="text-[#0A1628] font-medium truncate">{projet.titre}</span>
        </div>

        <Link href="/vitrine" className="inline-flex items-center gap-1 text-sm text-[#6B7280] hover:text-[#0A1628] mb-6">
          <ArrowLeft size={14} /> Retour à la vitrine
        </Link>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* ═══ Colonne principale ═══ */}
          <div className="flex-1 space-y-6">
            {/* En-tête */}
            <div className="card p-6 bg-white">
              <h1 className="text-2xl md:text-3xl font-serif font-bold text-[#0A1628] mb-3">{projet.titre}</h1>
              <div className="flex flex-wrap items-center gap-2 text-sm text-[#6B7280] mb-4">
                <span className="flex items-center gap-1"><Tag size={12} />{secteur?.icon} {secteur?.label}</span>
                <span>·</span>
                <span className="flex items-center gap-1"><MapPin size={12} />{projet.zoneGeographique?.[0] || 'Local'}</span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  {new Date(projet.publishedAt || Date.now()).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  projet.statutScoring === "PRIORITAIRE" ? "bg-[#C9A84C]/10 text-[#C9A84C]" : "bg-[#0A1628]/10 text-[#0A1628]"
                }`}>
                  {projet.statutScoring === "PRIORITAIRE" ? "⭐ Prioritaire" : "Standard"}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs border text-[#6B7280]">
                  {financement?.label}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs border text-[#6B7280]">
                  {STADE_LABELS[projet.stade]}
                </span>
              </div>
            </div>

            {/* Le projet */}
            <div className="card p-6 bg-white space-y-5">
              <h2 className="text-lg font-bold text-[#0A1628]">Le projet en bref</h2>
              <div>
                <h3 className="text-sm font-medium text-[#0A1628] mb-1">Description</h3>
                <p className="text-sm text-[#6B7280] leading-relaxed">{projet.description}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-[#0A1628] mb-1">Problème résolu</h3>
                <p className="text-sm text-[#6B7280]">{projet.problemeResolu}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-[#0A1628] mb-1">Solution proposée</h3>
                <p className="text-sm text-[#6B7280]">{projet.solution}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-[#0A1628] mb-1">Avantage concurrentiel</h3>
                <p className="text-sm text-[#6B7280]">{projet.avantagesConcurrentiels}</p>
              </div>
            </div>

            {/* Marché */}
            <div className="card p-6 bg-white space-y-4">
              <h2 className="text-lg font-bold text-[#0A1628]">Le marché visé</h2>
              <div className="flex flex-wrap gap-1.5">
                {projet.zoneGeographique.map((z) => (
                  <span key={z} className="px-2.5 py-0.5 bg-gray-100 rounded-full text-xs text-[#0A1628]">{z}</span>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-[#6B7280]">CA actuel</p>
                  <p className="font-medium text-[#0A1628]">{projet.caActuel}</p>
                </div>
                <div>
                  <p className="text-[#6B7280]">Rentabilité</p>
                  <p className="font-medium text-[#0A1628]">{projet.rentabilite}</p>
                </div>
                <div>
                  <p className="text-[#6B7280]">Revenus</p>
                  <p className="font-medium text-[#0A1628]">{projet.revenusGeneres ? "Oui ✓" : "Pas encore"}</p>
                </div>
              </div>
            </div>

            {/* Équipe */}
            <div className="card p-6 bg-white space-y-4">
              <h2 className="text-lg font-bold text-[#0A1628]">L&apos;équipe</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-[#6B7280]">Porteur</p>
                  <p className="font-medium text-[#0A1628]">{projet.porteur?.prenom || ""} {projet.porteur?.nom?.charAt(0) || ""}.</p>
                </div>
                <div>
                  <p className="text-[#6B7280]">Expérience secteur</p>
                  <p className="font-medium text-[#0A1628]">{projet.anneesExperience}</p>
                </div>
                <div>
                  <p className="text-[#6B7280]">Ville</p>
                  <p className="font-medium text-[#0A1628]">{projet.porteur?.ville || "Non précisé"}</p>
                </div>
                <div>
                  <p className="text-[#6B7280]">Structure juridique</p>
                  <p className="font-medium text-[#0A1628]">{projet.structureJuridique}</p>
                </div>
              </div>
            </div>

            {/* Documents */}
            <div className="card p-6 bg-white space-y-3">
              <h2 className="text-lg font-bold text-[#0A1628]">Documents disponibles</h2>
              {[
                { key: "businessPlan", label: "Business plan / Note de présentation" },
                { key: "etatsFinanciers", label: "États financiers" },
                { key: "statuts", label: "Statuts de la société" },
              ].map((doc) => (
                <div key={doc.key} className="flex items-center gap-2 text-sm">
                  {projet.documents?.[doc.key as keyof typeof projet.documents] ? (
                    <CheckCircle size={14} className="text-[#2D6A4F]" />
                  ) : (
                    <Minus size={14} className="text-[#6B7280]" />
                  )}
                  <span className={projet.documents?.[doc.key as keyof typeof projet.documents] ? "text-[#0A1628]" : "text-[#6B7280]"}>
                    {doc.label}
                  </span>
                </div>
              ))}
              <p className="text-xs text-[#6B7280] italic mt-2">
                Les documents complets sont partagés aux investisseurs qualifiés après prise de contact avec Oriz Advisory.
              </p>
            </div>

            <AlerteSecteur defaultSecteurs={[projet.secteur]} />
          </div>

          {/* ═══ Sidebar ═══ */}
          <div className="w-full lg:w-96 space-y-6">
            <div className="lg:sticky lg:top-4 space-y-6">
              {/* Score Oriz */}
              <div className="card p-6 bg-white">
                <h2 className="text-lg font-bold text-[#0A1628] mb-4">Scoring Oriz Advisory</h2>
                <ScoreGauge score={projet.scoreTotal} />

                {/* Radar */}
                {projet.scoreDetail && <ScoreRadar scores={projet.scoreDetail} />}

                {/* Barres */}
                {projet.scoreDetail && (
                  <div className="space-y-3 mt-4">
                    {DIMENSIONS.map((dim) => {
                      const val = projet.scoreDetail?.[dim.key] as number || 0;
                      const pct = (val / dim.max) * 100;
                      return (
                        <div key={dim.key}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-[#0A1628]">{dim.label}</span>
                            <span className="font-bold">{val}/{dim.max}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div className="bg-[#C9A84C] h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Commentaire */}
                {projet.scoreDetail?.commentaireOriz && (
                  <div className="mt-4 bg-[#C9A84C]/5 border border-[#C9A84C]/20 rounded-lg p-3">
                    <p className="text-xs text-[#6B7280] italic leading-relaxed">
                      &ldquo;{projet.scoreDetail.commentaireOriz}&rdquo;
                    </p>
                  </div>
                )}

                {/* Statut explication */}
                <div className="mt-4 text-xs text-[#6B7280]">
                  {projet.statutScoring === "PRIORITAIRE" ? (
                    <p>⭐ <strong>Projet recommandé</strong> par Oriz Advisory. Dossier solide, porteur crédible, potentiel de rendement identifié.</p>
                  ) : (
                    <p>✓ <strong>Projet viable</strong> publié sur la vitrine. Opportunité à étudier selon vos critères d&apos;investissement.</p>
                  )}
                </div>
              </div>

              {/* Opportunité financière */}
              <div className="card p-6 bg-white">
                <h2 className="text-lg font-bold text-[#0A1628] mb-3">Opportunité financière</h2>
                <p className="text-3xl font-bold text-[#C9A84C]">{formatFCFA(projet.montantRecherche)}</p>
                <p className="text-sm text-[#6B7280] mt-1">
                  Fourchette : {formatFCFA(projet.montantMin)} à {formatFCFA(projet.montantMax)}
                </p>
                <div className="mt-3 space-y-1 text-sm">
                  <p><span className="text-[#6B7280]">Type :</span> <span className="font-medium">{financement?.label}</span></p>
                  <p className="text-xs text-[#6B7280]">{financement?.desc}</p>
                  <p className="text-xs text-[#6B7280] mt-2">Rendement attendu : à préciser lors de la mise en relation</p>
                </div>
              </div>

              {/* CTA Contact */}
              <div className="card p-6 bg-white">
                <button
                  onClick={() => setShowContact(true)}
                  className="w-full py-3 px-4 bg-[#C9A84C] hover:bg-[#b09240] text-[#0A1628] font-bold rounded-lg transition-colors text-sm"
                >
                  Exprimer mon intérêt →
                </button>
                <p className="text-xs text-[#6B7280] text-center mt-3">
                  Oriz Advisory facilite la mise en relation et sécurise les échanges.
                </p>
                <Link
                  href="https://wa.me/237670000000"
                  target="_blank"
                  className="flex items-center justify-center gap-1 text-xs text-[#25D366] hover:underline mt-3"
                >
                  <MessageCircle size={12} /> Poser une question à Oriz Advisory
                </Link>
              </div>

              {/* Compteur */}
              <div className="text-center text-xs text-[#6B7280] flex items-center justify-center gap-1">
                <Eye size={12} /> {projet.nombreVues} investisseurs ont consulté ce projet
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modale */}
      <ModaleContact projet={projet} open={showContact} onClose={() => setShowContact(false)} />
    </div>
  );
}
