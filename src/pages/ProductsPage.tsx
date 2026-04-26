import React, { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Pencil, Trash2, Image, Video, Search, Eye } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "../components/ui/dialog";

import {
  useProductsQuery,
  useCreateProduct,
  useUpdateProduct, useDeleteProduct
} from "../hooks/products";
import { useCategoriesQuery } from "../hooks/categories";
import { useFarmsQuery } from "../hooks/farms";
import type { Product, CreateProductDto, UpdateProductDto, Variant } from "../services/products.service";
import { Loader } from "../components/ui/loader";
import { getApiErrorMessage } from "../lib/apiError";
import { Pagination } from "../components/ui/pagination";
import { api } from "../services/api";
import MediaPreview from "../components/MediaPreview";

export function ProductsPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const { data: productsData, isLoading: productsLoading } = useProductsQuery(page, pageSize);
  const { data: categoriesData } = useCategoriesQuery(1, 100);
  const { data: farmsData } = useFarmsQuery(1, 100);
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct(); // reuse update for soft-delete

  const products = (productsData && ((productsData as any).items ?? (productsData as any).content)) || [];
  const total = (productsData && (productsData as any).total) || products.length;

  console.log(products)

  if (page > 1 && total > 0) {
    const last = Math.ceil(total / pageSize);
    if (page > last) setPage(last);
  }

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    farm: "",
    description: "",
    grammage: "",
    price: [] as { grammage: string; price: string }[],
    imageFile: null as File | null,
    videoFile: null as File | null
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);

  // handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0];
    setFormData((prev) => ({ ...prev, imageFile: f ?? null }));
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(f ? URL.createObjectURL(f) : null);
  };

  // handle video selection
  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0];
    setFormData((prev) => ({ ...prev, videoFile: f ?? null }));
    if (videoPreview) URL.revokeObjectURL(videoPreview);
    setVideoPreview(f ? URL.createObjectURL(f) : null);
  };

  // cleanup previews on unmount
  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      if (videoPreview) URL.revokeObjectURL(videoPreview);
    };
  }, [imagePreview, videoPreview]);

  const parseVariants = (variants?: any[]) => {
    if (!variants) return [] as { grammage: string; price: string }[];
    return variants.map((v) => {
      if (typeof v === "string") {
        const [g, p] = v.split(":");
        if (p === undefined) return { grammage: v, price: "" };
        return { grammage: g.trim(), price: p.trim() };
      }
      return { grammage: (v as any).grammage ?? String(v), price: (v as any).price ?? "" };
    });
  };

  const handleEdit = (product: Product) => {
    // normalize category and farm values to ids (backend expects category_id and farm_id)
    const catField = (product as any).category ?? (product as any).category_id ?? undefined;
    let categoryId = "";
    if (typeof catField === "string") categoryId = catField;
    else if (catField && typeof catField === "object") categoryId = catField.id ?? catField._id ?? "";

    const farmField = (product as any).farm ?? (product as any).farm_id ?? undefined;
    let farmId = "";
    if (typeof farmField === "string") farmId = farmField;
    else if (farmField && typeof farmField === "object") farmId = farmField.id ?? farmField._id ?? "";

    setEditingProduct(product);
    setFormData({
      name: product.name ?? "",
      category: categoryId,
      farm: farmId,
      description: (product as any).description ?? "",
      grammage: "",
      price: parseVariants((product as any).variants ?? (product as any).price as any[] | undefined),
      imageFile: null,
      videoFile: null
    });
    // show existing media previews if available
    setImagePreview((product as any).image ?? null);
    setVideoPreview((product as any).video ?? null);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingProduct(null);
    setFormData({ name: "", category: "", farm: "", description: "", grammage: "", price: [], imageFile: null, videoFile: null });
    setImagePreview(null);
    setVideoPreview(null);
    setIsModalOpen(true);
  };

  const addVariantRow = () => {
    setFormData((prev) => ({ ...prev, price: [...(prev.price || []), { grammage: "", price: "" }] }));
  };

  const updateVariant = (index: number, key: "grammage" | "price", value: string) => {
    setFormData((prev) => {
      const nextPrice = [...(prev.price || [])];
      nextPrice[index] = { ...nextPrice[index], [key]: value };
      return { ...prev, price: nextPrice };
    });
  };

  const removeVariant = (index: number) => {
    setFormData((prev) => ({ ...prev, price: (prev.price || []).filter((_, i) => i !== index) }));
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.category.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }
    // when creating a product, price and farm are required by the backend
    if (!editingProduct) {
      if (!formData.farm || !formData.farm.trim()) {
        toast.error("Please select a farm");
        return;
      }
    }

    try {
      // convert structured variants to strings expected by service
      const variantObjects = formData.price || [];

      // prepare DTO and attach image/video fields expected by backend
      const imageFile = formData.imageFile;
      const videoFile = formData.videoFile;

      // if files present, validate there is at most 1 image and at most 1 video
      if (imageFile && imageFile.type && !imageFile.type.startsWith("image")) {
        toast.error("Selected image file is not a valid image");
        return;
      }
      if (videoFile && videoFile.type && !videoFile.type.startsWith("video")) {
        toast.error("Selected video file is not a valid video");
        return;
      }

      const dtoBase: any = {
        title: formData.name,
        name: formData.name,
        category_id: formData.category,
        farm_id: formData.farm,
        description: formData.description,
        variants: variantObjects
      };
      // price must be an array of Variant objects. Send as array if any rows exist.
      if (Array.isArray(formData.price) && formData.price.length > 0) {
        dtoBase.price = formData.price;
      }
      if (imageFile) dtoBase.image = imageFile;
      if (videoFile) dtoBase.video = videoFile;

      if (editingProduct) {
        await updateProduct.mutateAsync({ id: (editingProduct as any)._id ?? (editingProduct as any).id, dto: dtoBase as UpdateProductDto });
        toast.success("Product updated successfully");
      } else {
        dtoBase.status = "draft";
        await createProduct.mutateAsync(dtoBase as CreateProductDto);
        toast.success("Product created successfully");
      }
      setIsModalOpen(false);
    } catch (error) {
      toast.error(getApiErrorMessage(error) || "Failed to save product. Please try again.");
    }
  };

  const openDeleteDialog = (product: Product) => {
    setProductToDelete(product);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;

    try {
      await deleteProduct.mutateAsync((productToDelete as any)._id ?? (productToDelete as any).id);
      toast.success(`Product "${productToDelete.name}" has been disabled`);
      setIsDeleteOpen(false);
      setProductToDelete(null);
    } catch (error) {
      toast.error(getApiErrorMessage(error) || "Failed to delete product. Please try again.");
    }
  };

  function resolveProductMediaSrc(ref?: string | null) {
    if (!ref) return "";
    const s = String(ref);
    if (s.startsWith("http") || s.startsWith("/")) return s;
    const base = (api.defaults.baseURL || "").replace(/\/$/, "");
    return `${base}/media/${s}/download`;
  }

  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const openDetail = (p: Product) => { setDetailProduct(p); setIsDetailOpen(true); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight"> </h1>
        <Button
          onClick={handleAdd}
          className="rounded-full px-5 h-10 text-sm font-medium"
        >
          + Add Product
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative w-full max-w-md">
          <Input placeholder="Search products..." className="pl-10 rounded-full" />
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
            <Search className="w-4 h-4 text-muted-foreground" />
          </span>
        </div>
      </div>

      {productsLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader size="md" />
        </div>
      ) : products.length === 0 ? (
        <Card className="rounded-2xl border border-border/70 shadow-sm">
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            Aucun element disponible dans cette liste.
          </CardContent>
        </Card>
      ) : (
        <>
        <div className="grid gap-5 lg:grid-cols-4 md:grid-cols-2 grid-cols-1">
          {(products || []).map((product: Product) => {
            const cardImgSrc = resolveProductMediaSrc(product.image as unknown as string) || (product.image as any) || "";
            const cardVideoSrc = product.video ? resolveProductMediaSrc(product.video as unknown as string) : "";
            return (
              <Card
                key={product._id}
                className="overflow-hidden rounded-2xl border-border"
              >
                <div className="relative h-48 w-full overflow-hidden cursor-pointer" onClick={() => openDetail(product)}>
                  {cardImgSrc ? (
                    <MediaPreview srcRef={product.image as unknown as string} type="image" className="h-full w-full object-cover" alt={product.title || product.name} />
                  ) : cardVideoSrc ? (
                    <MediaPreview srcRef={product.video as unknown as string} type="video" className="h-full w-full object-cover" muted autoPlay loop />
                  ) : (
                    <div className="h-full w-full bg-slate-100" />
                  )}
                  <div className="absolute right-3 top-3 flex flex-col gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleEdit(product); }}
                      className="h-8 w-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-sm transition-colors"
                      title="Edit product"
                      type="button"
                    >
                      <Pencil className="h-4 w-4 text-slate-600" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); openDetail(product); }}
                      className="h-8 w-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-sm transition-colors"
                      title="View details"
                      type="button"
                    >
                      <Eye className="h-4 w-4 text-slate-600" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); openDeleteDialog(product); }}
                      className="h-8 w-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-sm transition-colors"
                      title="Delete product"
                      type="button"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </button>
                  </div>
                </div>
                <CardContent className="p-4 space-y-2">
                  <div>
                    <div className="text-sm text-muted-foreground">
                      {typeof (product as any).category === 'object' ? (product as any).category.name : (product as any).category}
                    </div>
                    <div className="font-semibold">{product.title || product.name}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {product.description}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {((product as any).variants ?? (product as any).price ?? []).map((variant: Variant) => (
                      <span
                        key={`${variant.grammage}-${variant.price}`}
                        className="rounded-full bg-slate-100 px-3 py-1 text-xs"
                      >
                        {variant.grammage}{variant.price ? ` \u2022 ${variant.price}` : ""}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        <Pagination page={page} pageSize={pageSize} total={total} onPageChange={(p: number) => setPage(p)} onPageSizeChange={(s: number) => { setPageSize(s); setPage(1); }} />
        </>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="w-full max-w-full sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? "Edit Product" : "Add New Product"}
            </DialogTitle>
            <DialogDescription>
              {editingProduct
                ? "Update the product details below"
                : "Fill in the product details below"}
            </DialogDescription>
          </DialogHeader>

          <div className="px-8 py-4 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">
                  Name <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="Product name"
                  className="h-11"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm text-slate-700"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                >
                  <option value="">Select category</option>
                  {((categoriesData && (categoriesData as any).content) || []).map((cat: any) => (
                    <option key={cat._id ?? cat.id} value={cat._id ?? cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">
                  Farm *
                </label>
                <select
                  className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm text-slate-700"
                  value={formData.farm}
                  onChange={(e) =>
                    setFormData({ ...formData, farm: e.target.value })
                  }
                >
                  <option value="">Select farm</option>
                  {((farmsData && (farmsData as any).content) || []).map((f: any) => (
                    <option key={f._id ?? f.id} value={f._id ?? f.id}>{f.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">
                Description
              </label>
              <textarea
                className="min-h-[90px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-slate-700 resize-none"
                placeholder="Product description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-700">
                  Price List
                </label>
                <button
                  type="button"
                  className="h-9 px-4 inline-flex items-center justify-center rounded-md border border-input text-sm text-slate-700 bg-white hover:bg-slate-50"
                  onClick={addVariantRow}
                >
                  Add Price
                </button>
              </div>
              <div className="space-y-2">
                {(formData.price || []).map((v, idx) => (
                  <div key={idx} className="grid grid-cols-[1fr,90px,36px] sm:grid-cols-[1fr,120px,40px] gap-2 items-center">
                    <input
                      value={v.grammage}
                      onChange={(e) => updateVariant(idx, 'grammage', e.target.value)}
                      placeholder="Grammage (e.g., 500g)"
                      className="h-10 rounded-md border border-input px-3 text-sm min-w-0 truncate"
                    />
                    <input
                      value={v.price}
                      onChange={(e) => updateVariant(idx, 'price', e.target.value)}
                      placeholder="Price (e.g., $5)"
                      className="h-10 rounded-md border border-input px-3 text-sm min-w-0"
                    />
                    <button
                      type="button"
                      onClick={() => removeVariant(idx)}
                      className="h-9 w-9 sm:h-10 sm:w-10 rounded-md text-red-500 flex items-center justify-center"
                    >
                      ✖
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2 pb-2">
              <label className="text-xs font-medium text-slate-700">Photos & Videos</label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Image</label>
                  <label className="block">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="sr-only"
                    />
                    <div className="flex h-40 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 text-xs text-muted-foreground cursor-pointer hover:bg-slate-100">
                      {imagePreview ? (
                        <img src={imagePreview} className="h-full w-full object-cover" alt="Selected image" />
                      ) : (
                        <>
                          <Image className="h-8 w-8 mb-2 text-muted-foreground" />
                          <div className="font-medium text-slate-700 mb-1">Click to select an image</div>
                          <div className="text-[11px] text-muted-foreground">PNG, JPG up to 10MB</div>
                        </>
                      )}
                    </div>
                  </label>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Video</label>
                  <label className="block">
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoChange}
                      className="sr-only"
                    />
                    <div className="flex h-40 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 text-xs text-muted-foreground cursor-pointer hover:bg-slate-100">
                      {videoPreview ? (
                        <video src={videoPreview} className="h-full w-full object-cover" controls />
                      ) : (
                        <>
                          <Video className="h-8 w-8 mb-2 text-muted-foreground" />
                          <div className="font-medium text-slate-700 mb-1">Click to select a video</div>
                          <div className="text-[11px] text-muted-foreground">MP4 up to 10MB</div>
                        </>
                      )}
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button
                variant="outline"
                className="h-10 px-6 text-sm"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
            </DialogClose>
            <Button className="h-10 px-6 text-sm" onClick={handleSave} disabled={createProduct.status === 'pending' || updateProduct.status === 'pending'}>
              {createProduct.status === 'pending' || updateProduct.status === 'pending' ? (
                <>
                  <Loader size="sm" />
                  <span className="ml-2">{editingProduct ? "Updating..." : "Creating..."}</span>
                </>
              ) : (
                editingProduct ? "Update Product" : "Create Product"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="w-full max-w-sm sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete product</DialogTitle>
            <DialogDescription>
              {productToDelete
                ? `Are you sure you want to disable \u201c${productToDelete.name}\u201d? The product will be marked as inactive.`
                : "Are you sure you want to disable this product?"}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button
                variant="outline"
                className="h-9 px-5 text-sm"
                type="button"
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              className="h-9 px-5 text-sm"
              type="button"
              onClick={handleConfirmDelete}
              disabled={updateProduct.status === 'pending'}
            >
              {updateProduct.status === 'pending' ? (
                <>
                  <Loader size="sm" />
                  <span className="ml-2">Deleting...</span>
                </>
              ) : (
                "Confirm"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Product detail modal (read-only) */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="w-full max-w-lg">
          <DialogHeader>
            <DialogTitle>Product details</DialogTitle>
            <DialogDescription>Details of the selected product</DialogDescription>
          </DialogHeader>
          <div className="px-6 py-4 space-y-4">
            {detailProduct && (
              <div className="space-y-3">
                <div className="w-full rounded-lg overflow-hidden bg-slate-100 h-56">
                  {detailProduct.video ? (
                    <MediaPreview srcRef={detailProduct.video as unknown as string} type="video" controls className="h-full w-full object-cover" />
                  ) : (
                    <MediaPreview srcRef={detailProduct.image as unknown as string} type="image" className="h-full w-full object-cover" alt={detailProduct.name} />
                  )}
                </div>
                <div>
                  <div className="text-lg font-semibold">{detailProduct.title || detailProduct.name}</div>
                  <div className="text-sm text-muted-foreground">Category: {typeof (detailProduct as any).category === 'object' ? (detailProduct as any).category.name : (detailProduct as any).category}</div>
                  <div className="text-sm text-muted-foreground">Farm: {typeof (detailProduct as any).farm === 'object' ? (detailProduct as any).farm.name : (detailProduct as any).farm}</div>
                </div>
                <div>
                  <div className="text-sm font-medium">Description</div>
                  <div className="text-sm text-muted-foreground">{detailProduct.description}</div>
                </div>
                <div>
                  <div className="text-sm font-medium">Price List</div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(detailProduct.price ?? detailProduct.variants ?? []).map((v: any) => (
                      <span key={`${v.grammage}-${v.price}`} className="rounded-full bg-slate-100 px-3 py-1 text-xs">{v.grammage}{v.price ? ` • ${v.price}` : ''}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" className="h-9 px-4">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
