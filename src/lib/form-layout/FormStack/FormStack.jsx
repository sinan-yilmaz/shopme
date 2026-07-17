import clsx from "clsx";

/** Vertikaler Formular-Rhythmus mit konsistentem Abstand. */
export default function FormStack({ className, children }) {
  return <div className={clsx("space-y-5", className)}>{children}</div>;
}
