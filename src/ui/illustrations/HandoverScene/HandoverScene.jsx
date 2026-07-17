/**
 * Übergabe-Szene der Danke-Seite (HANDOFF §5): zwei Figuren + Tür, die
 * accent-Tasche wechselt die Hand (bagPass 1.1 s, delay 0.5 s).
 * Geometrie 1:1 aus dem Prototyp (viewBox 0 0 220 120).
 */
export default function HandoverScene({ width = 230, className }) {
  return (
    <svg
      viewBox="0 0 220 120"
      width={width}
      className={className}
      aria-hidden="true"
    >
      <rect x="150" y="14" width="54" height="98" rx="10" fill="#E7F1EA" />
      <rect x="158" y="22" width="38" height="90" rx="8" fill="#174935" />
      <circle cx="165" cy="66" r="2.8" fill="#E8A13D" />
      <rect x="36" y="62" width="27" height="42" rx="13" fill="#1E5C43" />
      <line x1="59" y1="74" x2="76" y2="65" stroke="#1E5C43" strokeWidth="7" strokeLinecap="round" />
      <circle cx="49" cy="45" r="14" fill="#E7F1EA" stroke="#174935" strokeWidth="1.6" />
      <circle cx="44.5" cy="43.5" r="1.5" fill="#1F2A24" />
      <circle cx="53.5" cy="43.5" r="1.5" fill="#1F2A24" />
      <path
        d="M44 49.5 q5 4 10 0"
        fill="none"
        stroke="#1F2A24"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <rect x="104" y="66" width="25" height="38" rx="12" fill="#5C6B62" />
      <line x1="104" y1="77" x2="89" y2="68" stroke="#5C6B62" strokeWidth="7" strokeLinecap="round" />
      <circle cx="116" cy="51" r="13" fill="#E7F1EA" stroke="#174935" strokeWidth="1.6" />
      <circle cx="112" cy="49.5" r="1.5" fill="#1F2A24" />
      <circle cx="120.5" cy="49.5" r="1.5" fill="#1F2A24" />
      <path
        d="M111.5 55 q4.5 3.6 9 0"
        fill="none"
        stroke="#1F2A24"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <g style={{ animation: "bagPass 1.1s ease-in-out 0.5s both" }}>
        <rect x="66" y="58" width="19" height="17" rx="4" fill="#E8A13D" />
        <path
          d="M70.5 59 v-2.5 a5 5 0 0 1 10 0 V59"
          fill="none"
          stroke="#9A6B1F"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}
