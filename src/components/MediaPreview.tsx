import React, { useEffect, useState } from "react";
import { api } from "../services/api";

type Props = {
  srcRef?: string | null;
  type: "image" | "video";
  className?: string;
  controls?: boolean;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  alt?: string;
};

// Simple in-memory cache of fetched object URLs to avoid refetching the same id
const objectUrlCache = new Map<string, string>();

export default function MediaPreview({ srcRef, type, className, controls = false, autoPlay = false, muted = false, loop = false, alt = "" }: Props) {
  const [src, setSrc] = useState<string>("");

  useEffect(() => {
    let active = true;
    let localObjUrl: string | undefined;

    async function load() {
      if (!srcRef) {
        setSrc("");
        return;
      }
      const s = String(srcRef);
      if (s.startsWith("http") || s.startsWith("/")) {
        setSrc(s);
        return;
      }

      // treat as internal id
      const id = s;
      // return cached objectUrl if present
      const cached = objectUrlCache.get(id);
      if (cached) {
        setSrc(cached);
        return;
      }

      try {
        const base = (api.defaults.baseURL || "").replace(/\/$/, "");
        const url = `${base}/media/${id}/download`;
        const res = await api.get(url, { responseType: "blob" });
        if (!active) return;
        localObjUrl = URL.createObjectURL(res.data as Blob);
        objectUrlCache.set(id, localObjUrl);
        setSrc(localObjUrl);
      } catch (e) {
        if (!active) return;
        // fallback: empty string
        setSrc("");
      }
    }

    load();

    return () => {
      active = false;
      // Do not revoke cached object URLs here because other instances may use them.
      // If you want aggressive cleanup, implement LRU and revoke when evicted.
      if (localObjUrl && !objectUrlCache.has(String(srcRef))) {
        try { URL.revokeObjectURL(localObjUrl); } catch {}
      }
    };
  }, [srcRef]);

  if (type === "video") {
    return <video src={src} controls={controls} autoPlay={autoPlay} muted={muted} loop={loop} className={className} />;
  }
  return <img src={src} alt={alt} className={className} />;
}

