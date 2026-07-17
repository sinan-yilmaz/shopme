import { useQuery } from "@tanstack/react-query";
import OrderApi from "../api/OrderApi";

export const ORDER_BY_ID_QUERY_KEY = (id) => ["order", "by-id", id];

export default function useOrderById({ id }) {
  return useQuery({
    queryKey: ORDER_BY_ID_QUERY_KEY(id),
    queryFn: () => OrderApi.getById({ id }),
    enabled: Boolean(id),
    retry: false,
  });
}
