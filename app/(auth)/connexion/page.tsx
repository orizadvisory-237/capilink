"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn, getSession } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { connexionSchema } from "@/lib/validations/auth";
import { Loader2 } from "lucide-react";

type ConnexionData = z.infer<typeof connexionSchema>;

export default function ConnexionPage() {
  const router = useRouter();
  const [errorLogin, setErrorLogin] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ConnexionData>({
    resolver: zodResolver(connexionSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = handleSubmit(async (data) => {
    setIsLoading(true);
    setErrorLogin(null);
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (result?.error) {
        setErrorLogin("Email ou mot de passe incorrect");
      } else {
        const session = await getSession();
        if (session?.user?.role === "ADMIN" || session?.user?.role === "ANALYSTE") {
          router.push("/admin/dashboard");
        } else if (session?.user?.role === "INVESTISSEUR") {
          router.push("/espace-investisseur");
        } else {
          router.push("/dashboard");
        }
        router.refresh();
      }
    } catch (err) {
      setErrorLogin("Une erreur est survenue.");
    } finally {
      setIsLoading(false);
    }
  });

  return (
    <div className="w-full max-w-md">
      <div className="card p-8 bg-white">
        <h1 className="text-2xl font-serif text-center text-[#0A1628] mb-2">
          Connexion
        </h1>
        <p className="text-sm text-[#6B7280] text-center mb-6">
          Accédez à votre espace porteur Capilink
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          {errorLogin && (
            <div className="p-3 text-sm text-[#C0392B] bg-red-50 border border-red-200 rounded text-center">
              {errorLogin}
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-[#0A1628]">Email</label>
            <Input {...register("email")} type="email" placeholder="jean@example.cm" />
            {errors.email && (
              <p className="text-xs text-[#C0392B] mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-[#0A1628]">Mot de passe</label>
            <Input {...register("password")} type="password" />
            {errors.password && (
              <p className="text-xs text-[#C0392B] mt-1">{errors.password.message}</p>
            )}
          </div>

          <div className="text-right">
            <Link href="#" className="text-sm text-[#6B7280] hover:text-[#0A1628] underline">
              Mot de passe oublié ?
            </Link>
          </div>

          <Button type="submit" className="w-full bg-[#0A1628] hover:bg-[#0A1628]/90 text-white" disabled={isLoading}>
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : "Se connecter"}
          </Button>
        </form>

        <div className="relative mt-6 mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-[#6B7280]">Ou</span>
          </div>
        </div>

        <Button 
          type="button" 
          variant="outline" 
          className="w-full flex items-center justify-center gap-2"
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
        >
          <svg className="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 19">
            <path fillRule="evenodd" d="M8.842 18.083a8.8 8.8 0 0 1-8.65-8.948 8.841 8.841 0 0 1 8.8-8.652h.153a8.464 8.464 0 0 1 5.7 2.257l-2.193 2.038A5.27 5.27 0 0 0 9.09 3.4a5.882 5.882 0 0 0-.2 11.76h.124a5.091 5.091 0 0 0 5.248-4.057L14.3 11H9V8h8.34c.066.543.095 1.09.088 1.636-.086 5.053-3.463 8.449-8.4 8.449l-.186-.002Z" clipRule="evenodd"/>
          </svg>
          Continuer avec Google
        </Button>

        <p className="text-sm text-center text-[#6B7280] mt-6">
          Pas encore de compte ?{" "}
          <Link href="/inscription-porteur" className="text-[#0A1628] font-medium underline">
            Créer mon compte porteur
          </Link>
        </p>

        <p className="text-xs text-center text-[#6B7280] mt-4 border-t pt-4">
          Vous êtes investisseur ?{" "}
          <Link href="/inscription-investisseur" className="text-[#C9A84C] font-medium underline">
            Créer votre espace privé
          </Link>
        </p>
      </div>
    </div>
  );
}
