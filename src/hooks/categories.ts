import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { categoriesService, type CreateCategoryDto, type UpdateCategoryDto } from "../services/categories.service";

export function useCategoriesQuery(page: number = 1, take: number = 10) {
  return useQuery({ queryKey: ["categories", { page, take }], queryFn: () => categoriesService.getCategories({ page, take }), staleTime: 1000 * 60 * 5 });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateCategoryDto) => categoriesService.createCategory(dto),
    onSuccess() {
      qc.invalidateQueries({ predicate: (q) => q.queryKey[0] === "categories" });
    }
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateCategoryDto }) => categoriesService.updateCategory(id, dto),
    onSuccess() {
      qc.invalidateQueries({ predicate: (q) => q.queryKey[0] === "categories" });
    }
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => categoriesService.deleteCategory(id),
    onSuccess() {
      qc.invalidateQueries({ predicate: (q) => q.queryKey[0] === "categories" });
    }
  });
}
