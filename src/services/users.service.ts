import { delay } from "../lib/delay";
import { api } from "./api";

export type User = {
  _id: string;
  name: string;
  email: string;
  firstname?: string;
  lastname?: string;
  role: "admin" | "user";
  status: "active" | "inactive" | "VERIFIED" | "PENDING_VERIFICATION";
  created: string;
  lastLogin: string;
};

let usersStore: User[] = [
  {
    _id: "1",
    name: "Admin User",
    email: "admin@demo.com",
    role: "admin",
    status: "active",
    created: "2024-01-01",
    lastLogin: "2024-01-15 10:30"
  },
  {
    _id: "2",
    name: "Regular User",
    email: "user@demo.com",
    role: "user",
    status: "active",
    created: "2024-01-05",
    lastLogin: "2024-01-14 15:45"
  },
  {
    _id: "3",
    name: "John Smith",
    email: "john@example.com",
    role: "user",
    status: "active",
    created: "2024-01-08",
    lastLogin: "2024-01-13 09:20"
  },
  {
    _id: "4",
    name: "Maria Garcia",
    email: "maria@example.com",
    role: "user",
    status: "inactive",
    created: "2024-01-10",
    lastLogin: "2024-01-10 14:00"
  },
  {
    _id: "5",
    name: "Lina Chen",
    email: "lina.chen@example.com",
    role: "user",
    status: "active",
    created: "2024-02-02",
    lastLogin: "2024-02-10 08:12"
  },
  {
    _id: "6",
    name: "Olivier Dupont",
    email: "olivier@example.fr",
    role: "user",
    status: "active",
    created: "2024-02-10",
    lastLogin: "2024-02-14 17:05"
  }
];

export type CreateUserDto = Omit<User, "_id" | "created" | "lastLogin">;
export type UpdateUserDto = Partial<CreateUserDto>;
export type UserActivityItem = { title: string; description?: string; time?: string };

function isClientError(e: any) {
  return e && e.response && typeof e.response.status === "number" && e.response.status >= 400 && e.response.status < 500;
}

export const usersService = {
  async getMyAccount(): Promise<User | null> {
    try {
      const res = await api.get<{ user: User }>(`/users/my-account`);
      return res.data.user;
    } catch (e) {
      if (isClientError(e)) throw e;
      await delay(200);
      return usersStore[0] ?? null;
    }
  },

  async updateMyPassword(dto: { old_password: string; new_password: string }): Promise<User | null> {
    try {
      const res = await api.patch<{ user: User }>(`/users/my-account/password`, dto);
      return res.data.user;
    } catch (e) {
      if (isClientError(e)) throw e;
      await delay(300);
      return usersStore[0] ?? null;
    }
  },

  async resetPasswordForUser(_id: string): Promise<{ password: string } | null> {
    try {
      const res = await api.patch<{ password: string }>(`/users/password`, { id: _id });
      return res.data;
    } catch (e) {
      if (isClientError(e)) throw e;
      await delay(300);
      return { password: "temporary-password" };
    }
  },

  async getUsers(query?: { page?: number; take?: number }) {
    try {
      const params: any = {};
      if (query?.page) params.page = query.page;
      if (query?.take) params.take = query.take;
      const res = await api.get<any>(`/users`, { params });
      // Support both formats:
      // - API returns { items: User[], total }
      // - API returns User[] directly
      if (Array.isArray(res.data)) {
        return res.data as User[];
      }
      if ((res.data && Array.isArray(res.data.items))) return  res.data.items as User[] | []
      return res.data
    } catch (e) {
      if (isClientError(e)) throw e;
      await delay(400);
      return [...usersStore];
    }
  },

  async getUser(_id: string): Promise<User | null> {
    try {
      const res = await api.get<{ user: User }>(`/users/${_id}`);
      return res.data.user;
    } catch (e) {
      if (isClientError(e)) throw e;
      await delay(300);
      return usersStore.find((u) => u._id === _id) ?? null;
    }
  },

  async createUser(dto: CreateUserDto): Promise<User> {
    try {
      const res = await api.post<{ user: User }>(`/users`, dto);
      return res.data.user;
    } catch (e) {
      if (isClientError(e)) throw e;
      await delay(700);
      const _id = String(Date.now());
      const user: User = {
        _id,
        name: dto.name,
        email: dto.email,
        role: dto.role,
        status: dto.status as any,
        created: new Date().toISOString().split("T")[0],
        lastLogin: "—"
      };
      usersStore = [...usersStore, user];
      return user;
    }
  },

  async updateUser(_id: string, dto: UpdateUserDto): Promise<User> {
    try {
      const res = await api.patch<{ user: User }>(`/users/${_id}`, dto);
      return res.data.user;
    } catch (e) {
      if (isClientError(e)) throw e;
      await delay(700);
      usersStore = usersStore.map((u) => (u._id === _id ? { ...u, ...dto } : u));
      return usersStore.find((u) => u._id === _id)!;
    }
  },

  async deleteUser(_id: string): Promise<void> {
    try {
      await api.delete(`/users/${_id}`);
    } catch (e) {
      if (isClientError(e)) throw e;
      await delay(500);
      usersStore = usersStore.filter((u) => u._id !== _id);
    }
  },

  async getUserActivity(_id: string): Promise<UserActivityItem[]> {
    try {
      const res = await api.get<any>(`/users/${_id}/activity`);
      const data = res.data;
      const items = data.items ?? data.content ?? data.activities ?? (Array.isArray(data) ? data : []);
      return (items || []).map((item: any) => ({
        title: String(item.title ?? item.action ?? "Activity"),
        description: item.description,
        time: item.time ?? item.createdAt
      }));
    } catch (e) {
      if (isClientError(e)) throw e;
      await delay(250);
      return [];
    }
  }
};
