import { useSyncExternalStore, useCallback } from "react";
import type { MediaItem, PlatformId } from "@/lib/downloader";

export interface DownloadHistoryEntry {
  id: string;
  mediaId: string;
  title: string;
  platform: PlatformId;
  previewUrl?: string | undefined;
  videoUrl?: string | undefined;
  format: string;
  bytes: number;
  kind: "video" | "image";
  downloadedAt: number;
}

const STORAGE_KEY = "link2video_download_history";
const MAX_HISTORY_ITEMS = 30;

let memoryHistory: DownloadHistoryEntry[] | null = null;
const listeners = new Set<() => void>();

function getStoredHistory(): DownloadHistoryEntry[] {
  if (typeof window === "undefined") return [];
  if (memoryHistory !== null) return memoryHistory;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    memoryHistory = raw ? JSON.parse(raw) : [];
  } catch {
    memoryHistory = [];
  }
  return memoryHistory ?? [];
}

function notify() {
  listeners.forEach((listener) => listener());
}

function setStoredHistory(items: DownloadHistoryEntry[]) {
  memoryHistory = items;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignore quota errors */
    }
  }
  notify();
}

const EMPTY_HISTORY: DownloadHistoryEntry[] = [];

export function useDownloadHistory() {
  const history = useSyncExternalStore(
    (onStoreChange) => {
      listeners.add(onStoreChange);
      return () => {
        listeners.delete(onStoreChange);
      };
    },
    getStoredHistory,
    () => EMPTY_HISTORY,
  );

  const addHistoryItem = useCallback(
    (item: MediaItem, platform: PlatformId, caption?: string) => {
      const current = getStoredHistory();
      const filtered = current.filter((entry) => entry.mediaId !== item.id);
      const newEntry: DownloadHistoryEntry = {
        id: `${item.id}-${Date.now()}`,
        mediaId: item.id,
        title: item.title || caption || `${platform.toUpperCase()} Media`,
        platform,
        previewUrl: item.previewUrl,
        videoUrl: item.videoUrl,
        format: item.format,
        bytes: item.bytes,
        kind: item.kind,
        downloadedAt: Date.now(),
      };
      setStoredHistory([newEntry, ...filtered].slice(0, MAX_HISTORY_ITEMS));
    },
    [],
  );

  const removeHistoryItem = useCallback((id: string) => {
    const current = getStoredHistory();
    setStoredHistory(current.filter((item) => item.id !== id));
  }, []);

  const clearHistory = useCallback(() => {
    setStoredHistory([]);
  }, []);

  return {
    history,
    addHistoryItem,
    removeHistoryItem,
    clearHistory,
    count: history.length,
  };
}
