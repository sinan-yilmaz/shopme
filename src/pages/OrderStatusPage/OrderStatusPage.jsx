import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PackageSearch } from "lucide-react";
import { orderStatusPath } from "common/consts/routes";
import { formatCents } from "common/services/money";
import { formatDayShort } from "common/services/dateFormat";
import useCatalogItems from "features/catalog/hooks/useCatalogItems";
import { fromDateKey } from "features/delivery/services/slotRules";
import { FeeBreakdown, OrderStatusTimeline } from "features/order/components";
import { ORDER_ITEM_STATUS_LABELS } from "features/order/consts/orderStatus";
import useOrderByCode from "features/order/hooks/useOrderByCode";
import PageContainer from "lib/layout/PageContainer";
import Badge from "lib/primitives/Badge";
import Button from "lib/primitives/Button";
import Input from "lib/primitives/Input";
import Skeleton from "lib/primitives/Skeleton";
import { EmptyState, WarningBox } from "ui/feedback";
import { WhatsAppButton } from "ui/buttons";

const ITEM_BADGE_VARIANTS = {
  gekauft: "brand",
  ersetzt: "neutral",
  uebersprungen: "warn",
};

function OrderLookup({ code }) {
  const [value, setValue] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!value.trim()) return;
    navigate(orderStatusPath(value.trim().toUpperCase()));
  };

  return (
    <EmptyState
      icon={PackageSearch}
      title="Bestellung nicht gefunden"
      description={
        code
          ? `Zum Code „${code}" liegt uns keine Bestellung vor. Prüfen Sie den Code aus Ihrer Bestellbestätigung.`
          : "Geben Sie Ihren Bestellcode ein, um den Status zu sehen."
      }
      action={
        <form onSubmit={handleSubmit} className="space-y-2.5">
          <Input
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="z. B. GZ-26-0001"
            aria-label="Bestellcode"
            autoComplete="off"
          />
          <Button type="submit" fullWidth disabled={!value.trim()}>
            Status anzeigen
          </Button>
        </form>
      }
    />
  );
}

export default function OrderStatusPage() {
  const { code } = useParams();
  const orderQuery = useOrderByCode({ code });
  const catalogQuery = useCatalogItems();

  const catalogById = useMemo(
    () => new Map((catalogQuery.data ?? []).map((entry) => [entry.id, entry])),
    [catalogQuery.data],
  );

  if (orderQuery.isPending) {
    return (
      <PageContainer>
        <Skeleton className="h-9 w-2/3" />
        <Skeleton className="mt-6 h-72 rounded-2xl" />
        <Skeleton className="mt-6 h-56 rounded-2xl" />
      </PageContainer>
    );
  }

  if (orderQuery.isError) {
    return (
      <PageContainer>
        <OrderLookup code={code} />
      </PageContainer>
    );
  }

  const order = orderQuery.data;
  const isCancelled = order.status === "storniert";
  const showItemProgress = order.items.some((item) => item.status !== "offen");

  return (
    <PageContainer className="animate-step-in">
      <header className="mb-4">
        <p className="text-[13.5px] font-semibold uppercase tracking-[0.12em] text-brand">
          Ihre Bestellung
        </p>
        <div className="mt-1.5 flex flex-wrap items-baseline gap-x-4 gap-y-2">
          <h1 className="font-display text-[32px] font-extrabold leading-[1.1] tracking-[-0.01em] tabular-nums text-ink">
            {order.code}
          </h1>
          {order.slot && (
            <span className="text-[15.5px] font-medium text-muted">
              Lieferung {formatDayShort(fromDateKey(order.slot.date))},{" "}
              <span className="whitespace-nowrap">{order.slot.label}</span>
            </span>
          )}
        </div>
      </header>

      {isCancelled && (
        <div className="mb-5">
          <WarningBox title="Bestellung storniert">
            Diese Bestellung wurde storniert. Bei Fragen erreichen Sie uns
            jederzeit per WhatsApp.
          </WarningBox>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-line bg-white px-3.5 pb-[22px] pt-5 shadow-card">
        <OrderStatusTimeline order={order} />
      </div>

      <section className="mt-6">
        <h2 className="mb-3 font-display text-[21px] font-bold text-ink">
          Positionen ({order.items.length})
        </h2>
        <ul className="rounded-2xl border border-line bg-white px-[18px] py-1 shadow-[0_1px_3px_rgb(23_73_53/0.05)]">
          {order.items.map((item) => {
            const catalogItem = item.catalogItemId
              ? catalogById.get(item.catalogItemId)
              : null;
            return (
              <li
                key={item.id}
                className="flex items-center gap-3 border-b border-[#F1EDE4] py-[13px] last:border-b-0"
              >
                <span
                  className="inline-flex size-[38px] shrink-0 items-center justify-center rounded-full bg-brand-soft text-lg"
                  aria-hidden="true"
                >
                  {catalogItem?.emoji ?? "🛒"}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-base font-semibold text-ink">
                    {item.label}
                    {item.mustHave && (
                      <span
                        className="ml-1.5 text-accent"
                        title="Pflicht-Artikel"
                        aria-label="Pflicht-Artikel"
                      >
                        ★
                      </span>
                    )}
                  </p>
                  <p className="mt-px text-[13.5px] text-neutral-500">
                    {item.quantity} {item.unit}
                    {item.bio && " · Bio"}
                    {item.note && ` · „${item.note}“`}
                    {item.status === "ersetzt" &&
                      item.substitutionNote &&
                      ` · Ersetzt durch: ${item.substitutionNote}`}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  {showItemProgress && item.status !== "offen" && (
                    <Badge
                      variant={ITEM_BADGE_VARIANTS[item.status] ?? "neutral"}
                    >
                      {ORDER_ITEM_STATUS_LABELS[item.status]}
                    </Badge>
                  )}
                  {item.priceCents != null && (
                    <span className="text-[14.5px] font-semibold tabular-nums text-neutral-700">
                      {formatCents(item.priceCents)}
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-6">
        <h2 className="mb-3 font-display text-[21px] font-bold text-ink">
          {order.receiptCents != null
            ? "Ihre Abrechnung"
            : "Ihre Kosten-Obergrenze"}
        </h2>
        {order.receiptCents != null && order.finalFees ? (
          <FeeBreakdown
            variant="final"
            receiptCents={order.receiptCents}
            finalFees={order.finalFees}
            prepaidCents={order.prepaidCents}
            area={order.customer.area}
          />
        ) : (
          <FeeBreakdown
            variant="estimate"
            budgetCents={order.budgetCents}
            area={order.customer.area}
            paymentMode={order.paymentMode}
          />
        )}
      </section>

      <div className="mt-6">
        <WhatsAppButton
          variant="ghost-brand"
          fullWidth
          message={`Hallo! Ich habe eine Frage zu meiner Bestellung ${order.code}.`}
        >
          Frage zur Bestellung?
        </WhatsAppButton>
      </div>
    </PageContainer>
  );
}
