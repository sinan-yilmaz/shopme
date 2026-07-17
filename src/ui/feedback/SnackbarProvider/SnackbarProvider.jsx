import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { CheckCircle2 } from "lucide-react";

const SnackbarContext = createContext(null);

const AUTO_HIDE_MS = 4000;

/**
 * Leichte globale Snackbar mit aria-live-Region (SPEC §10).
 * Verwendung: const showSnackbar = useSnackbar(); showSnackbar('…');
 */
export default function SnackbarProvider({ children }) {
  const [snackbar, setSnackbar] = useState(null);

  const showSnackbar = useCallback((message) => {
    setSnackbar({ key: Date.now(), message });
  }, []);

  useEffect(() => {
    if (!snackbar) return undefined;
    const timeout = setTimeout(() => setSnackbar(null), AUTO_HIDE_MS);
    return () => clearTimeout(timeout);
  }, [snackbar]);

  return (
    <SnackbarContext.Provider value={showSnackbar}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 bottom-24 z-50 flex justify-center sm:bottom-8"
      >
        {snackbar && (
          <div
            key={snackbar.key}
            className="pointer-events-auto flex max-w-md items-center gap-2.5 rounded-lg bg-ink px-4 py-3 text-base text-white shadow-float"
          >
            <CheckCircle2
              className="size-5 shrink-0 text-brand-300"
              aria-hidden="true"
            />
            {snackbar.message}
          </div>
        )}
      </div>
    </SnackbarContext.Provider>
  );
}

export function useSnackbar() {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error(
      "useSnackbar muss innerhalb von <SnackbarProvider> verwendet werden.",
    );
  }
  return context;
}
