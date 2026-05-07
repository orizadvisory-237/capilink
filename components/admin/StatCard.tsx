"use client";

import { cn } from "@/lib/utils";

interface StatCardProps {
  icone: string;
  valeur: string | number;
  label: string;
  variation?: { valeur: number; sens: "hausse" | "baisse" };
  couleur?: "gold" | "navy" | "green" | "red";
}

export function StatCard({ icone, valeur, label, variation, couleur = "navy" }: StatCardProps) {
  const borderColors = {
    gold: "border-t-[#C9A84C]",
    navy: "border-t-[#0A1628]",
    green: "border-t-[#2D6A4F]",
    red: "border-t-[#C0392B]",
  };

  return (
    <div className={cn("bg-white rounded-lg border border-t-[3px] p-5 shadow-sm", borderColors[couleur])}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-2xl mb-1">{icone}</p>
          <p className="text-3xl font-bold text-[#0A1628]">{valeur}</p>
          <p className="text-sm text-[#6B7280] mt-1">{label}</p>
        </div>
        {variation && (
          <div className={cn(
            "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
            variation.sens === "hausse"
              ? "bg-[#2D6A4F]/10 text-[#2D6A4F]"
              : "bg-[#C0392B]/10 text-[#C0392B]"
          )}>
            <span>{variation.sens === "hausse" ? "↑" : "↓"}</span>
            <span>+{Math.abs(variation.valeur)} ce mois</span>
          </div>
        )}
      </div>
    </div>
  );
}
