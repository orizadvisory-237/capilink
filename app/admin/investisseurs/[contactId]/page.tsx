"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUT_STYLES: Record<string, string> = {
  NOUVEAU: "bg-blue-100 text-blue-700",
  CONTACTE: "bg-yellow-100 text-yellow-700",
  RDV_PLANIFIE: "bg-purple-100 text-purple-700",
  DEAL_EN_COURS: "bg-[#C9A84C]/10 text-[#C9A84C]",
  CLOTURE: "bg-[#2D6A4F]/10 text-[#2D6A4F]",
};

const NEXT_STATUTS: Record<string, string[]> = {
  NOUVEAU: ["CONTACTE", "RDV_PLANIFIE"],
  CONTACTE: ["RDV_PLANIFIE", "DEAL_EN_COURS", "CLOTURE"],
  RDV_PLANIFIE: ["DEAL_EN_COURS", "CLOTURE"],
  DEAL_EN_COURS: ["CLOTURE"],
  CLOTURE: [],
};

const QUALITE_LABELS: Record<string, string> = {
  BUSINESS_ANGEL: "Business Angel",
  FONDS_INVESTISSEMENT: "Fonds d'investissement",
  INSTITUTION_FINANCIERE: "Institution financière",
  DIASPORA: "Investisseur diaspora",
  STRATEGIQUE: "Investisseur stratégique",
};

const INTENTION_LABELS: Record<string, string> = {
  INFORMATION: "Demande d'informations",
  RENDEZ_VOUS: "Demande de RDV",
  FINANCEMENT: "Proposition de financement",
  PARTENARIAT: "Proposition de partenariat",
};

interface ContactDetail {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  qualite: string;
  typeIntention: string;
  statutSuivi: string;
  message: string;
  notesInternes: string;
  createdAt: string;
  projet: {
    id: string;
    titre: string;
    reference: string;
  };
}

export default function InvestisseurDetailPage({ params }: { params: Promise<{ contactId: string }> }) {
  const { contactId } = use(params);
  const [contact, setContact] = useState<ContactDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statut, setStatut] = useState<string>("NOUVEAU");
  const [notes, setNotes] = useState<Array<{ texte: string; date: string }>>([]);
  const [noteInput, setNoteInput] = useState("");
  const [updatingStatut, setUpdatingStatut] = useState(false);

  useEffect(() => {
    const fetchContact = async () => {
      try {
        // Fetch from the contacts list and find the specific one
        const res = await fetch(`/api/contacts?limit=100`);
        if (!res.ok) throw new Error("Erreur chargement");
        const data = await res.json();
        if (data.success) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const found = data.contacts.find((c: any) => c.id === contactId);
          if (found) {
            setContact(found);
            setStatut(found.statutSuivi);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchContact();
  }, [contactId]);

  const updateStatut = async (newStatut: string) => {
    setUpdatingStatut(true);
    try {
      const res = await fetch(`/api/contacts/${contactId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statutSuivi: newStatut }),
      });
      if (res.ok) {
        setStatut(newStatut);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingStatut(false);
    }
  };

  const addNote = () => {
    if (!noteInput.trim()) return;
    setNotes((prev) => [...prev, { texte: noteInput, date: new Date().toLocaleString("fr-FR") }]);
    setNoteInput("");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 size={28} className="animate-spin text-[#C9A84C]" />
      </div>
    );
  }

  if (!contact) return (
    <div className="text-center py-20">
      <p className="text-[#6B7280]">Contact introuvable.</p>
      <Link href="/admin/investisseurs" className="text-[#C9A84C] hover:underline text-sm mt-2 inline-block">← Retour</Link>
    </div>
  );

  return (
    <div className="space-y-5">
      <Link href="/admin/investisseurs" className="inline-flex items-center gap-1 text-sm text-[#6B7280] hover:text-[#0A1628]">
        <ArrowLeft size={14} /> Retour aux investisseurs
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-5">
          {/* Investisseur */}
          <div className="bg-white rounded-lg border p-5 space-y-3">
            <h2 className="font-bold text-[#0A1628]">Profil investisseur</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-[#6B7280]">Nom</p><p className="font-medium text-[#0A1628]">{contact.prenom} {contact.nom}</p></div>
              <div><p className="text-[#6B7280]">Qualité</p><p className="font-medium">{QUALITE_LABELS[contact.qualite] || contact.qualite}</p></div>
              <div><p className="text-[#6B7280]">Email</p><a href={`mailto:${contact.email}`} className="text-[#C9A84C] hover:underline">{contact.email}</a></div>
              <div><p className="text-[#6B7280]">Téléphone</p><p className="font-medium">{contact.telephone}</p></div>
              <div><p className="text-[#6B7280]">Intention</p><p className="font-medium">{INTENTION_LABELS[contact.typeIntention] || contact.typeIntention}</p></div>
              <div><p className="text-[#6B7280]">Date de contact</p><p className="font-medium">{new Date(contact.createdAt).toLocaleDateString("fr-FR")}</p></div>
            </div>
          </div>

          {/* Message */}
          <div className="bg-white rounded-lg border p-5 space-y-3">
            <h2 className="font-bold text-[#0A1628]">Message initial</h2>
            <div className="bg-gray-50 rounded-lg p-4 text-sm text-[#0A1628] italic">
              &ldquo;{contact.message}&rdquo;
            </div>
          </div>

          {/* Projet concerné */}
          <div className="bg-white rounded-lg border p-5 space-y-3">
            <h2 className="font-bold text-[#0A1628]">Projet concerné</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-[#0A1628]">{contact.projet.titre}</p>
                <p className="text-xs text-[#6B7280]">{contact.projet.reference}</p>
              </div>
              <Link href={`/projet/${contact.projet.id}`} className="text-xs text-[#C9A84C] hover:underline">Voir la fiche →</Link>
            </div>
          </div>

          {/* Notes internes */}
          <div className="bg-white rounded-lg border p-5 space-y-3">
            <h2 className="font-bold text-[#0A1628]">Notes internes</h2>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {notes.length === 0 && <p className="text-sm text-[#6B7280] italic">Aucune note encore.</p>}
              {notes.map((n, i) => (
                <div key={i} className="bg-gray-50 rounded p-3 text-sm">
                  <p className="text-[#0A1628]">{n.texte}</p>
                  <p className="text-[10px] text-[#6B7280] mt-1">{n.date}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <textarea
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                rows={2}
                placeholder="Ajouter une note interne…"
                className="flex-1 border rounded px-3 py-2 text-sm resize-none"
              />
              <button onClick={addNote} className="px-3 py-2 bg-[#0A1628] text-white rounded hover:bg-[#0A1628]/90 self-end">
                <Plus size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Statut */}
          <div className="bg-white rounded-lg border p-5 space-y-3">
            <h2 className="font-bold text-[#0A1628] text-sm">Statut de la mise en relation</h2>
            <span className={cn("px-3 py-1 text-sm font-medium rounded-full", STATUT_STYLES[statut] || "bg-gray-100 text-gray-500")}>
              {statut.replace(/_/g, " ")}
            </span>
            <div className="space-y-1">
              {(NEXT_STATUTS[statut] || []).map((next) => (
                <button
                  key={next}
                  onClick={() => updateStatut(next)}
                  disabled={updatingStatut}
                  className="w-full text-left px-3 py-2 text-sm border rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  → {next.replace(/_/g, " ")}
                </button>
              ))}
            </div>
          </div>

          {/* Chronologie */}
          <div className="bg-white rounded-lg border p-5 space-y-3">
            <h2 className="font-bold text-[#0A1628] text-sm">Chronologie</h2>
            <ol className="space-y-2 text-xs text-[#6B7280]">
              <li className="flex gap-2"><span>📅</span><span>Contact reçu — {new Date(contact.createdAt).toLocaleDateString("fr-FR")}</span></li>
              {statut !== "NOUVEAU" && <li className="flex gap-2"><span>📞</span><span>Contacté par Oriz Advisory</span></li>}
              {(statut === "RDV_PLANIFIE" || statut === "DEAL_EN_COURS" || statut === "CLOTURE") && <li className="flex gap-2"><span>📋</span><span>RDV planifié</span></li>}
              {(statut === "DEAL_EN_COURS" || statut === "CLOTURE") && <li className="flex gap-2"><span>💼</span><span>Deal en cours de structuration</span></li>}
              {statut === "CLOTURE" && <li className="flex gap-2"><span>✅</span><span>Dossier clôturé</span></li>}
              {notes.map((n, i) => (
                <li key={i} className="flex gap-2"><span>📝</span><span>Note ajoutée — {n.date}</span></li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
