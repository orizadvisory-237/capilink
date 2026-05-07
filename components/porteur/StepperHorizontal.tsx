"use client";

import { cn } from "@/lib/utils";

interface StepperHorizontalProps {
  steps: string[];
  currentStep: number;
}

/** Stepper visuel horizontal pour formulaires multi-étapes */
export function StepperHorizontal({ steps, currentStep }: StepperHorizontalProps) {
  return (
    <div className="flex items-center justify-between w-full mb-8">
      {steps.map((label, index) => {
        const isCompleted = index < currentStep;
        const isActive = index === currentStep;

        return (
          <div key={label} className="flex items-center flex-1 last:flex-initial">
            <div className="flex flex-col items-center gap-2">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors",
                  isCompleted && "bg-[#2D6A4F] border-[#2D6A4F] text-white",
                  isActive && "bg-[#C9A84C] border-[#C9A84C] text-[#0A1628]",
                  !isCompleted && !isActive && "bg-gray-100 border-gray-300 text-[#6B7280]"
                )}
              >
                {isCompleted ? "✓" : index + 1}
              </div>
              <span
                className={cn(
                  "text-xs font-medium text-center max-w-[80px] hidden sm:block",
                  isActive ? "text-[#0A1628]" : "text-[#6B7280]"
                )}
              >
                {label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-0.5 mx-2",
                  isCompleted ? "bg-[#2D6A4F]" : "bg-gray-200"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
