"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Shield, BarChart3, Users, Handshake, MapPin, Mail, Phone,
  CheckCircle, XCircle, Clock,
} from "lucide-react";

const DIMENSIONS_SCORING = [
  { label: "Viabilité du porteur", desc: "Expérience, compétences et crédibilité du porteur de projet", poids: "Poids élevé" },
  { label: "Modèle économique", desc: "Solidité du business model, pertinence de la stratégie de revenus", poids: "Poids élevé" },
  { label: "Marché et traction", desc: "Taille du marché, positionnement concurrentiel, premiers résultats", poids: "Poids moyen" },
  { label: "Structuration juridique et financière", desc: "Formalisation de l'entreprise, tenue comptable, conformité", poids: "Poids moyen" },
  { label: "Attractivité investisseur", desc: "Qualité du dossier, clarté de la proposition, potentiel de rendement", poids: "Poids standard" },
];

const STATS = [
  { value: "25+", label: "Projets scorés" },
  { value: "150M+", label: "FCFA en projets publiés" },
  { value: "85%", label: "Taux de satisfaction porteurs" },
  { value: "48h", label: "Délai moyen de scoring" },
];

const COMPARATIF = [
  { critere: "Due diligence préliminaire", avec: true, sans: false },
  { critere: "Score indépendant", avec: true, sans: false },
  { critere: "Accès en ligne 24/7", avec: true, sans: false },
  { critere: "Projets pré-filtrés", avec: true, sans: false },
  { critere: "Coût initial pour l'investisseur", avec: "Gratuit", sans: "Variable" },
  { critere: "Délai d'accès aux dossiers", avec: "Immédiat", sans: "Semaines" },
  { critere: "Mise en relation sécurisée", avec: true, sans: false },
];

export default function AProposPage() {
  const [contactForm, setContactForm] = useState({ nom: "", email: "", message: "" });
  const [contactSent, setContactSent] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8F6F1]">
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-16">
        {/* Hero */}
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#0A1628]">
            À propos de Capilink
          </h1>
          <p className="text-[#6B7280] mt-4 max-w-2xl mx-auto leading-relaxed">
            Connecter les projets camerounais aux investisseurs, de manière transparente et sécurisée.
          </p>
        </div>

        {/* Qui sommes-nous */}
        <section className="card p-8 bg-white">
          <div className="flex items-center gap-3 mb-4">
            <Shield size={24} className="text-[#C9A84C]" />
            <h2 className="text-2xl font-serif font-bold text-[#0A1628]">Qui sommes-nous</h2>
          </div>
          <p className="text-sm text-[#6B7280] leading-relaxed">
            <strong className="text-[#0A1628]">Oriz Advisory SARL</strong> est un cabinet de conseil financier
            basé à Yaoundé, spécialisé dans l&apos;accompagnement des PME camerounaises et de la zone CEMAC.
          </p>
          <p className="text-sm text-[#6B7280] leading-relaxed mt-3">
            Notre mission avec <strong className="text-[#0A1628]">Capilink</strong> : rendre le financement
            des PME plus accessible et plus transparent grâce à un processus de scoring indépendant.
            Chaque projet publié sur la plateforme a été analysé par nos experts selon 5 dimensions clés.
          </p>
        </section>

        {/* Le scoring Oriz */}
        <section className="card p-8 bg-white">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 size={24} className="text-[#C9A84C]" />
            <h2 className="text-2xl font-serif font-bold text-[#0A1628]">Le scoring Oriz</h2>
          </div>
          <p className="text-sm text-[#6B7280] mb-6">
            Notre score sur 100 évalue chaque projet selon 5 dimensions, garantissant une analyse
            indépendante et rigoureuse pour les investisseurs.
          </p>
          <div className="space-y-4">
            {DIMENSIONS_SCORING.map((d, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-6 h-6 rounded-full bg-[#C9A84C]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-[#C9A84C]">{i + 1}</span>
                </div>
                <div>
                  <p className="font-medium text-sm text-[#0A1628]">{d.label}</p>
                  <p className="text-xs text-[#6B7280] mt-0.5">{d.desc}</p>
                  <span className="text-[10px] text-[#C9A84C] font-medium">{d.poids}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Comparatif */}
          <h3 className="font-bold text-[#0A1628] mt-8 mb-4">Avec Capilink vs. Due diligence classique</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 text-[#6B7280] font-medium">Critère</th>
                  <th className="text-center py-2 text-[#C9A84C] font-medium">Avec Capilink</th>
                  <th className="text-center py-2 text-[#6B7280] font-medium">Sans Capilink</th>
                </tr>
              </thead>
              <tbody>
                {COMPARATIF.map((row) => (
                  <tr key={row.critere} className="border-b last:border-0">
                    <td className="py-2 text-[#0A1628]">{row.critere}</td>
                    <td className="py-2 text-center">
                      {typeof row.avec === "boolean" ? (
                        row.avec ? <CheckCircle size={16} className="text-[#2D6A4F] mx-auto" /> : <XCircle size={16} className="text-[#C0392B] mx-auto" />
                      ) : <span className="text-[#2D6A4F] font-medium">{row.avec}</span>}
                    </td>
                    <td className="py-2 text-center">
                      {typeof row.sans === "boolean" ? (
                        row.sans ? <CheckCircle size={16} className="text-[#2D6A4F] mx-auto" /> : <XCircle size={16} className="text-[#C0392B] mx-auto" />
                      ) : <span className="text-[#6B7280]">{row.sans}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Pour les investisseurs */}
        <section className="card p-8 bg-white">
          <div className="flex items-center gap-3 mb-4">
            <Users size={24} className="text-[#C9A84C]" />
            <h2 className="text-2xl font-serif font-bold text-[#0A1628]">Pour les investisseurs</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: "🆓", title: "Accès gratuit et libre", desc: "Parcourez la vitrine sans inscription, filtrez par secteur, ticket et score." },
              { icon: "✅", title: "Projets pré-scorés", desc: "Chaque projet a été analysé par Oriz Advisory = gain de temps considérable." },
              { icon: "🔒", title: "Mise en relation sécurisée", desc: "Oriz Advisory sécurise les échanges entre investisseurs et porteurs." },
              { icon: "🤝", title: "Accompagnement closing", desc: "Option d'accompagnement par Oriz Advisory jusqu'à la conclusion du deal." },
            ].map((item) => (
              <div key={item.title} className="p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl mb-2">{item.icon}</p>
                <p className="font-medium text-sm text-[#0A1628]">{item.title}</p>
                <p className="text-xs text-[#6B7280] mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Chiffres */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map((s) => (
            <div key={s.label} className="card p-6 bg-white text-center">
              <p className="text-3xl font-bold text-[#C9A84C]">{s.value}</p>
              <p className="text-xs text-[#6B7280] mt-1">{s.label}</p>
            </div>
          ))}
        </section>

        {/* Contact */}
        <section className="card p-8 bg-white">
          <div className="flex items-center gap-3 mb-4">
            <Handshake size={24} className="text-[#C9A84C]" />
            <h2 className="text-2xl font-serif font-bold text-[#0A1628]">Contactez-nous</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-2">
                <MapPin size={16} className="text-[#C9A84C] mt-0.5" />
                <div>
                  <p className="font-medium text-[#0A1628]">Oriz Advisory SARL</p>
                  <p className="text-[#6B7280]">Yaoundé, Cameroun</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-[#C9A84C]" />
                <span className="text-[#6B7280]">contact@orizadvisory.cm</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={16} className="text-[#C9A84C]" />
                <span className="text-[#6B7280]">+237 670 00 00 00</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-[#C9A84C]" />
                <span className="text-[#6B7280]">Lun–Ven : 8h00 – 17h00</span>
              </div>
            </div>

            <div>
              {contactSent ? (
                <div className="bg-[#2D6A4F]/10 rounded-lg p-6 text-center">
                  <CheckCircle size={32} className="text-[#2D6A4F] mx-auto mb-2" />
                  <p className="text-sm font-medium text-[#2D6A4F]">Message envoyé ! Nous vous répondrons sous 48h.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <Input
                    placeholder="Votre nom"
                    value={contactForm.nom}
                    onChange={(e) => setContactForm((f) => ({ ...f, nom: e.target.value }))}
                  />
                  <Input
                    type="email"
                    placeholder="Votre email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm((f) => ({ ...f, email: e.target.value }))}
                  />
                  <textarea
                    rows={4}
                    placeholder="Votre message"
                    className="w-full border rounded px-3 py-2 text-sm resize-none"
                    value={contactForm.message}
                    onChange={(e) => setContactForm((f) => ({ ...f, message: e.target.value }))}
                  />
                  <Button
                    onClick={() => setContactSent(true)}
                    className="w-full bg-[#0A1628] hover:bg-[#0A1628]/90 text-white"
                    disabled={!contactForm.nom || !contactForm.email || !contactForm.message}
                  >
                    Envoyer
                  </Button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/vitrine"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#C9A84C] hover:bg-[#b09240] text-[#0A1628] font-bold rounded-lg transition-colors"
          >
            Explorer les projets →
          </Link>
        </div>
      </div>
    </div>
  );
}
