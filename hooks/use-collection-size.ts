"use client";

import { useState, useEffect } from "react";

const LS_KEY = "postpurush-collection-size";
const EVENT_NAME = "postpurush-collection-size-change";

export function useCollectionSize() {
  const [size, setSize] = useState(3);
  useEffect(() => {
    const stored = localStorage.getItem(LS_KEY);
    if (stored) setSize(Number(stored));
    const handler = () => {
      const val = localStorage.getItem(LS_KEY);
      setSize(val ? Number(val) : 3);
    };
    window.addEventListener(EVENT_NAME, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(EVENT_NAME, handler);
      window.removeEventListener("storage", handler);
    };
  }, []);
  return size;
}

export const SIDEBAR_SIZES: Record<number, string> = {
  1: "text-[10px]",
  2: "text-[11px]",
  3: "text-xs",
  4: "text-sm",
  5: "text-base",
};

export const CONTENT_SIZES: Record<number, string> = {
  1: "text-xs",
  2: "text-xs",
  3: "text-sm",
  4: "text-sm",
  5: "text-base",
};

export const TAB_SIZES: Record<number, string> = {
  1: "text-[10px]",
  2: "text-[11px]",
  3: "text-xs",
  4: "text-xs",
  5: "text-sm",
};

export const CODE_FONT_PX: Record<number, number> = {
  1: 11,
  2: 12,
  3: 13,
  4: 14,
  5: 16,
};

export const METHOD_SIZE_CLASSES: Record<number, string> = {
  1: "text-[7px]",
  2: "text-[7px]",
  3: "text-[8px]",
  4: "text-[9px]",
  5: "text-[10px]",
};
