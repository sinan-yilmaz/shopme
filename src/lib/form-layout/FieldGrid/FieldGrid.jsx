import clsx from "clsx";

/** Zweispaltiges Feld-Raster ab Tablet-Breite (mobil einspaltig). */
export default function FieldGrid({ className, children }) {
  return (
    <div
      className={clsx(
        "grid grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-2",
        className,
      )}
    >
      {children}
    </div>
  );
}
