import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createId } from "common/services/id";

/** localStorage-Key des Bestellentwurfs (SPEC R10). */
export const DRAFT_STORAGE_KEY = "gzes-draft-v1";

const EMPTY_DRAFT = {
  step: 1,
  items: [],
  budgetCents: null,
  market: null,
  allowSecondMarket: false,
  slotId: null,
  customer: { name: "", phone: "", street: "", zip: "", doorInfo: "" },
  paymentMode: "vorkasse",
  termsAccepted: false,
};

/** Löscht den gespeicherten Entwurf (für „Demo zurücksetzen"). */
export function clearDraftStorage() {
  localStorage.removeItem(DRAFT_STORAGE_KEY);
}

function loadDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return EMPTY_DRAFT;
    const parsed = JSON.parse(raw);
    return {
      ...EMPTY_DRAFT,
      ...parsed,
      customer: { ...EMPTY_DRAFT.customer, ...(parsed.customer ?? {}) },
      items: Array.isArray(parsed.items) ? parsed.items : [],
    };
  } catch {
    return EMPTY_DRAFT;
  }
}

const OrderDraftContext = createContext(null);

export default function OrderDraftProvider({ children }) {
  const [draft, setDraft] = useState(loadDraft);

  useEffect(() => {
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
  }, [draft]);

  const goToStep = useCallback((step) => {
    setDraft((current) => ({ ...current, step }));
  }, []);

  const addCatalogItem = useCallback((catalogItem) => {
    setDraft((current) => {
      const existing = current.items.find(
        (item) => item.catalogItemId === catalogItem.id,
      );
      if (existing) {
        return {
          ...current,
          items: current.items.map((item) =>
            item.id === existing.id
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          ),
        };
      }
      return {
        ...current,
        items: [
          ...current.items,
          {
            id: createId(),
            catalogItemId: catalogItem.id,
            label: catalogItem.name,
            quantity: 1,
            unit: catalogItem.units[0],
            bio: false,
            mustHave: false,
            note: "",
          },
        ],
      };
    });
  }, []);

  const addFreeTextItem = useCallback((label) => {
    const trimmed = label.trim();
    if (!trimmed) return;
    setDraft((current) => ({
      ...current,
      items: [
        ...current.items,
        {
          id: createId(),
          catalogItemId: null,
          label: trimmed,
          quantity: 1,
          unit: "Stück",
          bio: false,
          mustHave: false,
          note: "",
        },
      ],
    }));
  }, []);

  /** Hängt Parser-Rohlinge (SPEC §8.1.1) ans Ende der Liste an. */
  const addParsedItems = useCallback((parsedItems) => {
    if (!parsedItems.length) return;
    setDraft((current) => ({
      ...current,
      items: [
        ...current.items,
        ...parsedItems.map((item) => ({ ...item, id: createId() })),
      ],
    }));
  }, []);

  const updateItem = useCallback((itemId, patch) => {
    setDraft((current) => ({
      ...current,
      items: current.items.map((item) =>
        item.id === itemId ? { ...item, ...patch } : item,
      ),
    }));
  }, []);

  const removeItem = useCallback((itemId) => {
    setDraft((current) => ({
      ...current,
      items: current.items.filter((item) => item.id !== itemId),
    }));
  }, []);

  /** Pfeiltasten-Sortierung: verschiebt ein Item um delta Plätze. */
  const moveItem = useCallback((itemId, delta) => {
    setDraft((current) => {
      const index = current.items.findIndex((item) => item.id === itemId);
      const target = index + delta;
      if (index === -1 || target < 0 || target >= current.items.length)
        return current;
      const items = [...current.items];
      const [moved] = items.splice(index, 1);
      items.splice(target, 0, moved);
      return { ...current, items };
    });
  }, []);

  /** Drag-&-Drop-Sortierung: verschiebt activeId an die Position von overId. */
  const reorderItems = useCallback((activeId, overId) => {
    setDraft((current) => {
      const from = current.items.findIndex((item) => item.id === activeId);
      const to = current.items.findIndex((item) => item.id === overId);
      if (from === -1 || to === -1 || from === to) return current;
      const items = [...current.items];
      const [moved] = items.splice(from, 1);
      items.splice(to, 0, moved);
      return { ...current, items };
    });
  }, []);

  const setBudgetCents = useCallback((budgetCents) => {
    setDraft((current) => ({ ...current, budgetCents }));
  }, []);

  const setMarket = useCallback((market) => {
    setDraft((current) => ({ ...current, market }));
  }, []);

  const setAllowSecondMarket = useCallback((allowSecondMarket) => {
    setDraft((current) => ({ ...current, allowSecondMarket }));
  }, []);

  const setSlotId = useCallback((slotId) => {
    setDraft((current) => ({ ...current, slotId }));
  }, []);

  const setCustomer = useCallback((patch) => {
    setDraft((current) => ({
      ...current,
      customer: { ...current.customer, ...patch },
    }));
  }, []);

  const setPaymentMode = useCallback((paymentMode) => {
    setDraft((current) => ({ ...current, paymentMode }));
  }, []);

  const setTermsAccepted = useCallback((termsAccepted) => {
    setDraft((current) => ({ ...current, termsAccepted }));
  }, []);

  const clearDraft = useCallback(() => {
    clearDraftStorage();
    setDraft(EMPTY_DRAFT);
  }, []);

  const value = useMemo(
    () => ({
      draft,
      goToStep,
      addCatalogItem,
      addFreeTextItem,
      addParsedItems,
      updateItem,
      removeItem,
      moveItem,
      reorderItems,
      setBudgetCents,
      setMarket,
      setAllowSecondMarket,
      setSlotId,
      setCustomer,
      setPaymentMode,
      setTermsAccepted,
      clearDraft,
    }),
    [
      draft,
      goToStep,
      addCatalogItem,
      addFreeTextItem,
      addParsedItems,
      updateItem,
      removeItem,
      moveItem,
      reorderItems,
      setBudgetCents,
      setMarket,
      setAllowSecondMarket,
      setSlotId,
      setCustomer,
      setPaymentMode,
      setTermsAccepted,
      clearDraft,
    ],
  );

  return (
    <OrderDraftContext.Provider value={value}>
      {children}
    </OrderDraftContext.Provider>
  );
}

export function useOrderDraft() {
  const context = useContext(OrderDraftContext);
  if (!context) {
    throw new Error(
      "useOrderDraft muss innerhalb von <OrderDraftProvider> verwendet werden.",
    );
  }
  return context;
}
