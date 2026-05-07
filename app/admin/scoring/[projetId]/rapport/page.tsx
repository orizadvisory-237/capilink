"use client";

import { use, useEffect, useState } from "react";
import { useAdminStore } from "@/lib/stores/admin-store";
import { formatFCFA } from "@/lib/utils";
import { StatutScoring } from "@/lib/types";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Printer, ArrowLeft, Loader2 } from "lucide-react";

const STATUT_LABELS: Partial<Record<StatutScoring, { label: string; decision: string; prochaines: string }>> = {
  [StatutScoring.PRIORITAIRE]: {
    label: "PRIORITAIRE",
    decision: "Votre projet est éligible à la publication sur la vitrine Capilink.",
    prochaines: "Votre projet sera publié dans les 48h. Les investisseurs pourront vous contacter via Oriz Advisory.",
  },
  [StatutScoring.STANDARD]: {
    label: "STANDARD",
    decision: "Votre projet répond aux critères de publication Capilink.",
    prochaines: "Votre projet sera publié. Nous recommandons de renforcer les dimensions les plus faibles pour améliorer votre attractivité.",
  },
  [StatutScoring.ACCOMPAGNEMENT]: {
    label: "ACCOMPAGNEMENT RECOMMANDÉ",
    decision: "Votre projet nécessite un accompagnement avant publication.",
    prochaines: "Oriz Advisory vous propose un accompagnement de structuration. Un chargé de dossier vous contactera dans les prochains jours.",
  },
  [StatutScoring.REJETE]: {
    label: "NON PUBLIÉ",
    decision: "Votre projet ne répond pas aux critères actuels de Capilink.",
    prochaines: "Nous ne pouvons pas publier votre projet à ce stade. Vous pouvez resoumettre dans 6 mois après avoir renforcé les dimensions identifiées.",
  },
};

interface ProjetRapport {
  id: string;
  titre: string;
  secteur: string;
  montantRecherche: string;
  reference: string;
}

export default function RapportPage({ params }: { params: Promise<{ projetId: string }> }) {
  const { projetId } = use(params);
  const store = useAdminStore();
  const [projet, setProjet] = useState<ProjetRapport | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProjet = async () => {
      try {
        const res = await fetch(`/api/scoring/${projetId}`);
        if (!res.ok) throw new Error("Erreur");
        const data = await res.json();
        if (data.success) {
          setProjet({
            id: data.projet.id,
            titre: data.projet.titre,
            secteur: data.projet.secteur,
            montantRecherche: data.projet.montantRecherche,
            reference: data.projet.reference,
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjet();
  }, [projetId]);

  const scoreTotal = store.getScoreTotal();
  const statut = store.getStatutRecommande();
  const sc = store.scoringEnCours;
  const analyste = store.analysteConnecte;
  const statutInfo = STATUT_LABELS[statut];

  const dims = [
    { label: "Viabilité et crédibilité du porteur", note: store.getScoreD1(), max: 30 },
    { label: "Modèle économique", note: store.getScoreD2(), max: 25 },
    { label: "Marché et traction", note: store.getScoreD3(), max: 20 },
    { label: "Structuration juridique et financière", note: store.getScoreD4(), max: 15 },
    { label: "Attractivité pour l'investisseur", note: store.getScoreD5(), max: 10 },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 size={28} className="animate-spin text-[#C9A84C]" />
      </div>
    );
  }

  if (!projet) return (
    <div className="text-center py-20">
      <p className="text-[#6B7280]">Projet introuvable.</p>
      <Link href="/admin/dossiers" className="text-[#C9A84C] text-sm hover:underline mt-2 inline-block">← Dossiers</Link>
    </div>
  );

  return (
    <>
      {/* Contrôles (masqués à l'impression) */}
      <div className="print:hidden flex items-center justify-between mb-6">
        <Link href={`/admin/scoring/${projetId}`} className="inline-flex items-center gap-2 text-sm text-[#6B7280] hover:text-[#0A1628]">
          <ArrowLeft size={14} /> Retour au scoring
        </Link>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 bg-[#0A1628] text-white rounded-lg text-sm hover:bg-[#0A1628]/90"
        >
          <Printer size={14} /> Imprimer / Exporter PDF
        </button>
      </div>

      {/* Document rapport */}
      <div id="rapport" className="bg-white rounded-lg border shadow-sm max-w-3xl mx-auto p-8 print:shadow-none print:border-none print:rounded-none print:p-12">

        {/* En-tête */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-2xl font-serif font-bold text-[#0A1628]">Oriz Advisory</p>
            <p className="text-xs text-[#6B7280] mt-1">Yaoundé, Cameroun · contact@orizadvisory.cm</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Rapport de Scoring Capilink</p>
            <p className="text-xs text-[#6B7280] mt-1">Ref. {projet.reference}</p>
            <p className="text-xs text-[#6B7280]">Analyste : {analyste.prenom.charAt(0)}. {analyste.nom}</p>
            <p className="text-xs text-[#6B7280]">Date : {new Date().toLocaleDateString("fr-FR")}</p>
          </div>
        </div>
        <div className="border-t-2 border-[#C9A84C] mb-8" />

        {/* Section 1 — Résumé exécutif */}
        <section className="mb-8">
          <h2 className="text-lg font-serif font-bold text-[#0A1628] mb-3">1. Résumé exécutif</h2>
          <div className="bg-[#F8F6F1] rounded-lg p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-[#0A1628]">{projet.titre}</span>
              <span className="text-xs text-[#6B7280]">{projet.secteur}</span>
            </div>
            <p className="text-sm text-[#6B7280]">Montant recherché : <span className="font-bold text-[#0A1628]">{formatFCFA(Number(projet.montantRecherche))}</span></p>
            <div className="flex items-center gap-4 mt-3">
              <div>
                <p className="text-xs text-[#6B7280]">Score obtenu</p>
                <p className={cn("text-4xl font-bold", scoreTotal >= 75 ? "text-[#2D6A4F]" : scoreTotal >= 60 ? "text-[#0A1628]" : scoreTotal >= 45 ? "text-amber-600" : "text-[#C0392B]")}>
                  {scoreTotal}<span className="text-lg text-[#6B7280] font-normal">/100</span>
                </p>
              </div>
              <div>
                <p className="text-xs text-[#6B7280]">Statut</p>
                <p className="text-lg font-bold text-[#C9A84C]">{statutInfo?.label}</p>
              </div>
            </div>
            <div className="mt-3 border-t pt-3">
              <p className="text-sm font-medium text-[#0A1628]">Décision : {statutInfo?.decision}</p>
            </div>
          </div>
        </section>

        {/* Section 2 — Résultats par dimension */}
        <section className="mb-8">
          <h2 className="text-lg font-serif font-bold text-[#0A1628] mb-3">2. Résultats par dimension</h2>
          <div className="space-y-4">
            {dims.map((d, i) => (
              <div key={i} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-[#0A1628]">D{i + 1} — {d.label}</h3>
                  <span className="text-sm font-bold text-[#C9A84C]">{d.note}/{d.max} pts</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                  <div className="bg-[#C9A84C] h-2 rounded-full" style={{ width: `${(d.note / d.max) * 100}%` }} />
                </div>
                <p className="text-xs text-[#6B7280] italic">
                  {i === 0 && (sc.d1.experienaceSectorielle.justification || "Voir détails du scoring.")}
                  {i === 1 && (sc.d2.clarteBizModel.justification || "Voir détails du scoring.")}
                  {i === 2 && (sc.d3.tailleMarche.justification || "Voir détails du scoring.")}
                  {i === 3 && (sc.d4.structureLegale.justification || "Voir détails du scoring.")}
                  {i === 4 && (sc.d5.clarteOffreInvestisseur.justification || "Voir détails du scoring.")}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 3 — Commentaire global */}
        <section className="mb-8">
          <h2 className="text-lg font-serif font-bold text-[#0A1628] mb-3">3. Commentaire global Oriz Advisory</h2>
          <div className="border-l-4 border-[#C9A84C] pl-4">
            <p className="text-sm text-[#0A1628] leading-relaxed">
              {sc.commentaireGlobal || "Aucun commentaire rédigé pour l'instant. Veuillez compléter le formulaire de scoring."}
            </p>
          </div>
        </section>

        {/* Section 4 — Prochaines étapes */}
        <section className="mb-8">
          <h2 className="text-lg font-serif font-bold text-[#0A1628] mb-3">4. Prochaines étapes</h2>
          <div className={cn("rounded-lg p-4 text-sm", statut === StatutScoring.PRIORITAIRE || statut === StatutScoring.STANDARD ? "bg-[#2D6A4F]/5 border border-[#2D6A4F]/20" : "bg-amber-50 border border-amber-200")}>
            <p className="text-[#0A1628]">{statutInfo?.prochaines}</p>
          </div>
        </section>

        {/* Pied */}
        <div className="border-t pt-6 space-y-1">
          <p className="text-[10px] text-[#6B7280] italic">Ce rapport est confidentiel et destiné exclusivement au porteur de projet cité ci-dessus.</p>
          <p className="text-[10px] text-[#6B7280]">Oriz Advisory SARL · Yaoundé, Cameroun · contact@orizadvisory.cm · +237 222 00 00 00</p>
        </div>
      </div>
    </>
  );
}
