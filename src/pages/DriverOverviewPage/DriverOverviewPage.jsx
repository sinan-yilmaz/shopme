import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import clsx from "clsx";
import { Inbox, ShoppingBasket } from "lucide-react";
import { driverOrderPath } from "common/consts/routes";
import { formatCents } from "common/services/money";
import { formatDayShort } from "common/services/dateFormat";
import useCatalogItems from "features/catalog/hooks/useCatalogItems";
import {
  fromDateKey,
  slotSortKey,
  toDateKey,
} from "features/delivery/services/slotRules";
import { OrderStatusBadge } from "features/order/components";
import { ORDER_STATUS_LABELS } from "features/order/consts/orderStatus";
import { marketLabel } from "features/order/consts/markets";
import hasAgeRestrictedItems from "features/order/services/ageRestriction";
import useOrders from "features/order/hooks/useOrders";
import useUpdateOrderStatus from "features/order/hooks/useUpdateOrderStatus";
import Button from "lib/primitives/Button";
import PageContainer from "lib/layout/PageContainer";
import PageHeader from "lib/layout/PageHeader";
import Skeleton from "lib/primitives/Skeleton";
import { EmptyState } from "ui/feedback";

const FILTERS = [
  "alle",
  "eingegangen",
  "bestaetigt",
  "im_einkauf",
  "unterwegs",
  "geliefert",
];

function OrderCard({ order, isAgeRestricted, onConfirm, isConfirming }) {
  return (
    <li className="relative rounded-2xl border border-line bg-white px-4 py-[15px] shadow-[0_1px_3px_rgb(23_73_53/0.05)] transition-[border-color,box-shadow] duration-150 hover:border-brand hover:shadow-[0_0_0_3px_#E7F1EA]">
      <Link
        to={driverOrderPath(order.id)}
        className="absolute inset-0 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        aria-label={`Bestellung ${order.code} öffnen`}
      />
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[17px] font-bold tabular-nums text-ink">
          {order.code}
        </span>
        <OrderStatusBadge status={order.status} />
        {isAgeRestricted && (
          <span
            className="rounded-md border-[1.5px] border-danger px-1.5 py-0.5 text-xs font-bold text-danger"
            title="Enthält Artikel ab 18 — Ausweis prüfen"
            aria-label="Enthält Artikel ab 18 — Ausweis prüfen"
          >
            18+
          </span>
        )}
      </div>
      <p className="mt-[7px] text-[15px] text-muted">
        {order.customer.city} · {order.items.length} Artikel · Budget{" "}
        <span className="tabular-nums">{formatCents(order.budgetCents)}</span> ·{" "}
        {marketLabel(order.market)}
      </p>
      {order.status === "eingegangen" && (
        <div className="relative z-10 mt-[11px]">
          <Button size="md" busy={isConfirming} onClick={onConfirm}>
            Bestätigen
          </Button>
        </div>
      )}
    </li>
  );
}

export default function DriverOverviewPage() {
  const ordersQuery = useOrders();
  const catalogQuery = useCatalogItems();
  const updateStatus = useUpdateOrderStatus();
  const [filter, setFilter] = useState("alle");

  const groups = useMemo(() => {
    const orders = ordersQuery.data ?? [];
    const filtered =
      filter === "alle" ? orders : orders.filter((o) => o.status === filter);
    const bySlot = new Map();
    for (const order of filtered) {
      const key = order.slot?.id ?? "ohne-fenster";
      if (!bySlot.has(key)) bySlot.set(key, { slot: order.slot, orders: [] });
      bySlot.get(key).orders.push(order);
    }
    const todayKey = toDateKey(new Date());
    const entries = [...bySlot.values()];
    const upcoming = entries
      .filter((entry) => entry.slot && entry.slot.date >= todayKey)
      .sort((a, b) => slotSortKey(a.slot).localeCompare(slotSortKey(b.slot)));
    const past = entries
      .filter((entry) => !entry.slot || entry.slot.date < todayKey)
      .sort((a, b) =>
        slotSortKey(b.slot ?? { date: "", start: "" }).localeCompare(
          slotSortKey(a.slot ?? { date: "", start: "" }),
        ),
      );
    return { upcoming, past, todayKey, isEmpty: filtered.length === 0 };
  }, [ordersQuery.data, filter]);

  const catalogItems = catalogQuery.data ?? [];

  const renderGroup = (entry) => {
    const { slot, orders } = entry;
    const isToday = slot && slot.date === groups.todayKey;
    const heading = slot
      ? `${isToday ? "Heute" : formatDayShort(fromDateKey(slot.date))} · ${slot.label}`
      : "Ohne Zeitfenster";
    return (
      <section key={slot?.id ?? "ohne-fenster"} className="mt-6 first:mt-0">
        <h2 className="mb-2.5 flex items-baseline justify-between font-display text-[17px] font-bold text-ink">
          {heading}
          <span className="font-sans text-sm font-normal text-neutral-500">
            {orders.length}{" "}
            {orders.length === 1 ? "Bestellung" : "Bestellungen"}
          </span>
        </h2>
        <ul className="space-y-2.5">
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              isAgeRestricted={hasAgeRestrictedItems(order, catalogItems)}
              isConfirming={
                updateStatus.isPending &&
                updateStatus.variables?.orderId === order.id
              }
              onConfirm={() =>
                updateStatus.mutate({ orderId: order.id, status: "bestaetigt" })
              }
            />
          ))}
        </ul>
      </section>
    );
  };

  return (
    <PageContainer width="driver" className="text-base">
      <PageHeader
        eyebrow="Interner Bereich"
        title="Fahrer-Übersicht"
        description="Bestellungen nach Lieferfenster — heute zuerst."
      />

      <div
        className="scrollbar-none -mx-4 mb-5 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0"
        role="group"
        aria-label="Nach Status filtern"
      >
        {FILTERS.map((value) => {
          const isActive = filter === value;
          return (
            <button
              key={value}
              type="button"
              aria-pressed={isActive}
              onClick={() => setFilter(value)}
              className={clsx(
                "h-[38px] shrink-0 whitespace-nowrap rounded-full border-[1.5px] px-3.5 text-sm font-semibold transition-all duration-150 ease-out",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
                isActive
                  ? "border-brand bg-brand text-white"
                  : "border-line-strong bg-white text-neutral-700 hover:border-brand",
              )}
            >
              {value === "alle" ? "Alle" : ORDER_STATUS_LABELS[value]}
            </button>
          );
        })}
      </div>

      {ordersQuery.isPending ? (
        <div className="space-y-2.5">
          <Skeleton className="h-6 w-56" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
      ) : groups.isEmpty ? (
        <EmptyState
          icon={filter === "alle" ? Inbox : ShoppingBasket}
          title="Keine Bestellungen"
          description={
            filter === "alle"
              ? "Aktuell liegen keine Bestellungen vor."
              : `Keine Bestellungen mit Status „${ORDER_STATUS_LABELS[filter]}".`
          }
        />
      ) : (
        <>
          {groups.upcoming.map(renderGroup)}
          {groups.past.length > 0 && (
            <div className="mt-8 border-t border-line pt-4 opacity-75">
              <h2 className="mb-1 text-[12.5px] font-semibold uppercase tracking-[0.1em] text-neutral-500">
                Vergangene Fenster
              </h2>
              {groups.past.map(renderGroup)}
            </div>
          )}
        </>
      )}
    </PageContainer>
  );
}
