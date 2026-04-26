import { useQuery } from "@tanstack/react-query";
import { dashboardService, type SummaryCard } from "../services/dashboard.service";

export function useSummaryCards() {
  return useQuery({ queryKey: ["dashboard","summary"], queryFn: () => dashboardService.getSummary(), staleTime: 1000 * 60 * 1 });
}

export function useWeeklyInteractions() {
  return useQuery({ queryKey: ["dashboard","weeklyInteractions"], queryFn: () => dashboardService.getWeeklyInteractions(), staleTime: 1000 * 60 * 1 });
}

export function useRecentActivity() {
  return useQuery({ queryKey: ["dashboard", "recentActivity"], queryFn: () => dashboardService.getRecentActivity(), staleTime: 1000 * 60 * 1 });
}

