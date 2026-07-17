import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DELIVERY_SLOTS_QUERY_KEY } from "features/delivery/hooks/useDeliverySlots";
import OrderApi from "../api/OrderApi";

export default function useCreateOrder(options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (draft) => OrderApi.create(draft),
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["order"] });
      queryClient.invalidateQueries({ queryKey: DELIVERY_SLOTS_QUERY_KEY });
      options.onSuccess?.(...args);
    },
  });
}
