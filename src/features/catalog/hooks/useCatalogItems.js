import { useQuery } from "@tanstack/react-query";
import CatalogApi from "../api/CatalogApi";

export const CATALOG_ITEMS_QUERY_KEY = ["catalog", "items"];

export default function useCatalogItems() {
  return useQuery({
    queryKey: CATALOG_ITEMS_QUERY_KEY,
    queryFn: () => CatalogApi.getItems(),
  });
}
