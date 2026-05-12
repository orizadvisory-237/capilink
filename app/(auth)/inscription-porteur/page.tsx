"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StepperHorizontal } from "@/components/porteur/StepperHorizontal";
import { SECTEURS_ACTIVITE } from "@/lib/constants";
import {
  inscriptionEtape1Schema,
  inscriptionEtape2Schema,
} from "@/lib/validations/projet";

type Etape1Data = z.infer<typeof inscriptionEtape1Schema>;
type Etape2Data = z.infer<typeof inscriptionEtape2Schema>;

const VILLES = [
  "Yaoundé", "Douala", "Bafoussam", "Garoua", "Maroua",
  "Ngaoundéré", "Bertoua", "Ebolowa", "Autre",
];

const QUALITES = [
  { value: "ENTREPRENEUR_INDIVIDUEL", label: "Entrepreneur individuel" },
  { value: "DIRIGEANT_PME", label: "Dirigeant de PME" },
  { value: "REPRESENTANT_ASSOCIATION", label: "Représentant d'association" },
  { value: "AUTRE", label: "Autre" },
];

const SOURCES = [
  "Recommandation", "Réseaux sociaux", "Presse", "Événement", "Autre",
];

export default function InscriptionPorteurPage() {
  const [etape, setEtape] = useState(0);
  const router = useRouter();

  const form1 = useForm<Etape1Data>({
    resolver: zodResolver(inscriptionEtape1Schema),
    defaultValues: {
      prenom: "", nom: "", email: "", telephone: "+237 ",
      motDePasse: "", confirmationMotDePasse: "",
      accepteConditions: false as unknown as true,
    },
  });

  const form2 = useForm<Etape2Data>({
    resolver: zodResolver(inscriptionEtape2Schema),
    defaultValues: { qualitePorteur: "", ville: "", secteurActivite: "", sourceDecouverte: "" },
  });

  const handleEtape1 = form1.handleSubmit(() => setEtape(1));

  const handleEtape2 = form2.handleSubmit(() => {
    router.push("/connexion");
  });

  return (
    <div className="w-full max-w-lg">
      <div className="card p-8 bg-white">
        <h1 className="text-2xl font-serif text-center text-[#0A1628] mb-2">
          Créer un compte Porteur
        </h1>
        <p className="text-sm text-[#6B7280] text-center mb-6">
          Soumettez votre projet et accédez au réseau d&apos;investisseurs Capilink
        </p>

        <StepperHorizontal steps={["Identité", "Profil"]} currentStep={etape} />

        {/* ─── Étape 1 : Identité ─── */}
        {etape === 0 && (
          <div className="space-y-6">
            <Button 
              type="button" 
              variant="outline" 
              className="w-full flex items-center justify-center gap-2"
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            >
              <svg className="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 19">
                <path fillRule="evenodd" d="M8.842 18.083a8.8 8.8 0 0 1-8.65-8.948 8.841 8.841 0 0 1 8.8-8.652h.153a8.464 8.464 0 0 1 5.7 2.257l-2.193 2.038A5.27 5.27 0 0 0 9.09 3.4a5.882 5.882 0 0 0-.2 11.76h.124a5.091 5.091 0 0 0 5.248-4.057L14.3 11H9V8h8.34c.066.543.095 1.09.088 1.636-.086 5.053-3.463 8.449-8.4 8.449l-.186-.002Z" clipRule="evenodd"/>
              </svg>
              S&apos;inscrire avec Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-[#6B7280]">Ou utiliser par email</span>
              </div>
            </div>

            <form onSubmit={handleEtape1} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-[#0A1628]">Prénom *</label>
                <Input {...form1.register("prenom")} placeholder="Jean" />
                {form1.formState.errors.prenom && (
                  <p className="text-xs text-[#C0392B] mt-1">{form1.formState.errors.prenom.message}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-[#0A1628]">Nom *</label>
                <Input {...form1.register("nom")} placeholder="Takam" />
                {form1.formState.errors.nom && (
                  <p className="text-xs text-[#C0392B] mt-1">{form1.formState.errors.nom.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-[#0A1628]">Email *</label>
              <Input {...form1.register("email")} type="email" placeholder="jean@example.cm" />
              {form1.formState.errors.email && (
                <p className="text-xs text-[#C0392B] mt-1">{form1.formState.errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-[#0A1628]">Téléphone *</label>
              <Input {...form1.register("telephone")} placeholder="+237 6XX XX XX XX" />
              {form1.formState.errors.telephone && (
                <p className="text-xs text-[#C0392B] mt-1">{form1.formState.errors.telephone.message}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-[#0A1628]">Mot de passe *</label>
              <Input {...form1.register("motDePasse")} type="password" placeholder="Min. 10 caractères" />
              {form1.formState.errors.motDePasse && (
                <p className="text-xs text-[#C0392B] mt-1">{form1.formState.errors.motDePasse.message}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-[#0A1628]">Confirmer le mot de passe *</label>
              <Input {...form1.register("confirmationMotDePasse")} type="password" />
              {form1.formState.errors.confirmationMotDePasse && (
                <p className="text-xs text-[#C0392B] mt-1">{form1.formState.errors.confirmationMotDePasse.message}</p>
              )}
            </div>

            <label className="flex items-start gap-2 cursor-pointer">
              <input type="checkbox" {...form1.register("accepteConditions")} className="mt-1" />
              <span className="text-sm text-[#6B7280]">
                J&apos;accepte les conditions d&apos;utilisation de Capilink
              </span>
            </label>
            {form1.formState.errors.accepteConditions && (
              <p className="text-xs text-[#C0392B]">{form1.formState.errors.accepteConditions.message}</p>
            )}

            <Button type="submit" className="w-full bg-[#0A1628] hover:bg-[#0A1628]/90 text-white">
              Suivant →
            </Button>
          </form>
          </div>
        )}

        {/* ─── Étape 2 : Profil porteur ─── */}
        {etape === 1 && (
          <form onSubmit={handleEtape2} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-[#0A1628]">Qualité du porteur *</label>
              <div className="space-y-2 mt-2">
                {QUALITES.map((q) => (
                  <label key={q.value} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" value={q.value} {...form2.register("qualitePorteur")} />
                    <span className="text-sm">{q.label}</span>
                  </label>
                ))}
              </div>
              {form2.formState.errors.qualitePorteur && (
                <p className="text-xs text-[#C0392B] mt-1">{form2.formState.errors.qualitePorteur.message}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-[#0A1628]">Ville *</label>
              <select {...form2.register("ville")} className="w-full border rounded px-3 py-2 text-sm mt-1">
                <option value="">Sélectionner...</option>
                {VILLES.map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
              {form2.formState.errors.ville && (
                <p className="text-xs text-[#C0392B] mt-1">{form2.formState.errors.ville.message}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-[#0A1628]">Secteur d&apos;activité principal *</label>
              <select {...form2.register("secteurActivite")} className="w-full border rounded px-3 py-2 text-sm mt-1">
                <option value="">Sélectionner...</option>
                {SECTEURS_ACTIVITE.map((s) => (
                  <option key={s.id} value={s.id}>{s.icon} {s.label}</option>
                ))}
              </select>
              {form2.formState.errors.secteurActivite && (
                <p className="text-xs text-[#C0392B] mt-1">{form2.formState.errors.secteurActivite.message}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-[#0A1628]">Comment avez-vous connu Capilink ? *</label>
              <select {...form2.register("sourceDecouverte")} className="w-full border rounded px-3 py-2 text-sm mt-1">
                <option value="">Sélectionner...</option>
                {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              {form2.formState.errors.sourceDecouverte && (
                <p className="text-xs text-[#C0392B] mt-1">{form2.formState.errors.sourceDecouverte.message}</p>
              )}
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setEtape(0)} className="flex-1">
                ← Retour
              </Button>
              <Button type="submit" className="flex-1 bg-[#C9A84C] hover:bg-[#b09240] text-[#0A1628] font-bold">
                Créer mon compte
              </Button>
            </div>
          </form>
        )}

        <p className="text-sm text-center text-[#6B7280] mt-6">
          Déjà inscrit ?{" "}
          <Link href="/connexion" className="text-[#0A1628] font-medium underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
