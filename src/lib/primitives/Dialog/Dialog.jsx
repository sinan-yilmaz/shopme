import { useEffect, useId, useRef } from "react";
import clsx from "clsx";
import { X } from "lucide-react";
import IconButton from "lib/primitives/IconButton";

/**
 * Modal auf Basis des nativen dialog-Elements: Fokus-Falle, ESC und
 * Scroll-Sperre kommen vom Browser; Klick auf den Hintergrund schließt.
 */
export default function Dialog({
  open,
  onClose,
  title,
  size = "md",
  children,
}) {
  const dialogRef = useRef(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const handleCancel = (event) => {
    event.preventDefault();
    onClose();
  };

  const handleBackdropClick = (event) => {
    if (event.target === dialogRef.current) onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onCancel={handleCancel}
      onClick={handleBackdropClick}
      className={clsx(
        "m-auto w-[calc(100%-2rem)] rounded-2xl bg-white p-0 text-ink shadow-float",
        "backdrop:bg-ink/45",
        size === "sm" && "max-w-sm",
        size === "md" && "max-w-md",
        size === "lg" && "max-w-lg",
      )}
    >
      <div className="flex max-h-[85vh] flex-col">
        <header className="flex items-start justify-between gap-4 px-6 pb-2 pt-5">
          <h2 id={titleId} className="text-xl font-semibold">
            {title}
          </h2>
          <IconButton
            label="Schließen"
            onClick={onClose}
            className="-mr-2 -mt-1"
          >
            <X className="size-5" aria-hidden="true" />
          </IconButton>
        </header>
        <div className="overflow-y-auto px-6 pb-6">{children}</div>
      </div>
    </dialog>
  );
}
