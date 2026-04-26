import { useQuery } from "@tanstack/react-query";
import { categoriesService } from "../services/categories.service";

export function useCategoriesQuery(page: number = 1, take: number = 10) {
  return useQuery({ queryKey: ["categories", { page, take }], queryFn: () => categoriesService.getCategories({ page, take }), staleTime: 1000 * 60 * 5 });
}
