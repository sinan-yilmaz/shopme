import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  MapPin,
  Phone,
  Play,
  Store,
} from "lucide-react";
import routes from "common/consts/routes";
import { formatDayShort } from "common/services/dateFormat";
import { fromDateKey } from "features/delivery/services/slotRules";
import {
  BudgetBar,
  FeeBreakdown,
  HandoverChecklist,
  OrderStatusBadge,
  ReceiptForm,
  ShoppingChecklist,
} from "features/order/components";
import { marketLabel } from "features/order/consts/markets";
import hasAgeRestrictedItems from "features/order/services/ageRestriction";
import useCatalogItems from "features/catalog/hooks/useCatalogItems";
import useCompleteShopping from "features/order/hooks/useCompleteShopping";
import useOrderById from "features/order/hooks/useOrderById";
import useUpdateOrderItem from "features/order/hooks/useUpdateOrderItem";
import useUpdateOrderStatus from "features/order/hooks/useUpdateOrderStatus";
import Button, { buttonClasses } from "lib/primitives/Button";
import Dialog from "lib/primitives/Dialog";
import PageContainer from "lib/layout/PageContainer";
import Skeleton from "lib/primitives/Skeleton";
import { EmptyState, InfoBox, useSnackbar, WarningBox } from "ui/feedback";

export default function DriverOrderPage() {
  const { id } = useParams();
  const orderQuery = useOrderById({ id });
  const catalogQuery = useCatalogItems();
  const showSnackbar = useSnackbar();
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [ageChecked, setAgeChecked] = useState(false);

  const updateStatus = useUpdateOrderStatus({
    onSuccess: (updated) => {
      if (updated.status === "bestaetigt")
        showSnackbar("Bestellung bestätigt.");
      if (updated.status === "im_einkauf")
        showSnackbar("Einkauf gestartet — gutes Gelingen!");
      if (updated.status === "geliefert")
        showSnackbar("Bestellung als geliefert markiert.");
    },
  });
  const updateItem = useUpdateOrderItem();
  const completeShopping = useCompleteShopping({
    onSuccess: () => {
      setReceiptOpen(false);
      showSnackbar("Abrechnung erstellt — die Lieferung ist unterwegs.");
    },
  });

  const order = orderQuery.data;
  const catalogItems = catalogQuery.data ?? [];

  const catalogById = useMemo(
    () => new Map((catalogQuery.data ?? []).map((entry) => [entry.id, entry])),
    [catalogQuery.data],
  );
  const isAgeRestricted = order
    ? hasAgeRestrictedItems(order, catalogItems)
    : false;
  const spentCents = order
    ? order.items.reduce((sum, item) => sum + (item.priceCents ?? 0), 0)
    : 0;
  const openCount = order
    ? order.items.filter((item) => item.status === "offen").length
    : 0;

  if (orderQuery.isPending) {
    return (
      <PageContainer width="driver">
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="mt-4 h-28 rounded-2xl" />
        <Skeleton className="mt-2.5 h-28 rounded-2xl" />
      </PageContainer>
    );
  }

  if (orderQuery.isError) {
    return (
      <PageContainer width="driver">
        <EmptyState
          title="Bestellung nicht gefunden"
          description="Diese Bestellung existiert nicht (mehr) im Demo-Datenbestand."
          action={
            <Link
              to={routes.driverOverview}
              className={buttonClasses({ fullWidth: true })}
            >
              Zur Übersicht
            </Link>
          }
        />
      </PageContainer>
    );
  }

  const handlePatchItem = (itemId, patch) => {
    updateItem.mutate({ orderId: order.id, itemId, patch });
  };

  const handleMarkDelivered = () => {
    updateStatus.mutate({
      orderId: order.id,
      status: "geliefert",
      ageCheckConfirmed: ageChecked,
    });
  };

  return (
    <PageContainer width="driver" className="text-base">
      <Link
        to={routes.driverOverview}
        className="mb-4 inline-flex h-10 items-center gap-1.5 rounded-lg pr-2 text-base font-medium text-brand-700 transition-colors duration-150 hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
      >
        <ArrowLeft className="size-5" aria-hidden="true" />
        Zur Übersicht
      </Link>

      {/* Kopf */}
      <div className="rounded-2xl border border-line bg-white p-4 shadow-card sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-display text-2xl font-extrabold leading-[1.1] tabular-nums text-ink">
            {order.code}
          </h1>
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

        <dl className="mt-3 space-y-1.5 text-base text-neutral-800">
          <div className="flex items-center gap-2.5">
            <Store
              className="size-4.5 shrink-0 text-neutral-500"
              aria-hidden="true"
            />
            <span>
              {marketLabel(order.market)}
              {order.allowSecondMarket && (
                <span className="text-neutral-500">
                  {" "}
                  · zweiter Markt erlaubt
                </span>
              )}
            </span>
          </div>
          {order.slot && (
            <div className="flex items-center gap-2.5">
              <Calendar
                className="size-4.5 shrink-0 text-neutral-500"
                aria-hidden="true"
              />
              <span>
                {formatDayShort(fromDateKey(order.slot.date))}{" "}
                {order.slot.label}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2.5">
            <MapPin
              className="size-4.5 shrink-0 text-neutral-500"
              aria-hidden="true"
            />
            <span>
              {order.customer.name} · {order.customer.street},{" "}
              {order.customer.zip} {order.customer.city}
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <Phone
              className="size-4.5 shrink-0 text-neutral-500"
              aria-hidden="true"
            />
            <a
              href={`tel:${order.customer.phone.replace(/\s/g, "")}`}
              className="rounded font-medium text-brand-700 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
            >
              {order.customer.phone}
            </a>
          </div>
        </dl>

        {order.status === "im_einkauf" && (
          <div className="mt-4 border-t border-line pt-4">
            <BudgetBar
              budgetCents={order.budgetCents}
              spentCents={spentCents}
            />
          </div>
        )}
      </div>

      {updateItem.isError && (
        <div className="mt-4">
          <WarningBox title="Position konnte nicht aktualisiert werden">
            {updateItem.error.message}
          </WarningBox>
        </div>
      )}

      {/* Inhalt je Status */}
      {order.status === "eingegangen" && (
        <div className="mt-5 space-y-4">
          <InfoBox title="Neue Bestellung">
            Bitte prüfe kurz die Liste und bestätige die Bestellung — der Kunde
            sieht den neuen Status sofort.
          </InfoBox>
          <CompactItemList order={order} catalogById={catalogById} />
          <Button
            size="lg"
            fullWidth
            busy={updateStatus.isPending}
            onClick={() =>
              updateStatus.mutate({ orderId: order.id, status: "bestaetigt" })
            }
          >
            <CheckCircle2 className="size-5" aria-hidden="true" />
            Bestellung bestätigen
          </Button>
        </div>
      )}

      {order.status === "bestaetigt" && (
        <div className="mt-5 space-y-4">
          <CompactItemList order={order} catalogById={catalogById} />
          <Button
            size="lg"
            fullWidth
            busy={updateStatus.isPending}
            onClick={() =>
              updateStatus.mutate({ orderId: order.id, status: "im_einkauf" })
            }
          >
            <Play className="size-5" aria-hidden="true" />
            Einkauf starten
          </Button>
        </div>
      )}

      {order.status === "im_einkauf" && (
        <>
          <div className="mt-5">
            <ShoppingChecklist
              order={order}
              catalogItems={catalogItems}
              onPatchItem={handlePatchItem}
            />
          </div>
          <div className="sticky bottom-0 z-30 -mx-4 mt-6 border-t border-line bg-bg/[.94] px-4 pb-[calc(12px+env(safe-area-inset-bottom))] pt-3 backdrop-blur sm:-mx-6 sm:px-6">
            <Button
              size="lg"
              fullWidth
              disabled={openCount > 0}
              onClick={() => setReceiptOpen(true)}
            >
              {openCount > 0
                ? `Noch ${openCount} ${openCount === 1 ? "Position" : "Positionen"} offen`
                : "Einkauf abschließen"}
            </Button>
          </div>

          <Dialog
            open={receiptOpen}
            onClose={() => setReceiptOpen(false)}
            title="Kassenbon eingeben"
            size="sm"
          >
            <ReceiptForm
              budgetCents={order.budgetCents}
              isSubmitting={completeShopping.isPending}
              onSubmitReceipt={(receiptCents) =>
                completeShopping.mutate({ orderId: order.id, receiptCents })
              }
            />
            {completeShopping.isError && (
              <p
                className="mt-3 text-sm font-medium text-warn-800"
                role="alert"
              >
                {completeShopping.error.message}
              </p>
            )}
          </Dialog>
        </>
      )}

      {order.status === "unterwegs" && (
        <div className="mt-5 space-y-5">
          <FeeBreakdown
            variant="final"
            receiptCents={order.receiptCents}
            finalFees={order.finalFees}
            prepaidCents={order.prepaidCents}
            area={order.customer.area}
            showTransparencyNote={false}
          />
          <HandoverChecklist
            order={order}
            hasAgeRestricted={isAgeRestricted}
            ageChecked={ageChecked}
            onChangeAgeChecked={setAgeChecked}
            onMarkDelivered={handleMarkDelivered}
            isSubmitting={updateStatus.isPending}
            submitError={updateStatus.error?.message ?? null}
          />
        </div>
      )}

      {order.status === "geliefert" && (
        <div className="mt-5 space-y-5">
          <div className="flex items-center gap-3 rounded-2xl bg-brand-100 p-4">
            <CheckCircle2
              className="size-6 shrink-0 text-brand-700"
              aria-hidden="true"
            />
            <p className="text-base font-semibold text-brand-900">
              Zugestellt — diese Bestellung ist abgeschlossen.
            </p>
          </div>
          <FeeBreakdown
            variant="final"
            receiptCents={order.receiptCents}
            finalFees={order.finalFees}
            prepaidCents={order.prepaidCents}
            area={order.customer.area}
            showTransparencyNote={false}
          />
        </div>
      )}

      {order.status === "storniert" && (
        <div className="mt-5">
          <WarningBox title="Bestellung storniert">
            Diese Bestellung wurde storniert und muss nicht eingekauft werden.
          </WarningBox>
        </div>
      )}
    </PageContainer>
  );
}

/** Kompakte, read-only Positionsliste vor dem Einkauf. */
function CompactItemList({ order, catalogById }) {
  return (
    <ul className="divide-y divide-[#F1EDE4] rounded-2xl border border-line bg-white px-4 shadow-[0_1px_3px_rgb(23_73_53/0.05)]">
      {order.items.map((item) => {
        const catalogItem = item.catalogItemId
          ? catalogById.get(item.catalogItemId)
          : null;
        return (
          <li key={item.id} className="flex items-center gap-3 py-3">
            <span className="w-7 text-center text-xl" aria-hidden="true">
              {catalogItem?.emoji ?? "🛒"}
            </span>
            <span className="min-w-0 flex-1 text-base font-medium text-ink">
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
              {item.note && (
                <span className="block text-sm font-normal text-neutral-500">
                  „{item.note}“
                </span>
              )}
            </span>
            <span className="whitespace-nowrap text-sm text-muted tabular-nums">
              {item.quantity} {item.unit}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
