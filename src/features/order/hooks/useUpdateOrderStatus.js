import { useMutation, useQueryClient } from "@tanstack/react-query";
import OrderApi from "../api/OrderApi";

export default function useUpdateOrderStatus(options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, status, ageCheckConfirmed }) =>
      OrderApi.updateStatus({ orderId, status, ageCheckConfirmed }),
    ...options,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ["order"] });
      options.onSuccess?.(...args);
    },
  });
}
