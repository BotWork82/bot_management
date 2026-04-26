import { delay } from "../lib/delay";
import { api } from "./api";

export type MediaItem = {
  _id?: string;
  id?: string;
  name?: string;
  originalName?: string;
  label?: string;
  type: "image" | "video";
  farm?: string;
  src?: string;
  url?: string;
  filename?: string;
  mimeType?: string;
  size?: number;
  owner?: string;
  created_at?: string;
};

const mediaStore: MediaItem[] = [
  { _id: "1", name: "honey-1.jpg", originalName: "honey-1.jpg", label: "Organic Honey", type: "image", farm: "Sunny Valley Farm", src: "https://images.pexels.com/photos/6157054/pexels-photo-6157054.jpeg?auto=compress&cs=tinysrgb&w=800" },
  { _id: "2", name: "eggs-1.jpg", originalName: "eggs-1.jpg", label: "Fresh Eggs", type: "image", farm: "Green Meadows", src: "https://images.pexels.com/photos/162760/egg-white-food-protein-162760.jpeg?auto=compress&cs=tinysrgb&w=800" },
  { _id: "3", name: "milk-1.jpg", originalName: "milk-1.jpg", label: "Farm Fresh Milk", type: "image", farm: "Hillside Dairy", src: "https://images.pexels.com/photos/3738085/pexels-photo-3738085.jpeg?auto=compress&cs=tinysrgb&w=800" },
  { _id: "4", name: "veggies-1.jpg", originalName: "veggies-1.jpg", label: "Organic Vegetables", type: "image", farm: "Organic Gardens Co.", src: "https://images.pexels.com/photos/143133/pexels-photo-143133.jpeg?auto=compress&cs=tinysrgb&w=800" },
  { _id: "5", name: "farm-tour.mp4", originalName: "farm-tour.mp4", label: "Farm Tour", type: "video", farm: "Sunny Valley Farm", src: "https://www.w3schools.com/html/mov_bbb.mp4" }
];

export type UploadMediaDto = { file?: File; type?: "image" | "video"; productId?: string };
export type UpdateMediaDto = Partial<Pick<MediaItem, "label" | "name" | "type">>;

function isClientError(e: any) {
  return e && e.response && typeof e.response.status === "number" && e.response.status >= 400 && e.response.status < 500;
}

export const mediaService = {
  async getMedia(query?: { page?: number; take?: number; q?: string }): Promise<{ items: MediaItem[]; total: number; page?: number; take?: number }> {
    try {
      const params: any = {};
      if (query?.page) params.page = query.page;
      if (query?.take) params.take = query.take;
      if (query?.q) params.q = query.q;
      const res = await api.get<any>(`/media`, { params });
      const data = res.data;
      const items: MediaItem[] = data.content ?? data.items ?? data.media ?? [];
      const total: number = data.total ?? items.length;
      const page = data.page ?? query?.page ?? 1;
      const take = data.take ?? query?.take ?? items.length;
      return { items, total, page, take };
    } catch (e) {
      if (isClientError(e)) throw e;
      await delay(400);
      const items = [...mediaStore];
      const total = items.length;
      const page = query?.page || 1;
      const take = query?.take || items.length;
      const start = (page - 1) * take;
      const paged = items.slice(start, start + take);
      return { items: paged, total, page, take };
    }
  },

  async uploadMedia(dto: UploadMediaDto): Promise<{ id: string; originalName: string; url: string }> {
    try {
      const fd = new FormData();
      if (dto.file) fd.append("file", dto.file);
      if (dto.type) fd.append("type", dto.type);
      if ((dto as any).productId) fd.append("productId", (dto as any).productId);
      const res = await api.post<{ media: { id: string; originalName: string; url: string } }>(`/media`, fd);
      return res.data.media;
    } catch (e) {
      if (isClientError(e)) throw e;
      await delay(800);
      const item: MediaItem = { _id: String(Date.now()), id: String(Date.now()), name: dto.file ? (dto.file as File).name : "file", originalName: dto.file ? (dto.file as File).name : "file", label: (dto as any).label, type: dto.type || "image", farm: (dto as any).farm, src: (dto as any).src || "" } as MediaItem;
      mediaStore.push(item);
      return { id: item._id!, originalName: item.originalName || item.name || "file", url: `/media/${item._id}/download` };
    }
  },

  async getMediaById(id: string): Promise<MediaItem | null> {
    try {
      const res = await api.get<{ meta: MediaItem }>(`/media/${id}`);
      return res.data.meta;
    } catch (e) {
      if (isClientError(e)) throw e;
      await delay(300);
      return mediaStore.find((m) => m._id === id || m.id === id) ?? null;
    }
  },

  async download(mediaId: string): Promise<Blob | string> {
    try {
      const res = await api.get(`/media/${mediaId}/download`, { responseType: "blob" });
      return res.data as Blob;
    } catch (e) {
      if (isClientError(e)) throw e;
      await delay(200);
      const item = mediaStore.find((m) => m._id === mediaId || m.id === mediaId);
      return item ? (item.src || item.url || "") : "";
    }
  },

  async deleteMedia(id: string): Promise<void> {
    try {
      await api.delete(`/media/${id}`);
    } catch (e) {
      if (isClientError(e)) throw e;
      await delay(400);
      const idx = mediaStore.findIndex((m) => m._id === id || m.id === id);
      if (idx >= 0) mediaStore.splice(idx, 1);
    }
  },

  async updateMedia(id: string, dto: UpdateMediaDto): Promise<MediaItem> {
    try {
      const res = await api.patch<{ media: MediaItem }>(`/media/${id}`, dto);
      return res.data.media;
    } catch (e) {
      if (isClientError(e)) throw e;
      await delay(300);
      const idx = mediaStore.findIndex((m) => m._id === id || m.id === id);
      if (idx < 0) throw new Error("Media not found");
      mediaStore[idx] = { ...mediaStore[idx], ...dto };
      return mediaStore[idx];
    }
  }
};
