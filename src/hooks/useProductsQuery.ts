import { useQuery } from "@tanstack/react-query";
import { productsService } from "../services/products.service";

export function useProductsQuery() {
  return useQuery({ queryKey: ["products"], queryFn: () => productsService.getProducts(), staleTime: 1000 * 60 * 2 });
}
