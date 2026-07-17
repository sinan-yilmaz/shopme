import { useMutation, useQueryClient } from "@tanstack/react-query";
import OrderApi from "../api/OrderApi";

export default function useUpdateOrderItem(options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, itemId, patch }) =>
      OrderApi.updateItem({ orderId, itemId, patch }),
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["order"] });
      options.onSuccess?.(...args);
    },
  });
}
