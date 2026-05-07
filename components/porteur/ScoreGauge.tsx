"use client";

interface ScoreGaugeProps {
  score: number;
  max?: number;
}

/** Demi-cercle SVG animé affichant un score sur 100 */
export function ScoreGauge({ score, max = 100 }: ScoreGaugeProps) {
  const percentage = Math.min(score / max, 1);
  const radius = 80;
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference * (1 - percentage);

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 200 120" className="w-48 h-28">
        {/* Arc de fond */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="12"
          strokeLinecap="round"
        />
        {/* Arc de progression */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="#C9A84C"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-out"
        />
        {/* Score central */}
        <text
          x="100"
          y="90"
          textAnchor="middle"
          className="fill-[#0A1628] text-3xl font-bold"
          fontSize="32"
          fontWeight="bold"
        >
          {score}
        </text>
        <text
          x="100"
          y="108"
          textAnchor="middle"
          className="fill-[#6B7280]"
          fontSize="12"
        >
          / {max}
        </text>
      </svg>
    </div>
  );
}
