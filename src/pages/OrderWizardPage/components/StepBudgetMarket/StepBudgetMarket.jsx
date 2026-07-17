import { BudgetInput, MarketPicker } from "features/order/components";
import { useOrderDraft } from "features/order/context/OrderDraftProvider";
import hasFreshFoodItems from "features/order/services/hasFreshFoodItems";

/** Schritt 2 — Budget & Markt (SPEC §8.2). */
export default function StepBudgetMarket({ catalogItems }) {
  const { draft, setBudgetCents, setMarket, setAllowSecondMarket } =
    useOrderDraft();

  const showDmHint =
    draft.market === "dm" && hasFreshFoodItems(draft.items, catalogItems);

  return (
    <div className="flex flex-col gap-[18px]">
      <h2 className="font-display text-[26px] font-bold leading-tight tracking-[-0.01em] text-ink">
        Budget &amp; Markt
      </h2>
      <div className="rounded-2xl border border-line bg-white p-5 shadow-card sm:p-6">
        <BudgetInput
          valueCents={draft.budgetCents}
          onChangeCents={setBudgetCents}
        />
      </div>
      <div className="rounded-2xl border border-line bg-white p-5 shadow-card sm:p-6">
        <MarketPicker
          market={draft.market}
          onChangeMarket={setMarket}
          allowSecondMarket={draft.allowSecondMarket}
          onChangeAllowSecondMarket={setAllowSecondMarket}
          showDmFreshFoodHint={showDmHint}
        />
      </div>
    </div>
  );
}
