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
      <div className="flex flex-col items-center justify-center h-full gap-3 text-foreground-subtle">
        <Loader2 className="h-6 w-6 animate-spin text-foreground-muted" />
        <p className="text-sm">Sending request...</p>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-foreground-subtle">
        <div className="w-12 h-12 rounded-full bg-raised/60 flex items-center justify-center">
          <ArrowDownRight className="h-6 w-6 text-foreground-subtle" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-foreground-muted">No response yet</p>
          <p className="text-xs text-foreground-subtle mt-1">
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
        className="flex flex-col h-full overflow-auto"
      >
        <ResponseMeta />
        <ResponseTabs />
      </motion.div>
    </AnimatePresence>
  );
}
