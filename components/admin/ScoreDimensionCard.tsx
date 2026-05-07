"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { CheckCircle } from "lucide-react";

interface ScoreDimensionCardProps {
  numero: number;
  titre: string;
  noteMax: number;
  noteCourante: number;
  children: ReactNode;
  complete?: boolean;
}

export function ScoreDimensionCard({
  numero,
  titre,
  noteMax,
  noteCourante,
  children,
  complete,
}: ScoreDimensionCardProps) {
  const pct = noteMax > 0 ? Math.min(100, (noteCourante / noteMax) * 100) : 0;

  return (
    <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
      {/* En-tête dimension */}
      <div className="flex items-center gap-3 p-4 border-b bg-[#0A1628]/2">
        <div className="w-8 h-8 rounded-full bg-[#0A1628] flex items-center justify-center flex-shrink-0">
          <span className="text-white text-sm font-bold">D{numero}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-[#0A1628] text-sm">{titre}</h3>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 bg-gray-200 rounded-full h-1.5">
              <div
                className={cn("h-1.5 rounded-full transition-all", pct >= 100 ? "bg-[#2D6A4F]" : "bg-[#C9A84C]")}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-xs font-bold text-[#0A1628] whitespace-nowrap">
              {noteCourante}/{noteMax} pts
            </span>
            {complete && <CheckCircle size={14} className="text-[#2D6A4F] flex-shrink-0" />}
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="p-5 space-y-6">{children}</div>
    </div>
  );
}
