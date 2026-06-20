"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Loader2, CheckCircle } from "lucide-react";

/** Type analyste pour l'onglet Équipe */
interface Analyste {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  role: string;
  dossiersAssignes: number;
  derniereConnexion: string;
}

const TABS = ["Général", "Scoring", "Équipe", "Notifications"] as const;
type Tab = (typeof TABS)[number];

const SEUILS = [
  { statut: "PRIORITAIRE", seuil: "≥ 75", couleur: "bg-[#2D6A4F]/10 text-[#2D6A4F]" },
  { statut: "STANDARD", seuil: "60 – 74", couleur: "bg-[#0A1628]/10 text-[#0A1628]" },
  { statut: "ACCOMPAGNEMENT", seuil: "45 – 59", couleur: "bg-yellow-100 text-yellow-700" },
  { statut: "REJETÉ", seuil: "< 45", couleur: "bg-red-100 text-red-700" },
];

const DIMENSIONS_SCORING = [
  { label: "Viabilité du porteur", max: 30 },
  { label: "Modèle économique", max: 25 },
  { label: "Marché et traction", max: 20 },
  { label: "Structuration juridique", max: 15 },
  { label: "Attractivité investisseur", max: 10 },
];

const NOTIF_DEFAULTS = [
  { id: "accuse_reception", label: "Accusé de réception dossier → porteur (email + WhatsApp)" },
  { id: "confirm_paiement", label: "Confirmation paiement → porteur" },
  { id: "scoring_termine", label: "Scoring terminé → porteur" },
  { id: "publication", label: "Publication projet → porteur" },
  { id: "contact_investisseur", label: "Nouveau contact investisseur → analyste + porteur" },
  { id: "alerte_7jours", label: "Alerte dossier > 7 jours sans scoring → admin" },
];

export default function ParametresPage() {
  const [tab, setTab] = useState<Tab>("Général");
  const [notifs, setNotifs] = useState<Record<string, boolean>>(
    Object.fromEntries(NOTIF_DEFAULTS.map((n) => [n.id, true]))
  );
  const [general, setGeneral] = useState({
    plateforme: "Capilink",
    emailContact: "contact@orizadvisory.cm",
    whatsapp: "+237 670 00 00 00",
    delaiScoring: "7",
    montantMin: "5000000",
  });

  // ── Paramètres globaux (scoring + gratuité) ──
  const [scoringActif, setScoringActif] = useState(true);
  const [projetsGratuits, setProjetsGratuits] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.settings) {
          setScoringActif(data.settings.scoringActif);
          setProjetsGratuits(data.settings.projetsGratuits);
        }
      })
      .catch(console.error)
      .finally(() => setSettingsLoading(false));
  }, []);

  const toggleSetting = async (key: "scoringActif" | "projetsGratuits", value: boolean) => {
    // Optimistic update
    if (key === "scoringActif") setScoringActif(value);
    else setProjetsGratuits(value);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: value }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(
          key === "scoringActif"
            ? value ? "Scoring Oriz activé" : "Scoring Oriz désactivé"
            : value ? "Gratuité des projets activée" : "Gratuité des projets désactivée"
        );
      } else {
        // Revert on error
        if (key === "scoringActif") setScoringActif(!value);
        else setProjetsGratuits(!value);
        showToast("Erreur lors de la sauvegarde");
      }
    } catch {
      if (key === "scoringActif") setScoringActif(!value);
      else setProjetsGratuits(!value);
      showToast("Erreur réseau");
    }
  };

  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("ANALYSTE");
  const [invitePrenom, setInvitePrenom] = useState("");
  const [inviteNom, setInviteNom] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteResult, setInviteResult] = useState<{ success: boolean; message: string } | null>(null);

  // Toast
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  // Analystes depuis l'API
  const [analystes, setAnalystes] = useState<Analyste[]>([]);
  const [equipeLoading, setEquipeLoading] = useState(false);

  const fetchEquipe = async () => {
    setEquipeLoading(true);
    try {
      const res = await fetch("/api/admin/equipe");
      if (!res.ok) throw new Error("Erreur chargement");
      const data = await res.json();
      if (data.success) setAnalystes(data.analystes);
    } catch (err) {
      console.error(err);
    } finally {
      setEquipeLoading(false);
    }
  };

  useEffect(() => {
    if (tab === "Équipe") fetchEquipe();
  }, [tab]);

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    setInviteLoading(true);
    setInviteResult(null);
    try {
      const res = await fetch("/api/admin/equipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: inviteEmail,
          role: inviteRole,
          prenom: invitePrenom || undefined,
          nom: inviteNom || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setInviteResult({
          success: true,
          message: `Analyste créé ! Mot de passe temporaire : ${data.motDePasseTemporaire}`,
        });
        fetchEquipe();
        setInviteEmail("");
        setInvitePrenom("");
        setInviteNom("");
      } else {
        setInviteResult({ success: false, message: data.error || "Erreur lors de la création" });
      }
    } catch {
      setInviteResult({ success: false, message: "Erreur réseau" });
    } finally {
      setInviteLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-[#0A1628]">Paramètres</h1>

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 bg-[#2D6A4F] text-white rounded-lg shadow-lg animate-in fade-in slide-in-from-top-2">
          <CheckCircle size={16} />
          <span className="text-sm font-medium">{toast}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "px-4 py-2 text-sm border-b-2 transition-colors",
              tab === t ? "border-[#C9A84C] text-[#0A1628] font-medium" : "border-transparent text-[#6B7280]"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Contenu */}
      <div className="bg-white rounded-lg border p-6">
        {tab === "Général" && (
          <div className="max-w-lg space-y-4">
            <h2 className="font-bold text-[#0A1628] mb-4">Paramètres généraux</h2>
            {[
              { key: "plateforme", label: "Nom de la plateforme" },
              { key: "emailContact", label: "Email de contact affiché" },
              { key: "whatsapp", label: "Numéro WhatsApp Business" },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="text-sm font-medium text-[#0A1628]">{label}</label>
                <input
                  value={general[key as keyof typeof general]}
                  onChange={(e) => setGeneral((g) => ({ ...g, [key]: e.target.value }))}
                  className="w-full border rounded px-3 py-2 text-sm mt-1"
                />
              </div>
            ))}
            <div>
              <label className="text-sm font-medium text-[#0A1628]">Délai de scoring affiché</label>
              <select
                value={general.delaiScoring}
                onChange={(e) => setGeneral((g) => ({ ...g, delaiScoring: e.target.value }))}
                className="w-full border rounded px-3 py-2 text-sm mt-1"
              >
                {["5", "7", "10"].map((v) => (
                  <option key={v} value={v}>
                    {v} jours ouvrés
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-[#0A1628]">Montant minimum (FCFA)</label>
              <input
                value={general.montantMin}
                onChange={(e) => setGeneral((g) => ({ ...g, montantMin: e.target.value }))}
                className="w-full border rounded px-3 py-2 text-sm mt-1"
                type="number"
              />
            {/* ── Toggles fonctionnels ── */}
            <div className="border-t pt-6 mt-6 space-y-4">
              <h2 className="font-bold text-[#0A1628]">Options de la plateforme</h2>

              {settingsLoading ? (
                <div className="flex items-center gap-2 py-4 text-[#6B7280] text-sm">
                  <Loader2 size={16} className="animate-spin" />
                  Chargement des paramètres…
                </div>
              ) : (
                <>
                  {/* Toggle scoring Oriz */}
                  <div className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-1 pr-4">
                      <p className="text-sm font-medium text-[#0A1628]">Scoring des dossiers par Oriz</p>
                      <p className="text-xs text-[#6B7280] mt-1">
                        {scoringActif
                          ? "Chaque dossier soumis passe par le scoring d'Oriz Advisory avant d'être publié."
                          : "Le scoring est désactivé. Les projets peuvent être publiés sans notation préalable."}
                      </p>
                    </div>
                    <button
                      onClick={() => toggleSetting("scoringActif", !scoringActif)}
                      className={cn(
                        "w-11 h-6 rounded-full transition-colors flex items-center px-0.5 flex-shrink-0 mt-0.5",
                        scoringActif ? "bg-[#2D6A4F]" : "bg-gray-300"
                      )}
                      aria-label="Activer/Désactiver le scoring Oriz"
                    >
                      <div className={cn("w-5 h-5 bg-white rounded-full shadow transition-transform", scoringActif ? "translate-x-5" : "")} />
                    </button>
                  </div>

                  {/* Toggle gratuité projets */}
                  <div className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-1 pr-4">
                      <p className="text-sm font-medium text-[#0A1628]">Gratuité de l&apos;ajout des projets</p>
                      <p className="text-xs text-[#6B7280] mt-1">
                        {projetsGratuits
                          ? "Les porteurs peuvent soumettre leurs projets gratuitement, sans frais de forfait."
                          : "Les porteurs doivent payer un forfait (Starter, Growth ou Premium) pour soumettre un projet."}
                      </p>
                    </div>
                    <button
                      onClick={() => toggleSetting("projetsGratuits", !projetsGratuits)}
                      className={cn(
                        "w-11 h-6 rounded-full transition-colors flex items-center px-0.5 flex-shrink-0 mt-0.5",
                        projetsGratuits ? "bg-[#2D6A4F]" : "bg-gray-300"
                      )}
                      aria-label="Activer/Désactiver la gratuité des projets"
                    >
                      <div className={cn("w-5 h-5 bg-white rounded-full shadow transition-transform", projetsGratuits ? "translate-x-5" : "")} />
                    </button>
                  </div>
                </>
              )}
            </div>

            <div className="pt-4 border-t mt-6">
              <button
                onClick={() => showToast("Paramètres enregistrés avec succès !")}
                className="px-4 py-2 bg-[#0A1628] text-white text-sm rounded hover:bg-[#0A1628]/90"
              >
                Enregistrer les modifications
              </button>
            </div>
          </div>
        )}

        {tab === "Scoring" && (
          <div className="space-y-5">
            <h2 className="font-bold text-[#0A1628]">Grille de pondération (lecture seule)</h2>
            <div className="space-y-2">
              {DIMENSIONS_SCORING.map((d, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-7 h-7 rounded-full bg-[#0A1628] flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">D{i + 1}</span>
                  </div>
                  <span className="flex-1 text-sm text-[#0A1628]">{d.label}</span>
                  <span className="font-bold text-[#C9A84C]">{d.max} pts</span>
                  <div className="w-24 bg-gray-200 rounded-full h-1.5">
                    <div className="bg-[#C9A84C] h-1.5 rounded-full" style={{ width: `${d.max}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <h2 className="font-bold text-[#0A1628]">Seuils de publication</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {SEUILS.map((s) => (
                <div key={s.statut} className="border rounded-lg p-3 text-center">
                  <span className={cn("px-2 py-0.5 text-xs font-bold rounded-full", s.couleur)}>{s.statut}</span>
                  <p className="text-lg font-bold text-[#0A1628] mt-2">{s.seuil}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-[#6B7280] italic">La modification des seuils est réservée à l&apos;administrateur principal.</p>
          </div>
        )}

        {tab === "Équipe" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-[#0A1628]">Équipe Oriz Advisory</h2>
              <button
                onClick={() => {
                  setInviteOpen(true);
                  setInviteResult(null);
                }}
                className="px-3 py-1.5 bg-[#C9A84C] text-[#0A1628] text-sm font-medium rounded hover:bg-[#b09240]"
              >
                + Inviter un analyste
              </button>
            </div>
            {equipeLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={24} className="animate-spin text-[#C9A84C]" />
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr>
                    <th className="text-left py-2 text-xs font-medium text-[#6B7280]">Nom</th>
                    <th className="text-left py-2 text-xs font-medium text-[#6B7280]">Email</th>
                    <th className="text-left py-2 text-xs font-medium text-[#6B7280]">Rôle</th>
                    <th className="text-center py-2 text-xs font-medium text-[#6B7280]">Dossiers</th>
                    <th className="text-left py-2 text-xs font-medium text-[#6B7280]">Dernière connexion</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {analystes.map((a) => (
                    <tr key={a.id} className="hover:bg-gray-50">
                      <td className="py-3 font-medium text-[#0A1628]">
                        {a.prenom} {a.nom}
                      </td>
                      <td className="py-3 text-[#6B7280]">{a.email}</td>
                      <td className="py-3">
                        <span
                          className={cn(
                            "px-2 py-0.5 text-[10px] font-bold rounded-full",
                            a.role === "ADMIN" ? "bg-[#C9A84C]/10 text-[#C9A84C]" : "bg-gray-100 text-[#6B7280]"
                          )}
                        >
                          {a.role}
                        </span>
                      </td>
                      <td className="py-3 text-center text-[#6B7280]">{a.dossiersAssignes}</td>
                      <td className="py-3 text-[#6B7280]">{a.derniereConnexion}</td>
                    </tr>
                  ))}
                  {analystes.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-[#6B7280]">
                        Aucun membre trouvé dans l&apos;équipe.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
            {inviteOpen && (
              <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl space-y-3">
                  <h3 className="font-bold text-[#0A1628]">Inviter un analyste</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      className="border rounded px-3 py-2 text-sm"
                      placeholder="Prénom"
                      value={invitePrenom}
                      onChange={(e) => setInvitePrenom(e.target.value)}
                    />
                    <input
                      className="border rounded px-3 py-2 text-sm"
                      placeholder="Nom"
                      value={inviteNom}
                      onChange={(e) => setInviteNom(e.target.value)}
                    />
                  </div>
                  <input
                    className="w-full border rounded px-3 py-2 text-sm"
                    placeholder="Email de l'analyste"
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                  <select
                    className="w-full border rounded px-3 py-2 text-sm"
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                  >
                    <option value="ANALYSTE">ANALYSTE</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                  {inviteResult && (
                    <div
                      className={cn(
                        "p-3 rounded-lg text-sm",
                        inviteResult.success ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
                      )}
                    >
                      {inviteResult.message}
                    </div>
                  )}
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setInviteOpen(false);
                        setInviteResult(null);
                      }}
                      className="flex-1 border rounded py-2 text-sm text-[#6B7280]"
                    >
                      Fermer
                    </button>
                    <button
                      onClick={handleInvite}
                      disabled={inviteLoading || !inviteEmail.trim()}
                      className="flex-1 bg-[#0A1628] text-white rounded py-2 text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {inviteLoading && <Loader2 size={14} className="animate-spin" />}
                      {inviteLoading ? "Création…" : "Créer le compte"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === "Notifications" && (
          <div className="space-y-4">
            <h2 className="font-bold text-[#0A1628]">Notifications automatiques</h2>
            <div className="space-y-3">
              {NOTIF_DEFAULTS.map((n) => (
                <label key={n.id} className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <span className="text-sm text-[#0A1628]">{n.label}</span>
                  <div
                    onClick={() => setNotifs((prev) => ({ ...prev, [n.id]: !prev[n.id] }))}
                    className={cn(
                      "w-10 h-5 rounded-full transition-colors flex items-center px-0.5",
                      notifs[n.id] ? "bg-[#2D6A4F]" : "bg-gray-300"
                    )}
                  >
                    <div className={cn("w-4 h-4 bg-white rounded-full shadow transition-transform", notifs[n.id] ? "translate-x-5" : "")} />
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
