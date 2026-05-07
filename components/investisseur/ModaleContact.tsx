"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StepperHorizontal } from "@/components/porteur/StepperHorizontal";
import { SECTEURS_ACTIVITE } from "@/lib/constants";
import {
  contactEtape1Schema,
  contactEtape2Schema,
  type ContactEtape1Data,
  type ContactEtape2Data,
} from "@/lib/validations/contact-investisseur";
import type { ProjetMock } from "@/lib/types";
import { cn } from "@/lib/utils";
import { X, Check, Loader2 } from "lucide-react";

interface Props {
  projet: ProjetMock;
  open: boolean;
  onClose: () => void;
}

const QUALITES = [
  { value: "BUSINESS_ANGEL", icon: "👤", label: "Investisseur individuel (Business Angel)" },
  { value: "FONDS_INVESTISSEMENT", icon: "🏢", label: "Fonds d'investissement / Family office" },
  { value: "INSTITUTION_FINANCIERE", icon: "🏦", label: "Institution financière" },
  { value: "DIASPORA", icon: "🌍", label: "Investisseur de la diaspora" },
  { value: "STRATEGIQUE", icon: "🏗️", label: "Investisseur stratégique" },
];

const INTENTIONS = [
  { value: "INFORMATION", icon: "🔍", label: "Demande d'informations complémentaires" },
  { value: "RENDEZ_VOUS", icon: "📋", label: "Demande de rendez-vous avec le porteur" },
  { value: "FINANCEMENT", icon: "💼", label: "Proposition de financement" },
  { value: "PARTENARIAT", icon: "🤝", label: "Proposition de partenariat stratégique" },
];

const PAYS = ["Cameroun", "France", "USA", "Canada", "Autre pays CEMAC", "Autre"];
const TICKETS = ["< 10M FCFA", "10–25M FCFA", "25–50M FCFA", "50–100M FCFA", "> 100M FCFA"];

export function ModaleContact({ projet, open, onClose }: Props) {
  const [etape, setEtape] = useState<1 | 2 | 3>(1);
  const [alerteEmail, setAlerteEmail] = useState("");
  const [alerteSecteurs, setAlerteSecteurs] = useState<string[]>([projet.secteur]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isAlertSubmitting, setIsAlertSubmitting] = useState(false);
  const [alertSuccess, setAlertSuccess] = useState(false);

  const form1 = useForm<ContactEtape1Data>({
    resolver: zodResolver(contactEtape1Schema),
    defaultValues: { prenom: "", nom: "", email: "", telephone: "+237 ", qualite: "", paysResidence: "", ticketHabituel: "" },
  });

  const form2 = useForm<ContactEtape2Data>({
    resolver: zodResolver(contactEtape2Schema),
    defaultValues: { message: "", intention: "", dejaInvestiAfrique: false, accepteTransmission: false as unknown as true },
  });

  useEffect(() => {
    if (etape === 3 && form1.getValues("email")) {
      setAlerteEmail(form1.getValues("email"));
    }
  }, [etape, form1]);

  if (!open) return null;

  const handleStep1 = form1.handleSubmit(() => setEtape(2));

  const handleStep2 = form2.handleSubmit(async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const step1Data = form1.getValues();
      const step2Data = form2.getValues();

      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projetId: projet.id,
          prenom: step1Data.prenom,
          nom: step1Data.nom,
          email: step1Data.email,
          telephone: step1Data.telephone,
          qualite: step1Data.qualite,
          paysResidence: step1Data.paysResidence,
          ticketHabituel: step1Data.ticketHabituel,
          message: step2Data.message,
          intention: step2Data.intention,
          dejaInvestiAfrique: step2Data.dejaInvestiAfrique,
          accepteTransmission: step2Data.accepteTransmission,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.erreur || "Erreur lors de l'envoi de votre demande");
      }

      const data = await res.json();
      if (data.success) {
        setEtape(3);
      } else {
        throw new Error("Erreur inattendue");
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setIsSubmitting(false);
    }
  });

  const handleSaveAlert = async () => {
    if (!alerteEmail) return;
    setIsAlertSubmitting(true);
    try {
      const res = await fetch("/api/alertes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: alerteEmail, secteurs: alerteSecteurs }),
      });
      if (res.ok) setAlertSuccess(true);
    } catch(e) {
      console.error(e);
    } finally {
      setIsAlertSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-serif font-bold text-[#0A1628]">Exprimer mon intérêt</h2>
          <button onClick={onClose} aria-label="Fermer"><X size={20} /></button>
        </div>

        <div className="p-6">
          <StepperHorizontal steps={["Identification", "Message", "Confirmation"]} currentStep={etape - 1} />
          <p className="text-xs text-[#6B7280] text-center mb-4">Projet : {projet.titre}</p>

          {/* Étape 1 */}
          {etape === 1 && (
            <form onSubmit={handleStep1} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Prénom *</label>
                  <Input {...form1.register("prenom")} />
                  {form1.formState.errors.prenom && <p className="text-xs text-[#C0392B] mt-1">{form1.formState.errors.prenom.message}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium">Nom *</label>
                  <Input {...form1.register("nom")} />
                  {form1.formState.errors.nom && <p className="text-xs text-[#C0392B] mt-1">{form1.formState.errors.nom.message}</p>}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Email professionnel *</label>
                <Input {...form1.register("email")} type="email" />
                {form1.formState.errors.email && <p className="text-xs text-[#C0392B] mt-1">{form1.formState.errors.email.message}</p>}
              </div>
              <div>
                <label className="text-sm font-medium">Téléphone *</label>
                <Input {...form1.register("telephone")} />
                {form1.formState.errors.telephone && <p className="text-xs text-[#C0392B] mt-1">{form1.formState.errors.telephone.message}</p>}
              </div>
              <div>
                <label className="text-sm font-medium">Qualité *</label>
                <div className="space-y-2 mt-1">
                  {QUALITES.map((q) => (
                    <label key={q.value} className={cn(
                      "flex items-center gap-2 p-2 border rounded-lg cursor-pointer text-sm",
                      form1.watch("qualite") === q.value ? "border-[#C9A84C] bg-amber-50" : "border-gray-200"
                    )}>
                      <input type="radio" value={q.value} {...form1.register("qualite")} className="sr-only" />
                      <span>{q.icon}</span><span>{q.label}</span>
                    </label>
                  ))}
                </div>
                {form1.formState.errors.qualite && <p className="text-xs text-[#C0392B] mt-1">{form1.formState.errors.qualite.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Pays de résidence *</label>
                  <select {...form1.register("paysResidence")} className="w-full border rounded px-3 py-2 text-sm mt-1">
                    <option value="">Sélectionner</option>
                    {PAYS.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                  {form1.formState.errors.paysResidence && <p className="text-xs text-[#C0392B] mt-1">{form1.formState.errors.paysResidence.message}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium">Ticket habituel *</label>
                  <select {...form1.register("ticketHabituel")} className="w-full border rounded px-3 py-2 text-sm mt-1">
                    <option value="">Sélectionner</option>
                    {TICKETS.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                  {form1.formState.errors.ticketHabituel && <p className="text-xs text-[#C0392B] mt-1">{form1.formState.errors.ticketHabituel.message}</p>}
                </div>
              </div>
              <Button type="submit" className="w-full bg-[#0A1628] hover:bg-[#0A1628]/90 text-white">Suivant →</Button>
            </form>
          )}

          {/* Étape 2 */}
          {etape === 2 && (
            <form onSubmit={handleStep2} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Message au porteur *</label>
                <textarea
                  {...form2.register("message")} rows={4} maxLength={500}
                  className="w-full border rounded px-3 py-2 text-sm mt-1 resize-none"
                  placeholder="Présentez brièvement votre intérêt pour ce projet..."
                />
                <div className="flex justify-between text-xs text-[#6B7280] mt-1">
                  {form2.formState.errors.message && <span className="text-[#C0392B]">{form2.formState.errors.message.message}</span>}
                  <span className="ml-auto">{(form2.watch("message") || "").length}/500</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Type d&apos;intention *</label>
                <div className="space-y-2 mt-1">
                  {INTENTIONS.map((i) => (
                    <label key={i.value} className={cn(
                      "flex items-center gap-2 p-2 border rounded-lg cursor-pointer text-sm",
                      form2.watch("intention") === i.value ? "border-[#C9A84C] bg-amber-50" : "border-gray-200"
                    )}>
                      <input type="radio" value={i.value} {...form2.register("intention")} className="sr-only" />
                      <span>{i.icon}</span><span>{i.label}</span>
                    </label>
                  ))}
                </div>
                {form2.formState.errors.intention && <p className="text-xs text-[#C0392B] mt-1">{form2.formState.errors.intention.message}</p>}
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" {...form2.register("dejaInvestiAfrique")} />
                <span className="text-sm">Avez-vous déjà investi en Afrique subsaharienne ?</span>
              </label>
              <label className="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" {...form2.register("accepteTransmission")} className="mt-1" />
                <span className="text-sm text-[#6B7280]">J&apos;accepte que mes coordonnées soient transmises à Oriz Advisory dans le cadre de cette mise en relation</span>
              </label>
              {form2.formState.errors.accepteTransmission && <p className="text-xs text-[#C0392B]">{form2.formState.errors.accepteTransmission.message}</p>}

              {/* Erreur serveur */}
              {submitError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-[#C0392B]">
                  {submitError}
                </div>
              )}

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setEtape(1)} className="flex-1" disabled={isSubmitting}>← Retour</Button>
                <Button type="submit" className="flex-1 bg-[#C9A84C] hover:bg-[#b09240] text-[#0A1628] font-bold" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <span className="flex items-center gap-2"><Loader2 size={16} className="animate-spin" /> Envoi…</span>
                  ) : (
                    "Envoyer"
                  )}
                </Button>
              </div>
            </form>
          )}

          {/* Étape 3 — Confirmation */}
          {etape === 3 && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#2D6A4F]/10 flex items-center justify-center mx-auto">
                <Check size={32} className="text-[#2D6A4F]" />
              </div>
              <h3 className="font-bold text-[#0A1628]">Demande transmise !</h3>
              <p className="text-sm text-[#6B7280]">
                Votre demande a été transmise à Oriz Advisory. Un chargé de dossier vous contactera sous 48h ouvrés.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 text-left space-y-2 text-sm">
                <p><span className="text-[#6B7280]">Projet :</span> <span className="font-medium">{projet.titre}</span></p>
                <p><span className="text-[#6B7280]">Intention :</span> <span className="font-medium">{form2.getValues("intention")}</span></p>
              </div>

              {/* Alerte secteur */}
              <div className="bg-[#F8F6F1] rounded-lg p-4 text-left space-y-3">
                <p className="text-sm font-medium text-[#0A1628]">📬 Recevoir une alerte pour les nouveaux projets</p>
                <Input
                  value={alerteEmail}
                  onChange={(e) => setAlerteEmail(e.target.value)}
                  placeholder="Votre email"
                  type="email"
                />
                <div className="flex flex-wrap gap-1">
                  {SECTEURS_ACTIVITE.slice(0, 6).map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setAlerteSecteurs((prev) =>
                        prev.includes(s.id) ? prev.filter((v) => v !== s.id) : [...prev, s.id]
                      )}
                      className={cn(
                        "px-2 py-0.5 text-xs rounded-full border",
                        alerteSecteurs.includes(s.id) ? "bg-[#0A1628] text-white" : "text-[#6B7280]"
                      )}
                    >
                      {s.icon} {s.label}
                    </button>
                  ))}
                </div>
                {alertSuccess ? (
                  <p className="text-xs text-[#2D6A4F] font-medium pt-2">Alerte configurée avec succès ✓</p>
                ) : (
                  <div className="pt-2">
                    <Button 
                      onClick={handleSaveAlert} 
                      disabled={isAlertSubmitting || !alerteEmail} 
                      className="w-full bg-[#0A1628] hover:bg-[#0A1628]/90 text-white text-xs h-8"
                    >
                      {isAlertSubmitting ? "Enregistrement..." : "Créer l'alerte"}
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={onClose} className="flex-1">Fermer</Button>
                <Button onClick={onClose} className="flex-1 bg-[#0A1628] text-white">Explorer d&apos;autres projets</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
