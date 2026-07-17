import { useQuery } from "@tanstack/react-query";
import OrderApi from "../api/OrderApi";

export const ORDERS_QUERY_KEY = ["order", "all"];

export default function useOrders() {
  return useQuery({
    queryKey: ORDERS_QUERY_KEY,
    queryFn: () => OrderApi.getAll(),
  });
}
