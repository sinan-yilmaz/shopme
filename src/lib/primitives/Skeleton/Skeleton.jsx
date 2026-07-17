import clsx from "clsx";

/** Lade-Platzhalter mit fester Höhe — verhindert Layout-Shift. */
export default function Skeleton({ className }) {
  return (
    <div
      className={clsx("animate-pulse rounded-lg bg-neutral-200", className)}
      aria-hidden="true"
    />
  );
}
