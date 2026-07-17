/**
 * Bildmarke: Einkaufstasche mit Lächeln (HANDOFF §3) — Geometrie 1:1 aus
 * dem Prototyp. Nur Palette-Farben, rein dekorativ.
 */
export default function BrandMark({ size = 34, className }) {
  return (
    <svg
      viewBox="0 0 40 40"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      <path
        d="M12.5 16 v-3.5 a7.5 7.5 0 0 1 15 0 V16"
        fill="none"
        stroke="#1E5C43"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <rect x="5" y="15" width="30" height="21" rx="9" fill="#1E5C43" />
      <circle cx="14.5" cy="24" r="1.9" fill="#FAF8F4" />
      <circle cx="25.5" cy="24" r="1.9" fill="#FAF8F4" />
      <path
        d="M14.5 28.5 q5.5 4.4 11 0"
        fill="none"
        stroke="#FAF8F4"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
