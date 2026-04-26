import { delay } from "../lib/delay";
import { api } from "./api";

export type Variant = { grammage: string; price: string | number };

export type Product = {
  _id?: string; // keep compatibility
  id?: string;
  title?: string; // backend prefers title
  name?: string; // keep compatibility
  description?: string;
  // price is always a Variant[] (price list)
  price?: Variant[];
  category?: string;
  category_id?: string;
  farm_id?: string;
  status?: string;
  variants?: Variant[]; // structured variants with grammage and price
  media?: string[]; // media ids
  image?: string; // fallback url
  video?: string; // fallback url
  created_at?: string;
};

let productsStore: Product[] = [
  {
    _id: "1",
    name: "Organic Honey",
    title: "Organic Honey",
    category: "Honey Products",
    status: "active",
    description: "Pure organic honey from local beekeepers",
    price: [
      { grammage: "250g", price: "$8.99" },
      { grammage: "500g", price: "$15.99" },
      { grammage: "1kg", price: "$28.99" }
    ],
    image:
      "https://images.pexels.com/photos/6157054/pexels-photo-6157054.jpeg?auto=compress&cs=tinysrgb&w=800"
  },
  {
    _id: "2",
    name: "Fresh Eggs",
    title: "Fresh Eggs",
    category: "Dairy & Eggs",
    status: "active",
    description: "Free-range eggs from happy chickens",
    price: [
      { grammage: "6 pack", price: "$4.99" },
      { grammage: "12 pack", price: "$8.99" }
    ],
    image:
      "https://images.pexels.com/photos/162760/egg-white-food-protein-162760.jpeg?auto=compress&cs=tinysrgb&w=800"
  },
  {
    _id: "3",
    name: "Farm Fresh Milk",
    title: "Farm Fresh Milk",
    category: "Dairy & Eggs",
    status: "active",
    description: "Pasteurized whole milk from grass-fed cows",
    price: [
      { grammage: "1L", price: "$3.49" },
      { grammage: "2L", price: "$5.99" }
    ],
    image:
      "https://images.pexels.com/photos/3738085/pexels-photo-3738085.jpeg?auto=compress&cs=tinysrgb&w=800"
  },
  {
    _id: "4",
    name: "Organic Vegetables Box",
    title: "Organic Vegetables Box",
    category: "Vegetables",
    status: "draft",
    description: "Weekly selection of seasonal organic vegetables",
    price: [
      { grammage: "Small", price: "$19.99" },
      { grammage: "Medium", price: "$29.99" },
      { grammage: "Large", price: "$39.99" }
    ],
    image:
      "https://images.pexels.com/photos/143133/pexels-photo-143133.jpeg?auto=compress&cs=tinysrgb&w=800"
  },
  {
    _id: "5",
    name: "Artisan Cheese",
    title: "Artisan Cheese",
    category: "Dairy & Eggs",
    status: "active",
    description: "Soft and hard cheeses from local dairies",
    price: [
      { grammage: "200g", price: "$7.99" },
      { grammage: "500g", price: "$17.99" }
    ],
    image: "https://images.pexels.com/photos/4109998/pexels-photo-4109998.jpeg?auto=compress&cs=tinysrgb&w=800"
  },
  {
    _id: "6",
    name: "Apple Basket",
    title: "Apple Basket",
    category: "Fruits",
    status: "active",
    description: "Seasonal apples freshly picked",
    price: [{ grammage: "1kg", price: "$4.99" }],
    image: "https://images.pexels.com/photos/102104/pexels-photo-102104.jpeg?auto=compress&cs=tinysrgb&w=800"
  },
  {
    _id: "7",
    name: "Beef Steak",
    title: "Beef Steak",
    category: "Meat",
    status: "active",
    description: "Grass-fed beef steak, tender and juicy",
    price: [
      { grammage: "250g", price: "$12.99" },
      { grammage: "500g", price: "$24.99" }
    ],
    image: "https://images.pexels.com/photos/209360/pexels-photo-209360.jpeg?auto=compress&cs=tinysrgb&w=800"
  },
  {
    _id: "8",
    name: "Salmon Fillet",
    title: "Salmon Fillet",
    category: "Seafood",
    status: "active",
    description: "Fresh salmon fillet, rich in omega-3",
    price: [
      { grammage: "200g", price: "$9.99" },
      { grammage: "400g", price: "$18.99" }
    ],
    image: "https://images.pexels.com/photos/459794/pexels-photo-459794.jpeg?auto=compress&cs=tinysrgb&w=800"
  },
  {
    _id: "9",
    name: "Chicken Breast",
    title: "Chicken Breast",
    category: "Meat",
    status: "active",
    description: "Boneless chicken breast, skinless and tender",
    price: [
      { grammage: "500g", price: "$7.99" },
      { grammage: "1kg", price: "$14.99" }
    ],
    image: "https://images.pexels.com/photos/461198/pexels-photo-461198.jpeg?auto=compress&cs=tinysrgb&w=800"
  },
  {
    _id: "10",
    name: "Pork Sausages",
    title: "Pork Sausages",
    category: "Meat",
    status: "active",
    description: "Homemade pork sausages, mildly spiced",
    price: [
      { grammage: "300g", price: "$5.99" },
      { grammage: "600g", price: "$11.49" }
    ],
    image: "https://images.pexels.com/photos/461198/pexels-photo-461198.jpeg?auto=compress&cs=tinysrgb&w=800"
  },
  {
    _id: "11",
    name: "Shrimp Cocktail",
    title: "Shrimp Cocktail",
    category: "Seafood",
    status: "active",
    description: "Chilled shrimp with cocktail sauce",
    price: [
      { grammage: "200g", price: "$11.99" },
      { grammage: "400g", price: "$22.99" }
    ],
    image: "https://images.pexels.com/photos/459794/pexels-photo-459794.jpeg?auto=compress&cs=tinysrgb&w=800"
  },
  {
    _id: "12",
    name: "Lobster Tail",
    title: "Lobster Tail",
    category: "Seafood",
    status: "active",
    description: "Fresh lobster tail, a delicacy",
    price: [
      { grammage: "1 piece", price: "$15.99" },
      { grammage: "2 pieces", price: "$29.99" }
    ],
    image: "https://images.pexels.com/photos/459794/pexels-photo-459794.jpeg?auto=compress&cs=tinysrgb&w=800"
  },
  {
    _id: "13",
    name: "Blueberries",
    title: "Blueberries",
    category: "Fruits",
    status: "active",
    description: "Fresh blueberries, rich in antiox_idants",
    price: [
      { grammage: "125g", price: "$3.99" },
      { grammage: "250g", price: "$6.99" }
    ],
    image: "https://images.pexels.com/photos/164077/pexels-photo-164077.jpeg?auto=compress&cs=tinysrgb&w=800"
  },
  {
    _id: "14",
    name: "Strawberries",
    title: "Strawberries",
    category: "Fruits",
    status: "active",
    description: "Juicy strawberries, perfect for desserts",
    price: [
      { grammage: "250g", price: "$4.99" },
      { grammage: "500g", price: "$8.99" }
    ],
    image: "https://images.pexels.com/photos/164077/pexels-photo-164077.jpeg?auto=compress&cs=tinysrgb&w=800"
  },
  {
    _id: "15",
    name: "Raspberries",
    title: "Raspberries",
    category: "Fruits",
    status: "active",
    description: "Fresh raspberries, sweet and tangy",
    price: [
      { grammage: "125g", price: "$3.49" },
      { grammage: "250g", price: "$5.99" }
    ],
    image: "https://images.pexels.com/photos/164077/pexels-photo-164077.jpeg?auto=compress&cs=tinysrgb&w=800"
  },
  {
    _id: "16",
    name: "Blackberries",
    title: "Blackberries",
    category: "Fruits",
    status: "active",
    description: "Organic blackberries, rich in flavor",
    price: [
      { grammage: "125g", price: "$3.49" },
      { grammage: "250g", price: "$5.99" }
    ],
    image: "https://images.pexels.com/photos/164077/pexels-photo-164077.jpeg?auto=compress&cs=tinysrgb&w=800"
  },
  {
    _id: "17",
    name: "Peach",
    title: "Peach",
    category: "Fruits",
    status: "active",
    description: "Fresh peaches, sweet and juicy",
    price: [
      { grammage: "1 piece", price: "$1.49" },
      { grammage: "6 pieces", price: "$8.49" }
    ],
    image: "https://images.pexels.com/photos/164077/pexels-photo-164077.jpeg?auto=compress&cs=tinysrgb&w=800"
  },
  {
    _id: "18",
    name: "Plum",
    title: "Plum",
    category: "Fruits",
    status: "active",
    description: "Juicy plums, perfect for snacking",
    price: [
      { grammage: "1 piece", price: "$0.99" },
      { grammage: "6 pieces", price: "$5.99" }
    ],
    image: "https://images.pexels.com/photos/164077/pexels-photo-164077.jpeg?auto=compress&cs=tinysrgb&w=800"
  },
  {
    _id: "19",
    name: "Apricot",
    title: "Apricot",
    category: "Fruits",
    status: "active",
    description: "Fresh apricots, sweet and tart",
    price: [
      { grammage: "1 piece", price: "$0.79" },
      { grammage: "6 pieces", price: "$4.79" }
    ],
    image: "https://images.pexels.com/photos/164077/pexels-photo-164077.jpeg?auto=compress&cs=tinysrgb&w=800"
  },
  {
    _id: "20",
    name: "Cherries",
    title: "Cherries",
    category: "Fruits",
    status: "active",
    description: "Sweet cherries, perfect for desserts",
    price: [
      { grammage: "250g", price: "$5.99" },
      { grammage: "500g", price: "$10.99" }
    ],
    image: "https://images.pexels.com/photos/164077/pexels-photo-164077.jpeg?auto=compress&cs=tinysrgb&w=800"
  }
];

export type CreateProductDto = {
  title: string;
  description?: string;
  // price is an array of Variant objects
  price?: Variant[];
  category_id: string;
  farm_id: string;
  mediaIds?: string[];
  variants?: Variant[];
  image?: File | null;
  video?: File | null;
};

export type UpdateProductDto = Partial<CreateProductDto> & { mediaIds?: string[] };

function buildProductFormData(dto: Partial<CreateProductDto>) {
  const fd = new FormData();
  if (dto.title) fd.append("title", String(dto.title));
  if ((dto as any).name && !dto.title) fd.append("title", String((dto as any).name));
  if (dto.description) fd.append("description", dto.description);
  if ((dto as any).category_id) fd.append("category_id", (dto as any).category_id);
  if ((dto as any).farm_id) fd.append("farm_id", (dto as any).farm_id);
  if (dto.variants) fd.append("variants", JSON.stringify(dto.variants));
  // price: append using bracket notation so backend parses array of objects from multipart
  if (dto.price !== undefined) {
    try {
      const prices = Array.isArray(dto.price) ? dto.price : [dto.price as any];
      prices.forEach((p, i) => {
        // if p is primitive, wrap
        const item = typeof p === "object" ? p : { grammage: "", price: p };
        if (item.grammage !== undefined) fd.append(`price[${i}][grammage]`, String(item.grammage));
        if (item.price !== undefined) fd.append(`price[${i}][price]`, String(item.price));
      });
    } catch {}
  }
  // support separate image & video fields (controller expects 'image' and 'video')
  if ((dto as any).image) {
    const f = (dto as any).image as File;
    if (f && f.type && !f.type.startsWith("image")) {
      throw new Error("Validation: 'image' must be an image file");
    }
    if (f) fd.append("image", f);
  }
  if ((dto as any).video) {
    const f = (dto as any).video as File;
    if (f && f.type && !f.type.startsWith("video")) {
      throw new Error("Validation: 'video' must be a video file");
    }
    if (f) fd.append("video", f);
  }
  // Debug: log FormData contents (keys + file meta) to help debugging what is sent to the API
  try {
    // Collect entries (FormData iterator may not be serializable directly)
    const entries: Array<any> = [];
    // Use (fd as any).entries() for TS compatibility
    for (const pair of (fd as any).entries()) {
      entries.push(pair);
    }
    console.groupCollapsed("[products.service] buildProductFormData -> FormData contents");
    entries.forEach(([k, v]: any) => {
      if (typeof File !== "undefined" && v instanceof File) {
        console.log(k, { name: v.name, type: v.type, size: v.size });
      } else {
        console.log(k, v);
      }
    });
    console.groupEnd();
  } catch (e) {
    // ignore logging errors
  }
  return fd;
}

function isClientError(e: any) {
  return e && e.response && typeof e.response.status === "number" && e.response.status >= 400 && e.response.status < 500;
}

export const productsService = {
  async getProducts(query?: { page?: number; take?: number; category_id?: string; farm_id?: string; q?: string }) {
    try {
      const params: any = {};
      if (query?.page) params.page = query.page;
      if (query?.take) params.take = query.take;
      if (query?.category_id) params.category_id = query.category_id;
      if (query?.farm_id) params.farm_id = query.farm_id;
      if (query?.q) params.q = query.q;
      const res = await api.get<any>(`/products`, { params });
      const data = res.data;
      // backend returns PaginationResponseDto with content
      const items: Product[] = data.content || data.items || []
      const total: number = data.total ?? data.totalItems ?? items.length;
      const page = data.page ?? query?.page ?? 1;
      const take = data.take ?? query?.take ?? items.length;
      return { items, total, page, take };
    } catch (e) {
      if (isClientError(e)) throw e;
      await delay(600);
      const items = productsStore.map((p) => p);
      const total = items.length;
      const page = query?.page || 1;
      const take = query?.take || items.length;
      const start = (page - 1) * take;
      const paged = items.slice(start, start + take);
      return { items: paged, total, page, take };
    }
  },

  async getProduct(id: string): Promise<Product | null> {
    try {
      const res = await api.get<{ product: Product }>(`/products/${id}`);
      return res.data.product;
    } catch (e) {
      if (isClientError(e)) throw e;
      await delay(300);
      return productsStore.find((p) => (p._id === id || p.id === id)) ?? null;
    }
  },

  async createProduct(dto: Partial<CreateProductDto>): Promise<Product> {
    try {
      // send multipart/form-data always (backend expects multipart)
      const fd = buildProductFormData(dto as Partial<CreateProductDto>);
      const res = await api.post<{ product: Product }>(`/products`, fd);
      return res.data.product;
    } catch (e) {
      if (isClientError(e)) throw e;
      if (e instanceof Error && e.message.startsWith("Validation:")) throw e;
      await delay(700);
      const product: Product = { _id: String(Date.now()), id: String(Date.now()), title: dto.title || (dto as any).name || "Untitled", name: (dto as any).name || dto.title, category_id: (dto as any).category_id || "", status: "draft", description: dto.description, price: (dto as any).price } as Product;
      productsStore = [...productsStore, product];
      return product;
    }
  },

  async updateProduct(id: string, dto: UpdateProductDto): Promise<Product> {
    try {
      // send multipart/form-data for updates as well (supports files and text fields)
      const fd = buildProductFormData(dto as Partial<CreateProductDto>);
      const res = await api.patch<{ product: Product }>(`/products/${id}`, fd);
      return res.data.product;
    } catch (e) {
      if (isClientError(e)) throw e;
      if (e instanceof Error && e.message.startsWith("Validation:")) throw e;
      await delay(700);
      productsStore = productsStore.map((p) => (p._id === id || p.id === id ? { ...p, ...dto } as Product : p));
      return productsStore.find((p) => (p._id === id || p.id === id))!;
    }
  },

  async deleteProduct(id: string): Promise<void> {
    try {
      await api.delete(`/products/${id}`);
    } catch (e) {
      if (isClientError(e)) throw e;
      await delay(500);
      productsStore = productsStore.filter((p) => p._id !== id && p.id !== id);
    }
  }
};
