import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { orderConfirmationPath } from "common/consts/routes";
import useCatalogItems from "features/catalog/hooks/useCatalogItems";
import useDeliverySlots from "features/delivery/hooks/useDeliverySlots";
import { findDeliveryArea } from "features/delivery/consts/areas";
import { MIN_BUDGET_CENTS } from "features/order/consts/fees";
import { useOrderDraft } from "features/order/context/OrderDraftProvider";
import useCreateOrder from "features/order/hooks/useCreateOrder";
import Button from "lib/primitives/Button";
import PageContainer from "lib/layout/PageContainer";
import { WizardSteps } from "ui/steps";
import PaymentSimulation from "./components/PaymentSimulation";
import StepShoppingList from "./components/StepShoppingList";
import StepBudgetMarket from "./components/StepBudgetMarket";
import StepDelivery, { ADDRESS_FORM_ID } from "./components/StepDelivery";
import StepReview from "./components/StepReview";

const WIZARD_STEPS = [
  { number: 1, label: "Liste" },
  { number: 2, label: "Budget & Markt" },
  { number: 3, label: "Lieferung" },
  { number: 4, label: "Prüfen" },
];

export default function OrderWizardPage() {
  const { draft, goToStep, clearDraft } = useOrderDraft();
  const catalogQuery = useCatalogItems();
  const slotsQuery = useDeliverySlots();
  const navigate = useNavigate();
  const [slotError, setSlotError] = useState("");
  const [paymentSimOrder, setPaymentSimOrder] = useState(null);

  const createOrder = useCreateOrder({
    onSuccess: (order) => {
      clearDraft();
      if (order.paymentMode === "vorkasse") {
        setPaymentSimOrder(order);
      } else {
        navigate(orderConfirmationPath(order.code));
      }
    },
  });

  const step = draft.step;
  const zip = draft.customer.zip?.trim() ?? "";
  const zipOutsideArea = zip.length === 5 && !findDeliveryArea(zip);
  const budgetAndMarketValid =
    draft.budgetCents != null &&
    draft.budgetCents >= MIN_BUDGET_CENTS &&
    draft.market != null;

  const handleStepClick = (target) => {
    setSlotError("");
    goToStep(target);
  };

  const handleAddressValid = () => {
    if (!draft.slotId) {
      setSlotError("Bitte wählen Sie oben ein Lieferfenster aus.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setSlotError("");
    goToStep(4);
  };

  const handleSubmitOrder = () => {
    createOrder.mutate({
      items: draft.items,
      budgetCents: draft.budgetCents,
      market: draft.market,
      allowSecondMarket: draft.allowSecondMarket,
      slotId: draft.slotId,
      customer: draft.customer,
      paymentMode: draft.paymentMode,
    });
  };

  if (paymentSimOrder) {
    return (
      <PageContainer>
        <h1 className="sr-only">Zahlung simulieren</h1>
        <PaymentSimulation
          order={paymentSimOrder}
          onSimulatePayment={() =>
            navigate(orderConfirmationPath(paymentSimOrder.code))
          }
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer className="pb-0">
      <h1 className="sr-only">Einkauf zusammenstellen</h1>
      <WizardSteps
        steps={WIZARD_STEPS}
        currentStep={step}
        onStepClick={handleStepClick}
      />

      {/* key={step} startet die stepIn-Animation bei jedem Schrittwechsel neu */}
      <div key={step} className="animate-step-in">
        {step === 1 && (
          <StepShoppingList
            catalogItems={catalogQuery.data}
            isCatalogLoading={catalogQuery.isPending}
          />
        )}
        {step === 2 && <StepBudgetMarket catalogItems={catalogQuery.data} />}
        {step === 3 && (
          <StepDelivery
            slots={slotsQuery.data}
            isSlotsLoading={slotsQuery.isPending}
            slotError={slotError}
            onValidSubmit={handleAddressValid}
          />
        )}
        {step === 4 && (
          <StepReview
            slots={slotsQuery.data}
            catalogItems={catalogQuery.data}
            submitError={createOrder.error?.message ?? null}
          />
        )}
      </div>

      <div className="sticky bottom-0 z-30 -mx-4 mt-7 border-t border-line bg-white/[.94] px-4 pb-[calc(12px+env(safe-area-inset-bottom))] pt-3 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="flex items-center gap-3">
          {step > 1 ? (
            <Button
              variant="secondary"
              onClick={() => handleStepClick(step - 1)}
            >
              <ArrowLeft className="size-5" aria-hidden="true" />
              Zurück
            </Button>
          ) : (
            <span
              className="whitespace-nowrap text-[15.5px] font-semibold tabular-nums text-brand-deep"
              aria-live="polite"
            >
              {draft.items.length} Artikel
            </span>
          )}

          {step === 1 && (
            <Button
              className="flex-1"
              size="lg"
              disabled={draft.items.length === 0}
              onClick={() => handleStepClick(2)}
            >
              Weiter zu Budget & Markt
            </Button>
          )}
          {step === 2 && (
            <Button
              className="flex-1"
              size="lg"
              disabled={!budgetAndMarketValid}
              onClick={() => handleStepClick(3)}
            >
              Weiter zur Lieferung
            </Button>
          )}
          {step === 3 && (
            <Button
              className="flex-1"
              size="lg"
              type="submit"
              form={ADDRESS_FORM_ID}
              disabled={zipOutsideArea}
            >
              Weiter zur Übersicht
            </Button>
          )}
          {step === 4 && (
            <Button
              className="flex-1"
              size="lg"
              disabled={!draft.termsAccepted || !draft.slotId}
              busy={createOrder.isPending}
              onClick={handleSubmitOrder}
            >
              Zahlungspflichtig bestellen
            </Button>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
