"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, ArrowRight, Lock, Unlock, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContactHistory {
  id: string;
  projetId: string;
  projetTitre: string;
  projetRef: string;
  projetSecteur: string;
  statutSuivi: string;
  typeIntention: string;
  createdAt: string;
}

interface ProfilInvestisseur {
  id: string;
  nom: string;
  prenom: string;
  email: string;
}

const STATUT_STYLES: Record<string, string> = {
  NOUVEAU: "bg-blue-100 text-blue-700",
  CONTACTE: "bg-yellow-100 text-yellow-700",
  RDV_PLANIFIE: "bg-purple-100 text-purple-700",
  DEAL_EN_COURS: "bg-[#C9A84C]/10 text-[#C9A84C]",
  CLOTURE: "bg-[#2D6A4F]/10 text-[#2D6A4F]",
  ARCHIVE: "bg-gray-100 text-gray-500",
};

const STATUT_LABELS: Record<string, string> = {
  NOUVEAU: "À traiter",
  CONTACTE: "Pris en charge",
  RDV_PLANIFIE: "RDV avec analyste",
  DEAL_EN_COURS: "Data Room experte",
  CLOTURE: "Deal cloturé",
  ARCHIVE: "Archivé",
};

export default function EspaceInvestisseurPage() {
  const [profil, setProfil] = useState<ProfilInvestisseur | null>(null);
  const [contacts, setContacts] = useState<ContactHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/investisseurs/mon-espace");
        if (!res.ok) {
          if (res.status === 403) throw new Error("Accès refusé. Veuillez vous connecter.");
          throw new Error("Erreur de récupération des données");
        }
        const data = await res.json();
        if (data.success) {
          setProfil(data.investisseur);
          setContacts(data.contacts);
        }
      } catch (err: any) {
        setError(err.message || "Erreur réseau");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 size={32} className="animate-spin text-[#C9A84C]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20 px-4">
        <p className="text-[#C0392B] bg-red-50 p-4 rounded-lg inline-block border border-red-200">
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F6F1] py-10">
      <div className="max-w-5xl mx-auto px-4 space-y-8">
        
        {/* Header Profil */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-[#0A1628]">
              Bonjour, {profil?.prenom} {profil?.nom}
            </h1>
            <p className="text-[#6B7280] text-sm mt-1">
              Bienvenue sur votre Dashboard d&apos;investissement privé.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border text-sm text-[#0A1628]">
            <Mail size={16} className="text-[#C9A84C]" />
            <span className="font-medium">{profil?.email}</span>
          </div>
        </div>

        {/* Tableau d'investissements/d'intérêts */}
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <div className="p-5 border-b bg-gray-50/50 flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#0A1628]">Mon Deal Flow (Intérêts)</h2>
            <span className="text-xs bg-[#0A1628]/10 text-[#0A1628] px-3 py-1 rounded-full font-bold">
              {contacts.length} dossier(s) en suivi
            </span>
          </div>

          {contacts.length === 0 ? (
            <div className="p-12 text-center text-[#6B7280]">
              <p className="text-4xl mb-4">📂</p>
              <p>Vous n&apos;avez exprimé d&apos;intérêt pour aucun projet pour l&apos;instant.</p>
              <Link
                href="/vitrine"
                className="mt-6 inline-flex items-center gap-2 px-6 py-2 bg-[#C9A84C] text-[#0A1628] font-bold rounded-lg hover:bg-[#b09240] transition-colors"
              >
                Explorer la Vitrine <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-[#6B7280] bg-gray-50 border-b uppercase">
                  <tr>
                    <th className="px-5 py-4 font-medium">Projet ciblé</th>
                    <th className="px-5 py-4 font-medium">Secteur</th>
                    <th className="px-5 py-4 font-medium">Date demande</th>
                    <th className="px-5 py-4 font-medium">Statut Oriz</th>
                    <th className="px-5 py-4 font-medium text-right">Accès Data Room</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {contacts.map((c) => {
                    const isOpen = c.statutSuivi === "DEAL_EN_COURS";
                    return (
                      <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-4">
                          <Link href={`/projet/${c.projetId}`} className="font-bold text-[#0A1628] hover:text-[#C9A84C]">
                            {c.projetTitre}
                          </Link>
                          <div className="text-xs text-[#6B7280] mt-0.5">Ref: {c.projetRef}</div>
                        </td>
                        <td className="px-5 py-4 text-[#6B7280]">
                          {c.projetSecteur.slice(0, 30)}
                        </td>
                        <td className="px-5 py-4 text-[#6B7280]">
                          {new Date(c.createdAt).toLocaleDateString("fr-FR")}
                        </td>
                        <td className="px-5 py-4">
                          <span className={cn("px-2.5 py-1 text-[11px] font-bold rounded-full uppercase", STATUT_STYLES[c.statutSuivi] || "bg-gray-100 text-gray-500")}>
                            {STATUT_LABELS[c.statutSuivi] || c.statutSuivi}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          {isOpen ? (
                            <Link 
                              href={`/espace-investisseur/data-room/${c.projetId}`}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0A1628] hover:bg-[#0A1628]/90 text-white text-xs font-medium rounded-lg transition-colors"
                            >
                              <Unlock size={14} className="text-[#C9A84C]" />
                              Déverrouillé
                            </Link>
                          ) : (
                            <span 
                              title="Réservé aux statuts DEAL_EN_COURS validés par Oriz" 
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-[#6B7280] text-xs font-medium rounded-lg cursor-not-allowed border"
                            >
                              <Lock size={14} />
                              Verrouillée
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
