import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { farmsService, type CreateFarmDto, type UpdateFarmDto } from "../services/farms.service";

export function useFarmsQuery(page: number = 1, take: number = 10) {
  return useQuery({ queryKey: ["farms", { page, take }], queryFn: () => farmsService.getFarms({ page, take }), staleTime: 1000 * 60 * 5 });
}

export function useCreateFarm() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateFarmDto) => farmsService.createFarm(dto),
    onSuccess() {
      qc.invalidateQueries({ predicate: (q) => q.queryKey[0] === "farms" });
    }
  });
}

export function useUpdateFarm() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateFarmDto }) => farmsService.updateFarm(id, dto),
    onSuccess() {
      qc.invalidateQueries({ predicate: (q) => q.queryKey[0] === "farms" });
    }
  });
}

export function useDeleteFarm() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => farmsService.deleteFarm(id),
    onSuccess() {
      qc.invalidateQueries({ predicate: (q) => q.queryKey[0] === "farms" });
    }
  });
}
