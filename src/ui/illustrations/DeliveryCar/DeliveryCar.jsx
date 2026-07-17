/**
 * Held-Motiv Liefer-PKW (HANDOFF §5): brand-Karosserie, brand-soft-Fenster,
 * accent-Scheinwerfer, Logo-Tasche an der Tür, Kiste im Fenster.
 * Geometrie 1:1 aus dem Prototyp (viewBox 0 0 150 60).
 * `spinWheels` lässt die Räder beim Einfahren 2× drehen (wheelSpin 0.9 s).
 */
export default function DeliveryCar({ width = 170, spinWheels = false }) {
  const wheel = (cx) => (
    <g
      style={
        spinWheels
          ? {
              transformBox: "fill-box",
              transformOrigin: "center",
              animation: "wheelSpin 0.9s linear 2",
            }
          : undefined
      }
    >
      <circle cx={cx} cy="46" r="9.5" fill="#174935" />
      <circle cx={cx} cy="46" r="4" fill="#FAF8F4" />
      {spinWheels && (
        <line
          x1={cx}
          y1="38.5"
          x2={cx}
          y2="53.5"
          stroke="#FAF8F4"
          strokeWidth="1.6"
        />
      )}
    </g>
  );

  return (
    <svg viewBox="0 0 150 60" width={width} aria-hidden="true">
      <rect x="2" y="18" width="122" height="28" rx="12" fill="#1E5C43" />
      <path d="M16 20 q4 -14 20 -14 h34 q16 0 20 14 z" fill="#1E5C43" />
      <rect x="24" y="10" width="22" height="13" rx="5" fill="#DFF0E6" />
      <rect x="52" y="10" width="20" height="13" rx="5" fill="#DFF0E6" />
      <rect x="30" y="15" width="11" height="8" rx="2" fill="#E8A13D" />
      <rect x="49" y="22" width="2.5" height="20" rx="1.2" fill="#174935" />
      <rect x="88" y="24" width="22" height="16" rx="6" fill="#E7F1EA" />
      <path
        d="M93 25 v-1.5 a6 6 0 0 1 12 0 v1.5"
        fill="none"
        stroke="#174935"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M95 32.5 q4 3 8 0"
        fill="none"
        stroke="#174935"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <rect x="118" y="26" width="7" height="6" rx="3" fill="#E8A13D" />
      {wheel(32)}
      {wheel(98)}
    </svg>
  );
}
