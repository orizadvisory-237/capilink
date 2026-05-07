"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { inscriptionInvestisseurSchema } from "@/lib/validations/auth";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";

type InscriptionFormData = z.infer<typeof inscriptionInvestisseurSchema>;

export default function InscriptionInvestisseurPage() {
  const [errorGlobal, setErrorGlobal] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm<InscriptionFormData>({
    resolver: zodResolver(inscriptionInvestisseurSchema),
    defaultValues: {
      email: "",
      password: "",
      nom: "",
      prenom: "",
      telephone: "",
    },
  });

  const onSubmit = async (data: InscriptionFormData) => {
    setErrorGlobal(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/register-investisseur", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.erreur || "Erreur lors de l'inscription");
      }

      // Connexion automatique après inscription
      const signInResult = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (signInResult?.error) {
        throw new Error("Inscription réussie, mais échec de connexion automatique.");
      }

      router.push("/espace-investisseur");
      router.refresh();
    } catch (err: any) {
      setErrorGlobal(err.message || "Une erreur est survenue");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-serif font-bold text-[#0A1628]">Espace Investisseur</h1>
        <p className="mt-2 text-sm text-[#6B7280]">
          Créez votre compte pour accéder à la dataroom et à votre Deal Flow.
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {errorGlobal && (
          <div className="p-3 text-sm text-[#C0392B] bg-red-50 border border-red-200 rounded-lg">
            {errorGlobal}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#0A1628] mb-1">
              Prénom
            </label>
            <Input
              {...form.register("prenom")}
              placeholder="Jean"
              className="bg-gray-50 border-gray-200 focus:bg-white"
            />
            {form.formState.errors.prenom && (
              <p className="mt-1 text-xs text-[#C0392B]">
                {form.formState.errors.prenom.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-[#0A1628] mb-1">
              Nom
            </label>
            <Input
              {...form.register("nom")}
              placeholder="Dupont"
              className="bg-gray-50 border-gray-200 focus:bg-white"
            />
            {form.formState.errors.nom && (
              <p className="mt-1 text-xs text-[#C0392B]">
                {form.formState.errors.nom.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#0A1628] mb-1">
            Email professionel
          </label>
          <Input
            {...form.register("email")}
            type="email"
            placeholder="jean.dupont@fonds.com"
            className="bg-gray-50 border-gray-200 focus:bg-white"
          />
          {form.formState.errors.email && (
            <p className="mt-1 text-xs text-[#C0392B]">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-[#0A1628] mb-1">
            Téléphone
          </label>
          <Input
            {...form.register("telephone")}
            type="tel"
            placeholder="+33 6 00 00 00 00"
            className="bg-gray-50 border-gray-200 focus:bg-white"
          />
        </div>

        <div>
           <label className="block text-sm font-medium text-[#0A1628] mb-1">
            Mot de passe
          </label>
          <Input
            {...form.register("password")}
            type="password"
            placeholder="••••••••"
            className="bg-gray-50 border-gray-200 focus:bg-white"
          />
          {form.formState.errors.password && (
            <p className="mt-1 text-xs text-[#C0392B]">
              {form.formState.errors.password.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full bg-[#C9A84C] hover:bg-[#b09240] text-[#0A1628] font-bold h-11"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <Loader2 size={16} className="animate-spin" /> Inscription en cours...
            </span>
          ) : (
            "Créer mon compte Investisseur"
          )}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 text-gray-500 bg-white">Ou</span>
        </div>
      </div>

      <p className="text-center text-sm text-[#6B7280]">
        Vous avez déjà un compte ?{" "}
        <Link
          href="/connexion"
          className="font-medium text-[#0A1628] hover:text-[#C9A84C] transition-colors"
        >
          Me connecter
        </Link>
      </p>
    </div>
  );
}
