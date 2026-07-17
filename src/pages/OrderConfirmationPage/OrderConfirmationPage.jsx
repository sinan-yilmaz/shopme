import { Link, useParams } from "react-router-dom";
import { Check, PackageSearch } from "lucide-react";
import routes, { orderStatusPath } from "common/consts/routes";
import { formatDayShort } from "common/services/dateFormat";
import { fromDateKey } from "features/delivery/services/slotRules";
import useOrderByCode from "features/order/hooks/useOrderByCode";
import PageContainer from "lib/layout/PageContainer";
import { buttonClasses } from "lib/primitives/Button";
import Skeleton from "lib/primitives/Skeleton";
import { EmptyState } from "ui/feedback";
import { HandoverScene } from "ui/illustrations";

const CONFETTI_COLORS = ["#1E5C43", "#E8A13D", "#BFD9C9", "#9A6B1F", "#174935"];

/**
 * Einmaliges Konfetti (HANDOFF 2.5): ~26 absolute Spans in Palette-Farben,
 * `confettiFall` mit `forwards` — endet unsichtbar, nichts loopt.
 */
function Confetti() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {Array.from({ length: 26 }, (_, i) => {
        const size = 6 + (i % 3) * 3;
        return (
          <span
            key={i}
            className="absolute rounded-[2px]"
            style={{
              left: `${4 + ((i * 3.7) % 92)}%`,
              top: "-12px",
              width: `${size}px`,
              height: `${size * 1.5}px`,
              background: CONFETTI_COLORS[i % 5],
              transform: `rotate(${(i * 37) % 180}deg)`,
              opacity: 0,
              animation: `confettiFall ${900 + (i % 5) * 200}ms ease-in ${(i % 9) * 90}ms forwards`,
            }}
          />
        );
      })}
    </div>
  );
}

export default function OrderConfirmationPage() {
  const { code } = useParams();
  const orderQuery = useOrderByCode({ code });

  if (orderQuery.isPending) {
    return (
      <PageContainer>
        <Skeleton className="mx-auto h-72 max-w-md rounded-2xl" />
      </PageContainer>
    );
  }

  if (orderQuery.isError) {
    return (
      <PageContainer>
        <EmptyState
          icon={PackageSearch}
          title="Bestellung nicht gefunden"
          description={`Zum Code „${code}" liegt uns keine Bestellung vor.`}
          action={
            <Link
              to={routes.home}
              className={buttonClasses({ fullWidth: true })}
            >
              Zur Startseite
            </Link>
          }
        />
      </PageContainer>
    );
  }

  const order = orderQuery.data;

  return (
    <PageContainer className="relative">
      <Confetti />
      <div className="mx-auto max-w-md text-center">
        <span
          className="inline-flex size-[92px] animate-spring-in items-center justify-center rounded-full bg-brand shadow-[0_10px_28px_rgb(23_73_53/0.28)]"
          aria-hidden="true"
        >
          <Check className="size-[46px] text-white" strokeWidth={2.6} />
        </span>
        <h1 className="mt-5 font-display text-[34px] font-extrabold leading-[1.15] tracking-[-0.015em] text-ink">
          Vielen Dank, {order.customer.name.split(" ")[0]}!
        </h1>
        <p className="mx-auto mt-2.5 max-w-[42ch] text-[17.5px] text-muted [text-wrap:pretty]">
          Ihre Bestellung ist bei uns eingegangen.
          {order.slot && (
            <>
              {" "}
              Wir liefern{" "}
              <strong className="font-semibold text-ink">
                {formatDayShort(fromDateKey(order.slot.date))}{" "}
                {order.slot.label}
              </strong>{" "}
              — bis an Ihre Wohnungstür.
            </>
          )}
        </p>

        <HandoverScene className="mx-auto mt-6 block" />

        <div className="mx-auto mt-7 max-w-[340px] rounded-2xl border border-line bg-white p-5 shadow-card">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-neutral-500">
            Ihr Bestellcode
          </p>
          <p className="mt-1.5 font-display text-[30px] font-extrabold tracking-[0.04em] tabular-nums text-brand-deep">
            {order.code}
          </p>
          <p className="mt-2 text-sm text-muted">
            Mit diesem Code verfolgen Sie Ihre Bestellung jederzeit.
          </p>
        </div>

        <div className="mx-auto mt-4 flex max-w-[340px] flex-col gap-2.5">
          <Link
            to={orderStatusPath(order.code)}
            className={buttonClasses({ size: "lg", fullWidth: true })}
          >
            Bestellstatus ansehen
          </Link>
          <Link
            to={routes.home}
            className={buttonClasses({ variant: "secondary", fullWidth: true })}
          >
            Zur Startseite
          </Link>
        </div>
      </div>
    </PageContainer>
  );
}
