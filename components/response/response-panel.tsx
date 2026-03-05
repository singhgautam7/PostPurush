"use client";

import { useResponseStore } from "@/store/response-store";
import { ResponseMeta } from "./response-meta";
import { ResponseTabs } from "./response-tabs";
import { Loader2, ArrowDownRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function ResponsePanel() {
  const response = useResponseStore((s) => s.response);
  const loading = useResponseStore((s) => s.loading);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
        <p className="text-sm">Sending request...</p>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
        <div className="rounded-full bg-muted/50 p-4">
          <ArrowDownRight className="h-6 w-6 text-muted-foreground/50" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium">No response yet</p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Send a request to see the response here
          </p>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="response"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="flex flex-col h-full"
      >
        <ResponseMeta />
        <div className="flex-1 overflow-hidden">
          <ResponseTabs />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
