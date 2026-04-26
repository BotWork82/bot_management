import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { messagesService, type CreateMessageDto, type UpdateMessageDto } from "../services/messages.service";

export function useMessagesQuery(page: number = 1, take: number = 10, box?: string) {
  return useQuery({ queryKey: ["messages", { page, take, box }], queryFn: () => messagesService.getMessages({ page, take, box }), staleTime: 1000 * 60 * 2 });
}

export function useCreateMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateMessageDto) => messagesService.createMessage(dto),
    onSuccess() {
      qc.invalidateQueries({ predicate: (q) => q.queryKey[0] === "messages" });
    }
  });
}

export function useUpdateMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateMessageDto }) => messagesService.updateMessage(id, dto),
    onSuccess() {
      qc.invalidateQueries({ predicate: (q) => q.queryKey[0] === "messages" });
    }
  });
}

export function useSendMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => messagesService.sendMessage(id),
    onSuccess() {
      qc.invalidateQueries({ predicate: (q) => q.queryKey[0] === "messages" });
    }
  });
}

export function useDeleteMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => messagesService.deleteMessage(id),
    onSuccess() {
      qc.invalidateQueries({ predicate: (q) => q.queryKey[0] === "messages" });
    }
  });
}

export function useMessageStatsQuery() {
  return useQuery({ queryKey: ["messages", "stats"], queryFn: () => messagesService.getMessageStats(), staleTime: 1000 * 60 * 2 });
}
