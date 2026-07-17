import { useEffect, useMemo, useRef } from "react";
import clsx from "clsx";
import { CATALOG_CATEGORIES } from "../../consts/categories";

/** Finger muss sich erst 10 px horizontal bewegen, bevor der Drag „lockt". */
const DRAG_LOCK_PX = 10;
/** Dämpfung beim Ziehen über das erste/letzte Ende hinaus (Rubber-Band). */
const OVERSCROLL_FACTOR = 0.35;
const SETTLE_TRANSITION = "transform 300ms cubic-bezier(.22,.61,.36,1)";
/** Basisposition: mittlerer Slide (Vorgänger | aktuell | Folgeseite). */
const BASE_TRANSFORM = "translateX(-100%)";

/**
 * Statische Kopfzeile über dem gleitenden Track: Kategoriename links,
 * Seiten-Punkte rechts. Zeigt stets die committete Seite — beim Drag bewegt
 * sie sich nicht mit und aktualisiert sich erst mit dem Snap-Commit.
 */
function PagerHeader({ categoryId, label, pageIndex, pageCount }) {
  return (
    <div className="mb-3">
      {pageCount > 1 && (
        <span className="sr-only" aria-live="polite">
          Seite {pageIndex + 1} von {pageCount} — wischen Sie für weitere
          Artikel und Kategorien
        </span>
      )}
      <div
        // Nur der Kategoriewechsel remountet den sichtbaren Kopf (kurzer
        // Fade); innerhalb einer Kategorie bleiben die Punkte gemountet,
        // damit die width-Transition den aktiven Punkt animiert wandern lässt.
        key={categoryId}
        className="flex animate-fade-in items-center justify-between gap-3"
      >
        <p className="font-display text-[17px] font-bold text-ink">{label}</p>
        {pageCount > 1 && (
          <span
            className="flex shrink-0 items-center gap-1.5"
            aria-hidden="true"
          >
            {Array.from({ length: pageCount }, (_, index) => (
              <span
                key={index}
                className={clsx(
                  "h-2 rounded-full transition-all duration-200 ease-out",
                  index === pageIndex ? "w-[18px] bg-brand" : "w-2 bg-line-strong",
                )}
              />
            ))}
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * Mobiles Kategorie-Carousel (Schritt 1): Seiten zu je `pageSize` Kacheln
 * gleiten live unter dem Finger mit; beim Loslassen snappt der Track zur
 * Nachbarseite oder federt zurück. Über die letzte/erste Seite hinaus
 * wechselt der Swipe in die Nachbar-Kategorie, an den Enden dämpft ein
 * Rubber-Band. Es gleitet nur das Kachel-Grid — die Kopfzeile steht statisch
 * darüber und folgt erst dem Commit. Die Snap-Animation läuft imperativ am
 * Track-Element; der Seitenwechsel selbst remountet den Track (key) auf der
 * Basisposition.
 */
export default function CategoryTilePager({
  activeCategoryId,
  page,
  onNavigate,
  itemsByCategory,
  pageSize,
  renderTile,
}) {
  const rootRef = useRef(null);
  const trackRef = useRef(null);
  const dragRef = useRef(null);
  /** true, solange die Snap-Animation läuft — blockt neue Drags. */
  const animatingRef = useRef(false);

  /** Flache Seitenliste über alle Kategorien in Anzeige-Reihenfolge. */
  const allPages = useMemo(() => {
    const pages = [];
    for (const category of CATALOG_CATEGORIES) {
      const items = itemsByCategory.get(category.id) ?? [];
      const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
      for (let index = 0; index < pageCount; index += 1) {
        pages.push({
          categoryId: category.id,
          label: category.label,
          pageIndex: index,
          pageCount,
          items: items.slice(index * pageSize, (index + 1) * pageSize),
        });
      }
    }
    return pages;
  }, [itemsByCategory, pageSize]);

  const globalIndex = allPages.findIndex(
    (entry) => entry.categoryId === activeCategoryId && entry.pageIndex === page,
  );
  const current = allPages[globalIndex] ?? null;
  const slides = [
    allPages[globalIndex - 1] ?? null,
    current,
    allPages[globalIndex + 1] ?? null,
  ];

  useEffect(() => {
    const root = rootRef.current;
    const track = trackRef.current;
    if (!root || !track) return undefined;

    const hasPrev = globalIndex > 0;
    const hasNext = globalIndex < allPages.length - 1;

    /** Animiert den Track zum Ziel; direction 0 = zurückfedern. */
    const snapTo = (direction) => {
      const target = direction === 0 ? null : allPages[globalIndex + direction];
      animatingRef.current = true;
      const finish = (event) => {
        // transitionend bubbelt auch von Kachel-Transitions hoch (z. B.
        // active:scale beim Loslassen) — nur das Transform-Ende des Tracks
        // selbst darf committen, sonst bricht der Snap sichtbar ab.
        if (
          event &&
          (event.target !== track || event.propertyName !== "transform")
        ) {
          return;
        }
        if (!animatingRef.current) return;
        animatingRef.current = false;
        track.removeEventListener("transitionend", finish);
        if (target) {
          // Commit: der Track wird per key remountet und steht wieder
          // auf der Basisposition — mit der neuen Seite in der Mitte.
          onNavigate(target.categoryId, target.pageIndex);
        } else {
          track.style.transition = "none";
        }
      };
      track.addEventListener("transitionend", finish);
      // Fallback, falls transitionend nicht feuert (z. B. reduced motion)
      setTimeout(finish, 380);
      track.style.transition = SETTLE_TRANSITION;
      requestAnimationFrame(() => {
        track.style.transform = `translateX(${-100 - direction * 100}%)`;
      });
    };

    const handleStart = (event) => {
      if (animatingRef.current) return;
      const touch = event.touches[0];
      dragRef.current = {
        startX: touch.clientX,
        startY: touch.clientY,
        locked: false,
        dx: 0,
      };
    };

    const handleMove = (event) => {
      const drag = dragRef.current;
      if (!drag) return;
      const touch = event.touches[0];
      const deltaX = touch.clientX - drag.startX;
      const deltaY = touch.clientY - drag.startY;
      if (!drag.locked) {
        if (Math.abs(deltaX) < DRAG_LOCK_PX) return;
        if (Math.abs(deltaX) <= Math.abs(deltaY)) {
          // vertikale Geste → dem Browser-Scrollen überlassen
          dragRef.current = null;
          return;
        }
        drag.locked = true;
        track.style.transition = "none";
      }
      // horizontal gelockt: Seite darf nicht zusätzlich vertikal scrollen
      event.preventDefault();
      const overscroll = (deltaX > 0 && !hasPrev) || (deltaX < 0 && !hasNext);
      drag.dx = overscroll ? deltaX * OVERSCROLL_FACTOR : deltaX;
      track.style.transform = `translateX(calc(-100% + ${drag.dx}px))`;
    };

    const handleEnd = () => {
      const drag = dragRef.current;
      dragRef.current = null;
      if (!drag?.locked) return;
      if (Math.abs(drag.dx) < 1) {
        track.style.transition = "none";
        track.style.transform = BASE_TRANSFORM;
        return;
      }
      const width = root.offsetWidth || 1;
      const threshold = Math.min(width * 0.28, 96);
      let direction = 0;
      if (drag.dx <= -threshold && hasNext) direction = 1;
      if (drag.dx >= threshold && hasPrev) direction = -1;
      snapTo(direction);
    };

    root.addEventListener("touchstart", handleStart, { passive: true });
    root.addEventListener("touchmove", handleMove, { passive: false });
    root.addEventListener("touchend", handleEnd, { passive: true });
    root.addEventListener("touchcancel", handleEnd, { passive: true });
    return () => {
      root.removeEventListener("touchstart", handleStart);
      root.removeEventListener("touchmove", handleMove);
      root.removeEventListener("touchend", handleEnd);
      root.removeEventListener("touchcancel", handleEnd);
    };
  }, [allPages, globalIndex, onNavigate]);

  return (
    <div ref={rootRef} style={{ touchAction: "pan-y" }}>
      {current && (
        <PagerHeader
          categoryId={current.categoryId}
          label={current.label}
          pageIndex={current.pageIndex}
          pageCount={current.pageCount}
        />
      )}
      <div className="overflow-hidden">
        <div
          // Remount bei jedem Seitenwechsel → frischer Track auf Basisposition
          key={globalIndex}
          ref={trackRef}
          className="flex items-start"
          style={{ transform: BASE_TRANSFORM }}
        >
          {slides.map((slide, index) => (
            <div
              key={
                slide ? `${slide.categoryId}-${slide.pageIndex}` : `leer-${index}`
              }
              className="w-full min-w-full shrink-0"
              aria-hidden={index !== 1}
            >
              {slide && (
                <div className="grid grid-cols-3 gap-2.5">
                  {slide.items.map((item) => renderTile(item))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
