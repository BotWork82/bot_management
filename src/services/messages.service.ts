import { delay } from "../lib/delay";
import { api } from "./api";

export type Message = {
  _id: string;
  subject?: string;
  body: string;
  status: "sent" | "draft";
  date?: string | null;
  toUserId?: string | null;
  toFarmId?: string | null;
  attachments?: string[] | null;
  created_at?: string;
  createdBy?: any;
};

let messagesStore: Message[] = [
  {
    _id: "1",
    subject: "Weekly Product Update",
    status: "sent",
    date: "2024-01-15 10:00",
    toUserId: null,
    toFarmId: null,
    attachments: null,
    body: `🌟 New products this week!

Check out our fresh arrivals:
- Organic Honey 500g
- Farm Fresh Eggs
- Seasonal Vegetables Box

Order now and get 10% off!`
  },
  {
    _id: "2",
    subject: "Welcome Message",
    status: "draft",
    date: null,
    toUserId: null,
    toFarmId: null,
    attachments: null,
    body: `Welcome to TeleBot Farm Store! 🐄

We're glad to have you here. Browse our fresh products from local farms and enjoy farm-to-table quality.`
  },
  {
    _id: "3",
    subject: "Holiday Sale",
    status: "sent",
    date: "2024-12-20 09:00",
    toUserId: null,
    toFarmId: null,
    attachments: null,
    body: `🎉 Holiday sale starts now!\nUp to 30% off on selected products.\nDon't miss out!`
  },
  {
    _id: "4",
    subject: "Farm Spotlight: Sunny Valley",
    status: "draft",
    date: null,
    toUserId: null,
    toFarmId: null,
    attachments: null,
    body: `Meet Sunny Valley Farm - our partner for organic honey.\nTheir hives are cared for with love and traditional methods.`
  }
];

export type CreateMessageDto = {
  subject?: string;
  body: string;
  toUserId?: string | null;
  toFarmId?: string | null;
  attachments?: string[] | null;
};
export type UpdateMessageDto = Partial<CreateMessageDto> & { status?: "sent" | "draft" };
export type MessageStats = { sent?: number; delivered?: number; opened?: number; clicked?: number };

function isClientError(e: any) {
  return e && e.response && typeof e.response.status === "number" && e.response.status >= 400 && e.response.status < 500;
}

export const messagesService = {
  async getMessages(query?: { page?: number; take?: number; box?: string }) {
    try {
      const params: any = {};
      if (query?.page) params.page = query.page;
      if (query?.take) params.take = query.take;
      if (query?.box) params.box = query.box;
      const res = await api.get<{ items: Message[]; total?: number }>("/messages", { params });
      return res.data;
    } catch (e) {
      if (isClientError(e)) throw e;
      await delay(500);
      const items = [...messagesStore];
      const total = items.length;
      const page = query?.page || 1;
      const take = query?.take || items.length;
      const start = (page - 1) * take;
      const paged = items.slice(start, start + take);
      return { items: paged, total, page, take };
    }
  },

  async createMessage(dto: CreateMessageDto): Promise<Message> {
    try {
      const res = await api.post<{ message: Message }>("/messages", dto);
      return res.data.message;
    } catch (e) {
      if (isClientError(e)) throw e;
      await delay(700);
      const msg: Message = { _id: String(Date.now()), subject: dto.subject ?? "", body: dto.body, status: "draft", date: null, toUserId: dto.toUserId ?? null, toFarmId: dto.toFarmId ?? null, attachments: dto.attachments ?? null, created_at: new Date().toISOString() };
      messagesStore = [...messagesStore, msg];
      return msg;
    }
  },

  async getMessage(id: string): Promise<Message | null> {
    try {
      const res = await api.get<{ message: Message }>(`/messages/${id}`);
      return res.data.message;
    } catch (e) {
      if (isClientError(e)) throw e;
      await delay(300);
      return messagesStore.find((m) => m._id === id) ?? null;
    }
  },

  async sendMessage(id: string): Promise<Message> {
    try {
      const res = await api.patch<{ message: Message }>(`/messages/${id}/send`);
      return res.data.message;
    } catch (e) {
      if (isClientError(e)) throw e;
      await delay(500);
      messagesStore = messagesStore.map((m) => (m._id === id ? { ...m, status: "sent" } : m));
      return messagesStore.find((m) => m._id === id)!;
    }
  },

  async updateMessage(id: string, dto: UpdateMessageDto): Promise<Message> {
    try {
      const res = await api.patch<{ message: Message }>(`/messages/${id}`, dto);
      return res.data.message;
    } catch (e) {
      if (isClientError(e)) throw e;
      await delay(700);
      messagesStore = messagesStore.map((m) => (m._id === id ? { ...m, ...dto } : m));
      return messagesStore.find((m) => m._id === id)!;
    }
  },

  async deleteMessage(id: string): Promise<void> {
    try {
      await api.delete(`/messages/${id}`);
    } catch (e) {
      if (isClientError(e)) throw e;
      await delay(400);
      messagesStore = messagesStore.filter((m) => m._id !== id);
    }
  },

  async scheduleMessage(id: string, scheduledAt: string): Promise<Message> {
    try {
      const res = await api.post<{ message: Message }>(`/messages/${id}/schedule`, { scheduledAt });
      return res.data.message;
    } catch (e) {
      if (isClientError(e)) throw e;
      await delay(400);
      const updated = messagesStore.find((m) => m._id === id);
      if (!updated) throw new Error("Message not found");
      return { ...updated, date: scheduledAt };
    }
  },

  async getMessageStats(): Promise<MessageStats> {
    try {
      const res = await api.get<any>("/messages/stats");
      const data = res.data ?? {};
      return {
        sent: Number(data.sent ?? data.totalSent ?? 0),
        delivered: Number(data.delivered ?? data.totalDelivered ?? 0),
        opened: Number(data.opened ?? data.totalOpened ?? 0),
        clicked: Number(data.clicked ?? data.totalClicked ?? 0)
      };
    } catch (e) {
      if (isClientError(e)) throw e;
      await delay(250);
      return { sent: 0, delivered: 0, opened: 0, clicked: 0 };
    }
  }
};
