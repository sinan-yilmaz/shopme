import { useEffect, useState } from "react";

/**
 * Gibt den Wert erst zurück, wenn er für `delayMs` unverändert blieb.
 * @template T
 * @param {T} value
 * @param {number} delayMs
 * @returns {T}
 */
export default function useDebounce(value, delayMs) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timeout);
  }, [value, delayMs]);

  return debounced;
}
