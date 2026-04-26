import { useQuery } from "@tanstack/react-query";
import { statisticsService } from "../services/statistics.service";

export function useStatistics() {
  return useQuery({ queryKey: ["statistics"], queryFn: () => statisticsService.getStats(), staleTime: 1000 * 60 * 2 });
}

