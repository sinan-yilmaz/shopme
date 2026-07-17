import { useEffect, useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { Search } from "lucide-react";
import { BRAND_CLAIM, BRAND_NAME } from "common/consts/brand";
import routes from "common/consts/routes";
import Dialog from "lib/primitives/Dialog";
import { BrandMark } from "ui/brand";
import { SnackbarProvider } from "ui/feedback";
import DemoBanner from "../DemoBanner";
import TrackOrderDialog from "../TrackOrderDialog";

export default function App() {
  const [trackOpen, setTrackOpen] = useState(false);
  const [placeholderPage, setPlaceholderPage] = useState(null);

  useEffect(() => {
    document.title = `${BRAND_NAME} — ${BRAND_CLAIM}`;
  }, []);

  return (
    <SnackbarProvider>
      <div className="flex min-h-dvh flex-col">
        <header className="border-b border-line bg-white">
          <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-3 px-4 sm:px-6">
            <Link
              to={routes.home}
              className="flex items-center gap-2.5 rounded-[10px] p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              <BrandMark size={34} />
              <span className="font-display text-[23px] font-extrabold leading-none tracking-[-0.01em] text-ink">
                {BRAND_NAME}
              </span>
            </Link>
            <button
              type="button"
              onClick={() => setTrackOpen(true)}
              className="inline-flex h-11 items-center gap-2 rounded-lg px-3.5 text-base font-semibold text-brand transition-colors duration-150 ease-out hover:bg-brand-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              <Search className="size-[19px]" aria-hidden="true" />
              <span className="hidden sm:inline">Bestellung verfolgen</span>
              <span className="sm:hidden">Verfolgen</span>
            </button>
          </div>
        </header>

        <main className="flex-1">
          <Outlet />
        </main>

        <footer className="mt-14 border-t border-line bg-white">
          <div className="mx-auto flex max-w-5xl flex-col items-center gap-2.5 px-4 py-5 text-sm text-muted sm:flex-row sm:justify-between sm:px-6">
            <p>© 2026 {BRAND_NAME} · Demo-Prototyp</p>
            <nav
              aria-label="Fußzeile"
              className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2"
            >
              <Link
                to={routes.driverOverview}
                className="rounded text-muted underline decoration-line-strong underline-offset-[3px] transition-colors duration-150 hover:text-brand-deep hover:decoration-current focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                Fahrer-Ansicht (Demo)
              </Link>
              <button
                type="button"
                onClick={() => setPlaceholderPage("Impressum")}
                className="rounded underline decoration-line-strong underline-offset-[3px] transition-colors duration-150 hover:text-brand-deep hover:decoration-current focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                Impressum
              </button>
              <button
                type="button"
                onClick={() => setPlaceholderPage("Datenschutz")}
                className="rounded underline decoration-line-strong underline-offset-[3px] transition-colors duration-150 hover:text-brand-deep hover:decoration-current focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                Datenschutz
              </button>
            </nav>
          </div>
        </footer>

        {/* Demo-Hinweis bewusst unter dem Footer (Nutzerwunsch) */}
        <DemoBanner />
      </div>

      <TrackOrderDialog open={trackOpen} onClose={() => setTrackOpen(false)} />

      <Dialog
        open={placeholderPage !== null}
        onClose={() => setPlaceholderPage(null)}
        title={placeholderPage ?? ""}
        size="sm"
      >
        <p className="text-base text-neutral-700">
          Diese Seite ist in der Demo nur ein Platzhalter. Im echten Betrieb
          stehen hier{" "}
          {placeholderPage === "Impressum"
            ? "Anbieterkennzeichnung und Kontakt"
            : "alle Angaben zum Datenschutz"}
          .
        </p>
      </Dialog>
    </SnackbarProvider>
  );
}
