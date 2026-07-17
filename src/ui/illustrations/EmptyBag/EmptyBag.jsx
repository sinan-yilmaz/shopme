/**
 * EmptyState-Motiv „leere Tasche" (HANDOFF §5) — statisch, Geometrie 1:1
 * aus dem Prototyp (viewBox 0 0 120 90).
 */
export default function EmptyBag({ width = 110, className }) {
  return (
    <svg
      viewBox="0 0 120 90"
      width={width}
      className={className}
      aria-hidden="true"
    >
      <path
        d="M42 34 v-6 a18 18 0 0 1 36 0 v6"
        fill="none"
        stroke="#BFD9C9"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <rect x="28" y="32" width="64" height="50" rx="14" fill="#E7F1EA" />
      <circle cx="50" cy="52" r="3" fill="#174935" />
      <circle cx="70" cy="52" r="3" fill="#174935" />
      <path
        d="M52 62 q8 6 16 0"
        fill="none"
        stroke="#174935"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
