import { cn } from "@/lib/utils";
import { formatFCFA } from "@/lib/utils";
import { Check } from "lucide-react";

interface PrixCardProps {
  nom: string;
  prix: number;
  features: string[];
  recommended?: boolean;
  selected?: boolean;
  onSelect?: () => void;
}

/** Carte de forfait de listing avec badge "Recommandé" */
export function PrixCard({
  nom,
  prix,
  features,
  recommended = false,
  selected = false,
  onSelect,
}: PrixCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "relative flex flex-col p-6 rounded-lg border-2 text-left transition-all w-full",
        selected
          ? "border-[#C9A84C] bg-amber-50 shadow-md"
          : "border-gray-200 bg-white hover:border-gray-300",
        recommended && !selected && "border-[#C9A84C]/50"
      )}
    >
      {recommended && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-[#C9A84C] text-[#0A1628] text-[10px] font-bold rounded-full uppercase tracking-wider">
          Recommandé
        </span>
      )}

      <h4 className="text-lg font-bold text-[#0A1628] mb-1">{nom}</h4>
      <p className="text-2xl font-bold text-[#C9A84C] mb-4">{formatFCFA(prix)}</p>

      <ul className="space-y-2 flex-1">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm text-[#6B7280]">
            <Check size={14} className="text-[#2D6A4F] mt-0.5 flex-shrink-0" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      {selected && (
        <div className="mt-4 text-center text-sm font-semibold text-[#C9A84C]">
          ✓ Sélectionné
        </div>
      )}
    </button>
  );
}
