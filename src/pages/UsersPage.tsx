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
import { toast } from "sonner";

import {
  useUsersQuery,
  useCreateUser,
  useUpdateUser,
  useDeleteUser
} from "../hooks/users";
import type { User, CreateUserDto, UpdateUserDto } from "../services/users.service";
import { Loader } from "../components/ui/loader";
import { Pencil, Trash2, Search } from "lucide-react";
import { pageIconMap } from "../components/ui/icons";
import { Pagination } from "../components/ui/pagination";

function getUserDisplayName(user: User): string {
  const composed = `${user.firstname ?? ""} ${user.lastname ?? ""}`.trim();
  return composed || user.name || user.email || "Unknown";
}

function getUserInitial(user: User): string {
  const fullName = getUserDisplayName(user);
  return (fullName.charAt(0) || "U").toUpperCase();
}

export function UsersPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { data: usersData, isLoading: usersLoading } = useUsersQuery(page, pageSize);
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  console.log(usersData)
  const users = (usersData && ((usersData as any).content ?? (usersData as any).items ?? (Array.isArray(usersData) ? usersData : []))) || [];
  const total = (usersData && (usersData as any).total) || users.length;
  const hasUsers = users.length > 0;

  // if current page is out of range (e.g. after deletion), reset
  if (page > 1 && total > 0) {
    const last = Math.ceil(total / pageSize);
    if (page > last) setPage(last);
  }

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "user",
    status: "active" as "active" | "inactive" | "VERIFIED" | "PENDING_VERIFICATION"
  });

  const Icon = pageIconMap["/users"];

  const openForCreate = () => {
    setEditingUser(null);
    setFormData({ name: "", email: "", role: "user", status: "active" });
    setDialogOpen(true);
  };

  const openForEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      if (editingUser) {
        await updateUser.mutateAsync({ id: (editingUser as any)._id ?? (editingUser as any).id, dto: formData as UpdateUserDto });
        toast.success("User updated successfully");
      } else {
        await createUser.mutateAsync(formData as CreateUserDto);
        toast.success("User created successfully");
      }
      setDialogOpen(false);
    } catch (error) {
      toast.error("Failed to save user. Please try again.");
    }
  };

  const openDelete = (user: User) => {
    setUserToDelete(user);
    setDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!userToDelete) return;

    try {
      await deleteUser.mutateAsync((userToDelete as any)._id ?? (userToDelete as any).id);
      toast.success(`User "${userToDelete.name}" deleted successfully`);
      setDeleteOpen(false);
      setUserToDelete(null);
    } catch (error) {
      toast.error("Failed to delete user. Please try again.");
    }
  };

  // @ts-ignore
  // @ts-ignore
  // @ts-ignore
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
                <span className="h-8 w-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-lg">🔒</span>
              )}
              <span>Manage Users</span>
            </CardTitle>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative w-full max-w-md sm:w-64">
              <Input
                placeholder="Search users..."
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
              + Add User
            </Button>
          </div>
        </CardHeader>

        <CardContent className="px-6 pb-6">
          <div className="max-w-full overflow-x-hidden">
            <div className="overflow-x-auto">
              {usersLoading? (
                  <div className="py-8 flex items-center justify-center">
                    <Loader size="md" />
                  </div>
              ) : (
                  <>
                    {!hasUsers ? (
                      <div className="py-12 text-center text-sm text-muted-foreground">
                        Aucun element disponible dans cette liste.
                      </div>
                    ) : null}

                    {/* Table only on md+ */}
                    <div className={`hidden md:block ${!hasUsers ? "hidden" : ""}`}>
                      <table className="w-full text-sm">
                        <thead className="text-xs text-muted-foreground border-b">
                        <tr className="h-10">
                          <th className="text-left font-medium">User</th>
                          <th className="text-left font-medium w-32">Role</th>
                          <th className="text-left font-medium w-24">Status</th>
                          <th className="text-left font-medium w-32">Created</th>
                          <th className="text-right font-medium w-24">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {usersLoading ? (
                            <tr className="h-24">
                              <td colSpan={6} className="flex items-center justify-center">
                                <Loader size="md" />
                              </td>
                            </tr>
                        ) : (
                            <>
                              {(users || []).map((user: User) => (
                                  <tr
                                      key={user._id}
                                      className="border-b last:border-0 hover:bg-muted/40"
                                  >
                                    <td className="py-3">
                                      <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-semibold text-slate-600">
                                          {getUserInitial(user)}
                                        </div>
                                        <div>
                                          <div className="text-sm font-medium text-slate-800">
                                            {getUserDisplayName(user)}
                                          </div>
                                          <div className="text-[11px] text-muted-foreground">
                                            {user.email}
                                          </div>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="py-3">
                            <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-[11px]">
                              {user?.role}
                            </span>
                                    </td>
                                    <td className="py-3">
                            <span
                                className={`inline-flex rounded-full px-3 py-1 text-[11px] font-medium ${
                                    user.status === "active"
                                        ? "bg-blue-600/10 text-blue-600"
                                        : "bg-slate-100 text-slate-600"
                                }`}
                            >
                              {user.status}
                            </span>
                                    </td>
                                    <td className="py-3 text-xs text-muted-foreground">
                                      {user.created_at}
                                    </td>
                                    <td className="py-3">
                                      <div className="flex items-center justify-end gap-3 text-slate-400">
                                        <button
                                            className="hover:text-blue-600 text-sm"
                                            type="button"
                                            onClick={() => openForEdit(user)}
                                        >
                                          <Pencil className="h-4 w-4" />
                                        </button>
                                        <button
                                            className="hover:text-red-500 text-sm"
                                            type="button"
                                            onClick={() => openDelete(user)}
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                              ))}
                            </>
                        )}
                        </tbody>
                      </table>
                    </div>

                    {/* Cards for mobile (compact) */}
                    <div className={`md:hidden space-y-2 ${!hasUsers ? "hidden" : ""}`}>
                      {usersLoading ? (
                          <div className="py-4 flex items-center justify-center">
                            <Loader size="md" />
                          </div>
                      ) : (
                          (users || []).map((user: User) => (
                              <Card key={user._id} className="rounded-xl w-full overflow-hidden">
                                <CardContent className="p-4">
                                  <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3 min-w-0">
                                      <div className="h-8 w-8 flex-shrink-0 rounded-full bg-slate-100 flex items-center justify-center text-sm font-semibold text-slate-600">{getUserInitial(user)}</div>
                                      <div className="min-w-0">
                                        <div className="text-sm font-medium truncate">{getUserDisplayName(user)}</div>
                                        <div className="mt-0.5 flex items-center gap-2 min-w-0">
                                          <div className="text-xs text-muted-foreground truncate min-w-0">{user.email}</div>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                      <button onClick={() => openForEdit(user)} className="h-8 w-8 rounded-full bg-white/90 flex items-center justify-center shadow-sm text-slate-600"><Pencil className="h-4 w-4" /></button>
                                      <button onClick={() => openDelete(user)} className="h-8 w-8 rounded-full bg-white/90 flex items-center justify-center shadow-sm text-red-500"><Trash2 className="h-4 w-4" /></button>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                          ))
                      )}
                    </div>

                    <Pagination page={page} pageSize={pageSize} total={total} onPageChange={(p: number) => setPage(p)} onPageSizeChange={(s: number) => { setPageSize(s); setPage(1); }} />
                  </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="w-full max-w-full sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingUser ? "Edit User" : "Add New User"}
            </DialogTitle>
            <DialogDescription>
              Create or update a platform user account
            </DialogDescription>
          </DialogHeader>
          <div className="px-8 py-4 space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">
                Full Name <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="John Doe"
                className="h-11"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">
                Email <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="john@example.com"
                type="email"
                className="h-11"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Role</label>
              <select
                className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm text-slate-700"
                value={formData.role}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    role: e.target.value as "admin" | "user"
                  })
                }
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">
                Status
              </label>
              <select
                className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm text-slate-700"
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as "active" | "inactive"
                  })
                }
              >
                <option value="active">active</option>
                <option value="inactive">inactive</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" className="h-10 px-6 text-sm">
                Cancel
              </Button>
            </DialogClose>
            <Button className="h-10 px-6 text-sm" onClick={handleSave} disabled={createUser.status === 'pending' || updateUser.status === 'pending'}>
              {createUser.status === 'pending' || updateUser.status === 'pending' ? (
                <>
                  <Loader size="sm" />
                  <span className="ml-2">{editingUser ? "Saving..." : "Creating..."}</span>
                </>
              ) : (
                editingUser ? "Save Changes" : "Create"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="w-full max-w-sm sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete user</DialogTitle>
            <DialogDescription>
              {userToDelete
                ? `Delete ${userToDelete.name}? This cannot be undone.`
                : "Delete this user?"}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" className="h-9 px-5 text-sm">
                Cancel
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              className="h-9 px-5 text-sm"
              onClick={handleDelete}
              disabled={deleteUser.status === 'pending'}
            >
              {deleteUser.status === 'pending' ? (
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
