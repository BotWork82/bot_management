import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "../components/ui/card";
import { Button } from "../components/ui/button";
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
import { Loader } from "../components/ui/loader";
import { toast } from "sonner";

import { useMessagesQuery, useCreateMessage, useUpdateMessage, useDeleteMessage, useSendMessage, useMessageStatsQuery } from "../hooks/messages";
import type { Message, CreateMessageDto, UpdateMessageDto } from "../services/messages.service";
import { MessageSquare, Pencil, Trash2 } from "lucide-react";
import { Pagination } from "../components/ui/pagination";

export function MessagesPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { data: messagesData, isLoading: messagesLoading } = useMessagesQuery(page, pageSize);
  const { data: messageStats, isLoading: statsLoading } = useMessageStatsQuery();
  const createMessage = useCreateMessage();
  const updateMessage = useUpdateMessage();
  const sendMessage = useSendMessage();
  const deleteMessage = useDeleteMessage();

  const messages = (messagesData && ((messagesData as any).content ?? (messagesData as any).items)) || [];
  const total = (messagesData && (messagesData as any).total) || messages.length;

  if (page > 1 && total > 0) {
    const last = Math.ceil(total / pageSize);
    if (page > last) setPage(last);
  }

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<Message | null>(null);
  const [formData, setFormData] = useState({ subject: "", content: "" });

  const openForCreate = () => {
    setEditingMessage(null);
    setFormData({ subject: "", content: "" });
    setDialogOpen(true);
  };

  const openForEdit = (msg: Message) => {
    setEditingMessage(msg);
    setFormData({ subject: msg.subject ?? "", content: msg.body ?? "" });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.subject.trim() || !formData.content.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      if (editingMessage) {
        await updateMessage.mutateAsync({ id: (editingMessage as any)._id ?? (editingMessage as any).id, dto: { subject: formData.subject, body: formData.content } as UpdateMessageDto });
        toast.success("Message updated successfully");
      } else {
        await createMessage.mutateAsync({ subject: formData.subject, body: formData.content } as CreateMessageDto);
        toast.success("Message created successfully");
      }
      setDialogOpen(false);
    } catch (error) {
      toast.error("Failed to save message. Please try again.");
    }
  };

  const handleSendNow = async (msg: Message) => {
    try {
      await sendMessage.mutateAsync((msg as any)._id ?? (msg as any).id);
      toast.success(`Message "${msg.subject ?? msg._id}" sent`);
    } catch (error) {
      toast.error("Failed to send message. Please try again.");
    }
  };

  const openDelete = (msg: Message) => {
    setMessageToDelete(msg);
    setDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!messageToDelete) return;

    try {
      await deleteMessage.mutateAsync((messageToDelete as any)._id ?? (messageToDelete as any).id);
      toast.success(`Message "${messageToDelete.subject ?? messageToDelete._id}" deleted successfully`);
      setDeleteOpen(false);
      setMessageToDelete(null);
    } catch (error) {
      toast.error("Failed to delete message. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          {/*<h1 className="text-2xl font-semibold tracking-tight">Bot Messages</h1>*/}
          <p className="text-sm text-muted-foreground">
            Create and manage messages sent by your Telegram bot
          </p>
        </div>
        <Button
          className="h-10 rounded-full px-5 text-sm font-medium"
          onClick={openForCreate}
        >
          + New Message
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: "Sent", value: messageStats?.sent ?? 0 },
          { label: "Delivered", value: messageStats?.delivered ?? 0 },
          { label: "Opened", value: messageStats?.opened ?? 0 },
          { label: "Clicked", value: messageStats?.clicked ?? 0 }
        ].map((item) => (
          <Card key={item.label} className="rounded-xl border border-border/70 shadow-sm">
            <CardContent className="p-4">
              <div className="text-[11px] text-muted-foreground">{item.label}</div>
              <div className="text-xl font-semibold mt-1">{statsLoading ? "..." : item.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-4">
        {messagesLoading ? (
          <div className="py-8 flex items-center justify-center">
            <Loader size="md" />
          </div>
        ) : messages.length === 0 ? (
          <Card className="rounded-2xl border border-border/70 shadow-sm">
            <CardContent className="py-12 text-center text-sm text-muted-foreground">
              Aucun element disponible dans cette liste.
            </CardContent>
          </Card>
        ) : (
          messages.map((msg: Message) => (
            <Card
              key={msg._id}
              className="rounded-2xl border border-border/70 shadow-sm"
            >
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-semibold">
                      {msg.subject}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-1">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-[11px] font-medium ${
                          msg.status === "sent"
                            ? "bg-blue-600/10 text-blue-600"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {msg.status}
                      </span>
                      {msg.date && <span>{msg.date}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-slate-400 pr-2">
                  {msg.status === "draft" && (
                    <Button className="h-8 px-4 text-xs rounded-full" onClick={() => handleSendNow(msg)}>
                      Send Now
                    </Button>
                  )}
                  <button
                    className="hover:text-blue-600 text-slate-400 text-sm"
                    type="button"
                    onClick={() => openForEdit(msg)}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    className="hover:text-red-500 text-slate-400 text-sm"
                    type="button"
                    onClick={() => openDelete(msg)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-xl bg-muted px-5 py-4 text-xs leading-relaxed text-slate-700 whitespace-pre-line">
                  {msg.body}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Pagination page={page} pageSize={pageSize} total={total} onPageChange={(p: number) => setPage(p)} onPageSizeChange={(s: number) => { setPageSize(s); setPage(1); }} />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="w-full max-w-full sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingMessage ? "Edit Message" : "Create New Message"}
            </DialogTitle>
            <DialogDescription>
              Compose a message to send to your bot subscribers
            </DialogDescription>
          </DialogHeader>
          <div className="px-8 py-4 space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">
                Subject <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Message subject (internal reference)"
                className="h-11"
                value={formData.subject}
                onChange={(e) =>
                  setFormData({ ...formData, subject: e.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">
                Message Content <span className="text-red-500">*</span>
              </label>
              <textarea
                className="min-h-[180px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-slate-700 resize-none"
                placeholder="Write your message here... Use emojis and formatting!"
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
              />
              <p className="text-[11px] text-muted-foreground">
                Supports Telegram markdown formatting
              </p>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" className="h-10 px-6 text-sm">
                Cancel
              </Button>
            </DialogClose>
            <Button className="h-10 px-6 text-sm" onClick={handleSave} disabled={createMessage.status === 'pending' || updateMessage.status === 'pending'}>
              {createMessage.status === 'pending' || updateMessage.status === 'pending' ? (
                <>
                  <Loader size="sm" />
                  <span className="ml-2">{editingMessage ? "Saving..." : "Creating..."}</span>
                </>
              ) : (
                editingMessage ? "Save Changes" : "Save as Draft"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="w-full max-w-sm sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete message</DialogTitle>
            <DialogDescription>
              {messageToDelete
                ? `Delete \u201c${messageToDelete.subject}\u201d? This cannot be undone.`
                : "Delete this message?"}
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
              disabled={deleteMessage.status === 'pending'}
            >
              {deleteMessage.status === 'pending' ? (
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
