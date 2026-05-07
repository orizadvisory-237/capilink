"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { formatFCFA } from "@/lib/utils";
import { CheckCircle, Loader2 } from "lucide-react";

const FORFAIT_PRIX: Record<string, number> = {
  STARTER: 25000,
  GROWTH: 75000,
  PREMIUM: 150000,
};

function ConfirmationContent() {
  const searchParams = useSearchParams();

  // Tentative de lecture depuis les query params (transmis par le formulaire)
  const refParam = searchParams.get("ref");
  const forfaitParam = searchParams.get("forfait");
  const titreParam = searchParams.get("titre");

  const [reference, setReference] = useState(refParam || "");
  const [forfait, setForfait] = useState(forfaitParam || "GROWTH");
  const [titre, setTitre] = useState(titreParam || "");
  const [isLoading, setIsLoading] = useState(!refParam);

  // Si pas de query params, on charge depuis l'API
  useEffect(() => {
    if (refParam) return; // Déjà renseigné

    const fetchData = async () => {
      try {
        const res = await fetch("/api/porteurs/mon-dossier");
        if (!res.ok) return;
        const data = await res.json();
        if (data.success && data.projets?.length > 0) {
          const p = data.projets[0];
          setReference(p.reference);
          setForfait(p.forfait);
          setTitre(p.titre);
        }
      } catch {
        // fallback silencieux
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [refParam]);

  const montant = FORFAIT_PRIX[forfait] || 75000;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 size={32} className="animate-spin text-[#C9A84C]" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto text-center space-y-8">
      <div className="card p-8 bg-white">
        {/* Icône de succès animée */}
        <div className="w-20 h-20 rounded-full bg-[#C9A84C]/10 flex items-center justify-center mx-auto mb-6 animate-bounce">
          <CheckCircle size={40} className="text-[#C9A84C]" />
        </div>

        <h1 className="text-3xl font-serif text-[#0A1628] mb-2">
          Votre dossier a été soumis avec succès !
        </h1>
        <p className="text-[#6B7280] mb-6">
          Numéro de dossier : <span className="font-bold text-[#0A1628]">{reference || "En cours de génération…"}</span>
        </p>

        {/* Récapitulatif */}
        <div className="bg-gray-50 rounded-lg p-6 text-left space-y-3 mb-6">
          <h3 className="font-bold text-[#0A1628]">Récapitulatif</h3>
          <div className="flex justify-between text-sm">
            <span className="text-[#6B7280]">Projet</span>
            <span className="font-medium">{titre || "Votre projet"}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#6B7280]">Forfait choisi</span>
            <span className="font-medium">{forfait}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#6B7280]">Montant à régler</span>
            <span className="font-bold text-[#C9A84C]">{formatFCFA(montant)}</span>
          </div>
        </div>

        {/* Instructions de paiement */}
        <div className="bg-[#0A1628] text-white rounded-lg p-6 text-left space-y-4 mb-6">
          <h3 className="font-bold text-[#C9A84C]">Instructions de paiement</h3>
          <p className="text-sm text-gray-300">
            Pour finaliser votre inscription, réglez {formatFCFA(montant)} par :
          </p>
          <div className="space-y-3">
            <div className="bg-gray-800 rounded p-3">
              <p className="font-medium text-sm">📱 Mobile Money</p>
              <p className="text-xs text-gray-400 mt-1">
                MTN MoMo : +237 670 00 00 00 — Orange Money : +237 690 00 00 00
              </p>
              <p className="text-xs text-gray-400">Référence : {reference || "—"}</p>
            </div>
            <div className="bg-gray-800 rounded p-3">
              <p className="font-medium text-sm">🏦 Virement bancaire</p>
              <p className="text-xs text-gray-400 mt-1">
                Oriz Advisory SARL — Afriland First Bank — Compte N° 10005 00089 0123456789 01
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-400 border-t border-gray-700 pt-3">
            Votre dossier sera pris en charge dès réception du paiement. Délai de scoring : 5 à 10 jours ouvrés.
          </p>
        </div>

        <Link
          href="/mon-dossier"
          className="inline-flex items-center justify-center h-9 px-4 rounded-lg bg-[#C9A84C] hover:bg-[#b09240] text-[#0A1628] font-bold w-full text-sm transition-colors"
        >
          Suivre mon dossier →
        </Link>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 size={32} className="animate-spin text-[#C9A84C]" />
        </div>
      }
    >
      <ConfirmationContent />
    </Suspense>
  );
}
