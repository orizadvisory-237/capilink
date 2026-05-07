"use client";

import { cn } from "@/lib/utils";

/** Type pour l'historique d'actions */
export interface ActionHistorique {
  id: string;
  type: "SOUMISSION" | "PAIEMENT" | "ASSIGNATION" | "SCORING_START" | "SCORING_SAVE" | "PUBLICATION" | "CONTACT" | "MISE_EN_RELATION" | "STATUT_CHANGE";
  texte: string;
  timestamp: string;
  analysteId?: string;
  projetId?: string;
}

const TYPE_CONFIG: Record<ActionHistorique["type"], { icon: string; color: string }> = {
  SOUMISSION: { icon: "📥", color: "bg-blue-100" },
  PAIEMENT: { icon: "💳", color: "bg-green-100" },
  ASSIGNATION: { icon: "👤", color: "bg-purple-100" },
  SCORING_START: { icon: "🔍", color: "bg-yellow-100" },
  SCORING_SAVE: { icon: "💾", color: "bg-gray-100" },
  PUBLICATION: { icon: "✅", color: "bg-emerald-100" },
  CONTACT: { icon: "📬", color: "bg-orange-100" },
  MISE_EN_RELATION: { icon: "🤝", color: "bg-[#C9A84C]/10" },
  STATUT_CHANGE: { icon: "🔄", color: "bg-red-100" },
};

function tempsRelatif(ts: string): string {
  const ref = new Date();
  const diff = Math.floor((ref.getTime() - new Date(ts).getTime()) / 1000);
  if (diff < 60) return "il y a quelques secondes";
  if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)}h`;
  return `il y a ${Math.floor(diff / 86400)} jours`;
}

interface HistoriqueTimelineProps {
  actions: ActionHistorique[];
  max?: number;
}

export function HistoriqueTimeline({ actions, max = 10 }: HistoriqueTimelineProps) {
  const displayed = actions.slice(0, max);
  return (
    <ol className="relative">
      {displayed.map((action, idx) => {
        const cfg = TYPE_CONFIG[action.type];
        return (
          <li key={action.id} className="flex gap-3 pb-4 last:pb-0">
            {/* Timeline line */}
            <div className="flex flex-col items-center">
              <div className={cn("w-7 h-7 rounded-full flex items-center justify-center text-sm flex-shrink-0", cfg.color)}>
                {cfg.icon}
              </div>
              {idx < displayed.length - 1 && (
                <div className="w-px flex-1 bg-gray-200 mt-1" />
              )}
            </div>
            {/* Content */}
            <div className="flex-1 min-w-0 pb-1">
              <p className="text-sm text-[#0A1628] leading-snug">{action.texte}</p>
              <p className="text-[10px] text-[#6B7280] mt-0.5">{tempsRelatif(action.timestamp)}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
