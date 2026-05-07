import { cn } from "@/lib/utils";

interface TimelineStep {
  label: string;
  statut: "done" | "active" | "pending";
  description?: string;
}

interface TimelineStatutProps {
  steps: TimelineStep[];
}

/** Timeline verticale des étapes de traitement d'un dossier */
export function TimelineStatut({ steps }: TimelineStatutProps) {
  return (
    <div className="space-y-0">
      {steps.map((step, index) => (
        <div key={step.label} className="flex gap-4">
          {/* Ligne verticale + cercle */}
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 flex-shrink-0",
                step.statut === "done" && "bg-[#2D6A4F] border-[#2D6A4F] text-white",
                step.statut === "active" && "bg-[#C9A84C] border-[#C9A84C] text-[#0A1628] animate-pulse",
                step.statut === "pending" && "bg-gray-100 border-gray-300 text-[#6B7280]"
              )}
            >
              {step.statut === "done" ? "✓" : step.statut === "active" ? "🔄" : "⏳"}
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "w-0.5 h-12",
                  step.statut === "done" ? "bg-[#2D6A4F]" : "bg-gray-200"
                )}
              />
            )}
          </div>

          {/* Contenu */}
          <div className="pb-8">
            <p
              className={cn(
                "font-medium text-sm",
                step.statut === "done" && "text-[#2D6A4F]",
                step.statut === "active" && "text-[#0A1628] font-bold",
                step.statut === "pending" && "text-[#6B7280]"
              )}
            >
              {step.label}
            </p>
            {step.description && (
              <p className="text-xs text-[#6B7280] mt-1">{step.description}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
