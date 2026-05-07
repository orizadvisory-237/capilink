"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";

const TABS_STATUT = [
  { key: "TOUS", label: "Tous" },
  { key: "NOUVEAU", label: "Nouveau" },
  { key: "CONTACTE", label: "Contacté" },
  { key: "RDV_PLANIFIE", label: "RDV planifié" },
  { key: "DEAL_EN_COURS", label: "Deal en cours" },
  { key: "CLOTURE", label: "Clôturé" },
];

const STATUT_STYLES: Record<string, string> = {
  NOUVEAU: "bg-blue-100 text-blue-700",
  CONTACTE: "bg-yellow-100 text-yellow-700",
  RDV_PLANIFIE: "bg-purple-100 text-purple-700",
  DEAL_EN_COURS: "bg-[#C9A84C]/10 text-[#C9A84C]",
  CLOTURE: "bg-[#2D6A4F]/10 text-[#2D6A4F]",
  ARCHIVE: "bg-gray-100 text-gray-500",
};

const STATUT_LABELS: Record<string, string> = {
  NOUVEAU: "Nouveau",
  CONTACTE: "Contacté",
  RDV_PLANIFIE: "RDV planifié",
  DEAL_EN_COURS: "Deal en cours",
  CLOTURE: "Clôturé",
  ARCHIVE: "Archivé",
};

const QUALITE_LABELS: Record<string, string> = {
  BUSINESS_ANGEL: "Business Angel",
  FONDS_INVESTISSEMENT: "Fonds",
  INSTITUTION_FINANCIERE: "Institution",
  DIASPORA: "Diaspora",
  STRATEGIQUE: "Stratégique",
};

const INTENTION_LABELS: Record<string, string> = {
  INFORMATION: "Infos",
  RENDEZ_VOUS: "RDV",
  FINANCEMENT: "Financement",
  PARTENARIAT: "Partenariat",
};

interface ContactAPI {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  qualite: string;
  typeIntention: string;
  statutSuivi: string;
  message: string;
  createdAt: string;
  projet: {
    id: string;
    titre: string;
    reference: string;
    secteur: string;
  };
}

export default function InvestisseursPage() {
  const [contacts, setContacts] = useState<ContactAPI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [onglet, setOnglet] = useState("TOUS");
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const res = await fetch("/api/contacts?limit=100");
        if (!res.ok) throw new Error("Erreur chargement");
        const data = await res.json();
        if (data.success) {
          setContacts(data.contacts);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchContacts();
  }, []);

  const filtered = useMemo(() => {
    let list = contacts;
    if (onglet !== "TOUS") list = list.filter((c) => c.statutSuivi === onglet);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.prenom.toLowerCase().includes(q) ||
          c.nom.toLowerCase().includes(q) ||
          c.projet.titre.toLowerCase().includes(q)
      );
    }
    return list;
  }, [onglet, search, contacts]);

  const counts: Record<string, number> = useMemo(() => {
    const c: Record<string, number> = { TOUS: contacts.length };
    TABS_STATUT.slice(1).forEach((t) => {
      c[t.key] = contacts.filter((contact) => contact.statutSuivi === t.key).length;
    });
    return c;
  }, [contacts]);

  const updateStatut = async (id: string, newStatut: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/contacts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statutSuivi: newStatut }),
      });
      if (!res.ok) throw new Error("Erreur mise à jour");
      const data = await res.json();
      if (data.success) {
        setContacts((prev) =>
          prev.map((c) => (c.id === id ? { ...c, statutSuivi: newStatut } : c))
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-[#0A1628]">Investisseurs</h1>
        <p className="text-sm text-[#6B7280]">
          {isLoading ? "Chargement…" : `${filtered.length} mise${filtered.length > 1 ? "s" : ""} en relation`}
        </p>
      </div>

      {/* Onglets */}
      <div className="flex gap-1 overflow-x-auto border-b">
        {TABS_STATUT.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setOnglet(tab.key)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 text-sm whitespace-nowrap border-b-2 transition-colors",
              onglet === tab.key ? "border-[#C9A84C] text-[#0A1628] font-medium" : "border-transparent text-[#6B7280]"
            )}
          >
            {tab.label}
            <span className={cn("px-1.5 py-0.5 text-[10px] font-bold rounded-full", onglet === tab.key ? "bg-[#C9A84C]/20 text-[#C9A84C]" : "bg-gray-100 text-[#6B7280]")}>
              {counts[tab.key] || 0}
            </span>
          </button>
        ))}
      </div>

      {/* Recherche */}
      <div className="relative max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
        <Input placeholder="Rechercher investisseur ou projet…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8" />
      </div>

      {/* Tableau */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-[#C9A84C]" />
        </div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#6B7280]">Investisseur</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#6B7280]">Projet</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#6B7280]">Intention</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#6B7280]">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#6B7280]">Statut</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-[#6B7280]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-[#0A1628]">{c.prenom} {c.nom.charAt(0)}.</p>
                      <p className="text-[10px] text-[#6B7280]">{QUALITE_LABELS[c.qualite] || c.qualite}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/projet/${c.projet.id}`} className="text-[#0A1628] hover:text-[#C9A84C] font-medium">
                        {c.projet.titre}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 bg-gray-100 text-[#6B7280] text-[10px] rounded-full">
                        {INTENTION_LABELS[c.typeIntention] || c.typeIntention}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#6B7280] text-xs whitespace-nowrap">
                      {new Date(c.createdAt).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("px-2 py-0.5 text-[10px] font-medium rounded-full", STATUT_STYLES[c.statutSuivi] || "bg-gray-100 text-gray-500")}>
                        {STATUT_LABELS[c.statutSuivi] || c.statutSuivi}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {c.statutSuivi === "NOUVEAU" && (
                          <button
                            onClick={() => updateStatut(c.id, "CONTACTE")}
                            disabled={updatingId === c.id}
                            className="px-2 py-1 text-[10px] bg-[#0A1628] text-white rounded hover:bg-[#0A1628]/80 disabled:opacity-50"
                          >
                            {updatingId === c.id ? "…" : "Marquer contacté"}
                          </button>
                        )}
                        {c.statutSuivi === "CONTACTE" && (
                          <button
                            onClick={() => updateStatut(c.id, "RDV_PLANIFIE")}
                            disabled={updatingId === c.id}
                            className="px-2 py-1 text-[10px] border border-[#C9A84C] text-[#C9A84C] rounded hover:bg-amber-50 disabled:opacity-50"
                          >
                            {updatingId === c.id ? "…" : "Planifier RDV"}
                          </button>
                        )}
                        {c.statutSuivi === "RDV_PLANIFIE" && (
                          <button
                            onClick={() => updateStatut(c.id, "DEAL_EN_COURS")}
                            disabled={updatingId === c.id}
                            className="px-2 py-1 text-[10px] border border-[#2D6A4F] text-[#2D6A4F] rounded hover:bg-green-50 disabled:opacity-50"
                          >
                            {updatingId === c.id ? "…" : "Deal en cours"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-12">
              <p className="text-3xl mb-2">📭</p>
              <p className="text-[#6B7280]">Aucune mise en relation trouvée.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
