"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StatutBadge } from "@/components/porteur/StatutBadge";
import { ScoreGauge } from "@/components/porteur/ScoreGauge";
import { TimelineStatut } from "@/components/porteur/TimelineStatut";
import { StatutScoring } from "@/lib/types";
import { FileText, MessageCircle, Plus, CheckCircle, AlertTriangle, RefreshCw, Loader2 } from "lucide-react";

/** Dimensions de scoring avec label et max */
const DIMENSIONS = [
  { key: "viabilitePorteur" as const, label: "Viabilité du porteur", max: 30 },
  { key: "modeleEconomique" as const, label: "Modèle économique", max: 25 },
  { key: "marcheTraction" as const, label: "Marché et traction", max: 20 },
  { key: "structurationJuridique" as const, label: "Structuration juridique et financière", max: 15 },
  { key: "attractiviteInvestisseur" as const, label: "Attractivité investisseur", max: 10 },
];

/** Mapping champs Prisma ScoreDetail vers dimensions agrégées */
function mapScoringDimensions(scoring: Record<string, unknown>) {
  return {
    viabilitePorteur:
      (Number(scoring.d1ExperienceSectorielle) || 0) +
      (Number(scoring.d1CompetencesGestion) || 0) +
      (Number(scoring.d1ResilienceEngagement) || 0),
    modeleEconomique:
      (Number(scoring.d2ClarteBM) || 0) +
      (Number(scoring.d2RealismeProjections) || 0) +
      (Number(scoring.d2StructurationFonds) || 0),
    marcheTraction:
      (Number(scoring.d3TailleMarche) || 0) +
      (Number(scoring.d3Traction) || 0) +
      (Number(scoring.d3AvantagesConcurrentiels) || 0),
    structurationJuridique:
      (Number(scoring.d4StructureLegale) || 0) +
      (Number(scoring.d4DocumentsFinanciers) || 0) +
      (Number(scoring.d4AbsenceContentieux) || 0),
    attractiviteInvestisseur:
      (Number(scoring.d5ClarteOffre) || 0) +
      (Number(scoring.d5PotentielRendement) || 0),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildTimeline(projet: any) {
  const statut = projet.statutScoring;
  const paye = projet.paiementStatut === "CONFIRME";
  const isScored = ["PRIORITAIRE", "STANDARD", "ACCOMPAGNEMENT", "REJETE"].includes(statut);
  const isPublished = projet.published;

  return [
    {
      label: "Dossier reçu",
      statut: "done" as const,
      description: new Date(projet.createdAt).toLocaleDateString("fr-FR"),
    },
    {
      label: "Paiement confirmé",
      statut: paye ? ("done" as const) : ("active" as const),
      description: paye
        ? `${new Date(projet.paiementDate || projet.createdAt).toLocaleDateString("fr-FR")} — ${projet.forfait} ${projet.montantForfait?.toLocaleString("fr-FR")} FCFA`
        : "En attente de confirmation",
    },
    {
      label: "Scoring en cours",
      statut: isScored ? ("done" as const) : statut === "EN_COURS" ? ("active" as const) : ("pending" as const),
      description: isScored ? "Analyse terminée" : statut === "EN_COURS" ? "Analyse en cours par les experts" : "En attente",
    },
    {
      label: "Résultats du scoring",
      statut: isScored ? ("done" as const) : ("pending" as const),
      description: isScored
        ? `Score : ${projet.scoreTotal}/100 — ${statut === "PRIORITAIRE" ? "Prioritaire ⭐" : statut}`
        : "Score détaillé sur 5 dimensions",
    },
    {
      label: "Publication sur la vitrine",
      statut: isPublished ? ("done" as const) : isScored && ["PRIORITAIRE", "STANDARD"].includes(statut) ? ("active" as const) : ("pending" as const),
      description: isPublished ? "Visible par les investisseurs" : "En cours de mise en ligne",
    },
  ];
}

export default function MonDossierPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [projet, setProjet] = useState<any>(null);
  const [scoreDims, setScoreDims] = useState<Record<string, number> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/porteurs/mon-dossier");
        if (!res.ok) throw new Error("Impossible de charger votre dossier");
        const data = await res.json();
        if (data.success && data.projets?.length > 0) {
          const p = data.projets[0];
          setProjet(p);
          if (p.scoring) {
            setScoreDims(mapScoringDimensions(p.scoring));
          }
        } else {
          setError("Aucun dossier trouvé. Soumettez votre premier projet.");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inconnue");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 size={32} className="animate-spin text-[#C9A84C]" />
      </div>
    );
  }

  if (error || !projet) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20 space-y-4">
        <p className="text-4xl">📂</p>
        <p className="text-lg text-[#0A1628] font-medium">{error || "Aucun dossier trouvé"}</p>
        <Link
          href="/soumettre"
          className="inline-flex items-center justify-center h-9 px-6 rounded-lg bg-[#C9A84C] hover:bg-[#b09240] text-[#0A1628] font-bold text-sm transition-colors"
        >
          Soumettre un projet
        </Link>
      </div>
    );
  }

  const isScored =
    projet.statutScoring === StatutScoring.PRIORITAIRE ||
    projet.statutScoring === StatutScoring.STANDARD;

  const documents = projet.documents || [];
  const scoring = projet.scoring;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* En-tête */}
      <div className="card p-6 bg-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-serif text-[#0A1628]">{projet.titre}</h1>
            <div className="flex items-center gap-3 mt-2 text-sm text-[#6B7280]">
              <span>Dossier {projet.reference}</span>
              <span>·</span>
              <span>Soumis le {new Date(projet.createdAt).toLocaleDateString("fr-FR")}</span>
              <span>·</span>
              <span>Forfait {projet.forfait}</span>
            </div>
          </div>
          <StatutBadge statut={projet.statutScoring as StatutScoring} />
        </div>
      </div>

      {/* Timeline de statut */}
      <div className="card p-6 bg-white">
        <h2 className="text-lg font-bold text-[#0A1628] mb-4">Progression du dossier</h2>
        <TimelineStatut steps={buildTimeline(projet)} />
      </div>

      {/* Documents soumis */}
      <div className="card p-6 bg-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[#0A1628]">Documents soumis</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowUploadModal(true)}
            className="gap-1"
          >
            <Plus size={14} /> Ajouter un document
          </Button>
        </div>
        {documents.length === 0 ? (
          <p className="text-sm text-[#6B7280] text-center py-4">Aucun document soumis pour le moment.</p>
        ) : (
          <div className="space-y-3">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {documents.map((doc: any) => {
              const isVerifie = doc.verifie;
              return (
                <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText size={18} className="text-[#6B7280]" />
                    <div>
                      <p className="text-sm font-medium text-[#0A1628]">{doc.nom}</p>
                      <p className="text-xs text-[#6B7280]">
                        {new Date(doc.createdAt).toLocaleDateString("fr-FR")}
                        {doc.taille ? ` · ${(doc.taille / 1024).toFixed(0)} Ko` : ""}
                      </p>
                    </div>
                  </div>
                  <span className={`flex items-center gap-1 text-xs font-medium ${isVerifie ? "text-[#2D6A4F]" : "text-blue-600"}`}>
                    {isVerifie ? (
                      <><CheckCircle size={14} /> Vérifié ✓</>
                    ) : (
                      <><RefreshCw size={14} /> En cours de vérification</>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Score Oriz */}
      <div className="card p-6 bg-white">
        <h2 className="text-lg font-bold text-[#0A1628] mb-4">Score Oriz Advisory</h2>

        {!isScored || !scoreDims ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-[#6B7280]">
              Votre score sera disponible ici une fois le scoring terminé
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Score total + Gauge */}
            <ScoreGauge score={projet.scoreTotal!} />

            {/* 5 dimensions */}
            <div className="space-y-3">
              {DIMENSIONS.map((dim) => {
                const value = scoreDims[dim.key] ?? 0;
                const pct = (value / dim.max) * 100;
                return (
                  <div key={dim.key}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-[#0A1628]">{dim.label}</span>
                      <span className="font-bold text-[#0A1628]">{value}/{dim.max}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-[#C9A84C] h-2 rounded-full transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Commentaire Oriz */}
      {isScored && scoring?.commentaireGlobal && (
        <div className="card p-6 bg-white">
          <h2 className="text-lg font-bold text-[#0A1628] mb-3">Commentaire de l&apos;analyste Oriz</h2>
          <div className="bg-gray-50 rounded-lg p-4 text-sm text-[#6B7280] leading-relaxed italic">
            &ldquo;{scoring.commentaireGlobal}&rdquo;
          </div>
        </div>
      )}

      {/* Contact */}
      <div className="card p-6 bg-white">
        <h2 className="text-lg font-bold text-[#0A1628] mb-3">
          Une question sur votre dossier ?
        </h2>
        <p className="text-sm text-[#6B7280] mb-4">
          Contactez votre chargé de dossier Oriz Advisory
        </p>
        <Link
          href="https://wa.me/237670000000"
          target="_blank"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[#25D366] hover:bg-[#20BD5A] text-white text-sm font-medium"
        >
          <MessageCircle size={18} />
          Écrire sur WhatsApp
        </Link>
      </div>

      {/* Modale upload simple */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowUploadModal(false)}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-[#0A1628]">Ajouter un document complémentaire</h3>
            <div className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-[#C9A84C]">
              <p className="text-sm text-[#6B7280]">Glissez-déposez ou cliquez pour sélectionner</p>
              <p className="text-xs text-[#6B7280] mt-1">PDF, max 10 Mo</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowUploadModal(false)} className="flex-1">Annuler</Button>
              <Button onClick={() => setShowUploadModal(false)} className="flex-1 bg-[#0A1628] text-white">Télécharger</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
