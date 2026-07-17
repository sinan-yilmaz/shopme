import { useCallback, useSyncExternalStore } from "react";

/**
 * Reagiert auf eine CSS-Media-Query (z. B. "(max-width: 767px)").
 * @param {string} query
 * @returns {boolean}
 */
export default function useMediaQuery(query) {
  const subscribe = useCallback(
    (onStoreChange) => {
      const mediaQueryList = window.matchMedia(query);
      mediaQueryList.addEventListener("change", onStoreChange);
      return () => mediaQueryList.removeEventListener("change", onStoreChange);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
  );
}
