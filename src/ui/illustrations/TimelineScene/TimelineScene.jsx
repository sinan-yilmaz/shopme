import DeliveryCar from "../DeliveryCar";

/**
 * Szenen-Ebene über der Status-Straße (HANDOFF §5): Haus mit accent-Klinke
 * rechts, Liefer-PKW fährt per left-Transition (900 ms) zur aktuellen
 * Station (Zentren bei 10/30/50/70/90 %); bei „geliefert" winkt eine Figur.
 * Geometrie 1:1 aus dem Prototyp.
 */
export default function TimelineScene({ statusIndex, stationCount = 5 }) {
  const delivered = statusIndex >= stationCount - 1;
  const leftPercent = 10 + statusIndex * (80 / (stationCount - 1));

  return (
    <div aria-hidden="true" className="relative h-[104px]">
      <svg
        viewBox="0 0 60 92"
        width="42"
        className="absolute bottom-0 right-0"
        aria-hidden="true"
      >
        <rect x="4" y="4" width="52" height="88" rx="9" fill="#E7F1EA" />
        <rect x="12" y="12" width="36" height="80" rx="7" fill="#174935" />
        <circle cx="19" cy="52" r="2.6" fill="#E8A13D" />
      </svg>

      {delivered && (
        <svg
          viewBox="0 0 44 76"
          width="26"
          className="absolute bottom-0 right-[60px] z-[4]"
          aria-hidden="true"
        >
          <g
            style={{
              transformBox: "fill-box",
              transformOrigin: "right bottom",
              animation: "waveArm 1.4s ease-in-out 0.6s 2",
            }}
          >
            <line
              x1="30"
              y1="40"
              x2="42"
              y2="26"
              stroke="#1E5C43"
              strokeWidth="6"
              strokeLinecap="round"
            />
          </g>
          <rect x="10" y="36" width="22" height="38" rx="11" fill="#1E5C43" />
          <circle cx="21" cy="22" r="12" fill="#E7F1EA" stroke="#174935" strokeWidth="1.5" />
          <circle cx="17" cy="20.5" r="1.4" fill="#1F2A24" />
          <circle cx="25" cy="20.5" r="1.4" fill="#1F2A24" />
          <path
            d="M16.5 25.5 q4.5 3.6 9 0"
            fill="none"
            stroke="#1F2A24"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      )}

      <div
        className="absolute z-[3]"
        style={{
          bottom: "-6px",
          left: `${leftPercent}%`,
          transform: "translateX(-50%)",
          transition: "left 900ms cubic-bezier(.45,0,.2,1)",
        }}
      >
        <DeliveryCar width={86} />
      </div>
    </div>
  );
}
