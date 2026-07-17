import { useQuery } from "@tanstack/react-query";
import DeliveryApi from "../api/DeliveryApi";

export const DELIVERY_SLOTS_QUERY_KEY = ["delivery", "slots"];

export default function useDeliverySlots() {
  return useQuery({
    queryKey: DELIVERY_SLOTS_QUERY_KEY,
    queryFn: () => DeliveryApi.getSlots(),
  });
}
