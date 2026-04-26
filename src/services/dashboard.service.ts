import { delay } from "../lib/delay";
import { BarChart3, Boxes, MessageSquare, Users } from "lucide-react";
import { api } from "./api";

export type SummaryCard = {
  label: string;
  value: string;
  helper: string;
  icon: any;
};

export type RecentActivity = {
  title: string;
  desc: string;
  time: string;
  type?: string;
};

const iconMap: Record<string, any> = {
  products: Boxes,
  categories: BarChart3,
  farms: Boxes,
  users: Users,
  messages: MessageSquare,
  engagement: BarChart3
};

export const dashboardService = {
  async getSummary(): Promise<SummaryCard[]> {
    try {
      const res = await api.get<any>("/dashboard/summary");
      const data = res.data;
      const rawItems = data.items ?? data.content ?? data.summary ?? (Array.isArray(data) ? data : []);
      const items = (rawItems || []).map((item: any) => ({
        label: String(item.label ?? item.name ?? "Metric"),
        value: String(item.value ?? item.total ?? "0"),
        helper: String(item.helper ?? item.description ?? ""),
        icon: iconMap[String(item.iconKey ?? item.type ?? "").toLowerCase()] ?? BarChart3
      })) as SummaryCard[];
      return items;
    } catch {
      await delay(300);
      return [];
    }
  },

  async getWeeklyInteractions(): Promise<number[]> {
    try {
      const res = await api.get<any>("/dashboard/weekly-interactions");
      const data = res.data;
      const series = data.series ?? data.values ?? data.interactions ?? data.content ?? data;
      if (Array.isArray(series)) {
        return series.map((v: any) => Number(v?.value ?? v ?? 0));
      }
      return [];
    } catch {
      await delay(300);
      return [];
    }
  },

  async getRecentActivity(): Promise<RecentActivity[]> {
    try {
      const res = await api.get<any>("/dashboard/recent-activity");
      const data = res.data;
      const items = data.items ?? data.content ?? data.activities ?? (Array.isArray(data) ? data : []);
      return (items || []).map((item: any) => ({
        title: String(item.title ?? "Activity"),
        desc: String(item.desc ?? item.description ?? ""),
        time: String(item.time ?? item.createdAt ?? ""),
        type: item.type
      })) as RecentActivity[];
    } catch {
      await delay(300);
      return [];
    }
  }
};

