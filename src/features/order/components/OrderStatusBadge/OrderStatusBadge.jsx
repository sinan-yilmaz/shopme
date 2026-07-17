import Badge from "lib/primitives/Badge";
import { ORDER_STATUS_LABELS } from "../../consts/orderStatus";

/** Status-Farben nach HANDOFF §6 (Fahrer): eingegangen warn-bg · bestätigt
 * brand-soft · im Einkauf brand gefüllt · unterwegs ink-grau · geliefert
 * field/muted. */
const VARIANTS = {
  eingegangen: "warn",
  bestaetigt: "brand",
  im_einkauf: "brand-solid",
  unterwegs: "ink",
  geliefert: "muted",
  storniert: "neutral",
};

export default function OrderStatusBadge({ status }) {
  return (
    <Badge variant={VARIANTS[status] ?? "neutral"}>
      {ORDER_STATUS_LABELS[status]}
    </Badge>
  );
}
