"use client";

import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StepperHorizontal } from "@/components/porteur/StepperHorizontal";
import { DocumentUpload } from "@/components/porteur/DocumentUpload";
import { PrixCard } from "@/components/porteur/PrixCard";
import { SECTEURS_ACTIVITE, TYPES_FINANCEMENT, FORFAITS } from "@/lib/constants";
import { uploadDocumentClient } from "@/lib/supabase/client-storage";
import {
  sectionPresentationSchema,
  sectionFinancesSchema,
  sectionPorteurSchema,
  type SectionPresentationData,
  type SectionFinancesData,
  type SectionPorteurData,
} from "@/lib/validations/projet";
import { usePorteurStore } from "@/lib/stores/porteur-store";
import { formatFCFA, cn } from "@/lib/utils";
import { TypeDocument, type DocumentUploadItem, type Forfait, type ProjetFormData } from "@/lib/types";

const STEPS = ["Présentation", "Finances", "Porteur & équipe", "Documents & forfait"];

const STADES = [
  { value: "IDEE", label: "Idée / Pré-création", icon: "💡" },
  { value: "DEMARRAGE", label: "Démarrage", icon: "🌱" },
  { value: "CROISSANCE", label: "Croissance", icon: "📈" },
  { value: "EXPANSION", label: "Expansion", icon: "🏢" },
];

const ZONES = [
  "Douala", "Yaoundé", "Bafoussam", "Bamenda", "Garoua",
  "Maroua", "Bertoua", "Ebolowa", "Kribi", "Limbé",
  "National", "Afrique Centrale", "International",
];

const TRANCHES_CA = [
  { value: "AUCUN", label: "Aucun (pas encore d'activité)" },
  { value: "MOINS_5M", label: "Moins de 5M FCFA" },
  { value: "5M_20M", label: "5M — 20M FCFA" },
  { value: "20M_50M", label: "20M — 50M FCFA" },
  { value: "50M_100M", label: "50M — 100M FCFA" },
  { value: "PLUS_100M", label: "Plus de 100M FCFA" },
  { value: "NON_COMMUNIQUE", label: "Préfère ne pas communiquer" },
];

const UTILISATIONS_FONDS = [
  "Achat de matériel / équipement",
  "Besoin en fonds de roulement (BFR)",
  "Recrutement et formation",
  "Marketing et commercialisation",
  "Recherche et développement",
  "Expansion géographique",
  "Restructuration de dette",
  "Autre",
];

export default function SoumettreProjetPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [step, setStep] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    setProjetDraft, projetDraft,
    forfaitChoisi, setForfait,
    documentsUploades, addDocument, removeDocument,
  } = usePorteurStore();

  // ─── Forms ──────────────────────────────────────────────
  const form1 = useForm<SectionPresentationData>({
    resolver: zodResolver(sectionPresentationSchema),
    defaultValues: {
      nomProjet: projetDraft.nomProjet || "", 
      secteur: projetDraft.secteur || "", 
      description: projetDraft.description || "",
      stadeDeveloppement: projetDraft.stadeDeveloppement || "", 
      zonesGeographiques: projetDraft.zonesGeographiques || [],
      problemeResolu: projetDraft.problemeResolu || "", 
      solutionProposee: projetDraft.solutionProposee || "", 
      avantageConcurrentiel: projetDraft.avantageConcurrentiel || "",
    },
  });

  const form2 = useForm<SectionFinancesData>({
    resolver: zodResolver(sectionFinancesSchema),
    defaultValues: {
      typeFinancement: projetDraft.typeFinancement || "", 
      montantRecherche: projetDraft.montantRecherche || 25000000,
      utilisationFonds: projetDraft.utilisationFonds || [], 
      utilisationFondsAutre: projetDraft.utilisationFondsAutre || "",
      chiffreAffaires: projetDraft.chiffreAffaires || "", 
      rentabilite: projetDraft.rentabilite || "",
      projectionCA: projetDraft.projectionCA || null, 
      genereRevenus: projetDraft.genereRevenus || false, 
      depuisCombienTemps: projetDraft.depuisCombienTemps || "",
    },
  });

  const form3 = useForm<SectionPorteurData>({
    resolver: zodResolver(sectionPorteurSchema),
    defaultValues: {
      roleProjet: projetDraft.roleProjet || "", 
      anneesExperience: projetDraft.anneesExperience || "", 
      diplome: projetDraft.diplome || "",
      dejaGereEntreprise: projetDraft.dejaGereEntreprise || false, 
      membresEquipe: projetDraft.membresEquipe || false, 
      membres: projetDraft.membres || [],
      structureJuridique: projetDraft.structureJuridique || "", 
      numeroContribuable: projetDraft.numeroContribuable || "", 
      contentieux: projetDraft.contentieux || "",
    },
  });

  const handleNext1 = form1.handleSubmit((data) => {
    setProjetDraft(data as unknown as Partial<ProjetFormData>);
    setStep(1);
  });
  const handleNext2 = form2.handleSubmit((data) => {
    setProjetDraft(data as unknown as Partial<ProjetFormData>);
    setStep(2);
  });
  const handleNext3 = form3.handleSubmit((data) => {
    setProjetDraft(data as unknown as Partial<ProjetFormData>);
    setStep(3);
  });

  const handleDocUpload = useCallback(
    (doc: DocumentUploadItem) => addDocument(doc),
    [addDocument]
  );

  const handleDocRemove = useCallback(
    (id: string) => removeDocument(id),
    [removeDocument]
  );

  const handleSubmit = () => {
    if (!forfaitChoisi) return alert("Veuillez sélectionner un forfait");
    setShowModal(true);
  };

  const confirmSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      const payloadDocuments = [];
      const refId = session?.user?.id || "temp_user";

      // 1. Upload des fichiers sur Supabase
      for (const doc of documentsUploades) {
        if (doc.fichier) {
          const { publicUrl } = await uploadDocumentClient(doc.fichier, refId);
          payloadDocuments.push({
            nom: doc.nom,
            type: doc.type,
            url: publicUrl,
            taille: doc.taille
          });
        }
      }

      // 2. Envoi du dossier complet à l'API
      const payload = {
        ...projetDraft,
        forfait: forfaitChoisi,
        documents: payloadDocuments
      };

      const res = await fetch("/api/projets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.erreur || "Erreur lors de la soumission");
      }

      // 3. Succès -> Redirection vers la confirmation
      setShowModal(false);
      router.push(`/confirmation?ref=${result.projet.reference}`);
    } catch (error: any) {
      alert(error.message || "Une erreur est survenue");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedForfait = FORFAITS.find((f) => f.id === forfaitChoisi);

  const montant = form2.watch("montantRecherche");
  const genereRevenus = form2.watch("genereRevenus");
  const structureJuridique = form3.watch("structureJuridique");
  const membresEquipe = form3.watch("membresEquipe");

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-serif text-[#0A1628] mb-2">Soumettre un projet</h1>
      <p className="text-sm text-[#6B7280] mb-6">Remplissez les informations ci-dessous pour soumettre votre dossier à Oriz Advisory</p>

      <StepperHorizontal steps={STEPS} currentStep={step} />

      {/* ═══ Section 1 — Présentation ═══ */}
      {step === 0 && (
        <form onSubmit={handleNext1} className="card p-6 bg-white space-y-5">
          <h2 className="text-xl font-bold text-[#0A1628]">Présentation du projet</h2>

          {/* Nom du projet */}
          <div>
            <label className="text-sm font-medium text-[#0A1628]">Nom du projet *</label>
            <Input {...form1.register("nomProjet")} maxLength={80} placeholder="Ex. AgriFresh" />
            <div className="flex justify-between text-xs text-[#6B7280] mt-1">
              {form1.formState.errors.nomProjet && <span className="text-[#C0392B]">{form1.formState.errors.nomProjet.message}</span>}
              <span className="ml-auto">{(form1.watch("nomProjet") || "").length}/80</span>
            </div>
          </div>

          {/* Secteur */}
          <div>
            <label className="text-sm font-medium text-[#0A1628]">Secteur d&apos;activité *</label>
            <select {...form1.register("secteur")} className="w-full border rounded px-3 py-2 text-sm mt-1">
              <option value="">Sélectionner un secteur</option>
              {SECTEURS_ACTIVITE.map((s) => <option key={s.id} value={s.id}>{s.icon} {s.label}</option>)}
            </select>
            {form1.formState.errors.secteur && <p className="text-xs text-[#C0392B] mt-1">{form1.formState.errors.secteur.message}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium text-[#0A1628]">Description du projet *</label>
            <textarea
              {...form1.register("description")}
              rows={5}
              maxLength={1000}
              className="w-full border rounded px-3 py-2 text-sm mt-1 resize-none"
              placeholder="Décrivez votre activité, ce que vous faites, pour qui, et pourquoi c'est une opportunité de marché..."
            />
            <div className="flex justify-between text-xs text-[#6B7280] mt-1">
              {form1.formState.errors.description && <span className="text-[#C0392B]">{form1.formState.errors.description.message}</span>}
              <span className="ml-auto">{(form1.watch("description") || "").length}/1000</span>
            </div>
          </div>

          {/* Stade de développement */}
          <div>
            <label className="text-sm font-medium text-[#0A1628]">Stade de développement *</label>
            <div className="grid grid-cols-2 gap-3 mt-2">
              {STADES.map((s) => (
                <label
                  key={s.value}
                  className={cn(
                    "flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors",
                    form1.watch("stadeDeveloppement") === s.value
                      ? "border-[#C9A84C] bg-amber-50"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <input type="radio" value={s.value} {...form1.register("stadeDeveloppement")} className="sr-only" />
                  <span className="text-xl">{s.icon}</span>
                  <span className="text-sm">{s.label}</span>
                </label>
              ))}
            </div>
            {form1.formState.errors.stadeDeveloppement && <p className="text-xs text-[#C0392B] mt-1">{form1.formState.errors.stadeDeveloppement.message}</p>}
          </div>

          {/* Zones géographiques */}
          <div>
            <label className="text-sm font-medium text-[#0A1628]">Zone géographique d&apos;activité *</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {ZONES.map((z) => (
                <label key={z} className={cn(
                  "px-3 py-1.5 border rounded-full text-sm cursor-pointer transition-colors",
                  (form1.watch("zonesGeographiques") || []).includes(z)
                    ? "bg-[#0A1628] text-white border-[#0A1628]"
                    : "border-gray-300 hover:border-gray-400"
                )}>
                  <input type="checkbox" value={z} {...form1.register("zonesGeographiques")} className="sr-only" />
                  {z}
                </label>
              ))}
            </div>
            {form1.formState.errors.zonesGeographiques && <p className="text-xs text-[#C0392B] mt-1">{form1.formState.errors.zonesGeographiques.message}</p>}
          </div>

          {/* Problème / Solution / Avantage */}
          <div>
            <label className="text-sm font-medium text-[#0A1628]">Quel problème concret résolvez-vous ? *</label>
            <textarea {...form1.register("problemeResolu")} rows={2} maxLength={300}
              className="w-full border rounded px-3 py-2 text-sm mt-1 resize-none" />
            <div className="flex justify-between text-xs text-[#6B7280] mt-1">
              {form1.formState.errors.problemeResolu && <span className="text-[#C0392B]">{form1.formState.errors.problemeResolu.message}</span>}
              <span className="ml-auto">{(form1.watch("problemeResolu") || "").length}/300</span>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-[#0A1628]">Solution proposée *</label>
            <textarea {...form1.register("solutionProposee")} rows={2} maxLength={300}
              className="w-full border rounded px-3 py-2 text-sm mt-1 resize-none" />
            <div className="flex justify-between text-xs text-[#6B7280] mt-1">
              {form1.formState.errors.solutionProposee && <span className="text-[#C0392B]">{form1.formState.errors.solutionProposee.message}</span>}
              <span className="ml-auto">{(form1.watch("solutionProposee") || "").length}/300</span>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-[#0A1628]">Avantage concurrentiel</label>
            <textarea {...form1.register("avantageConcurrentiel")} rows={2} maxLength={300}
              className="w-full border rounded px-3 py-2 text-sm mt-1 resize-none"
              placeholder="Qu'est-ce qui vous différencie ?" />
            <span className="text-xs text-[#6B7280]">{(form1.watch("avantageConcurrentiel") || "").length}/300</span>
          </div>

          <Button type="submit" className="w-full bg-[#0A1628] hover:bg-[#0A1628]/90 text-white">
            Suivant →
          </Button>
        </form>
      )}

      {/* ═══ Section 2 — Finances ═══ */}
      {step === 1 && (
        <form onSubmit={handleNext2} className="card p-6 bg-white space-y-5">
          <h2 className="text-xl font-bold text-[#0A1628]">Informations financières</h2>

          {/* Type de financement */}
          <div>
            <label className="text-sm font-medium text-[#0A1628]">Type de financement recherché *</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
              {TYPES_FINANCEMENT.map((t) => (
                <label
                  key={t.id}
                  className={cn(
                    "p-3 border rounded-lg cursor-pointer transition-colors",
                    form2.watch("typeFinancement") === t.id
                      ? "border-[#C9A84C] bg-amber-50"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <input type="radio" value={t.id} {...form2.register("typeFinancement")} className="sr-only" />
                  <p className="font-medium text-sm">{t.label}</p>
                  <p className="text-xs text-[#6B7280] mt-1">{t.description}</p>
                </label>
              ))}
            </div>
            {form2.formState.errors.typeFinancement && <p className="text-xs text-[#C0392B] mt-1">{form2.formState.errors.typeFinancement.message}</p>}
          </div>

          {/* Montant recherché */}
          <div>
            <label className="text-sm font-medium text-[#0A1628]">Montant recherché *</label>
            <div className="space-y-2 mt-2">
              <input
                type="range"
                min={5000000} max={500000000} step={1000000}
                value={montant ?? 25000000}
                onChange={(e) => form2.setValue("montantRecherche", Number(e.target.value))}
                className="w-full accent-[#C9A84C]"
              />
              <div className="text-center">
                <span className="text-2xl font-bold text-[#C9A84C]">{formatFCFA(montant ?? 25000000)}</span>
              </div>
              <p className="text-xs text-[#6B7280] text-center">
                Capilink cible principalement les projets entre 10M et 100M FCFA
              </p>
            </div>
          </div>

          {/* Utilisation des fonds */}
          <div>
            <label className="text-sm font-medium text-[#0A1628]">Utilisation des fonds *</label>
            <div className="space-y-2 mt-2">
              {UTILISATIONS_FONDS.map((u) => (
                <label key={u} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" value={u} {...form2.register("utilisationFonds")} />
                  <span className="text-sm">{u}</span>
                </label>
              ))}
            </div>
            {form2.formState.errors.utilisationFonds && <p className="text-xs text-[#C0392B] mt-1">{form2.formState.errors.utilisationFonds.message}</p>}
          </div>

          {/* Chiffre d'affaires */}
          <div>
            <label className="text-sm font-medium text-[#0A1628]">Chiffre d&apos;affaires annuel actuel *</label>
            <select {...form2.register("chiffreAffaires")} className="w-full border rounded px-3 py-2 text-sm mt-1">
              <option value="">Sélectionner...</option>
              {TRANCHES_CA.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            {form2.formState.errors.chiffreAffaires && <p className="text-xs text-[#C0392B] mt-1">{form2.formState.errors.chiffreAffaires.message}</p>}
          </div>

          {/* Rentabilité */}
          <div>
            <label className="text-sm font-medium text-[#0A1628]">Rentabilité actuelle *</label>
            <div className="flex flex-wrap gap-3 mt-2">
              {["BENEFICIAIRE", "EQUILIBRE", "DEFICITAIRE", "PAS_ACTIVITE"].map((r) => (
                <label key={r} className={cn(
                  "px-4 py-2 border rounded-lg text-sm cursor-pointer transition-colors",
                  form2.watch("rentabilite") === r ? "border-[#C9A84C] bg-amber-50" : "border-gray-200"
                )}>
                  <input type="radio" value={r} {...form2.register("rentabilite")} className="sr-only" />
                  {r === "BENEFICIAIRE" ? "Bénéficiaire" : r === "EQUILIBRE" ? "À l'équilibre" : r === "DEFICITAIRE" ? "Déficitaire" : "Pas encore d'activité"}
                </label>
              ))}
            </div>
            {form2.formState.errors.rentabilite && <p className="text-xs text-[#C0392B] mt-1">{form2.formState.errors.rentabilite.message}</p>}
          </div>

          {/* Revenus */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" {...form2.register("genereRevenus")} />
              <span className="text-sm font-medium text-[#0A1628]">Le projet génère-t-il déjà des revenus ?</span>
            </label>
            {genereRevenus && (
              <select {...form2.register("depuisCombienTemps")} className="w-full border rounded px-3 py-2 text-sm mt-2">
                <option value="">Depuis combien de temps ?</option>
                <option value="MOINS_6_MOIS">Moins de 6 mois</option>
                <option value="6_12_MOIS">6 à 12 mois</option>
                <option value="1_2_ANS">1 à 2 ans</option>
                <option value="PLUS_2_ANS">Plus de 2 ans</option>
              </select>
            )}
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => setStep(0)} className="flex-1">← Retour</Button>
            <Button type="submit" className="flex-1 bg-[#0A1628] hover:bg-[#0A1628]/90 text-white">Suivant →</Button>
          </div>
        </form>
      )}

      {/* ═══ Section 3 — Porteur & équipe ═══ */}
      {step === 2 && (
        <form onSubmit={handleNext3} className="card p-6 bg-white space-y-5">
          <h2 className="text-xl font-bold text-[#0A1628]">Profil du porteur et équipe</h2>

          <div>
            <label className="text-sm font-medium text-[#0A1628]">Rôle dans le projet *</label>
            <select {...form3.register("roleProjet")} className="w-full border rounded px-3 py-2 text-sm mt-1">
              <option value="">Sélectionner...</option>
              <option value="FONDATEUR_UNIQUE">Fondateur unique</option>
              <option value="CO_FONDATEUR">Co-fondateur</option>
              <option value="DIRIGEANT_SALARIE">Dirigeant salarié</option>
              <option value="MANDATAIRE_SOCIAL">Mandataire social</option>
              <option value="AUTRE">Autre</option>
            </select>
            {form3.formState.errors.roleProjet && <p className="text-xs text-[#C0392B] mt-1">{form3.formState.errors.roleProjet.message}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-[#0A1628]">Années d&apos;expérience dans ce secteur *</label>
            <select {...form3.register("anneesExperience")} className="w-full border rounded px-3 py-2 text-sm mt-1">
              <option value="">Sélectionner...</option>
              <option value="MOINS_2">Moins de 2 ans</option>
              <option value="2_5">2 à 5 ans</option>
              <option value="5_10">5 à 10 ans</option>
              <option value="PLUS_10">Plus de 10 ans</option>
            </select>
            {form3.formState.errors.anneesExperience && <p className="text-xs text-[#C0392B] mt-1">{form3.formState.errors.anneesExperience.message}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-[#0A1628]">Diplôme le plus élevé *</label>
            <select {...form3.register("diplome")} className="w-full border rounded px-3 py-2 text-sm mt-1">
              <option value="">Sélectionner...</option>
              <option value="AUCUN">Aucun diplôme</option>
              <option value="BEPC">BEPC</option>
              <option value="BAC">Baccalauréat</option>
              <option value="BTS_DUT">BTS / DUT</option>
              <option value="LICENCE">Licence</option>
              <option value="MASTER">Master</option>
              <option value="DOCTORAT">Doctorat</option>
              <option value="FORMATION_PRO">Formation professionnelle certifiante</option>
            </select>
            {form3.formState.errors.diplome && <p className="text-xs text-[#C0392B] mt-1">{form3.formState.errors.diplome.message}</p>}
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" {...form3.register("dejaGereEntreprise")} />
            <span className="text-sm">Avez-vous déjà géré une entreprise auparavant ?</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" {...form3.register("membresEquipe")} />
            <span className="text-sm">L&apos;équipe compte-t-elle d&apos;autres membres clés ?</span>
          </label>

          {membresEquipe && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <p className="text-sm text-[#6B7280]">Ajoutez jusqu&apos;à 3 membres clés</p>
              {[0, 1, 2].map((i) => (
                <div key={i} className="grid grid-cols-3 gap-2">
                  <Input placeholder="Prénom / Nom" {...form3.register(`membres.${i}.prenom`)} />
                  <Input placeholder="Rôle" {...form3.register(`membres.${i}.role`)} />
                  <Input placeholder="Exp. (ans)" {...form3.register(`membres.${i}.anneesExperience`)} />
                </div>
              ))}
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-[#0A1628]">Structure juridique *</label>
            <select {...form3.register("structureJuridique")} className="w-full border rounded px-3 py-2 text-sm mt-1">
              <option value="">Sélectionner...</option>
              <option value="PAS_IMMATRICULEE">Pas encore immatriculée</option>
              <option value="ENTREPRISE_INDIVIDUELLE">Entreprise individuelle</option>
              <option value="SARL">SARL</option>
              <option value="SA">SA</option>
              <option value="GIC_COOPERATIVE">GIC / Coopérative</option>
              <option value="ASSOCIATION_ONG">Association / ONG</option>
              <option value="AUTRE">Autre</option>
            </select>
            {form3.formState.errors.structureJuridique && <p className="text-xs text-[#C0392B] mt-1">{form3.formState.errors.structureJuridique.message}</p>}
          </div>

          {structureJuridique && structureJuridique !== "PAS_IMMATRICULEE" && (
            <div>
              <label className="text-sm font-medium text-[#0A1628]">Numéro de contribuable</label>
              <Input {...form3.register("numeroContribuable")} placeholder="Optionnel" />
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-[#0A1628]">Êtes-vous en contentieux judiciaire ou fiscal ? *</label>
            <div className="flex gap-3 mt-2">
              {[{ v: "NON", l: "Non" }, { v: "OUI", l: "Oui" }, { v: "PREFERE_NE_PAS_REPONDRE", l: "Préfère ne pas répondre" }].map((r) => (
                <label key={r.v} className={cn(
                  "px-4 py-2 border rounded-lg text-sm cursor-pointer",
                  form3.watch("contentieux") === r.v ? "border-[#C9A84C] bg-amber-50" : "border-gray-200"
                )}>
                  <input type="radio" value={r.v} {...form3.register("contentieux")} className="sr-only" />
                  {r.l}
                </label>
              ))}
            </div>
            {form3.formState.errors.contentieux && <p className="text-xs text-[#C0392B] mt-1">{form3.formState.errors.contentieux.message}</p>}
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">← Retour</Button>
            <Button type="submit" className="flex-1 bg-[#0A1628] hover:bg-[#0A1628]/90 text-white">Suivant →</Button>
          </div>
        </form>
      )}

      {/* ═══ Section 4 — Documents & Forfait ═══ */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="card p-6 bg-white space-y-5">
            <h2 className="text-xl font-bold text-[#0A1628]">Documents et finalisation</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DocumentUpload
                label="Business plan / Note de présentation"
                type={TypeDocument.BUSINESS_PLAN}
                required
                document={documentsUploades.find((d) => d.type === TypeDocument.BUSINESS_PLAN)}
                onUpload={handleDocUpload}
                onRemove={handleDocRemove}
              />
              <DocumentUpload
                label="États financiers"
                type={TypeDocument.ETATS_FINANCIERS}
                document={documentsUploades.find((d) => d.type === TypeDocument.ETATS_FINANCIERS)}
                onUpload={handleDocUpload}
                onRemove={handleDocRemove}
              />
              <DocumentUpload
                label="Statuts de la société"
                type={TypeDocument.STATUTS}
                maxSizeMo={5}
                document={documentsUploades.find((d) => d.type === TypeDocument.STATUTS)}
                onUpload={handleDocUpload}
                onRemove={handleDocRemove}
              />
              <DocumentUpload
                label="Pièce d'identité du porteur"
                type={TypeDocument.PIECE_IDENTITE}
                required
                accept=".pdf,.jpg,.jpeg,.png"
                maxSizeMo={5}
                document={documentsUploades.find((d) => d.type === TypeDocument.PIECE_IDENTITE)}
                onUpload={handleDocUpload}
                onRemove={handleDocRemove}
              />
            </div>
          </div>

          {/* Récapitulatif */}
          <div className="card p-6 bg-white">
            <h3 className="font-bold text-[#0A1628] mb-3">Récapitulatif</h3>
            <div className="grid grid-cols-2 gap-y-2 text-sm">
              <span className="text-[#6B7280]">Projet</span>
              <span className="font-medium">{projetDraft.nomProjet || "—"}</span>
              <span className="text-[#6B7280]">Secteur</span>
              <span className="font-medium">{projetDraft.secteur || "—"}</span>
              <span className="text-[#6B7280]">Montant</span>
              <span className="font-medium">{projetDraft.montantRecherche ? formatFCFA(projetDraft.montantRecherche) : "—"}</span>
              <span className="text-[#6B7280]">Financement</span>
              <span className="font-medium">{projetDraft.typeFinancement || "—"}</span>
            </div>
          </div>

          {/* Sélection forfait */}
          <div className="card p-6 bg-white">
            <h3 className="font-bold text-[#0A1628] mb-1">Choisissez votre forfait de listing</h3>
            <p className="text-xs text-[#6B7280] mb-4">
              Les frais de listing sont non remboursables. Ils couvrent le scoring indépendant réalisé par Oriz Advisory.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {FORFAITS.map((f) => (
                <PrixCard
                  key={f.id}
                  nom={f.nom}
                  prix={f.prix}
                  features={f.features}
                  recommended={f.recommended}
                  selected={forfaitChoisi === f.id}
                  onSelect={() => setForfait(f.id)}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep(2)} className="flex-1">← Retour</Button>
            <Button onClick={handleSubmit} className="flex-1 bg-[#C9A84C] hover:bg-[#b09240] text-[#0A1628] font-bold">
              Soumettre mon dossier et procéder au paiement →
            </Button>
          </div>
        </div>
      )}

      {/* ═══ Modale de confirmation ═══ */}
      {showModal && selectedForfait && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-[#0A1628]">Confirmer la soumission</h3>
            <div className="bg-gray-50 rounded p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#6B7280]">Forfait</span>
                <span className="font-bold">{selectedForfait.nom}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B7280]">Montant</span>
                <span className="font-bold text-[#C9A84C]">{formatFCFA(selectedForfait.prix)}</span>
              </div>
            </div>
            <p className="text-xs text-[#6B7280]">
              Le paiement se fera par virement bancaire ou Mobile Money (MTN MoMo / Orange Money). Les instructions vous seront envoyées sur la page suivante.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowModal(false)} className="flex-1" disabled={isSubmitting}>Annuler</Button>
              <Button onClick={confirmSubmit} disabled={isSubmitting} className="flex-1 bg-[#C9A84C] hover:bg-[#b09240] text-[#0A1628] font-bold">
                {isSubmitting ? "Envoi en cours..." : "Confirmer →"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
