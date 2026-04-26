import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { mediaService, type MediaItem, type UploadMediaDto } from "../services/media.service";

export function useMediaQuery(page: number = 1, take: number = 12) {
  return useQuery({ queryKey: ["media", { page, take }], queryFn: () => mediaService.getMedia({ page, take }), staleTime: 1000 * 60 * 5 });
}

export function useUploadMedia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: UploadMediaDto) => mediaService.uploadMedia(dto),
    onSuccess() {
      qc.invalidateQueries({ predicate: (q) => q.queryKey[0] === "media" });
    }
  });
}

export function useDeleteMedia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => mediaService.deleteMedia(id),
    onSuccess() {
      qc.invalidateQueries({ predicate: (q) => q.queryKey[0] === "media" });
    }
  });
}

export type DownloadResult = { url: string; filename?: string; isObjectUrl?: boolean };

export function useDownloadMedia() {
  return useMutation({
    mutationFn: async (item: MediaItem | string): Promise<DownloadResult> => {
      const id = typeof item === "string" ? item : (item.id ?? item._id ?? "");
      const res = await mediaService.download(id);
      if (res instanceof Blob) {
        const url = URL.createObjectURL(res);
        const filename = typeof item === "string" ? "media" : (item.originalName || item.name || "media");
        return { url, filename, isObjectUrl: true };
      }
      // res is a string URL
      const filename = typeof item === "string" ? "media" : (item.originalName || item.name || "media");
      return { url: String(res), filename, isObjectUrl: false };
    }
  });
}
