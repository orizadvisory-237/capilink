"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SECTEURS_ACTIVITE } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Bell } from "lucide-react";

interface Props {
  defaultSecteurs?: string[];
}

export function AlerteSecteur({ defaultSecteurs = [] }: Props) {
  const [email, setEmail] = useState("");
  const [secteurs, setSecteurs] = useState<string[]>(defaultSecteurs);
  const [submitted, setSubmitted] = useState(false);

  const toggle = (id: string) =>
    setSecteurs((prev) => prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]);

  if (submitted) {
    return (
      <div className="bg-[#2D6A4F]/10 rounded-lg p-4 text-center">
        <p className="text-sm font-medium text-[#2D6A4F]">✓ Alerte configurée ! Vous serez notifié par email.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#F8F6F1] rounded-lg p-5 space-y-3">
      <div className="flex items-center gap-2">
        <Bell size={16} className="text-[#C9A84C]" />
        <h4 className="font-medium text-sm text-[#0A1628]">Recevoir des alertes projets</h4>
      </div>
      <p className="text-xs text-[#6B7280]">Soyez notifié quand de nouveaux projets correspondent à vos critères.</p>
      <Input
        type="email"
        placeholder="Votre email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <div className="flex flex-wrap gap-1">
        {SECTEURS_ACTIVITE.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => toggle(s.id)}
            className={cn(
              "px-2 py-0.5 text-xs rounded-full border transition-colors",
              secteurs.includes(s.id)
                ? "bg-[#0A1628] text-white border-[#0A1628]"
                : "text-[#6B7280] border-gray-300"
            )}
          >
            {s.icon} {s.label}
          </button>
        ))}
      </div>
      <Button
        onClick={() => { if (email) setSubmitted(true); }}
        className="w-full bg-[#C9A84C] hover:bg-[#b09240] text-[#0A1628] font-medium"
        disabled={!email}
      >
        Activer les alertes
      </Button>
    </div>
  );
}
