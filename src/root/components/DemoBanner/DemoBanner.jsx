import { useState } from "react";
import { resetDb } from "common/services/demoDb";
import routes from "common/consts/routes";
import { clearDraftStorage } from "features/order/context/OrderDraftProvider";
import Button from "lib/primitives/Button";
import Dialog from "lib/primitives/Dialog";

/** Demo-Hinweis mit Reset (SPEC §7, R10/T11). */
export default function DemoBanner() {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleReset = () => {
    resetDb();
    clearDraftStorage();
    window.location.assign(routes.home);
  };

  return (
    <div className="bg-brand-deep text-[13px] text-[#DFF0E6]">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-3 px-4 py-2 text-center">
        <span className="whitespace-nowrap">
          <span aria-hidden="true">🧪</span> Demo — alle Daten bleiben in diesem
          Browser
        </span>
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          className="whitespace-nowrap rounded-lg border border-[#E7F1EA]/40 px-2.5 py-[3px] text-[12.5px] transition-colors duration-150 hover:bg-[#E7F1EA]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E7F1EA]"
        >
          Demo zurücksetzen
        </button>
      </div>
      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Demo zurücksetzen?"
        size="sm"
      >
        <p className="text-base text-neutral-700">
          Katalog, Zeitfenster und die Demo-Bestellungen werden neu aufgesetzt.
          Ihr aktueller Bestellentwurf wird gelöscht.
        </p>
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
            Abbrechen
          </Button>
          <Button variant="warn" onClick={handleReset}>
            Jetzt zurücksetzen
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
