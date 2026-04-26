import { delay } from "../lib/delay";
import { api } from "./api";

export type Category = {
  _id: string;
  name: string;
  description?: string;
  products?: number;
  products_count?: number;
  created?: string;
  created_at?: string;
};

let categoriesStore: Category[] = [
  { _id: "1", name: "Honey Products", description: "All types of honey and bee products", products: 12, created: "2024-01-15" },
  { _id: "2", name: "Dairy & Eggs", description: "Fresh dairy products and eggs", products: 24, created: "2024-01-10" },
  { _id: "3", name: "Vegetables", description: "Fresh organic vegetables", products: 45, created: "2024-01-08" },
  { _id: "4", name: "Fruits", description: "Seasonal and tropical fruits", products: 32, created: "2024-01-05" },
  { _id: "5", name: "Meat", description: "Farm-raised meat products", products: 18, created: "2024-01-03" },
  { _id: "6", name: "Grains", description: "Whole grains and cereals", products: 15, created: "2024-01-01" },
  { _id: "7", name: "Seafood", description: "Fresh caught and farmed seafood", products: 9, created: "2024-02-01" },
  { _id: "8", name: "Deli", description: "Prepared foods and charcuterie", products: 5, created: "2024-02-10" }
];

export type CreateCategoryDto = Omit<Category, "id" | "products" | "created">;
export type UpdateCategoryDto = Partial<CreateCategoryDto>;

function isClientError(e: any) {
  return e && e.response && typeof e.response.status === "number" && e.response.status >= 400 && e.response.status < 500;
}

export const categoriesService = {
  async getCategories(query?: { page?: number; take?: number }): Promise<{ items: Category[]; total: number; page?: number; take?: number }> {
    try {
      const params: any = {};
      if (query?.page) params.page = query.page;
      if (query?.take) params.take = query.take;
      const res = await api.get<any>("/categories", { params });
      const data = res.data;
      // normalize { categories } or { items }
      const items: Category[] = data.categories ?? data.items ?? [];
      const total: number = data.total ?? items.length;
      if(data.categories && !data.items) return  { items, total, page: data.page ?? query?.page ?? 1, take: data.take ?? query?.take ?? items.length };
      return data;
    } catch (e) {
      if (isClientError(e)) throw e;
      // keep delay for UX parity and return local store
      await delay(300);
      const items = [...categoriesStore];
      const total = items.length;
      const page = query?.page || 1;
      const take = query?.take || items.length;
      const start = (page - 1) * take;
      const paged = items.slice(start, start + take);
      return { items: paged, total, page, take };
    }
  },

  async createCategory(dto: CreateCategoryDto): Promise<Category> {
    try {
      const res = await api.post<{ category: Category }>("/categories", dto);
      return res.data.category;
    } catch (e) {
      if (isClientError(e)) throw e;
      await delay(500);
      const cat: Category = { id: String(Date.now()), products: 0, created: new Date().toISOString().split("T")[0], ...dto } as Category;
      categoriesStore = [...categoriesStore, cat];
      return cat;
    }
  },

  async updateCategory(id: string, dto: UpdateCategoryDto): Promise<Category> {
    try {
      const res = await api.patch<{ category: Category }>(`/categories/${id}`, dto);
      return res.data.category;
    } catch (e) {
      if (isClientError(e)) throw e;
      await delay(500);
      categoriesStore = categoriesStore.map((c) => (c._id === id ? { ...c, ...dto } : c));
      return categoriesStore.find((c) => c._id === id)!;
    }
  },

  async deleteCategory(id: string): Promise<void> {
    try {
      await api.delete(`/categories/${id}`);
    } catch (e) {
      if (isClientError(e)) throw e;
      await delay(300);
      categoriesStore = categoriesStore.filter((c) => c._id !== id);
    }
  }
};
