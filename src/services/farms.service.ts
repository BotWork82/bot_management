import { delay } from "../lib/delay";
import { api } from "./api";

export type Farm = {
  _id: string;
  name: string;
  location?: string;
  description?: string;
  products?: number;
  products_count?: number;
  owner?: { id?: string; email?: string; name?: string } | string | null;
  status?: "active" | "inactive";
  created_at?: string;
};

let farmsStore: Farm[] = [
  { _id: "1", name: "Sunny Valley Farm", location: "California, USA", description: "Organic honey and bee products", products: 12, status: "active", owner: { id: "u1", email: "owner1@example.com", name: "Owner 1" }, created_at: "2024-01-01T10:00:00Z" },
  { _id: "2", name: "Green Meadows", location: "Oregon, USA", description: "Free-range poultry and eggs", products: 8, status: "active", owner: { id: "u2", email: "owner2@example.com", name: "Owner 2" }, created_at: "2024-02-10T09:00:00Z" }
];

export type CreateFarmDto = Omit<Farm, "id">;
export type UpdateFarmDto = Partial<CreateFarmDto>;

function isClientError(e: any) {
  return e && e.response && typeof e.response.status === "number" && e.response.status >= 400 && e.response.status < 500;
}

export const farmsService = {
  async getFarms(query?: { page?: number; take?: number; q?: string }) {
    try {
      const params: any = {};
      if (query?.page) params.page = query.page;
      if (query?.take) params.take = query.take;
      if (query?.q) params.q = query.q;
      const res = await api.get<{ items: Farm[]; total: number; page?: number; take?: number }>("/farms", { params });
      const data: any = res.data as any;
      if (data.farms && !data.items) return { items: data.farms, total: data.farms.length, page: data.page ?? query?.page ?? 1, take: data.take ?? query?.take ?? data.farms.length };
      return data;
    } catch (e) {
      if (isClientError(e)) throw e;
      await delay(600);
      return { items: [...farmsStore], total: farmsStore.length, page: query?.page || 1, take: query?.take || farmsStore.length };
    }
  },

  async createFarm(dto: CreateFarmDto): Promise<Farm> {
    try {
      const res = await api.post<{ farm: Farm }>("/farms", dto);
      return res.data.farm;
    } catch (e) {
      if (isClientError(e)) throw e;
      await delay(800);
      const farm: Farm = { id: String(Date.now()), ...dto } as Farm;
      farmsStore = [...farmsStore, farm];
      return farm;
    }
  },

  async getFarm(id: string): Promise<Farm | null> {
    try {
      const res = await api.get<{ farm: Farm }>(`/farms/${id}`);
      return res.data.farm;
    } catch (e) {
      if (isClientError(e)) throw e;
      await delay(300);
      return farmsStore.find((f) => f._id === id) ?? null;
    }
  },

  async updateFarm(id: string, dto: UpdateFarmDto): Promise<Farm> {
    try {
      const res = await api.patch<{ farm: Farm }>(`/farms/${id}`, dto);
      return res.data.farm;
    } catch (e) {
      if (isClientError(e)) throw e;
      await delay(700);
      farmsStore = farmsStore.map((f) => (f._id === id ? { ...f, ...dto } : f));
      return farmsStore.find((f) => f._id === id)!;
    }
  },

  async deleteFarm(id: string): Promise<void> {
    try {
      await api.delete(`/farms/${id}`);
    } catch (e) {
      if (isClientError(e)) throw e;
      await delay(500);
      farmsStore = farmsStore.filter((f) => f._id !== id);
    }
  }
};
