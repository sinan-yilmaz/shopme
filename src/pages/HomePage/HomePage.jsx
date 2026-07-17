import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, ReceiptText } from "lucide-react";
import routes from "common/consts/routes";
import { formatCents } from "common/services/money";
import { DELIVERY_AREAS } from "features/delivery/consts/areas";
import {
  FEE_DELIVERY_CITY_CENTS,
  FEE_DELIVERY_SUBURB_CENTS,
  MIN_BUDGET_CENTS,
  SERVICE_FEE_MAX_CENTS,
  SERVICE_FEE_MIN_CENTS,
} from "features/order/consts/fees";
import { buttonClasses } from "lib/primitives/Button";
import { WhatsAppButton } from "ui/buttons";
import { HeroScene, StoryboardScene } from "ui/illustrations";

const HEADLINE_LINES = ["Ihr Wocheneinkauf.", "Von uns erledigt."];
const SUBLINE =
  "Liste erstellen, Lieferfenster wählen — wir kaufen in Günzburg für Sie ein und liefern bis an die Wohnungstür. Sie zahlen den Ladenpreis laut Kassenbon plus eine faire, transparente Gebühr.";
const WHATSAPP_PREFILL =
  "Hallo! Ich möchte gerne einen Einkauf bestellen. Meine Liste:";

const STORYBOARD = [
  {
    variant: 1,
    title: "Liste erstellen",
    text: "Artikel suchen, aus Kategorien wählen oder die fertige Liste einfügen — sortiert nach Wichtigkeit.",
  },
  {
    variant: 2,
    title: "Wir kaufen ein",
    text: "Wir kaufen in Ihrem Wunschmarkt ein und bleiben dabei immer unter Ihrem Budget.",
  },
  {
    variant: 3,
    title: "Lieferung zum Wunschfenster",
    text: "Ihr Einkauf kommt im gewählten Zeitfenster bis an die Wohnungstür — mit Kassenbon.",
  },
];

/**
 * „So funktioniert's" mit scroll-getriggerten Szenen (HANDOFF §5):
 * IntersectionObserver (threshold 0.25), Panels faden gestaffelt ein,
 * die gestrichelte Linie zeichnet sich nur ≥760 px.
 */
function StoryboardSection() {
  const zoneRef = useRef(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const zone = zoneRef.current;
    if (!zone) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setActive(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    observer.observe(zone);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={zoneRef}
      className="mt-[84px]"
      aria-labelledby="how-it-works-heading"
    >
      <h2
        id="how-it-works-heading"
        className="font-display text-[30px] font-bold leading-[1.15] tracking-[-0.01em] text-ink"
      >
        So funktioniert's
      </h2>
      <div className="relative mt-7">
        {active && (
          <svg
            aria-hidden="true"
            className="absolute left-[16%] top-6 hidden h-1 w-[68%] overflow-visible md:block"
            viewBox="0 0 100 4"
            preserveAspectRatio="none"
          >
            <line
              x1="0"
              y1="2"
              x2="100"
              y2="2"
              stroke="#BFD9C9"
              strokeWidth="3"
              strokeDasharray="6 5"
              pathLength="100"
              style={{
                strokeDashoffset: 100,
                animation: "drawLine 1.4s ease-out 0.2s forwards",
              }}
            />
          </svg>
        )}
        <div className="relative grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-5">
          {STORYBOARD.map((panel, index) => (
            <div
              key={panel.variant}
              style={{
                opacity: active ? 1 : 0,
                transform: active ? "none" : "translateY(16px)",
                transition: `opacity 500ms ease-out ${index * 220}ms, transform 500ms ease-out ${index * 220}ms`,
              }}
            >
              <div className="h-full rounded-2xl border border-line bg-white p-[22px] shadow-card">
                <span className="inline-flex size-12 items-center justify-center rounded-full bg-brand-soft font-display text-xl font-bold text-brand-deep">
                  {index + 1}
                </span>
                <div
                  className="mb-1.5 mt-3.5 flex h-[120px] items-center justify-center"
                  aria-hidden="true"
                >
                  <StoryboardScene variant={panel.variant} active={active} />
                </div>
                <h3 className="font-display text-[19px] font-bold leading-snug text-ink">
                  {panel.title}
                </h3>
                <p className="mt-[7px] text-base text-muted [text-wrap:pretty]">
                  {panel.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  const feeRows = [
    {
      label: "Liefergebühr Günzburg (Stadt)",
      value: formatCents(FEE_DELIVERY_CITY_CENTS),
    },
    {
      label: "Liefergebühr Umland",
      value: formatCents(FEE_DELIVERY_SUBURB_CENTS),
    },
    {
      label: "Servicegebühr 10 % vom Kassenbon (mind. 3 €, max. 12 €)",
      value: `${Math.round(SERVICE_FEE_MIN_CENTS / 100)}–${Math.round(SERVICE_FEE_MAX_CENTS / 100)} €`,
    },
  ];

  return (
    <div className="mx-auto w-full max-w-5xl px-5 pb-16 pt-9">
      {/* Hero — Illustration rutscht mobil unter die Headline */}
      <section className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] items-center gap-9">
        <div className="animate-[fadeUp_500ms_ease-out_both]">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand">
            Einkaufsservice für Günzburg
          </p>
          <h1 className="mt-3.5 font-display text-[clamp(34px,5vw,52px)] font-extrabold leading-[1.08] tracking-[-0.02em] text-ink [text-wrap:balance]">
            {HEADLINE_LINES[0]}
            <br />
            {HEADLINE_LINES[1]}
          </h1>
          <p className="mt-[18px] max-w-[54ch] text-lg text-muted [text-wrap:pretty]">
            {SUBLINE}
          </p>
          <div className="mt-[26px] flex flex-wrap gap-3">
            <Link
              to={routes.orderWizard}
              className={`${buttonClasses({ size: "lg" })} whitespace-nowrap`}
            >
              Jetzt Einkauf zusammenstellen
            </Link>
            <WhatsAppButton
              variant="ghost-brand"
              size="lg"
              message={WHATSAPP_PREFILL}
              className="whitespace-nowrap"
            >
              Lieber per WhatsApp bestellen?
            </WhatsAppButton>
          </div>
        </div>
        <HeroScene />
      </section>

      <StoryboardSection />

      {/* Vertrauen */}
      <section className="mt-[72px]" aria-labelledby="trust-heading">
        <h2
          id="trust-heading"
          className="font-display text-[30px] font-bold leading-[1.15] tracking-[-0.01em] text-ink"
        >
          Fair und ohne Überraschungen
        </h2>
        <div className="mt-[26px] grid grid-cols-[repeat(auto-fit,minmax(270px,1fr))] gap-5">
          <div className="rounded-2xl border border-line bg-white p-6 shadow-card">
            <span
              className="inline-flex size-11 items-center justify-center rounded-lg bg-brand-soft"
              aria-hidden="true"
            >
              <ReceiptText className="size-[21px] text-brand-deep" />
            </span>
            <h3 className="mt-3.5 font-display text-[19px] font-bold text-ink">
              Kassenbon-Transparenz
            </h3>
            <p className="mt-2 text-base text-muted [text-wrap:pretty]">
              Sie zahlen exakt den Ladenpreis laut Kassenbon plus Liefer- und
              Servicegebühr. Der Bon liegt Ihrer Lieferung bei — keine
              versteckten Aufschläge.
            </p>
          </div>

          <div className="rounded-2xl border border-line bg-white p-6 shadow-card">
            <h3 className="font-display text-[19px] font-bold text-ink">
              Unsere Gebühren
            </h3>
            <dl className="mt-3.5 flex flex-col gap-3">
              {feeRows.map((row) => (
                <div
                  key={row.label}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-4"
                >
                  <dt className="text-base text-muted [text-wrap:pretty]">
                    {row.label}
                  </dt>
                  <dd className="text-right font-semibold tabular-nums text-ink">
                    {row.value}
                  </dd>
                </div>
              ))}
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-4 border-t-[1.5px] border-dashed border-[#D8DDD4] pt-3">
                <dt className="text-base text-muted">Mindestbestellwert</dt>
                <dd className="text-right font-semibold tabular-nums text-ink">
                  {formatCents(MIN_BUDGET_CENTS)}
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl border border-line bg-white p-6 shadow-card">
            <span
              className="inline-flex size-11 items-center justify-center rounded-lg bg-brand-soft"
              aria-hidden="true"
            >
              <MapPin className="size-[21px] text-brand-deep" />
            </span>
            <h3 className="mt-3.5 font-display text-[19px] font-bold text-ink">
              Unser Liefergebiet
            </h3>
            <p className="mt-2 text-base text-muted">
              {DELIVERY_AREAS.map(
                (area, index) =>
                  `${index > 0 ? " · " : ""}${area.city} (${area.zip})`,
              ).join("")}
            </p>
            <p className="mt-2 text-[14.5px] text-muted">
              Ihr Ort fehlt? Schreiben Sie uns per WhatsApp — wir melden uns,
              sobald wir liefern.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
