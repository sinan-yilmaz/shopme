import { Outlet } from "react-router-dom";
import OrderDraftProvider from "features/order/context/OrderDraftProvider";

/** Unsichtbarer Route-Wrapper: mountet den Bestellentwurf um Wizard + Danke-Seite. */
export default function OrderDraftScope() {
  return (
    <OrderDraftProvider>
      <Outlet />
    </OrderDraftProvider>
  );
}
