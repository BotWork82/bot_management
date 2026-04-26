import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { productsService, type CreateProductDto, type UpdateProductDto } from "../services/products.service";

export function useProductsQuery(page: number = 1, take: number = 12) {
  return useQuery({ queryKey: ["products", { page, take }], queryFn: () => productsService.getProducts({ page, take }), staleTime: 1000 * 60 * 2 });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateProductDto) => productsService.createProduct(dto),
    onSuccess() {
      qc.invalidateQueries({ predicate: (q) => q.queryKey[0] === "products" });
    }
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateProductDto }) => productsService.updateProduct(id, dto),
    onSuccess() {
      qc.invalidateQueries({ predicate: (q) => q.queryKey[0] === "products" });
    }
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productsService.deleteProduct(id),
    onSuccess() {
      qc.invalidateQueries({ predicate: (q) => q.queryKey[0] === "products" });
    }
  });
}
