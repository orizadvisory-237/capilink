"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  BookOpen,
  ScanSearch,
  Users,
  FileText,
  HelpCircle,
  Shield,
} from "lucide-react";

interface SectionAide {
  id: string;
  icon: React.ReactNode;
  titre: string;
  contenu: React.ReactNode;
}

function Accordion({
  section,
  isOpen,
  onToggle,
}: {
  section: SectionAide;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="w-8 h-8 rounded-lg bg-[#0A1628]/5 flex items-center justify-center flex-shrink-0 text-[#0A1628]">
          {section.icon}
        </div>
        <span className="flex-1 font-medium text-[#0A1628]">{section.titre}</span>
        <ChevronDown
          size={16}
          className={cn(
            "text-[#6B7280] transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>
      <div
        className={cn(
          "overflow-hidden transition-all duration-300",
          isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="px-5 pb-5 pt-1 text-sm text-[#374151] leading-relaxed space-y-3 border-t">
          {section.contenu}
        </div>
      </div>
    </div>
  );
}

const SECTIONS: SectionAide[] = [
  {
    id: "workflow",
    icon: <BookOpen size={16} />,
    titre: "Processus de traitement d'un dossier",
    contenu: (
      <>
        <p>Chaque dossier porteur suit un workflow bien défini :</p>
        <div className="space-y-2 mt-2">
          {[
            {
              etape: "1. Soumission",
              detail: "Le porteur remplit le formulaire et choisit son forfait (Starter, Growth, Premium).",
            },
            {
              etape: "2. Confirmation paiement",
              detail: "L'admin confirme la réception du paiement (Orange Money, MTN MoMo, virement). Le statut passe de « En attente » à « Paiement confirmé ».",
            },
            {
              etape: "3. Assignation analyste",
              detail: "L'admin ou le système assigne le dossier à un analyste Oriz Advisory.",
            },
            {
              etape: "4. Scoring (5 dimensions)",
              detail: "L'analyste évalue le dossier sur 100 points via les 5 dimensions et rédige ses justifications.",
            },
            {
              etape: "5. Décision",
              detail: "Selon le score : Prioritaire (≥75), Standard (60-74), Accompagnement (45-59), Rejeté (<45).",
            },
            {
              etape: "6. Publication",
              detail: "Les projets Prioritaire et Standard peuvent être publiés sur la Vitrine Investisseurs.",
            },
          ].map((item) => (
            <div key={item.etape} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
              <span className="font-semibold text-[#C9A84C] whitespace-nowrap">{item.etape}</span>
              <span>{item.detail}</span>
            </div>
          ))}
        </div>
      </>
    ),
  },
  {
    id: "scoring",
    icon: <ScanSearch size={16} />,
    titre: "Grille de scoring — Les 5 dimensions",
    contenu: (
      <>
        <p>La grille de scoring Capilink évalue chaque projet sur <strong>100 points</strong> répartis en 5 dimensions :</p>
        <table className="w-full text-sm mt-3 border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 text-xs font-medium text-[#6B7280]">Dimension</th>
              <th className="text-center py-2 text-xs font-medium text-[#6B7280]">Points max</th>
              <th className="text-left py-2 text-xs font-medium text-[#6B7280]">Critères clés</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {[
              { dim: "D1 — Viabilité du porteur", pts: 30, criteres: "Expérience sectorielle, compétences de gestion, résilience et engagement" },
              { dim: "D2 — Modèle économique", pts: 25, criteres: "Clarté du business model, réalisme des projections, structuration de l'utilisation des fonds" },
              { dim: "D3 — Marché et traction", pts: 20, criteres: "Taille du marché, traction existante, avantages concurrentiels" },
              { dim: "D4 — Structuration juridique", pts: 15, criteres: "Structure légale, documents financiers, absence de contentieux" },
              { dim: "D5 — Attractivité investisseur", pts: 10, criteres: "Clarté de l'offre, potentiel de rendement" },
            ].map((row) => (
              <tr key={row.dim}>
                <td className="py-2 font-medium text-[#0A1628]">{row.dim}</td>
                <td className="py-2 text-center">
                  <span className="px-2 py-0.5 bg-[#C9A84C]/10 text-[#C9A84C] text-xs font-bold rounded-full">
                    {row.pts} pts
                  </span>
                </td>
                <td className="py-2 text-[#6B7280]">{row.criteres}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
          {[
            { statut: "Prioritaire", seuil: "≥ 75", couleur: "bg-[#2D6A4F]/10 text-[#2D6A4F]" },
            { statut: "Standard", seuil: "60 – 74", couleur: "bg-[#0A1628]/10 text-[#0A1628]" },
            { statut: "Accompagnement", seuil: "45 – 59", couleur: "bg-yellow-100 text-yellow-700" },
            { statut: "Rejeté", seuil: "< 45", couleur: "bg-red-100 text-red-700" },
          ].map((s) => (
            <div key={s.statut} className="border rounded-lg p-3 text-center">
              <span className={cn("px-2 py-0.5 text-xs font-bold rounded-full", s.couleur)}>{s.statut}</span>
              <p className="text-lg font-bold text-[#0A1628] mt-1">{s.seuil}</p>
            </div>
          ))}
        </div>
      </>
    ),
  },
  {
    id: "investisseurs",
    icon: <Users size={16} />,
    titre: "Suivi des investisseurs (CRM)",
    contenu: (
      <>
        <p>
          Lorsqu&apos;un investisseur exprime son intérêt via la vitrine, un contact est créé avec le statut
          <strong> « Nouveau »</strong>. L&apos;analyste fait progresser le statut selon l&apos;avancement :
        </p>
        <div className="flex flex-wrap gap-2 mt-3">
          {[
            { label: "Nouveau", color: "bg-blue-100 text-blue-700" },
            { label: "→" },
            { label: "Contacté", color: "bg-yellow-100 text-yellow-700" },
            { label: "→" },
            { label: "RDV planifié", color: "bg-purple-100 text-purple-700" },
            { label: "→" },
            { label: "Deal en cours", color: "bg-[#C9A84C]/10 text-[#C9A84C]" },
            { label: "→" },
            { label: "Clôturé", color: "bg-[#2D6A4F]/10 text-[#2D6A4F]" },
          ].map((item, i) =>
            item.color ? (
              <span key={i} className={cn("px-3 py-1 text-xs font-medium rounded-full", item.color)}>
                {item.label}
              </span>
            ) : (
              <span key={i} className="text-[#6B7280] text-xs self-center">{item.label}</span>
            )
          )}
        </div>
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
          <p className="font-medium text-blue-800 mb-1">💡 Data Room</p>
          <p className="text-blue-700">
            L&apos;investisseur n&apos;accède à la Data Room du projet <strong>que lorsque le statut est « Deal en cours »</strong>.
            C&apos;est vous qui contrôlez l&apos;accès en faisant avancer le statut.
          </p>
        </div>
      </>
    ),
  },
  {
    id: "documents",
    icon: <FileText size={16} />,
    titre: "Gestion des documents",
    contenu: (
      <>
        <p>Les documents téléchargés par les porteurs sont stockés de manière sécurisée sur Supabase Storage et catégorisés :</p>
        <ul className="list-disc pl-5 space-y-1 mt-2">
          <li><strong>BUSINESS_PLAN</strong> — Business Plan, pitch deck</li>
          <li><strong>ETATS_FINANCIERS</strong> — Bilans, comptes de résultat, prévisionnel</li>
          <li><strong>STATUTS</strong> — Statuts juridiques de l&apos;entreprise</li>
          <li><strong>PIECE_IDENTITE</strong> — CNI, passeport du porteur</li>
          <li><strong>AUTRE</strong> — Tout autre document pertinent</li>
        </ul>
        <p className="mt-3">
          Chaque document peut être marqué comme <strong>« Vérifié »</strong> par l&apos;analyste lors du scoring.
        </p>
      </>
    ),
  },
  {
    id: "securite",
    icon: <Shield size={16} />,
    titre: "Sécurité et accès",
    contenu: (
      <>
        <p>La plateforme intègre plusieurs couches de sécurité :</p>
        <ul className="list-disc pl-5 space-y-1 mt-2">
          <li><strong>Authentification</strong> — NextAuth avec sessions JWT, support Google OAuth et credentials</li>
          <li><strong>Rôles</strong> — PORTEUR, INVESTISSEUR, ANALYSTE, ADMIN — chaque rôle a ses routes protégées</li>
          <li><strong>Verrouillage de compte</strong> — Après 5 tentatives échouées, le compte est temporairement verrouillé</li>
          <li><strong>Journal de sécurité</strong> — Toutes les connexions, déconnexions, téléchargements et modifications de scoring sont journalisés</li>
          <li><strong>Data Room</strong> — Double validation : rôle INVESTISSEUR + statut DEAL_EN_COURS sur le contact</li>
        </ul>
      </>
    ),
  },
  {
    id: "faq",
    icon: <HelpCircle size={16} />,
    titre: "FAQ rapide",
    contenu: (
      <>
        <div className="space-y-4">
          {[
            {
              q: "Comment publier un projet sur la vitrine ?",
              a: "Allez dans Scoring → sélectionnez le projet → finalisez le scoring → choisissez le statut. Si le projet est Prioritaire ou Standard, cliquez sur « Publier le projet » dans le rapport de scoring.",
            },
            {
              q: "Comment exporter les dossiers ?",
              a: "Allez dans Dossiers reçus → cliquez sur « Exporter CSV ». Le fichier se télécharge automatiquement au format compatible Excel.",
            },
            {
              q: "Comment donner accès à la Data Room à un investisseur ?",
              a: "Allez dans Investisseurs → trouvez le contact → faites progresser son statut jusqu'à « Deal en cours ». L'investisseur aura alors automatiquement accès à la Data Room du projet concerné.",
            },
            {
              q: "Comment inviter un nouvel analyste ?",
              a: "Allez dans Paramètres → onglet Équipe → cliquez sur « Inviter un analyste ». Renseignez son email et son rôle. Il recevra une invitation pour créer son compte.",
            },
            {
              q: "Que faire si un paiement n'est pas encore confirmé ?",
              a: "Le dossier reste en attente. Vous pouvez néanmoins commencer le scoring, mais le projet ne sera pas publié tant que le paiement n'est pas confirmé.",
            },
          ].map((faq, i) => (
            <div key={i}>
              <p className="font-semibold text-[#0A1628]">{faq.q}</p>
              <p className="text-[#6B7280] mt-1">{faq.a}</p>
            </div>
          ))}
        </div>
      </>
    ),
  },
];

export default function AidePage() {
  const [openSections, setOpenSections] = useState<string[]>(["workflow"]);

  const toggleSection = (id: string) => {
    setOpenSections((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-[#0A1628]">Aide & documentation</h1>
        <p className="text-sm text-[#6B7280]">
          Guide d&apos;utilisation du back-office Oriz Advisory
        </p>
      </div>

      {/* Raccourcis */}
      <div className="bg-gradient-to-r from-[#0A1628] to-[#1a2f4a] rounded-lg p-5 text-white">
        <h2 className="font-bold mb-2">🎯 Accès rapide</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Dossiers en attente", href: "/admin/dossiers?statut=EN_ATTENTE" },
            { label: "Scoring en cours", href: "/admin/scoring" },
            { label: "Investisseurs", href: "/admin/investisseurs" },
            { label: "Statistiques", href: "/admin/statistiques" },
          ].map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="px-3 py-2 bg-white/10 rounded-lg text-sm text-white/90 hover:bg-white/20 transition-colors text-center"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-3">
        {SECTIONS.map((section) => (
          <Accordion
            key={section.id}
            section={section}
            isOpen={openSections.includes(section.id)}
            onToggle={() => toggleSection(section.id)}
          />
        ))}
      </div>

      {/* Contact */}
      <div className="bg-white rounded-lg border p-5 text-center">
        <p className="text-sm text-[#6B7280]">
          Une question technique ? Contactez l&apos;équipe dev à{" "}
          <a href="mailto:dev@orizadvisory.cm" className="text-[#C9A84C] font-medium hover:underline">
            dev@orizadvisory.cm
          </a>
        </p>
      </div>
    </div>
  );
}
