"use client";

import Link from "next/link";
import type { ProjetMock } from "@/lib/types";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  projets: ProjetMock[];
  currentIndex: number;
}

export function ProjetNavigation({ projets, currentIndex }: Props) {
  const prev = currentIndex > 0 ? projets[currentIndex - 1] : null;
  const next = currentIndex < projets.length - 1 ? projets[currentIndex + 1] : null;

  return (
    <div className="flex items-center justify-between py-4 border-t">
      {prev ? (
        <Link href={`/projet/${prev.id}`} className="flex items-center gap-2 text-sm text-[#6B7280] hover:text-[#0A1628] transition-colors">
          <ChevronLeft size={16} />
          <div className="text-left">
            <p className="text-[10px] uppercase tracking-wider">Précédent</p>
            <p className="font-medium line-clamp-1 max-w-[200px]">{prev.titre}</p>
          </div>
        </Link>
      ) : <div />}
      {next ? (
        <Link href={`/projet/${next.id}`} className="flex items-center gap-2 text-sm text-[#6B7280] hover:text-[#0A1628] transition-colors text-right">
          <div>
            <p className="text-[10px] uppercase tracking-wider">Suivant</p>
            <p className="font-medium line-clamp-1 max-w-[200px]">{next.titre}</p>
          </div>
          <ChevronRight size={16} />
        </Link>
      ) : <div />}
    </div>
  );
}
