import { useQuery } from "@tanstack/react-query";
import OrderApi from "../api/OrderApi";

export const ORDER_BY_CODE_QUERY_KEY = (code) => ["order", "by-code", code];

export default function useOrderByCode({ code }) {
  return useQuery({
    queryKey: ORDER_BY_CODE_QUERY_KEY(code),
    queryFn: () => OrderApi.getByCode({ code }),
    enabled: Boolean(code),
    retry: false,
  });
}
