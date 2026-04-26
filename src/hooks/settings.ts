import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { settingsService, type IntegrationSettings, type Settings } from "../services/settings.service";

export function useSettingsQuery() {
  return useQuery({ queryKey: ["settings"], queryFn: () => settingsService.getSettings(), staleTime: 1000 * 60 * 5 });
}

export function useUpdateSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (partial: Partial<Settings>) => settingsService.updateSettings(partial),
    onSuccess() {
      qc.invalidateQueries({ queryKey: ["settings"] });
    }
  });
}

export function useIntegrationsQuery() {
  return useQuery({ queryKey: ["settings", "integrations"], queryFn: () => settingsService.getIntegrations(), staleTime: 1000 * 60 * 5 });
}

export function useUpdateIntegrations() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (partial: Partial<IntegrationSettings>) => settingsService.updateIntegrations(partial),
    onSuccess() {
      qc.invalidateQueries({ queryKey: ["settings", "integrations"] });
    }
  });
}
