import { useId, useState } from "react";
import clsx from "clsx";
import { useSortable } from "@dnd-kit/sortable";
import { GripVertical, Pencil, Star, Trash2 } from "lucide-react";
import { ORDER_ITEM_UNITS } from "../../consts/units";

const MUST_HAVE_TOOLTIP =
  "Pflicht-Artikel kaufen wir auf jeden Fall zuerst ein.";

/** Pillen-Chip der zweiten Zeile (Bio, Notiz) — 34 px, rounded-full. */
function chipClasses(isActive) {
  return clsx(
    "inline-flex h-[34px] items-center gap-1.5 rounded-full border-[1.5px] px-3 text-[13.5px] font-semibold transition-all duration-150 ease-out",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
    isActive
      ? "border-brand-300 bg-brand-soft text-brand-deep"
      : "border-line-strong bg-white text-muted hover:border-brand",
  );
}

/**
 * Eine Zeile der Einkaufsliste (SPEC §8.1, HANDOFF §6 Schritt 1): Pfeile
 * klein & muted links gestapelt (Drag-Handle sekundär), Emoji im
 * brand-soft-Chip, Stern in accent, Mengen-Pille, Unit-Pille, Bio-/Notiz-
 * Chips, Notiz als Inline-Reveal. Neue Zeilen erscheinen mit listIn.
 */
export default function OrderItemRow({
  item,
  catalogItem,
  index,
  total,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });
  const [noteOpen, setNoteOpen] = useState(Boolean(item.note));
  const noteInputId = useId();

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    transition,
  };
  const units = catalogItem?.units ?? ORDER_ITEM_UNITS;
  const bioAvailable = catalogItem?.bioAvailable ?? false;
  const emoji = catalogItem?.emoji ?? "🛒";

  const handleDecrement = () => {
    if (item.quantity <= 1) {
      onRemove();
    } else {
      onUpdate({ quantity: item.quantity - 1 });
    }
  };

  const toggleNote = () => {
    if (noteOpen && item.note) onUpdate({ note: "" });
    setNoteOpen((open) => !open);
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={clsx(
        "animate-list-in rounded-2xl border bg-white px-3.5 py-3 shadow-[0_1px_3px_rgb(23_73_53/0.05)]",
        isDragging ? "z-10 border-brand shadow-float" : "border-line",
      )}
    >
      <div className="flex items-center gap-2.5">
        {/* Pfeile klein & muted, Drag-Handle sekundär dazwischen */}
        <div className="flex shrink-0 flex-col items-center">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={index === 0}
            aria-label={`${item.label} nach oben schieben`}
            className="flex h-5 w-[26px] items-center justify-center rounded-md text-[11px] leading-none text-[#A8B3AC] transition-colors duration-120 hover:text-brand-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:cursor-not-allowed disabled:opacity-40"
          >
            ▲
          </button>
          <button
            type="button"
            ref={setActivatorNodeRef}
            {...attributes}
            {...listeners}
            aria-label={`${item.label} per Tastatur oder Ziehen verschieben`}
            className="flex h-4 w-[26px] cursor-grab touch-none items-center justify-center rounded-md text-[#A8B3AC] transition-colors duration-120 hover:text-brand-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand active:cursor-grabbing"
          >
            <GripVertical className="size-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={index === total - 1}
            aria-label={`${item.label} nach unten schieben`}
            className="flex h-5 w-[26px] items-center justify-center rounded-md text-[11px] leading-none text-[#A8B3AC] transition-colors duration-120 hover:text-brand-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:cursor-not-allowed disabled:opacity-40"
          >
            ▼
          </button>
        </div>

        <span
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-soft text-xl"
          aria-hidden="true"
        >
          {emoji}
        </span>

        <p className="min-w-0 flex-1 text-[17px] font-semibold leading-snug text-ink">
          {item.label}
        </p>

        <button
          type="button"
          onClick={() => onUpdate({ mustHave: !item.mustHave })}
          aria-pressed={item.mustHave}
          aria-label={
            item.mustHave
              ? `${item.label} ist Pflicht-Artikel — Markierung entfernen`
              : `${item.label} als Pflicht-Artikel markieren`
          }
          title={MUST_HAVE_TOOLTIP}
          className={clsx(
            "inline-flex size-10 shrink-0 items-center justify-center rounded-[10px] transition-colors duration-120 ease-out hover:bg-warn-bg",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
          )}
        >
          <Star
            className={clsx(
              "size-[21px]",
              item.mustHave
                ? "fill-accent text-accent"
                : "fill-none text-[#A8B3AC]",
            )}
            strokeWidth={1.8}
            aria-hidden="true"
          />
        </button>

        <button
          type="button"
          onClick={onRemove}
          aria-label={`${item.label} entfernen`}
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-[10px] text-[#A8B3AC] transition-all duration-120 ease-out hover:bg-danger-soft hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
        >
          <Trash2 className="size-[19px]" aria-hidden="true" />
        </button>
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-2 pl-9">
        {/* Mengen-Pille: − n + */}
        <span className="inline-flex items-center overflow-hidden rounded-full border-[1.5px] border-line-strong bg-white">
          <button
            type="button"
            onClick={handleDecrement}
            aria-label={`Menge von ${item.label} verringern${item.quantity <= 1 ? " — entfernt den Artikel" : ""}`}
            className="h-[34px] w-9 text-[17px] font-bold leading-none text-brand-deep transition-colors duration-120 hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            −
          </button>
          <span
            className="min-w-[26px] text-center text-[15.5px] font-bold tabular-nums"
            aria-live="polite"
          >
            {item.quantity}
          </span>
          <button
            type="button"
            onClick={() => onUpdate({ quantity: item.quantity + 1 })}
            aria-label={`Menge von ${item.label} erhöhen`}
            className="h-[34px] w-9 text-[17px] font-bold leading-none text-brand-deep transition-colors duration-120 hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            +
          </button>
        </span>

        {/* Unit-Select als Pille */}
        <select
          value={item.unit}
          onChange={(event) => onUpdate({ unit: event.target.value })}
          aria-label={`Einheit von ${item.label}`}
          className="h-[34px] cursor-pointer appearance-none rounded-full border-[1.5px] border-line-strong bg-white bg-[url('data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20width=%2710%27%20height=%276%27%3E%3Cpath%20d=%27M1%201l4%204%204-4%27%20fill=%27none%27%20stroke=%27%235C6B62%27%20stroke-width=%271.6%27%20stroke-linecap=%27round%27/%3E%3C/svg%3E')] bg-[right_10px_center] bg-no-repeat pl-3 pr-[26px] text-[13.5px] font-semibold text-neutral-700 transition-colors duration-120 hover:border-brand focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          {units.map((unit) => (
            <option key={unit} value={unit}>
              {unit}
            </option>
          ))}
        </select>

        {bioAvailable && (
          <button
            type="button"
            onClick={() => onUpdate({ bio: !item.bio })}
            aria-pressed={item.bio}
            className={clsx(
              "inline-flex h-[34px] items-center rounded-full border-[1.5px] px-[11px] text-[13.5px] font-semibold transition-all duration-150 ease-out",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
              item.bio
                ? "border-brand bg-brand text-white"
                : "border-line-strong bg-white text-muted hover:border-brand",
            )}
          >
            Bio
          </button>
        )}

        <button
          type="button"
          onClick={toggleNote}
          aria-expanded={noteOpen}
          aria-controls={noteInputId}
          className={chipClasses(noteOpen || Boolean(item.note))}
        >
          <Pencil className="size-3.5" aria-hidden="true" />
          Notiz
        </button>
      </div>

      {noteOpen && (
        <div className="mt-2.5 animate-[fadeUp_150ms_ease-out] pl-9">
          <input
            id={noteInputId}
            value={item.note}
            onChange={(event) => onUpdate({ note: event.target.value })}
            placeholder="z. B. reife Avocados, Größe 4, glutenfrei …"
            aria-label={`Notiz zu ${item.label}`}
            className="h-[42px] w-full rounded-[11px] border-[1.5px] border-line-strong bg-[#FDFCFA] px-3.5 text-[15px] font-medium text-ink transition-colors duration-150 placeholder:text-[#9AA79F] focus:border-brand focus:outline-none"
          />
        </div>
      )}
    </li>
  );
}
