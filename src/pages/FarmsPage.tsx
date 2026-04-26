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
import { Pencil, Trash2, Search, User as UserIcon, Calendar } from "lucide-react";
import { toast } from "sonner";

import { useFarmsQuery, useCreateFarm, useUpdateFarm, useDeleteFarm } from "../hooks/farms";
import type { Farm, CreateFarmDto, UpdateFarmDto } from "../services/farms.service";
import { Loader } from "../components/ui/loader";
import { pageIconMap } from "../components/ui/icons";
import { Pagination } from "../components/ui/pagination";

export function FarmsPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { data: farmsData, isLoading: farmsLoading } = useFarmsQuery(page, pageSize);
  const createFarm = useCreateFarm();
  const updateFarm = useUpdateFarm();
  const deleteFarm = useDeleteFarm();

  const farms = (farmsData && ((farmsData as any).content ?? (farmsData as any).items)) || [];
  const total = (farmsData && (farmsData as any).total) || farms.length;
  const hasFarms = farms.length > 0;

  if (page > 1 && total > 0) {
    const last = Math.ceil(total / pageSize);
    if (page > last) setPage(last);
  }

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFarm, setEditingFarm] = useState<Farm | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [farmToDelete, setFarmToDelete] = useState<Farm | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "" });

  const Icon = pageIconMap["/farms"];

  const openForCreate = () => {
    setEditingFarm(null);
    setFormData({ name: "", description: "" });
    setDialogOpen(true);
  };

  const openForEdit = (farm: Farm) => {
    setEditingFarm(farm);
    setFormData({ name: farm.name, description: farm.description ?? "" });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("Please enter a farm name");
      return;
    }

    try {
      if (editingFarm) {
        await updateFarm.mutateAsync({ id: (editingFarm as any)._id ?? (editingFarm as any).id, dto: formData as UpdateFarmDto });
        toast.success("Farm updated successfully");
      } else {
        await createFarm.mutateAsync(formData as CreateFarmDto);
        toast.success("Farm created successfully");
      }
      setDialogOpen(false);
    } catch (error) {
      toast.error("Failed to save farm. Please try again.");
    }
  };

  const openDelete = (farm: Farm) => {
    setFarmToDelete(farm);
    setDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!farmToDelete) return;

    try {
      await deleteFarm.mutateAsync((farmToDelete as any)._id ?? (farmToDelete as any).id);
      toast.success(`Farm "${farmToDelete.name}" deleted successfully`);
      setDeleteOpen(false);
      setFarmToDelete(null);
    } catch (error) {
      toast.error("Failed to delete farm. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl border border-border/70 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              {Icon ? (
                <span className="h-8 w-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-lg">
                  <Icon className="h-5 w-5" />
                </span>
              ) : (
                <span className="h-8 w-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-lg">🏠</span>
              )}
              <span>Manage Farms</span>
            </CardTitle>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative w-full max-w-md sm:w-64">
              <Input
                placeholder="Search farms..."
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
              + Add Farm
            </Button>
          </div>
        </CardHeader>

        <CardContent className="px-6 pb-6">
          <div className="overflow-x-auto">
            {farmsLoading ? (
              <div className="py-8 flex items-center justify-center">
                <Loader size="md" />
              </div>
            ) : (
              <>
                {!hasFarms ? (
                  <div className="py-12 text-center text-sm text-muted-foreground">
                    Aucun element disponible dans cette liste.
                  </div>
                ) : null}

                {/* Table for md+ */}
                <div className={`hidden md:block ${!hasFarms ? "hidden" : ""}`}>
                  <table className="w-full text-sm">
                    <thead className="text-xs text-muted-foreground border-b">
                      <tr className="h-10">
                        <th className="text-left font-medium">Farm Name</th>
                        <th className="text-left font-medium">Description</th>
                        <th className="text-left font-medium">Owner</th>
                        <th className="text-center font-medium w-32">Products</th>
                        <th className="text-left font-medium w-36">Created</th>
                        <th className="text-right font-medium w-24">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(farms || []).map((farm: Farm) => (
                        <tr
                          key={farm._id}
                          className="border-b last:border-0 hover:bg-muted/40"
                        >
                          <td className="py-3 text-sm font-medium text-slate-800">
                            {farm.name}
                          </td>
                          <td className="py-3 text-xs text-muted-foreground">
                            {farm.description}
                          </td>
                          <td className="py-3 text-xs text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <span className="h-6 w-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs"><UserIcon className="h-3 w-3" /></span>
                              <span className="truncate">{(farm as any).owner?.email ?? (farm as any).owner ?? "—"}</span>
                            </div>
                          </td>
                          <td className="py-3 text-center">
                            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-600">
                              {(farm as any).products ?? (farm as any).products_count ?? 0}
                            </span>
                          </td>
                          <td className="py-3 text-xs text-muted-foreground">
                            {(farm as any).created ? new Date((farm as any).created).toLocaleString() : ((farm as any).created_at ? new Date((farm as any).created_at).toLocaleString() : "—")}
                          </td>
                          <td className="py-3">
                            <div className="flex items-center justify-end gap-3 text-slate-400">
                              <button
                                className="hover:text-blue-600"
                                type="button"
                                onClick={() => openForEdit(farm)}
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                className="hover:text-red-500"
                                type="button"
                                onClick={() => openDelete(farm)}
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
                <div className={`md:hidden space-y-3 ${!hasFarms ? "hidden" : ""}`}>
                  {(farms || []).map((farm: Farm) => (
                    <Card key={farm._id} className="rounded-xl">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-base font-medium truncate">{farm.name}</div>
                            <div className="text-sm text-muted-foreground mt-1 line-clamp-2">{farm.description}</div>
                            <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                              <UserIcon className="h-3 w-3 text-muted-foreground" />
                              <span className="truncate">{(farm as any).owner?.email ?? (farm as any).owner ?? "—"}</span>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              <span>{(farm as any).created ? new Date((farm as any).created).toLocaleDateString() : ((farm as any).created_at ? new Date((farm as any).created_at).toLocaleDateString() : "—")}</span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <div className="text-xs text-muted-foreground">{(farm as any).products ?? (farm as any).products_count ?? 0} products</div>
                            <div className="flex items-center gap-2">
                              <button onClick={() => openForEdit(farm)} className="h-8 w-8 rounded-full bg-white/90 flex items-center justify-center shadow-sm text-slate-600"><Pencil className="h-4 w-4" /></button>
                              <button onClick={() => openDelete(farm)} className="h-8 w-8 rounded-full bg-white/90 flex items-center justify-center shadow-sm text-red-500"><Trash2 className="h-4 w-4" /></button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </div>
         </CardContent>
      </Card>

      <Pagination page={page} pageSize={pageSize} total={total} onPageChange={(p: number) => setPage(p)} onPageSizeChange={(s: number) => { setPageSize(s); setPage(1); }} />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="">
          <DialogHeader>
            <DialogTitle>
              {editingFarm ? "Edit Farm" : "Add New Farm"}
            </DialogTitle>
            <DialogDescription>
              {editingFarm
                ? "Update the farm details below"
                : "Register a new farm partner"}
            </DialogDescription>
          </DialogHeader>
          <div className="px-8 py-4 space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">
                Farm Name <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Farm name"
                className="h-11"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            {/* backend does not accept location; keep only name + description */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">
                Description
              </label>
              <textarea
                className="min-h-[90px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-slate-700 resize-none"
                placeholder="Farm specialties and description"
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
            <Button className="h-10 px-6 text-sm" onClick={handleSave} disabled={createFarm.status === 'pending' || updateFarm.status === 'pending'}>
              {createFarm.status === 'pending' || updateFarm.status === 'pending' ? (
                <>
                  <Loader size="sm" />
                  <span className="ml-2">{editingFarm ? "Updating..." : "Creating..."}</span>
                </>
              ) : (
                editingFarm ? "Update" : "Create"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="w-full max-w-sm sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete farm</DialogTitle>
            <DialogDescription>
              {farmToDelete
                ? `Delete \u201c${farmToDelete.name}\u201d? This cannot be undone.`
                : "Delete this farm?"}
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
              disabled={deleteFarm.status === 'pending'}
            >
              {deleteFarm.status === 'pending' ? (
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
