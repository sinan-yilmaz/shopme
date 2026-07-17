import clsx from "clsx";
import { MessageCircle } from "lucide-react";
import { WHATSAPP_NUMBER } from "common/consts/brand";
import { buttonClasses } from "lib/primitives/Button";

/**
 * Öffnet WhatsApp über einen wa.me-Deeplink mit vorbefülltem Text —
 * es wird nichts versendet (SPEC: kein echter WhatsApp-Versand).
 */
export default function WhatsAppButton({
  message,
  variant = "secondary",
  size = "md",
  fullWidth = false,
  className,
  children,
}) {
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className={clsx(buttonClasses({ variant, size, fullWidth }), className)}
    >
      <MessageCircle className="size-5" aria-hidden="true" />
      {children}
    </a>
  );
}
