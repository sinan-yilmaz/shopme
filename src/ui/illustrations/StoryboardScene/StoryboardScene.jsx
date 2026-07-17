/**
 * „So funktioniert's"-Szenen (HANDOFF §5, 3 Varianten) — Geometrie 1:1 aus
 * dem Prototyp: 1 Figur+Liste (Häkchen ploppen gestaffelt), 2 Einkaufswagen
 * (3 Pakete dropIn), 3 Tür+Übergabe (bagPass). `active` startet die
 * einmaligen Animationen (scroll-getriggert vom Aufrufer).
 */

/** Figuren-Kopf: brand-soft-Kreis, brand-deep-Outline, Punktaugen, Lächeln. */
function Head({ cx, cy, r }) {
  return (
    <>
      <circle cx={cx} cy={cy} r={r} fill="#E7F1EA" stroke="#174935" strokeWidth="1.6" />
      <circle cx={cx - r * 0.34} cy={cy - 1} r="1.4" fill="#1F2A24" />
      <circle cx={cx + r * 0.34} cy={cy - 1} r="1.4" fill="#1F2A24" />
      <path
        d={`M ${cx - r * 0.36} ${cy + r * 0.32} q ${r * 0.36} ${r * 0.34} ${r * 0.72} 0`}
        fill="none"
        stroke="#1F2A24"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </>
  );
}

function SceneList({ active }) {
  const anim = (value) => (active ? value : "none");
  return (
    <svg viewBox="0 0 200 120" width="100%" height="100%" aria-hidden="true">
      <rect x="66" y="14" width="108" height="92" rx="12" fill="#fff" stroke="#D8DDD4" strokeWidth="1.6" />
      {[0, 1, 2].map((i) => (
        <rect
          key={i}
          x="104"
          y={29 + i * 22}
          width={52 - i * 10}
          height="8"
          rx="4"
          fill={i === 0 ? "#BFD9C9" : "#E7F1EA"}
        />
      ))}
      <g>
        <rect x="24" y="58" width="26" height="40" rx="12" fill="#1E5C43" />
        <line x1="46" y1="68" x2="62" y2="58" stroke="#1E5C43" strokeWidth="7" strokeLinecap="round" />
        <Head cx={37} cy={42} r={13} />
      </g>
      {[0, 1, 2].map((i) => (
        <g
          key={i}
          style={{
            animation: anim(`plop 420ms ease-out ${300 + i * 260}ms both`),
          }}
        >
          <circle cx="88" cy={34 + i * 22} r="7.5" fill="#1E5C43" />
          <path
            d={`M84.5 ${34 + i * 22} l2.6 2.6 l4.6 -5`}
            fill="none"
            stroke="#fff"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      ))}
    </svg>
  );
}

function SceneCart({ active }) {
  const anim = (value) => (active ? value : "none");
  const drops = [
    ["#E8A13D", 96, 0],
    ["#BFD9C9", 116, 1],
    ["#1E5C43", 106, 2],
  ];
  return (
    <svg viewBox="0 0 200 120" width="100%" height="100%" aria-hidden="true">
      <path
        d="M78 36 h64 l-8 34 a8 8 0 0 1 -8 6 h-34 a8 8 0 0 1 -8 -6 z"
        fill="#fff"
        stroke="#174935"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <path d="M66 24 h10 l6 14" fill="none" stroke="#174935" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="92" cy="88" r="6" fill="#174935" />
      <circle cx="126" cy="88" r="6" fill="#174935" />
      {drops.map(([color, x, order]) => (
        <rect
          key={color}
          x={x}
          y="42"
          width="13"
          height="13"
          rx="4"
          fill={color}
          style={{
            animation: anim(`dropIn 500ms ease-out ${250 + order * 300}ms both`),
          }}
        />
      ))}
    </svg>
  );
}

function SceneHandover({ active }) {
  const anim = (value) => (active ? value : "none");
  return (
    <svg viewBox="0 0 200 120" width="100%" height="100%" aria-hidden="true">
      <rect x="128" y="18" width="52" height="88" rx="10" fill="#E7F1EA" />
      <rect x="136" y="26" width="36" height="80" rx="8" fill="#174935" />
      <circle cx="143" cy="66" r="2.6" fill="#E8A13D" />
      <g>
        <rect x="30" y="58" width="26" height="40" rx="12" fill="#1E5C43" />
        <line x1="52" y1="70" x2="68" y2="62" stroke="#1E5C43" strokeWidth="7" strokeLinecap="round" />
        <Head cx={43} cy={42} r={13} />
      </g>
      <g>
        <rect x="96" y="62" width="24" height="36" rx="11" fill="#5C6B62" />
        <line x1="96" y1="72" x2="82" y2="64" stroke="#5C6B62" strokeWidth="7" strokeLinecap="round" />
        <Head cx={108} cy={48} r={12} />
      </g>
      <g style={{ animation: anim("bagPass 1s ease-in-out 500ms both") }}>
        <rect x="60" y="54" width="18" height="16" rx="4" fill="#E8A13D" />
        <path
          d="M64 55 v-2 a5 5 0 0 1 10 0 v2"
          fill="none"
          stroke="#9A6B1F"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}

const SCENES = { 1: SceneList, 2: SceneCart, 3: SceneHandover };

export default function StoryboardScene({ variant, active = true }) {
  const Scene = SCENES[variant] ?? SceneList;
  return <Scene active={active} />;
}
