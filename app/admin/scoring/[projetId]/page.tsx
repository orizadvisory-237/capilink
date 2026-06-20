"use client";

import { use, useEffect, useState } from "react";
import { useAdminStore } from "@/lib/stores/admin-store";
import { ScoreSlider } from "@/components/admin/ScoreSlider";
import { ScoreDimensionCard } from "@/components/admin/ScoreDimensionCard";
import { SuiviStatut } from "@/components/admin/SuiviStatut";
import { StatutScoring } from "@/lib/types";
import { cn } from "@/lib/utils";
import { formatFCFA } from "@/lib/utils";
import { STATUTS_SCORING } from "@/lib/constants";
import Link from "next/link";
import { Save, Send, Eye, RefreshCw } from "lucide-react";

/* ─ Repères standard ─────────────────────────────────────────── */
const getReperes = (max: number, labels: [string, string, string]) => [
  { valeur: 0, label: labels[0] },
  { valeur: Math.round(max / 2), label: labels[1] },
  { valeur: max, label: labels[2] },
];

/* ─ Récap Score Sticky ─────────────────────────────────────────── */
function ScoreRecap() {
  const { getScoreD1, getScoreD2, getScoreD3, getScoreD4, getScoreD5, getScoreTotal, getStatutRecommande } = useAdminStore();
  const d1 = getScoreD1(), d2 = getScoreD2(), d3 = getScoreD3(), d4 = getScoreD4(), d5 = getScoreD5();
  const total = getScoreTotal();
  const statut = getStatutRecommande();

  const dims = [
    { label: "D1 — Viabilité porteur", note: d1, max: 30 },
    { label: "D2 — Modèle économique", note: d2, max: 25 },
    { label: "D3 — Marché et traction", note: d3, max: 20 },
    { label: "D4 — Structuration", note: d4, max: 15 },
    { label: "D5 — Attractivité", note: d5, max: 10 },
  ];

  const STATUT_COLOR: Record<StatutScoring, string> = {
    [StatutScoring.PRIORITAIRE]: "text-[#2D6A4F] bg-[#2D6A4F]/10",
    [StatutScoring.STANDARD]: "text-[#0A1628] bg-[#0A1628]/10",
    [StatutScoring.ACCOMPAGNEMENT]: "text-amber-700 bg-amber-100",
    [StatutScoring.REJETE]: "text-[#C0392B] bg-[#C0392B]/10",
    [StatutScoring.EN_ATTENTE]: "text-gray-600 bg-gray-100",
    [StatutScoring.EN_COURS]: "text-blue-700 bg-blue-100",
  };

  return (
    <div className="bg-white rounded-lg border p-4 space-y-3">
      <h3 className="font-bold text-[#0A1628] text-sm">Récapitulatif score</h3>
      <div className="space-y-2">
        {dims.map((d, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span className="w-36 text-[#6B7280] truncate">{d.label}</span>
            <div className="flex-1 bg-gray-100 rounded-full h-1.5">
              <div className="bg-[#C9A84C] h-1.5 rounded-full" style={{ width: `${(d.note / d.max) * 100}%` }} />
            </div>
            <span className="w-12 text-right font-medium text-[#0A1628]">{d.note}/{d.max}</span>
          </div>
        ))}
      </div>
      <div className="border-t pt-3 flex items-center justify-between">
        <div>
          <p className="text-[10px] text-[#6B7280]">SCORE TOTAL</p>
          <p className={cn("text-3xl font-bold", total >= 75 ? "text-[#2D6A4F]" : total >= 60 ? "text-[#0A1628]" : total >= 45 ? "text-amber-600" : "text-[#C0392B]")}>
            {total}<span className="text-base font-normal text-[#6B7280]">/100</span>
          </p>
        </div>
        <span className={cn("px-2 py-1 text-xs font-bold rounded-full", STATUT_COLOR[statut])}>
          {STATUTS_SCORING[statut]?.label}
        </span>
      </div>
      <p className="text-[10px] text-[#6B7280] italic bg-gray-50 rounded p-2">
        {statut === StatutScoring.PRIORITAIRE && "Sur la base du score, ce projet est éligible au statut PRIORITAIRE."}
        {statut === StatutScoring.STANDARD && "Ce projet répond aux critères de publication STANDARD."}
        {statut === StatutScoring.ACCOMPAGNEMENT && "Un accompagnement est recommandé avant publication."}
        {statut === StatutScoring.REJETE && "Le score est insuffisant pour la publication actuelle."}
      </p>
    </div>
  );
}

/* ─ Page principale ─────────────────────────────────────────── */
export default function ScoringPage({ params }: { params: Promise<{ projetId: string }> }) {
  const { projetId } = use(params);
  const store = useAdminStore();
  const { scoringEnCours, initScoring, loadScoring, setSubScore, setJustification, setCommentaireGlobal,
    setCommentaireSynthese, setStatutChoisi, sauvegarderBrouillon, getScoreD1, getScoreD2,
    getScoreD3, getScoreD4, getScoreD5, getStatutRecommande, getPourcentageCompletion } = store;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [projet, setProjet] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishConfirmed, setPublishConfirmed] = useState(false);
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(`/api/scoring/${projetId}`);
        if (!res.ok) throw new Error("Erreur BDD");
        const data = await res.json();
        if (data.success) {
          setProjet(data.projet);
          if (data.scoring) {
            loadScoring(projetId, data.scoring);
          } else {
            initScoring(projetId);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [projetId, initScoring, loadScoring]);

  const saveToBackend = async (brouillon: boolean, statutForce?: string) => {
    setIsSaving(true);
    sauvegarderBrouillon(); // Pour maj de la date locale

    try {
      const payload = {
        brouillon,
        d1: store.scoringEnCours.d1,
        d2: store.scoringEnCours.d2,
        d3: store.scoringEnCours.d3,
        d4: store.scoringEnCours.d4,
        d5: store.scoringEnCours.d5,
        commentaireGlobal: store.scoringEnCours.commentaireGlobal,
        commentaireSyntheseInvestisseur: store.scoringEnCours.commentaireSyntheseInvestisseur,
        statutChoisi: statutForce || store.scoringEnCours.statutChoisi || store.getStatutRecommande(),
      };

      const res = await fetch(`/api/scoring/${projetId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.erreur || "Erreur de synchro");

      showToast(brouillon ? "✓ Brouillon sauvegardé en base" : "✓ Projet scoré et publié !");
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la sauvegarde :(");
    } finally {
      setIsSaving(false);
    }
  };

  // Auto-save every 60s
  useEffect(() => {
    const interval = setInterval(() => {
      if (projet && isLoading === false && scoringEnCours.projetId === projetId) {
        saveToBackend(true);
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [projet, isLoading, scoringEnCours.projetId, projetId]); // eslint-disable-line

  if (isLoading) return (
    <div className="flex items-center justify-center py-20">
      <RefreshCw className="animate-spin text-gray-400" size={32} />
    </div>
  );

  if (!projet) return (
    <div className="text-center py-20">
      <p className="text-[#6B7280]">Projet introuvable.</p>
      <Link href="/admin/dossiers" className="text-[#C9A84C] text-sm hover:underline mt-2 inline-block">← Dossiers</Link>
    </div>
  );

  const statutRecommande = getStatutRecommande();
  const pct = getPourcentageCompletion();
  const sc = scoringEnCours;

  const setD1 = (k: string, v: number) => setSubScore("d1", k, v);
  const setD2 = (k: string, v: number) => setSubScore("d2", k, v);
  const setD3 = (k: string, v: number) => setSubScore("d3", k, v);
  const setD4 = (k: string, v: number) => setSubScore("d4", k, v);
  const setD5 = (k: string, v: number) => setSubScore("d5", k, v);
  const jD1 = (k: string, v: string) => setJustification("d1", k, v);
  const jD2 = (k: string, v: string) => setJustification("d2", k, v);
  const jD3 = (k: string, v: string) => setJustification("d3", k, v);
  const jD4 = (k: string, v: string) => setJustification("d4", k, v);
  const jD5 = (k: string, v: string) => setJustification("d5", k, v);

  // Checks pour existence doc
  const hasStatuts = projet.documents?.some((doc: any) => doc.type === "STATUTS");
  const hasFinanciers = projet.documents?.some((doc: any) => doc.type === "ETATS_FINANCIERS");
  const hasBP = projet.documents?.some((doc: any) => doc.type === "BUSINESS_PLAN");

  return (
    <div className="space-y-5">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-[#2D6A4F] text-white px-4 py-2 rounded-lg shadow-lg text-sm">
          {toast}
        </div>
      )}

      {/* En-tête */}
      <div className="bg-white rounded-lg border p-5 space-y-3">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-serif font-bold text-[#0A1628]">{projet.titre}</h1>
            <p className="text-sm text-[#6B7280] mt-1">{projet.secteur} · {projet.besoins} · {formatFCFA(projet.montantRecherche)}</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <SuiviStatut
              statutActuel={statutRecommande}
              onStatutChange={(s) => setStatutChoisi(s)}
            />
            <Link
              href={`/admin/scoring/${projetId}/rapport`}
              className="flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-sm text-[#6B7280] hover:bg-gray-50"
            >
              <Eye size={14} /> Rapport
            </Link>
          </div>
        </div>
        {/* Barre de progression */}
        <div>
          <div className="flex items-center justify-between text-xs text-[#6B7280] mb-1">
            <span>Scoring complété à {pct}%</span>
            {sc.derniereSauvegarde && <span>Sauvegardé — {new Date(sc.derniereSauvegarde).toLocaleTimeString("fr-FR")}</span>}
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div className="bg-[#C9A84C] h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>

      {/* Contenu 2 colonnes */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Formulaire scoring (2/3) */}
        <div className="xl:col-span-2 space-y-5">

          {/* D1 */}
          <ScoreDimensionCard numero={1} titre="Viabilité et crédibilité du porteur" noteMax={30} noteCourante={getScoreD1()}>
            {/* Données porteur */}
            <div className="bg-gray-50 rounded-lg p-3 text-xs text-[#6B7280] space-y-1 mb-4">
              <p><span className="font-medium text-[#0A1628]">Porteur :</span> {projet.porteur?.prenom} {projet.porteur?.nom}</p>
              <p><span className="font-medium text-[#0A1628]">Stade visé :</span> {projet.stade || "Non renseigné"}</p>
            </div>
            <div className="space-y-5">
              {[
                { key: "experienaceSectorielle", label: "1.1 Expérience sectorielle", max: 10, val: sc.d1.experienaceSectorielle.valeur, just: sc.d1.experienaceSectorielle.justification, setter: setD1, jSetter: jD1, reps: ["Aucune expérience", "Expérience partielle", "Expert reconnu"] as [string, string, string] },
                { key: "competencesGestion", label: "1.2 Compétences de gestion", max: 10, val: sc.d1.competencesGestion.valeur, just: sc.d1.competencesGestion.justification, setter: setD1, jSetter: jD1, reps: ["Pas de formation", "Formation partielle", "Formation + expérience"] as [string, string, string] },
                { key: "resilienceEngagement", label: "1.3 Résilience et engagement", max: 10, val: sc.d1.resilienceEngagement.valeur, just: sc.d1.resilienceEngagement.justification, setter: setD1, jSetter: jD1, reps: ["Non disponible", "Engagement apparent", "Engagement total"] as [string, string, string] },
              ].map(({ key, label, max, val, just, setter, jSetter, reps }) => (
                <div key={key} className="space-y-2">
                  <ScoreSlider label={label} max={max} value={val} onChange={(v) => setter(key, v)} reperes={getReperes(max, reps)} />
                  <textarea className="w-full border rounded px-3 py-2 text-xs resize-none" rows={2} placeholder="Justification analyste (obligatoire)" value={just} onChange={(e) => jSetter(key, e.target.value)} />
                </div>
              ))}
            </div>
          </ScoreDimensionCard>

          {/* D2 */}
          <ScoreDimensionCard numero={2} titre="Modèle économique" noteMax={25} noteCourante={getScoreD2()}>
            <div className="bg-gray-50 rounded-lg p-3 text-xs text-[#6B7280] space-y-1 mb-4">
              <p><span className="font-medium text-[#0A1628]">Type financement :</span> {projet.besoins}</p>
              <p><span className="font-medium text-[#0A1628]">Montant recherché :</span> {formatFCFA(projet.montantRecherche)}</p>
              <p><span className="font-medium text-[#0A1628]">Utilisation :</span> Précisée dans le business plan</p>
            </div>
            {[
              { key: "clarteBizModel", label: "2.1 Clarté et cohérence du business model", max: 10, val: sc.d2.clarteBizModel.valeur, just: sc.d2.clarteBizModel.justification, reps: ["Modèle flou", "Modèle articulé mais incomplet", "Modèle clair et testé"] as [string, string, string] },
              { key: "realismeProjections", label: "2.2 Réalisme des projections financières", max: 8, val: sc.d2.realismeProjections.valeur, just: sc.d2.realismeProjections.justification, reps: ["Projections absentes", "Optimistes", "Conservatrices et détaillées"] as [string, string, string] },
              { key: "utilisationFonds", label: "2.3 Structuration de l'utilisation des fonds", max: 7, val: sc.d2.utilisationFonds.valeur, just: sc.d2.utilisationFonds.justification, reps: ["Vague (fonds de roulement)", "Partiellement détaillée", "Précise, ligne par ligne"] as [string, string, string] },
            ].map(({ key, max, val, just, label, reps }) => (
              <div key={key} className="space-y-2 mb-5">
                <ScoreSlider label={label} max={max} value={val} onChange={(v) => setD2(key, v)} reperes={getReperes(max, reps)} />
                <textarea className="w-full border rounded px-3 py-2 text-xs resize-none" rows={2} placeholder="Justification analyste" value={just} onChange={(e) => jD2(key, e.target.value)} />
              </div>
            ))}
          </ScoreDimensionCard>

          {/* D3 */}
          <ScoreDimensionCard numero={3} titre="Marché et traction" noteMax={20} noteCourante={getScoreD3()}>
            {[
              { key: "tailleMarche", label: "3.1 Taille et accessibilité du marché", max: 8, val: sc.d3.tailleMarche.valeur, just: sc.d3.tailleMarche.justification, reps: ["Non défini", "Identifié, taille estimée", "Documenté et adressable"] as [string, string, string] },
              { key: "tractionValidation", label: "3.2 Preuve de traction / validation marché", max: 8, val: sc.d3.tractionValidation.valeur, just: sc.d3.tractionValidation.justification, reps: ["0 client, idée non testée", "Quelques clients / LoI", "CA existant, contrats signés"] as [string, string, string] },
              { key: "avantageConcurrentiel", label: "3.3 Avantage concurrentiel défendable", max: 4, val: sc.d3.avantageConcurrentiel.valeur, just: sc.d3.avantageConcurrentiel.justification, reps: ["Pas de différenciation", "Différenciation copiable", "Avantage structurel"] as [string, string, string] },
            ].map(({ key, max, val, just, label, reps }) => (
              <div key={key} className="space-y-2 mb-5">
                <ScoreSlider label={label} max={max} value={val} onChange={(v) => setD3(key, v)} reperes={getReperes(max, reps)} />
                <textarea className="w-full border rounded px-3 py-2 text-xs resize-none" rows={2} placeholder="Justification analyste" value={just} onChange={(e) => jD3(key, e.target.value)} />
              </div>
            ))}
          </ScoreDimensionCard>

          {/* D4 */}
          <ScoreDimensionCard numero={4} titre="Structuration juridique et financière" noteMax={15} noteCourante={getScoreD4()}>
            <div className="bg-gray-50 rounded-lg p-3 text-xs text-[#6B7280] space-y-1 mb-4">
              <p><span className="font-medium text-[#0A1628]">Statuts fournis :</span> {hasStatuts ? "Oui ✓" : "Non ✗"}</p>
              <p><span className="font-medium text-[#0A1628]">États financiers :</span> {hasFinanciers ? "Oui ✓" : "Non ✗"}</p>
            </div>
            {[
              { key: "structureLegale", label: "4.1 Existence et conformité de la structure légale", max: 6, val: sc.d4.structureLegale.valeur, just: sc.d4.structureLegale.justification, reps: ["Pas de structure", "En cours d'immatriculation", "Immatriculée, statuts fournis"] as [string, string, string] },
              { key: "qualiteDocumentsFinanciers", label: "4.2 Qualité des documents financiers fournis", max: 5, val: sc.d4.qualiteDocumentsFinanciers.valeur, just: sc.d4.qualiteDocumentsFinanciers.justification, reps: ["Aucun document", "Documents partiels", "Bilans certifiés"] as [string, string, string] },
              { key: "absenceContentieux", label: "4.3 Absence de contentieux bloquant", max: 4, val: sc.d4.absenceContentieux.valeur, just: sc.d4.absenceContentieux.justification, reps: ["Contentieux déclaré", "Situation ambiguë", "Aucun contentieux"] as [string, string, string] },
            ].map(({ key, max, val, just, label, reps }) => (
              <div key={key} className="space-y-2 mb-5">
                <ScoreSlider label={label} max={max} value={val} onChange={(v) => setD4(key, v)} reperes={getReperes(max, reps)} />
                <textarea className="w-full border rounded px-3 py-2 text-xs resize-none" rows={2} placeholder="Justification analyste" value={just} onChange={(e) => jD4(key, e.target.value)} />
              </div>
            ))}
          </ScoreDimensionCard>

          {/* D5 */}
          <ScoreDimensionCard numero={5} titre="Attractivité pour l'investisseur" noteMax={10} noteCourante={getScoreD5()}>
            {[
              { key: "clarteOffreInvestisseur", label: "5.1 Clarté de l'offre faite à l'investisseur", max: 5, val: sc.d5.clarteOffreInvestisseur.valeur, just: sc.d5.clarteOffreInvestisseur.justification, reps: ["Aucune proposition", "Proposition vague", "Termes précis et réalistes"] as [string, string, string] },
              { key: "potentielRendement", label: "5.2 Potentiel de rendement et de sortie", max: 5, val: sc.d5.potentielRendement.valeur, just: sc.d5.potentielRendement.justification, reps: ["Aucun retour prévu", "Rendement non structuré", "Scénarios de sortie documentés"] as [string, string, string] },
            ].map(({ key, max, val, just, label, reps }) => (
              <div key={key} className="space-y-2 mb-5">
                <ScoreSlider label={label} max={max} value={val} onChange={(v) => setD5(key, v)} reperes={getReperes(max, reps)} />
                <textarea className="w-full border rounded px-3 py-2 text-xs resize-none" rows={2} placeholder="Justification analyste" value={just} onChange={(e) => jD5(key, e.target.value)} />
              </div>
            ))}
          </ScoreDimensionCard>

          {/* Commentaires */}
          <div className="bg-white rounded-lg border p-5 space-y-4">
            <h3 className="font-bold text-[#0A1628]">Commentaire global Oriz Advisory</h3>
            <div>
              <label className="text-xs text-[#6B7280] mb-1 block">Version complète → communiquée au porteur (min. 100 caractères)</label>
              <textarea
                rows={5}
                className="w-full border rounded px-3 py-2 text-sm resize-none"
                placeholder="Rédigez la synthèse du scoring. Soyez précis, bienveillant et professionnel…"
                value={sc.commentaireGlobal}
                onChange={(e) => setCommentaireGlobal(e.target.value)}
              />
              <p className={cn("text-[10px] mt-1", sc.commentaireGlobal.length < 100 ? "text-red-500" : "text-[#2D6A4F]")}>
                {sc.commentaireGlobal.length}/100 caractères minimum
              </p>
            </div>
            <div>
              <label className="text-xs text-[#6B7280] mb-1 block">Synthèse investisseur → affichée sur la vitrine (max. 200 caractères)</label>
              <textarea
                rows={2}
                className="w-full border rounded px-3 py-2 text-sm resize-none"
                placeholder="Résumé court pour les investisseurs…"
                value={sc.commentaireSyntheseInvestisseur}
                onChange={(e) => setCommentaireSynthese(e.target.value)}
                maxLength={200}
              />
              <p className="text-[10px] text-[#6B7280] mt-1">{sc.commentaireSyntheseInvestisseur.length}/200</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 flex-wrap pb-6">
            <button
              onClick={() => saveToBackend(true)}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2.5 border border-[#0A1628] text-[#0A1628] rounded-lg text-sm hover:bg-gray-50 flex-1 justify-center disabled:opacity-50"
            >
              {isSaving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />} Sauvegarder le brouillon
            </button>
            <button
              onClick={() => saveToBackend(false)}
              disabled={isSaving || pct < 100}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#C9A84C] text-[#0A1628] rounded-lg text-sm font-medium hover:bg-[#b09240] flex-1 disabled:opacity-50"
            >
              <Send size={14} /> Valider et soumettre
            </button>
            <button
              onClick={() => setShowPublishModal(true)}
              disabled={isSaving || pct < 100}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#2D6A4F] text-white rounded-lg text-sm font-medium hover:bg-[#2D6A4F]/90 flex-1 disabled:opacity-50"
            >
              ✅ Publier
            </button>
          </div>
        </div>

        {/* Sidebar droite (sticky) */}
        <div className="space-y-5 xl:sticky xl:top-4 xl:max-h-screen xl:overflow-y-auto pb-6">
          {/* Score récap */}
          <ScoreRecap />

          {/* Résumé dossier */}
          <div className="bg-white rounded-lg border">
            <div className="p-4 border-b">
              <h3 className="font-bold text-[#0A1628] text-sm">Résumé dossier</h3>
            </div>
            <div className="p-4 space-y-3 text-xs">
              {[
                { label: "Titre", val: projet.titre },
                { label: "Secteur", val: projet.secteur },
                { label: "Stade", val: projet.stade || "N/A" },
                { label: "Financement", val: projet.besoins },
                { label: "Montant", val: formatFCFA(projet.montantRecherche) },
                { label: "Porteur", val: `${projet.porteur?.prenom} ${projet.porteur?.nom}` },
                { label: "Ville", val: projet.porteur?.ville || "N/A" },
              ].map(({ label, val }) => (
                <div key={label} className="flex gap-2">
                  <span className="w-20 text-[#6B7280] flex-shrink-0">{label}</span>
                  <span className="text-[#0A1628] font-medium">{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Documents */}
          <div className="bg-white rounded-lg border">
            <div className="p-4 border-b">
              <h3 className="font-bold text-[#0A1628] text-sm">Documents du projet</h3>
            </div>
            <div className="p-4 space-y-3">
              {/* Checklist */}
              <div className="space-y-1.5 border-b pb-3">
                {[
                  { label: "Business Plan", ok: hasBP },
                  { label: "États financiers", ok: hasFinanciers },
                  { label: "Statuts", ok: hasStatuts },
                ].map(({ label, ok }) => (
                  <div key={label} className="flex items-center justify-between text-xs">
                    <span className="text-[#6B7280]">{label}</span>
                    <span className={ok ? "text-[#2D6A4F] font-medium" : "text-red-500"}>
                      {ok ? "✓ Fourni" : "✗ Absent"}
                    </span>
                  </div>
                ))}
              </div>

              {/* Liste des fichiers téléchargeables */}
              <div>
                <p className="text-xs font-semibold text-[#0A1628] mb-2">Fichiers disponibles :</p>
                {projet.documents && projet.documents.length > 0 ? (
                  <div className="space-y-2">
                    {projet.documents.map((doc: any) => (
                      <div key={doc.id} className="flex items-center justify-between gap-2 p-2 rounded bg-gray-50 border text-xs">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-[#0A1628] truncate" title={doc.nom}>{doc.nom}</p>
                          <p className="text-[9px] text-[#6B7280] uppercase mt-0.5">{doc.type}</p>
                        </div>
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 bg-[#0A1628] hover:bg-[#0A1628]/90 text-white rounded text-[10px] font-bold whitespace-nowrap transition-colors"
                        >
                          Ouvrir
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#6B7280] italic">Aucun fichier n&apos;a été téléversé pour ce projet.</p>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-lg border p-4">
            <h3 className="font-bold text-[#0A1628] text-sm mb-2">Description</h3>
            <p className="text-xs text-[#6B7280]">{projet.description}</p>
          </div>
        </div>
      </div>

      {/* Modale publication */}
      {showPublishModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="font-bold text-[#0A1628] text-lg">Confirmer la publication</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-1 text-sm">
              <p><span className="text-[#6B7280]">Projet :</span> <span className="font-medium">{projet.titre}</span></p>
              <p><span className="text-[#6B7280]">Score :</span> <span className="font-bold text-[#C9A84C]">{store.getScoreTotal()}/100</span></p>
              <p><span className="text-[#6B7280]">Statut recommandé :</span> <span className="font-medium">{STATUTS_SCORING[statutRecommande]?.label}</span></p>
            </div>
            {sc.commentaireGlobal.length < 100 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-700">
                ⚠ Le commentaire global est insuffisant (min. 100 caractères).
              </div>
            )}
            <label className="flex items-start gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={publishConfirmed} onChange={(e) => setPublishConfirmed(e.target.checked)} className="mt-0.5" />
              <span>J&apos;ai vérifié l&apos;ensemble du dossier et je valide cette publication.</span>
            </label>
            <div className="flex gap-3">
              <button onClick={() => setShowPublishModal(false)} className="flex-1 border rounded-lg py-2 text-sm text-[#6B7280]">Annuler</button>
              <button
                disabled={!publishConfirmed || sc.commentaireGlobal.length < 100 || isSaving}
                onClick={async () => {
                  await saveToBackend(false, statutRecommande);
                  setShowPublishModal(false);
                }}
                className="flex-1 bg-[#2D6A4F] text-white rounded-lg py-2 text-sm font-medium disabled:opacity-50"
              >
                {isSaving ? "Publication..." : "Confirmer la publication"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
