import { cn } from "@/lib/utils";
import { STATUTS_SCORING } from "@/lib/constants";
import type { StatutScoring } from "@/lib/types";

interface StatutBadgeProps {
  statut: StatutScoring;
}

/** Badge coloré affichant le statut scoring d'un projet */
export function StatutBadge({ statut }: StatutBadgeProps) {
  const config = STATUTS_SCORING[statut];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold",
        config.couleur
      )}
    >
      {config.label}
    </span>
  );
}
