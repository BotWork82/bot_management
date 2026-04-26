import { useState } from "react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "../components/ui/dialog";
import { Pencil, Trash2, Search } from "lucide-react";
import { toast } from "sonner";

import {
  useCategoriesQuery,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory
} from "../hooks/categories";
import type { Category, CreateCategoryDto, UpdateCategoryDto } from "../services/categories.service";
import { Loader } from "../components/ui/loader";
import { pageIconMap } from "../components/ui/icons";
import { Pagination } from "../components/ui/pagination";

export function CategoriesPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { data: categoriesData, isLoading: categoriesLoading } = useCategoriesQuery(page, pageSize);
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  console.log(categoriesData)

  const categories = (categoriesData && ((categoriesData as any).content ?? (categoriesData as any).items)) || [];
  const total = (categoriesData && (categoriesData as any).total) || categories.length;
  const hasCategories = categories.length > 0;

  if (page > 1 && total > 0) {
    const last = Math.ceil(total / pageSize);
    if (page > last) setPage(last);
  }

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "" });

  const openForCreate = () => {
    setEditingCategory(null);
    setFormData({ name: "", description: "" });
    setDialogOpen(true);
  };

  const openForEdit = (cat: Category) => {
    setEditingCategory(cat);
    setFormData({ name: cat.name, description: cat.description ?? "" });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("Please enter a category name");
      return;
    }

    try {
      if (editingCategory) {
        await updateCategory.mutateAsync({ id: (editingCategory as any).id ?? (editingCategory as any)._id, dto: formData as UpdateCategoryDto });
        toast.success("Category updated successfully");
      } else {
        await createCategory.mutateAsync(formData as CreateCategoryDto);
        toast.success("Category created successfully");
      }
      setDialogOpen(false);
    } catch (error) {
      toast.error("Failed to save category. Please try again.");
    }
  };

  const openDelete = (cat: Category) => {
    setCategoryToDelete(cat);
    setDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!categoryToDelete) return;

    try {
      await deleteCategory.mutateAsync((categoryToDelete as any).id ?? (categoryToDelete as any)._id);
      toast.success(`Category "${categoryToDelete.name}" deleted successfully`);
      setDeleteOpen(false);
      setCategoryToDelete(null);
    } catch (error) {
      toast.error("Failed to delete category. Please try again.");
    }
  };

  const Icon = pageIconMap["/categories"];

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl border border-border/70 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              {Icon ? (
                <span className="h-8 w-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-lg">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
              ) : (
                <span className="h-8 w-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-lg">⬚</span>
              )}
              <span>Manage Categories</span>
            </CardTitle>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative w-full max-w-md sm:w-64">
              <Input
                placeholder="Search categories..."
                className="h-10 rounded-full pl-10 bg-muted/60 border-none w-full"
              />
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                <Search className="w-4 h-4 text-muted-foreground" />
              </span>
            </div>
            <Button
              className="h-10 rounded-full px-5 text-sm font-medium"
              onClick={openForCreate}
            >
              + Add Cat
            </Button>
          </div>
        </CardHeader>

        <CardContent className="px-6 pb-6">
          <div className="max-w-full overflow-x-hidden">
            <div className="overflow-x-auto">
              {categoriesLoading ? (
                <div className="py-8 flex items-center justify-center">
                  <Loader size="md" />
                </div>
              ) : (
                <>
                  {!hasCategories ? (
                    <div className="py-12 text-center text-sm text-muted-foreground">
                      Aucun element disponible dans cette liste.
                    </div>
                  ) : null}

                  {/* Table for md+ */}
                  <div className={`hidden md:block ${!hasCategories ? "hidden" : ""}`}>
                    <table className="w-full text-sm">
                      <thead className="text-xs text-muted-foreground border-b">
                        <tr className="h-10">
                          <th className="text-left font-medium">Name</th>
                          <th className="text-left font-medium">Description</th>
                          <th className="text-center font-medium w-32">Products</th>
                          <th className="text-left font-medium w-32">Created</th>
                          <th className="text-right font-medium w-24">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(categories || []).map((cat: Category) => (
                          <tr
                            key={(cat as any).id ?? (cat as any)._id}
                            className="border-b last:border-0 hover:bg-muted/40"
                          >
                            <td className="py-3 text-sm font-medium text-slate-800">
                              {cat.name}
                            </td>
                            <td className="py-3 text-xs text-muted-foreground">
                              {cat.description}
                            </td>
                            <td className="py-3 text-center">
                              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-600">
                                {(cat as any).products ?? (cat as any).products_count ?? 0}
                              </span>
                            </td>
                            <td className="py-3 text-xs text-muted-foreground">
                              {(cat as any).created ?? ((cat as any).created_at ? new Date((cat as any).created_at).toLocaleString() : "—")}
                            </td>
                            <td className="py-3">
                              <div className="flex items-center justify-end gap-3 text-slate-400">
                                <button
                                  className="hover:text-blue-600"
                                  type="button"
                                  onClick={() => openForEdit(cat)}
                                  aria-label={`Edit ${cat.name}`}
                                >
                                  <Pencil className="h-4 w-4" />
                                </button>
                                <button
                                  className="hover:text-red-500"
                                  type="button"
                                  onClick={() => openDelete(cat)}
                                  aria-label={`Delete ${cat.name}`}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Cards for mobile */}
                  <div className={`md:hidden space-y-3 ${!hasCategories ? "hidden" : ""}`}>
                    {(categories || []).map((cat: Category) => (
                      <Card key={(cat as any).id ?? (cat as any)._id} className="rounded-xl">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="text-base font-medium truncate">{cat.name}</div>
                              <div className="text-sm text-muted-foreground mt-1 line-clamp-3">{cat.description}</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button onClick={() => openForEdit(cat)} className="h-8 w-8 rounded-full bg-white/90 flex items-center justify-center shadow-sm text-slate-600" aria-label={`Edit ${cat.name}`}><Pencil className="h-4 w-4" /></button>
                              <button onClick={() => openDelete(cat)} className="h-8 w-8 rounded-full bg-white/90 flex items-center justify-center shadow-sm text-red-500" aria-label={`Delete ${cat.name}`}><Trash2 className="h-4 w-4" /></button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Pagination page={page} pageSize={pageSize} total={total} onPageChange={(p: number) => setPage(p)} onPageSizeChange={(s: number) => { setPageSize(s); setPage(1); }} />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Edit Category" : "Add New Category"}
            </DialogTitle>
            <DialogDescription>
              {editingCategory
                ? "Update the category details below"
                : "Create a new product category"}
            </DialogDescription>
          </DialogHeader>
          <div className="px-8 py-4 space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">
                Name <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Category name"
                className="h-11"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">
                Description
              </label>
              <textarea
                className="min-h-[90px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-slate-700 resize-none"
                placeholder="Category description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button
                variant="outline"
                className="h-10 px-6 text-sm"
                type="button"
              >
                Cancel
              </Button>
            </DialogClose>
            <Button className="h-10 px-6 text-sm" onClick={handleSave} disabled={createCategory.status === 'pending' || updateCategory.status === 'pending'}>
              {createCategory.status === 'pending' || updateCategory.status === 'pending' ? (
                <>
                  <Loader size="sm" />
                  <span className="ml-2">{editingCategory ? "Updating..." : "Creating..."}</span>
                </>
              ) : (
                editingCategory ? "Update" : "Create"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="w-full max-w-sm sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete category</DialogTitle>
            <DialogDescription>
              {categoryToDelete
                ? `Delete \u201c${categoryToDelete.name}\u201d? This cannot be undone.`
                : "Delete this category?"}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" className="h-9 px-5 text-sm" type="button">
                Cancel
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              className="h-9 px-5 text-sm"
              type="button"
              onClick={handleDelete}
              disabled={deleteCategory.status === 'pending'}
            >
              {deleteCategory.status === 'pending' ? (
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
    </div>
  );
}
