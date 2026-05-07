"use client";

interface ScoreRadarProps {
  scores: {
    viabilitePorteur: number;
    modeleEconomique: number;
    marcheTraction: number;
    structurationJuridique: number;
    attractiviteInvestisseur: number;
  };
}

const DIMENSIONS = [
  { key: "viabilitePorteur" as const, label: "Viabilité", max: 30 },
  { key: "modeleEconomique" as const, label: "Modèle éco.", max: 25 },
  { key: "marcheTraction" as const, label: "Marché", max: 20 },
  { key: "structurationJuridique" as const, label: "Juridique", max: 15 },
  { key: "attractiviteInvestisseur" as const, label: "Attractivité", max: 10 },
];

const CENTER = 100;
const RADIUS = 70;
const LABEL_RADIUS = 90;

function polarToCart(angle: number, r: number): [number, number] {
  const rad = ((angle - 90) * Math.PI) / 180;
  return [CENTER + r * Math.cos(rad), CENTER + r * Math.sin(rad)];
}

export function ScoreRadar({ scores }: ScoreRadarProps) {
  const count = DIMENSIONS.length;
  const angleStep = 360 / count;

  // Outer pentagon
  const outerPoints = Array.from({ length: count }, (_, i) => polarToCart(i * angleStep, RADIUS));
  const outerPath = outerPoints.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ") + "Z";

  // Grid lines (3 levels)
  const gridPaths = [0.33, 0.66, 1].map((scale) => {
    const pts = Array.from({ length: count }, (_, i) => polarToCart(i * angleStep, RADIUS * scale));
    return pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ") + "Z";
  });

  // Data polygon
  const dataPoints = DIMENSIONS.map((dim, i) => {
    const value = scores[dim.key];
    const ratio = value / dim.max;
    return polarToCart(i * angleStep, RADIUS * ratio);
  });
  const dataPath = dataPoints.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ") + "Z";

  return (
    <div className="flex justify-center">
      <svg viewBox="0 0 200 200" width="220" height="220" className="overflow-visible">
        {/* Grid */}
        {gridPaths.map((d, i) => (
          <path key={i} d={d} fill="none" stroke="#e5e7eb" strokeWidth="0.5" />
        ))}

        {/* Axis lines */}
        {Array.from({ length: count }, (_, i) => {
          const [x, y] = polarToCart(i * angleStep, RADIUS);
          return <line key={i} x1={CENTER} y1={CENTER} x2={x} y2={y} stroke="#e5e7eb" strokeWidth="0.5" />;
        })}

        {/* Data fill */}
        <path d={dataPath} fill="rgba(201,168,76,0.2)" stroke="#C9A84C" strokeWidth="1.5" />

        {/* Data dots */}
        {dataPoints.map((p, i) => (
          <circle key={i} cx={p[0]} cy={p[1]} r="3" fill="#C9A84C" />
        ))}

        {/* Labels */}
        {DIMENSIONS.map((dim, i) => {
          const [x, y] = polarToCart(i * angleStep, LABEL_RADIUS);
          const value = scores[dim.key];
          return (
            <text
              key={dim.key}
              x={x} y={y}
              textAnchor="middle"
              dominantBaseline="central"
              className="text-[8px] fill-[#0A1628] font-medium"
            >
              <tspan x={x} dy="-0.4em">{dim.label}</tspan>
              <tspan x={x} dy="1.2em" className="fill-[#C9A84C] font-bold">{value}/{dim.max}</tspan>
            </text>
          );
        })}
      </svg>
    </div>
  );
}
