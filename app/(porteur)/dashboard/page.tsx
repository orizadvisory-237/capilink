"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StatutBadge } from "@/components/porteur/StatutBadge";
import { TimelineStatut } from "@/components/porteur/TimelineStatut";
import { StatutScoring } from "@/lib/types";
import { STATUTS_SCORING } from "@/lib/constants";
import { FileText, Upload, Phone, Loader2 } from "lucide-react";

/** Messages et config par statut pour la carte principale */
const MESSAGES_STATUT: Record<StatutScoring, { icon: string; message: string }> = {
  [StatutScoring.EN_ATTENTE]: {
    icon: "🕐",
    message: "Oriz Advisory a bien reçu votre dossier. L'analyse débutera sous 5 jours ouvrés.",
  },
  [StatutScoring.EN_COURS]: {
    icon: "🔄",
    message: "Notre équipe analyse votre dossier.",
  },
  [StatutScoring.PRIORITAIRE]: {
    icon: "⭐",
    message: "Félicitations ! Votre projet est éligible à la vitrine Prioritaire. Il sera visible par les investisseurs qualifiés.",
  },
  [StatutScoring.STANDARD]: {
    icon: "✅",
    message: "Votre projet répond aux critères de viabilité et sera publié sur la vitrine standard.",
  },
  [StatutScoring.ACCOMPAGNEMENT]: {
    icon: "🤝",
    message: "Oriz Advisory recommande un accompagnement structurant avant publication. Contactez votre chargé de dossier.",
  },
  [StatutScoring.REJETE]: {
    icon: "💬",
    message: "Votre projet ne correspond pas aux critères actuels de la plateforme. N'hésitez pas à contacter Oriz Advisory pour améliorer votre dossier et resoumettre.",
  },
};

interface PorteurData {
  id: string;
  nom: string | null;
  prenom: string | null;
  email: string;
}

interface ProjetData {
  id: string;
  reference: string;
  titre: string;
  statutScoring: StatutScoring;
  scoreTotal: number | null;
  paiementStatut: string;
  forfait: string;
  montantForfait: number;
  published: boolean;
  createdAt: string;
}

/** Calcule les étapes de la timeline en fonction de l'état réel du projet */
function buildTimelineSteps(projet: ProjetData) {
  const statut = projet.statutScoring;
  const paye = projet.paiementStatut === "CONFIRME";
  const isScored = ["PRIORITAIRE", "STANDARD", "ACCOMPAGNEMENT", "REJETE"].includes(statut);
  const isPublished = projet.published;

  return [
    {
      label: "Dossier reçu",
      statut: "done" as const,
      description: `Soumis le ${new Date(projet.createdAt).toLocaleDateString("fr-FR")}`,
    },
    {
      label: "Paiement confirmé",
      statut: paye ? ("done" as const) : ("active" as const),
      description: paye
        ? `Forfait ${projet.forfait} — ${projet.montantForfait.toLocaleString("fr-FR")} FCFA`
        : "En attente de confirmation du paiement",
    },
    {
      label: "Scoring en cours",
      statut: isScored ? ("done" as const) : statut === "EN_COURS" ? ("active" as const) : ("pending" as const),
      description: isScored
        ? `Score : ${projet.scoreTotal}/100`
        : statut === "EN_COURS"
        ? "Analyse par les experts Oriz Advisory"
        : "En attente de démarrage",
    },
    {
      label: "Résultats du scoring",
      statut: isScored ? ("done" as const) : ("pending" as const),
      description: isScored
        ? `${projet.scoreTotal}/100 — ${statut === "PRIORITAIRE" ? "Prioritaire ⭐" : statut}`
        : "Score détaillé sur 5 dimensions",
    },
    {
      label: "Publication sur la vitrine",
      statut: isPublished ? ("done" as const) : isScored && (statut === "PRIORITAIRE" || statut === "STANDARD") ? ("active" as const) : ("pending" as const),
      description: isPublished
        ? "Visible par les investisseurs"
        : "Visibilité auprès des investisseurs",
    },
  ];
}

export default function DashboardPorteurPage() {
  const [porteur, setPorteur] = useState<PorteurData | null>(null);
  const [projet, setProjet] = useState<ProjetData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/porteurs/mon-dossier");
        if (!res.ok) throw new Error("Impossible de charger vos données");
        const data = await res.json();
        if (data.success) {
          setPorteur(data.porteur);
          if (data.projets && data.projets.length > 0) {
            setProjet(data.projets[0]); // Premier projet (le plus récent)
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inconnue");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const today = new Date().toLocaleDateString("fr-FR", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 size={32} className="animate-spin text-[#C9A84C]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <p className="text-lg text-[#C0392B] mb-2">⚠ Erreur</p>
        <p className="text-sm text-[#6B7280]">{error}</p>
      </div>
    );
  }

  const hasProjet = !!projet;
  const statutConfig = projet ? MESSAGES_STATUT[projet.statutScoring as StatutScoring] : null;
  const statutLabel = projet ? STATUTS_SCORING[projet.statutScoring as StatutScoring] : null;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Bandeau de bienvenue */}
      <div>
        <h1 className="text-3xl font-serif text-[#0A1628]">
          Bonjour {porteur?.prenom || "Porteur"} 👋
        </h1>
        <p className="text-sm text-[#6B7280] mt-1 capitalize">{today}</p>
      </div>

      {/* Carte statut dossier */}
      <div className="card p-6 bg-white">
        {!hasProjet ? (
          <div className="text-center py-8">
            <p className="text-lg text-[#6B7280] mb-4">Vous n&apos;avez pas encore soumis de projet</p>
            <Link href="/soumettre" className="inline-flex items-center justify-center h-9 px-8 rounded-lg bg-[#C9A84C] hover:bg-[#b09240] text-[#0A1628] font-bold text-sm transition-colors">
              Soumettre mon premier projet
            </Link>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[#0A1628]">{projet.titre}</h2>
              <StatutBadge statut={projet.statutScoring as StatutScoring} />
            </div>
            {statutConfig && statutLabel && (
              <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-50">
                <span className="text-2xl">{statutConfig.icon}</span>
                <div>
                  <p className="font-medium text-[#0A1628]">{statutLabel.label}</p>
                  <p className="text-sm text-[#6B7280] mt-1">{statutConfig.message}</p>
                </div>
              </div>
            )}
            {/* Barre de progression pour EN_COURS */}
            {projet.statutScoring === StatutScoring.EN_COURS && (
              <div className="mt-4">
                <div className="flex justify-between text-xs text-[#6B7280] mb-1">
                  <span>Progression du scoring</span>
                  <span>En cours…</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-[#C9A84C] h-2 rounded-full transition-all animate-pulse" style={{ width: "60%" }} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tuiles d'actions rapides */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/mon-dossier" className="card p-4 bg-white flex items-center gap-3 hover:shadow-md transition-shadow">
          <FileText size={20} className="text-[#C9A84C]" />
          <span className="font-medium text-sm text-[#0A1628]">Voir mon dossier</span>
        </Link>
        <Link href="/mon-dossier" className="card p-4 bg-white flex items-center gap-3 hover:shadow-md transition-shadow">
          <Upload size={20} className="text-[#C9A84C]" />
          <span className="font-medium text-sm text-[#0A1628]">Compléter mes documents</span>
        </Link>
        <Link href="https://wa.me/237670000000" target="_blank" className="card p-4 bg-white flex items-center gap-3 hover:shadow-md transition-shadow">
          <Phone size={20} className="text-[#C9A84C]" />
          <span className="font-medium text-sm text-[#0A1628]">Contacter Oriz Advisory</span>
        </Link>
      </div>

      {/* Prochaines étapes */}
      {hasProjet && (
        <div className="card p-6 bg-white">
          <h3 className="text-lg font-bold text-[#0A1628] mb-4">Prochaines étapes</h3>
          <TimelineStatut steps={buildTimelineSteps(projet)} />
        </div>
      )}
    </div>
  );
}
