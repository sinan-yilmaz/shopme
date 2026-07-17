import { useMutation, useQueryClient } from "@tanstack/react-query";
import OrderApi from "../api/OrderApi";

export default function useCompleteShopping(options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, receiptCents }) =>
      OrderApi.completeShopping({ orderId, receiptCents }),
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["order"] });
      options.onSuccess?.(...args);
    },
  });
}
