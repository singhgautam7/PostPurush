"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, X, Copy, Check, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

const STORAGE_KEY = "postpurush-demo-banner-dismissed";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-7 w-7 shrink-0 text-foreground-muted hover:text-foreground"
      onClick={handleCopy}
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-emerald-400" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
    </Button>
  );
}

function CodeBlock({ code }: { code: string }) {
  return (
    <div className="relative w-full overflow-hidden rounded-md bg-zinc-900 dark:bg-zinc-800/50 font-mono text-xs border border-zinc-700/50">
      <pre className="text-zinc-300 overflow-x-auto whitespace-pre px-3 py-2.5 pr-12">
        <code>{code}</code>
      </pre>
      <div className="absolute top-1.5 right-1.5">
        <CopyButton text={code} />
      </div>
    </div>
  );
}

export function DemoBanner() {
  const [dismissed, setDismissed] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_IS_DEMO !== "true") return;
    const wasDismissed = sessionStorage.getItem(STORAGE_KEY);
    if (!wasDismissed) setDismissed(false);
  }, []);

  if (process.env.NEXT_PUBLIC_IS_DEMO !== "true") return null;
  if (dismissed) return null;

  const handleDismiss = () => {
    sessionStorage.setItem(STORAGE_KEY, "true");
    setDismissed(true);
  };

  return (
    <>
      <div className="sticky top-0 z-50 flex items-center justify-between gap-3 bg-accent px-4 py-2 text-accent-foreground text-sm">
        <div className="flex items-center gap-2 min-w-0 flex-wrap">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span className="font-semibold whitespace-nowrap">
            You&apos;re viewing the live demo.
          </span>
          <span className="text-accent-foreground/70">
            It is recommended that you use this platform on your machine after cloning it.
            Data is stored locally in your browser and won&apos;t sync across
            devices.
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setModalOpen(true)}
            className="underline underline-offset-2 font-medium hover:text-accent-foreground/70 whitespace-nowrap cursor-pointer"
          >
            Clone &amp; run locally &rarr;
          </button>
          <button
            onClick={handleDismiss}
            className="rounded-sm p-0.5 hover:bg-accent-foreground/10 transition-colors cursor-pointer"
            aria-label="Dismiss banner"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-lg rounded-lg overflow-hidden">
          <DialogHeader>
            <DialogTitle>Run PostPurush Locally</DialogTitle>
            <DialogDescription>
              Follow these steps to get the full experience on your machine.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <h4 className="text-sm font-semibold text-foreground">
                Before you begin
              </h4>
              <p className="text-sm text-foreground-muted">
                Make sure Git and Bun are installed. Get Bun at{" "}
                <a
                  href="https://bun.sh"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 hover:text-foreground"
                >
                  bun.sh
                </a>
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-foreground">
                1. Clone the repo
              </h4>
              <CodeBlock code="git clone https://github.com/singhgautam7/PostPurush.git" />
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-foreground">
                2. Navigate & install dependencies
              </h4>
              <CodeBlock code={"cd PostPurush\nbun install"} />
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-foreground">
                3. Run the server
              </h4>
              <CodeBlock code="bun run dev" />
            </div>
            <Separator />
            <p className="text-xs text-foreground-muted">
              Having trouble? You can also check the {" "}
                <a
                  href="https://github.com/singhgautam7/PostPurush/blob/main/README.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 hover:text-foreground"
                >
                  README.md
              </a>
              {" "}in the repo for
              detailed setup instructions.
            </p>
            <Button
              variant="outline"
              className="w-full gap-2 hover:bg-accent/10"
              asChild
            >
              <a
                href="https://github.com/singhgautam7/PostPurush/issues"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="h-4 w-4" />
                Facing an issue? Report it on GitHub &rarr;
              </a>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
