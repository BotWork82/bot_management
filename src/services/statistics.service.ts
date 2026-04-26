import { delay } from "../lib/delay";
import { api } from "./api";

export type TimeSeriesPoint = { date: string; value: number };

function isClientError(e: any) {
  return e && e.response && typeof e.response.status === "number" && e.response.status >= 400 && e.response.status < 500;
}

export const statisticsService = {
  async getStats() {
    try {
      const res = await api.get<any>("/statistics/overview");
      const data = res.data ?? {};
      return {
        totalMessages: Number(data.totalMessages ?? data.messages ?? 12400),
        totalProducts: Number(data.totalProducts ?? data.products ?? 156),
        totalUsers: Number(data.totalUsers ?? data.users ?? 2847)
      };
    } catch (e) {
      if (isClientError(e)) throw e;
      await delay(300);
      return {
        totalMessages: 12400,
        totalProducts: 156,
        totalUsers: 2847
      };
    }
  },

  async getWeeklySeries(): Promise<number[]> {
    try {
      const res = await api.get<any>("/statistics/weekly-series");
      const data = res.data;
      const series = data.series ?? data.values ?? data.content ?? data;
      if (Array.isArray(series)) {
        return series.map((v: any) => Number(v?.value ?? v ?? 0));
      }
      return [260, 340, 310, 450, 480, 360, 300];
    } catch (e) {
      if (isClientError(e)) throw e;
      await delay(300);
      return [260, 340, 310, 450, 480, 360, 300];
    }
  }
};

