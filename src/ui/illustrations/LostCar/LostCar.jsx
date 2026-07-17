/**
 * 404-Motiv „verfahrener PKW" mit „?"-Blase in warn-bg (HANDOFF §5) —
 * statisch, Geometrie 1:1 aus dem Prototyp (viewBox 0 0 220 110).
 */
export default function LostCar({ width = 230, className }) {
  return (
    <svg
      viewBox="0 0 220 110"
      width={width}
      className={className}
      aria-hidden="true"
    >
      <line
        x1="20"
        y1="96"
        x2="200"
        y2="96"
        stroke="#E2DCD0"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="12 10"
      />
      <rect x="40" y="52" width="100" height="26" rx="11" fill="#1E5C43" />
      <path d="M52 54 q4 -13 18 -13 h28 q14 0 18 13 z" fill="#1E5C43" />
      <rect x="59" y="45" width="18" height="11" rx="4" fill="#DFF0E6" />
      <rect x="82" y="45" width="17" height="11" rx="4" fill="#DFF0E6" />
      <circle cx="66" cy="80" r="8.5" fill="#174935" />
      <circle cx="66" cy="80" r="3.5" fill="#FAF8F4" />
      <circle cx="120" cy="80" r="8.5" fill="#174935" />
      <circle cx="120" cy="80" r="3.5" fill="#FAF8F4" />
      <circle cx="168" cy="38" r="17" fill="#FBF1DD" />
      <text
        x="168"
        y="45"
        textAnchor="middle"
        style={{
          font: "700 20px 'Bricolage Grotesque Variable', 'Inter Variable', sans-serif",
        }}
        fill="#9A6B1F"
      >
        ?
      </text>
    </svg>
  );
}
