"use client";

import { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Search,
  Loader2,
  Mail,
  MessageCircle,
  CheckCircle2,
  Clock,
  XCircle,
  RefreshCw,
} from "lucide-react";

const ONGLETS_STATUT = [
  { key: "TOUS", label: "Toutes" },
  { key: "ENVOYE", label: "Envoyées", icon: CheckCircle2, color: "text-[#2D6A4F]" },
  { key: "EN_ATTENTE", label: "En attente", icon: Clock, color: "text-amber-600" },
  { key: "ECHEC", label: "Échec", icon: XCircle, color: "text-red-500" },
] as const;

const TYPE_LABELS: Record<string, string> = {
  ACCUSE_RECEPTION: "Accusé de réception",
  PAIEMENT_CONFIRME: "Paiement confirmé",
  SCORING_DEMARRE: "Scoring démarré",
  SCORING_TERMINE: "Scoring terminé",
  PROJET_PUBLIE: "Projet publié",
  CONTACT_INVESTISSEUR: "Contact investisseur",
  RELANCE_PAIEMENT: "Relance paiement",
  ALERTE_DOSSIER_URGENT: "Alerte urgente",
};

const TYPE_ICONS: Record<string, string> = {
  ACCUSE_RECEPTION: "📥",
  PAIEMENT_CONFIRME: "💳",
  SCORING_DEMARRE: "🔍",
  SCORING_TERMINE: "📊",
  PROJET_PUBLIE: "🚀",
  CONTACT_INVESTISSEUR: "📩",
  RELANCE_PAIEMENT: "⏰",
  ALERTE_DOSSIER_URGENT: "🔔",
};

const STATUT_STYLES: Record<string, string> = {
  ENVOYE: "bg-[#2D6A4F]/10 text-[#2D6A4F]",
  EN_ATTENTE: "bg-amber-100 text-amber-700",
  ECHEC: "bg-red-100 text-red-600",
};

const STATUT_LABELS: Record<string, string> = {
  ENVOYE: "Envoyé",
  EN_ATTENTE: "En attente",
  ECHEC: "Échec",
};

interface NotificationAPI {
  id: string;
  projetId: string | null;
  destinataire: string;
  canal: "EMAIL" | "WHATSAPP";
  type: string;
  statut: string;
  contenu: string;
  messageId: string | null;
  erreur: string | null;
  envoyeAt: string | null;
  createdAt: string;
  projet: {
    id: string;
    titre: string;
    reference: string;
  } | null;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationAPI[]>([]);
  const [counts, setCounts] = useState({ total: 0, EN_ATTENTE: 0, ENVOYE: 0, ECHEC: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [onglet, setOnglet] = useState("TOUS");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams();
      query.append("limit", "100");
      if (onglet !== "TOUS") query.append("statut", onglet);
      if (search.trim()) query.append("q", search.trim());

      const res = await fetch(`/api/notifications?${query.toString()}`);
      if (!res.ok) throw new Error("Erreur chargement");
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications);
        setCounts(data.counts);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onglet]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== undefined) fetchNotifications();
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#0A1628]">Notifications</h1>
          <p className="text-sm text-[#6B7280]">
            {isLoading
              ? "Chargement…"
              : `${counts.total} notification${counts.total > 1 ? "s" : ""} au total`}
          </p>
        </div>
        <button
          onClick={fetchNotifications}
          className="flex items-center gap-2 px-4 py-2 border rounded-lg text-sm text-[#6B7280] hover:bg-gray-50 transition-colors"
        >
          <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
          Actualiser
        </button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border p-4 text-center">
          <div className="flex items-center justify-center gap-2 text-[#2D6A4F] mb-1">
            <CheckCircle2 size={16} />
            <span className="text-xs font-medium">Envoyées</span>
          </div>
          <p className="text-2xl font-bold text-[#0A1628]">{counts.ENVOYE}</p>
        </div>
        <div className="bg-white rounded-lg border p-4 text-center">
          <div className="flex items-center justify-center gap-2 text-amber-600 mb-1">
            <Clock size={16} />
            <span className="text-xs font-medium">En attente</span>
          </div>
          <p className="text-2xl font-bold text-[#0A1628]">{counts.EN_ATTENTE}</p>
        </div>
        <div className="bg-white rounded-lg border p-4 text-center">
          <div className="flex items-center justify-center gap-2 text-red-500 mb-1">
            <XCircle size={16} />
            <span className="text-xs font-medium">Échec</span>
          </div>
          <p className="text-2xl font-bold text-[#0A1628]">{counts.ECHEC}</p>
        </div>
      </div>

      {/* Onglets */}
      <div className="flex gap-1 overflow-x-auto border-b">
        {ONGLETS_STATUT.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setOnglet(tab.key)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 text-sm whitespace-nowrap border-b-2 transition-colors",
              onglet === tab.key
                ? "border-[#C9A84C] text-[#0A1628] font-medium"
                : "border-transparent text-[#6B7280]"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Recherche */}
      <div className="relative max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
        <Input
          placeholder="Rechercher par destinataire…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8"
        />
      </div>

      {/* Contenu */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-[#C9A84C]" />
        </div>
      ) : notifications.length > 0 ? (
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#6B7280]">Type</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#6B7280]">Destinataire</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#6B7280]">Canal</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#6B7280]">Projet</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#6B7280]">Statut</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#6B7280]">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {notifications.map((n) => (
                  <tr
                    key={n.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => setExpandedId(expandedId === n.id ? null : n.id)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{TYPE_ICONS[n.type] || "📨"}</span>
                        <span className="text-xs font-medium text-[#0A1628]">
                          {TYPE_LABELS[n.type] || n.type}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#6B7280] text-xs">{n.destinataire}</td>
                    <td className="px-4 py-3">
                      {n.canal === "EMAIL" ? (
                        <div className="flex items-center gap-1 text-xs text-[#6B7280]">
                          <Mail size={12} /> Email
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-xs text-green-600">
                          <MessageCircle size={12} /> WhatsApp
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {n.projet ? (
                        <div>
                          <span className="text-xs font-mono text-[#6B7280]">{n.projet.reference}</span>
                          <p className="text-xs text-[#0A1628] truncate max-w-[180px]">{n.projet.titre}</p>
                        </div>
                      ) : (
                        <span className="text-xs text-[#6B7280]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "px-2 py-0.5 text-[10px] font-medium rounded-full",
                          STATUT_STYLES[n.statut] || "bg-gray-100 text-gray-500"
                        )}
                      >
                        {STATUT_LABELS[n.statut] || n.statut}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#6B7280] text-xs whitespace-nowrap">
                      {new Date(n.createdAt).toLocaleDateString("fr-FR")}
                      <br />
                      <span className="text-[10px]">
                        {new Date(n.createdAt).toLocaleTimeString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-lg font-medium text-[#0A1628]">Aucune notification</p>
          <p className="text-sm text-[#6B7280] mt-1">
            Les notifications apparaîtront ici au fil de l&apos;activité de la plateforme.
          </p>
        </div>
      )}
    </div>
  );
}
