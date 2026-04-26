import { delay } from "../lib/delay";
import { api } from "./api";

export type Settings = {
  botName: string;
  botUsername: string;
  welcomeMessage: string;
  telegramToken?: string;
  webhookUrl?: string;
};

export type IntegrationSettings = {
  analyticsEnabled: boolean;
  notificationsEnabled: boolean;
  webhookSecret?: string;
};

let settingsStore: Settings = {
  botName: "FarmStore Bot",
  botUsername: "@farmstore_bot",
  welcomeMessage: "Welcome to FarmStore! Browse our fresh products from local farms.",
  telegramToken: undefined,
  webhookUrl: "https://api.example.com/webhook"
};

let integrationsStore: IntegrationSettings = {
  analyticsEnabled: true,
  notificationsEnabled: true,
  webhookSecret: ""
};

function isClientError(e: any) {
  return e && e.response && typeof e.response.status === "number" && e.response.status >= 400 && e.response.status < 500;
}

export const settingsService = {
  async getSettings(): Promise<Settings> {
    try {
      const res = await api.get<any>("/settings");
      const data = res.data?.settings ?? res.data ?? {};
      return {
        botName: data.botName ?? data.bot_name ?? settingsStore.botName,
        botUsername: data.botUsername ?? data.bot_username ?? settingsStore.botUsername,
        welcomeMessage: data.welcomeMessage ?? data.welcome_message ?? settingsStore.welcomeMessage,
        telegramToken: data.telegramToken ?? data.telegram_token ?? settingsStore.telegramToken,
        webhookUrl: data.webhookUrl ?? data.webhook_url ?? settingsStore.webhookUrl
      };
    } catch (e) {
      if (isClientError(e)) throw e;
      await delay(300);
      return { ...settingsStore };
    }
  },

  async updateSettings(partial: Partial<Settings>): Promise<Settings> {
    try {
      const res = await api.patch<any>("/settings", partial);
      const data = res.data?.settings ?? res.data ?? {};
      return {
        botName: data.botName ?? data.bot_name ?? partial.botName ?? settingsStore.botName,
        botUsername: data.botUsername ?? data.bot_username ?? partial.botUsername ?? settingsStore.botUsername,
        welcomeMessage: data.welcomeMessage ?? data.welcome_message ?? partial.welcomeMessage ?? settingsStore.welcomeMessage,
        telegramToken: data.telegramToken ?? data.telegram_token ?? partial.telegramToken ?? settingsStore.telegramToken,
        webhookUrl: data.webhookUrl ?? data.webhook_url ?? partial.webhookUrl ?? settingsStore.webhookUrl
      };
    } catch (e) {
      if (isClientError(e)) throw e;
      await delay(400);
      settingsStore = { ...settingsStore, ...partial };
      return { ...settingsStore };
    }
  },

  async getIntegrations(): Promise<IntegrationSettings> {
    try {
      const res = await api.get<any>("/settings/integrations");
      const data = res.data?.integrations ?? res.data ?? {};
      return {
        analyticsEnabled: Boolean(data.analyticsEnabled ?? data.analytics_enabled ?? integrationsStore.analyticsEnabled),
        notificationsEnabled: Boolean(data.notificationsEnabled ?? data.notifications_enabled ?? integrationsStore.notificationsEnabled),
        webhookSecret: data.webhookSecret ?? data.webhook_secret ?? integrationsStore.webhookSecret
      };
    } catch (e) {
      if (isClientError(e)) throw e;
      await delay(250);
      return { ...integrationsStore };
    }
  },

  async updateIntegrations(partial: Partial<IntegrationSettings>): Promise<IntegrationSettings> {
    try {
      const res = await api.patch<any>("/settings/integrations", partial);
      const data = res.data?.integrations ?? res.data ?? {};
      return {
        analyticsEnabled: Boolean(data.analyticsEnabled ?? data.analytics_enabled ?? partial.analyticsEnabled ?? integrationsStore.analyticsEnabled),
        notificationsEnabled: Boolean(data.notificationsEnabled ?? data.notifications_enabled ?? partial.notificationsEnabled ?? integrationsStore.notificationsEnabled),
        webhookSecret: data.webhookSecret ?? data.webhook_secret ?? partial.webhookSecret ?? integrationsStore.webhookSecret
      };
    } catch (e) {
      if (isClientError(e)) throw e;
      await delay(250);
      integrationsStore = { ...integrationsStore, ...partial };
      return { ...integrationsStore };
    }
  }
};

