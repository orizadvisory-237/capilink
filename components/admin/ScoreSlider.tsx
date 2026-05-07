"use client";

import { cn } from "@/lib/utils";

interface Repere {
  valeur: number;
  label: string;
}

interface ScoreSliderProps {
  label: string;
  max: number;
  value: number;
  onChange: (v: number) => void;
  reperes?: Repere[];
  className?: string;
}

export function ScoreSlider({ label, max, value, onChange, reperes, className }: ScoreSliderProps) {
  const pct = max > 0 ? (value / max) * 100 : 0;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-[#0A1628]">{label}</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            max={max}
            value={value}
            onChange={(e) => {
              const v = Math.min(max, Math.max(0, Number(e.target.value)));
              onChange(v);
            }}
            className="w-14 border rounded px-2 py-1 text-sm text-center font-bold text-[#0A1628]"
          />
          <span className="text-xs text-[#6B7280]">/{max} pts</span>
        </div>
      </div>

      {/* Slider track */}
      <div className="relative">
        <input
          type="range"
          min={0}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full accent-[#C9A84C] h-2"
          aria-label={label}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-valuenow={value}
        />
        {/* Progress bar overlay */}
        <div
          className="absolute left-0 top-[5px] h-2 bg-[#C9A84C] rounded-l pointer-events-none"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Repères */}
      {reperes && reperes.length > 0 && (
        <div className="flex justify-between text-[10px] text-[#6B7280]">
          {reperes.map((r, i) => (
            <span key={i} className="text-center max-w-[80px]">{r.label}</span>
          ))}
        </div>
      )}
    </div>
  );
}
