import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { toast } from "sonner";

import { useIntegrationsQuery, useSettingsQuery, useUpdateIntegrations, useUpdateSettings } from "../hooks/settings";
import type { IntegrationSettings, Settings } from "../services/settings.service";
import { Bot, Key } from "lucide-react";

export function SettingsPage() {
  const { data: settingsData, isPending: settingsLoading } = useSettingsQuery();
  const { data: integrationsData, isPending: integrationsLoading } = useIntegrationsQuery();
  const updateSettings = useUpdateSettings();
  const updateIntegrations = useUpdateIntegrations();

  const [settings, setSettings] = useState<Settings | null>(null);
  const [integrations, setIntegrations] = useState<IntegrationSettings | null>(null);

  useEffect(() => {
    if (settingsData) setSettings(settingsData);
  }, [settingsData]);

  useEffect(() => {
    if (integrationsData) setIntegrations(integrationsData);
  }, [integrationsData]);

  const handleSave = async () => {
    if (!settings) return;
    try {
      await updateSettings.mutateAsync(settings);
      toast.success("Settings updated");
    } catch (err) {
      toast.error("Failed to update settings");
    }
  };

  const handleSaveIntegrations = async () => {
    if (!integrations) return;
    try {
      await updateIntegrations.mutateAsync(integrations);
      toast.success("Integrations updated");
    } catch {
      toast.error("Failed to update integrations");
    }
  };

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl border border-border/70 shadow-sm">
        <CardHeader className="border-b pb-4">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <span className="h-8 w-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-lg">
              <Bot className="h-5 w-5" />
            </span>
            <span>Bot Configuration</span>
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Configure your Telegram bot settings
          </p>
        </CardHeader>
        <CardContent className="px-6 py-5 space-y-4">
          {settingsLoading ? (
            <div className="py-8 flex items-center justify-center">
              <div className="h-6 w-6 rounded-full border-2 border-blue-400 animate-spin" />
            </div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">
                    Bot Name
                  </label>
                  <Input value={settings?.botName ?? ""} onChange={(e) => setSettings((prev) => prev ? { ...prev, botName: e.target.value } : prev)} className="h-11" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">
                    Bot Username
                  </label>
                  <Input value={settings?.botUsername ?? ""} onChange={(e) => setSettings((prev) => prev ? { ...prev, botUsername: e.target.value } : prev)} className="h-11" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">
                  Welcome Message
                </label>
                <textarea
                  className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-slate-700 resize-none"
                  value={settings?.welcomeMessage ?? ""}
                  onChange={(e) => setSettings((prev) => prev ? { ...prev, welcomeMessage: e.target.value } : prev)}
                />
              </div>

              <div className="flex items-center justify-end">
                <Button onClick={handleSave} disabled={updateSettings.isPending}>
                  {updateSettings.isPending ? "Saving..." : "Save settings"}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-2xl border border-border/70 shadow-sm">
        <CardHeader className="border-b pb-4">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <span className="h-8 w-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-lg">
              <Key className="h-5 w-5" />
            </span>
            <span>API Configuration</span>
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Manage your API keys and tokens
          </p>
        </CardHeader>
        <CardContent className="px-6 py-5 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">
              Telegram Bot Token
            </label>
            <Input
              type="password"
              value={settings?.telegramToken ?? ""}
              onChange={(e) => setSettings((prev) => prev ? { ...prev, telegramToken: e.target.value } : prev)}
              className="h-11"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">
              Webhook URL
            </label>
            <Input
              value={settings?.webhookUrl ?? ""}
              onChange={(e) => setSettings((prev) => prev ? { ...prev, webhookUrl: e.target.value } : prev)}
              className="h-11"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
