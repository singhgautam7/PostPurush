"use client";

import { useState, useEffect, useRef, useCallback, useSyncExternalStore } from "react";
import { useTheme } from "@/hooks/use-theme";
import { THEMES } from "@/lib/themes";
import { KeyValuePair } from "@/types/request";
import { KeyValueTable } from "@/components/shared/key-value-table";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Sun,
  Moon,
  Download,
  Upload,
  Trash2,
  Info,
  FolderIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatTimestamp } from "@/lib/format-time";
import {
  loadRequestsFromDB,
  loadFoldersFromDB,
  loadEnvironmentsFromDB,
  loadAllResponseMetadataRawFromDB,
  loadAllTestRunsFromDB,
  clearAndImportRequests,
  clearAndImportFolders,
  clearAndImportEnvironments,
  clearAndImportResponseMetadata,
  clearAndImportTestRuns,
  clearAllResponseMetadataFromDB,
  clearAllTestRunsFromDB,
  clearAllRequestsFromDB,
  clearAllFoldersFromDB,
  clearAllEnvironmentsFromDB,
  clearAllStores,
} from "@/lib/storage/indexed-db";
import { TestRun } from "@/types/testing";
import { toast } from "sonner";

// ─── Size map for collection text ────────────────────────────────
const SIZE_MAP: { level: number; name: string; cls: string }[] = [
  { level: 1, name: "Smallest", cls: "text-[10px]" },
  { level: 2, name: "Small", cls: "text-[11px]" },
  { level: 3, name: "Default", cls: "text-xs" },
  { level: 4, name: "Large", cls: "text-sm" },
  { level: 5, name: "Largest", cls: "text-base" },
];

// ─── localStorage keys ───────────────────────────────────────────
const LS_KEYS = {
  collectionSize: "postpurush-collection-size",
  requestDefaults: "postpurush-request-defaults",
  timeFormat: "postpurush-time-format",
  theme: "postpurush-theme",
  mode: "postpurush-mode",
  environments: "postpurush-environments",
  openTabs: "postpurush-open-tabs",
  activeTab: "postpurush-active-tab",
  activeEnvId: "postpurush-active-env-id",
} as const;

// ─────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  // Avoid hydration mismatch for client-only state (theme, dates, localStorage)
  const subscribe = useCallback(() => () => {}, []);
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);

  // === Appearance ===
  const { theme, mode, setTheme, setMode } = useTheme();

  // === Collection Text Size ===
  const [collectionSize, setCollectionSize] = useState(() => {
    if (typeof window === 'undefined') return 3;
    const stored = localStorage.getItem(LS_KEYS.collectionSize);
    return stored ? Number(stored) : 3;
  });

  const handleSizeChange = (val: number[]) => {
    const v = val[0];
    setCollectionSize(v);
    localStorage.setItem(LS_KEYS.collectionSize, String(v));
    window.dispatchEvent(new Event("postpurush-collection-size-change"));
  };

  // === Request Defaults ===
  const [defaultTimeout, setDefaultTimeout] = useState(30000);
  const [defaultHeaders, setDefaultHeaders] = useState<KeyValuePair[]>([{ key: "", value: "" }]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEYS.requestDefaults);
      if (raw) {
        const data = JSON.parse(raw);
        if (typeof data.timeout === "number") setDefaultTimeout(data.timeout);
        if (Array.isArray(data.headers) && data.headers.length > 0)
          setDefaultHeaders(data.headers);
      }
    } catch {}
  }, []);

  const saveRequestDefaults = useCallback(
    (timeout: number, headers: KeyValuePair[]) => {
      const cleanHeaders = headers.filter((h) => h.key.trim());
      localStorage.setItem(
        LS_KEYS.requestDefaults,
        JSON.stringify({ timeout, headers: cleanHeaders })
      );
    },
    []
  );

  const handleTimeoutChange = (val: string) => {
    const n = Math.max(0, Math.min(120000, Number(val) || 0));
    setDefaultTimeout(n);
    saveRequestDefaults(n, defaultHeaders);
  };

  const handleDefaultHeadersChange = (rows: KeyValuePair[]) => {
    setDefaultHeaders(rows);
    saveRequestDefaults(defaultTimeout, rows);
  };

  // === Date & Time Format ===
  const [timeFormat, setTimeFormat] = useState<"relative" | "absolute">(() => {
    if (typeof window === 'undefined') return "relative";
    return localStorage.getItem(LS_KEYS.timeFormat) === "absolute" ? "absolute" : "relative";
  });

  const handleTimeFormatChange = (val: string) => {
    const v = val as "relative" | "absolute";
    setTimeFormat(v);
    localStorage.setItem(LS_KEYS.timeFormat, v);
  };

  // === Import / Export ===
  const [exportCollections, setExportCollections] = useState(true);
  const [exportEnvironments, setExportEnvironments] = useState(true);
  const [exportAnalytics, setExportAnalytics] = useState(true);
  const [exportTestHistory, setExportTestHistory] = useState(true);
  const [importConfirmOpen, setImportConfirmOpen] = useState(false);
  const [importData, setImportData] = useState<Record<string, unknown> | null>(
    null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    const payload: Record<string, unknown> = {
      version: 1,
      exportedAt: new Date().toISOString(),
    };
    if (exportCollections) {
      payload.collections = await loadRequestsFromDB();
      payload.folders = await loadFoldersFromDB();
    }
    if (exportEnvironments) {
      payload.environments = await loadEnvironmentsFromDB();
    }
    if (exportAnalytics) {
      const raw = await loadAllResponseMetadataRawFromDB();
      const obj: Record<string, unknown> = {};
      for (const [k, v] of raw) obj[k] = v;
      payload.analyticsHistory = obj;
    }
    if (exportTestHistory) {
      payload.testHistory = await loadAllTestRunsFromDB();
    }

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const date = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `postpurush-backup-${date}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Backup exported successfully");
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        if (!data.version) {
          toast.error("Invalid backup file: missing version field");
          return;
        }
        setImportData(data);
        setImportConfirmOpen(true);
      } catch {
        toast.error("Failed to parse backup file");
      }
    };
    reader.readAsText(file);
    // reset so same file can be re-selected
    e.target.value = "";
  };

  const handleImportConfirm = async () => {
    if (!importData) return;
    try {
      if (importData.collections) {
        await clearAndImportRequests(importData.collections as never[]);
      }
      if (importData.folders) {
        await clearAndImportFolders(importData.folders as never[]);
      }
      if (importData.environments) {
        await clearAndImportEnvironments(importData.environments as never[]);
      }
      if (importData.analyticsHistory) {
        const map = new Map<string, never[]>();
        for (const [k, v] of Object.entries(
          importData.analyticsHistory as Record<string, never[]>
        )) {
          map.set(k, v);
        }
        await clearAndImportResponseMetadata(map);
      }
      if (importData.testHistory) {
        await clearAndImportTestRuns(importData.testHistory as TestRun[]);
      }
      toast.success("Import successful. Reloading...");
      setImportConfirmOpen(false);
      setImportData(null);
      setTimeout(() => window.location.reload(), 500);
    } catch {
      toast.error("Import failed");
    }
  };

  // === Danger Zone ===
  const [dangerDialog, setDangerDialog] = useState<
    "analytics" | "test-history" | "collections" | "environments" | "reset" | null
  >(null);

  const handleClearAnalytics = async () => {
    await clearAllResponseMetadataFromDB();
    toast.success("Analytics history cleared");
    setDangerDialog(null);
  };

  const handleClearTestHistory = async () => {
    await clearAllTestRunsFromDB();
    toast.success("Test history cleared");
    setDangerDialog(null);
  };

  const handleClearCollections = async () => {
    await clearAllRequestsFromDB();
    await clearAllFoldersFromDB();
    toast.success("Collections cleared. Reloading...");
    setDangerDialog(null);
    setTimeout(() => window.location.reload(), 500);
  };

  const handleClearEnvironments = async () => {
    await clearAllEnvironmentsFromDB();
    toast.success("Environments cleared. Reloading...");
    setDangerDialog(null);
    setTimeout(() => window.location.reload(), 500);
  };

  const handleResetEverything = async () => {
    await clearAllStores();
    // Clear all postpurush localStorage keys
    Object.values(LS_KEYS).forEach((k) => localStorage.removeItem(k));
    toast.success("Everything has been reset. Reloading...");
    setDangerDialog(null);
    setTimeout(() => window.location.reload(), 500);
  };

  // === Render helpers ===
  const sizeEntry = SIZE_MAP.find((s) => s.level === collectionSize)!;
  const [oneHourAgo] = useState(() => Date.now() - 3600_000);

  // Build import summary
  const importSummary: string[] = [];
  if (importData) {
    if (importData.collections)
      importSummary.push(
        `${(importData.collections as unknown[]).length} request(s)`
      );
    if (importData.folders)
      importSummary.push(
        `${(importData.folders as unknown[]).length} folder(s)`
      );
    if (importData.environments)
      importSummary.push(
        `${(importData.environments as unknown[]).length} environment(s)`
      );
    if (importData.analyticsHistory)
      importSummary.push("Analytics history");
    if (importData.testHistory)
      importSummary.push(
        `${(importData.testHistory as unknown[]).length} test run(s)`
      );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto px-8 py-10 space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Settings</h1>
        <p className="text-sm text-foreground-muted mt-1">
          Customize your PostPurush experience
        </p>
      </div>

      {/* ─── 1. Appearance ─────────────────────────────────── */}
      <section className="bg-panel border border-border rounded-xl p-6 space-y-5">
        <div>
          <h2 className="text-base font-semibold text-foreground">
            Appearance
          </h2>
          <p className="text-sm text-foreground-muted">
            Choose your theme and color mode
          </p>
        </div>

        {/* Theme swatches */}
        <div>
          <label className="text-xs font-medium text-foreground-muted block mb-2">
            Theme
          </label>
          <div className="grid grid-cols-6 gap-3">
            {THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={cn(
                  "flex flex-col items-center gap-1.5 p-2 rounded-lg transition-all",
                  mounted && theme === t.id
                    ? "ring-2 ring-primary-action bg-raised"
                    : "hover:bg-raised/50"
                )}
              >
                <div
                  className="w-8 h-8 rounded-md border border-border"
                  style={{
                    backgroundColor: mounted
                      ? mode === "dark" ? t.accentColor : t.accentColorLight
                      : undefined,
                  }}
                />
                <span className="text-[10px] text-foreground-muted truncate w-full text-center">
                  {t.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Mode toggle */}
        <div>
          <label className="text-xs font-medium text-foreground-muted block mb-2">
            Mode
          </label>
          <div className="flex gap-2">
            <Button
              variant={mounted && mode === "light" ? "default" : "outline"}
              size="sm"
              onClick={() => setMode("light")}
              className={cn(
                "gap-1.5 text-xs",
                mounted &&
                  mode === "light" &&
                  "bg-primary-action text-primary-action-fg hover:bg-primary-action/85"
              )}
            >
              <Sun size={14} /> Light
            </Button>
            <Button
              variant={mounted && mode === "dark" ? "default" : "outline"}
              size="sm"
              onClick={() => setMode("dark")}
              className={cn(
                "gap-1.5 text-xs",
                mounted &&
                  mode === "dark" &&
                  "bg-primary-action text-primary-action-fg hover:bg-primary-action/85"
              )}
            >
              <Moon size={14} /> Dark
            </Button>
          </div>
        </div>
      </section>

      {/* ─── 2. Text Size ──────────────────────────────────── */}
      <section className="bg-panel border border-border rounded-xl p-6 space-y-5">
        <div>
          <h2 className="text-base font-semibold text-foreground">
            Text Size
          </h2>
          <p className="text-sm text-foreground-muted">
            Adjust text size across the collections view
          </p>
        </div>

        <div className="space-y-3">
          <Slider
            min={1}
            max={5}
            step={1}
            value={[collectionSize]}
            onValueChange={handleSizeChange}
            className="w-full"
          />
          <div className="flex justify-between text-[10px] text-foreground-subtle px-0.5">
            {SIZE_MAP.map((s) => (
              <span
                key={s.level}
                className={cn(s.level === collectionSize && "text-foreground font-medium")}
              >
                {s.name}
              </span>
            ))}
          </div>
        </div>

        {/* Live preview */}
        <div className="bg-raised border border-border rounded-lg p-3 space-y-1">
          <p className="text-[10px] text-foreground-subtle mb-2">Preview</p>
          <div className="flex items-center gap-2">
            <FolderIcon size={14} className="text-foreground-muted shrink-0" />
            <span className={cn(sizeEntry.cls, "text-foreground")}>
              My Collection
            </span>
          </div>
          <div className="flex items-center gap-2 pl-4">
            <span className={cn("font-mono font-bold text-emerald-400", collectionSize >= 4 ? "text-[9px]" : "text-[8px]")}>
              GET
            </span>
            <span className={cn(sizeEntry.cls, "text-foreground-muted")}>
              Get all users
            </span>
          </div>
          <div className="flex items-center gap-2 pl-4">
            <span className={cn("font-mono font-bold text-blue-400", collectionSize >= 4 ? "text-[9px]" : "text-[8px]")}>
              POS
            </span>
            <span className={cn(sizeEntry.cls, "text-foreground-muted")}>
              Create user
            </span>
          </div>
        </div>
      </section>

      {/* ─── 3. Request Defaults ──────────────────────────── */}
      <section className="bg-panel border border-border rounded-xl p-6 space-y-5">
        <div>
          <h2 className="text-base font-semibold text-foreground">
            Request Defaults
          </h2>
          <p className="text-sm text-foreground-muted">
            Applied to every new request
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-foreground-muted block">
            Timeout (ms)
          </label>
          <Input
            type="number"
            min={0}
            max={120000}
            step={1000}
            value={defaultTimeout}
            onChange={(e) => handleTimeoutChange(e.target.value)}
            className="w-40 h-8 text-sm"
          />
          <p className="text-[11px] text-foreground-subtle">
            0 = no timeout. Max 120,000ms (2 min).
          </p>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground-muted">
            Default Headers
          </label>
          <KeyValueTable
            rows={defaultHeaders}
            onChange={handleDefaultHeadersChange}
            addLabel="Add Header"
            showDescription={false}
            showActions={false}
          />
        </div>
      </section>

      {/* ─── 4. Date & Time Format ────────────────────────── */}
      <section className="bg-panel border border-border rounded-xl p-6 space-y-5">
        <div>
          <h2 className="text-base font-semibold text-foreground">
            Date & Time Format
          </h2>
          <p className="text-sm text-foreground-muted">
            How timestamps appear in analytics
          </p>
        </div>

        <RadioGroup value={timeFormat} onValueChange={handleTimeFormatChange}>
          <div className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-raised/50 transition-colors">
            <RadioGroupItem value="relative" id="time-relative" />
            <Label
              htmlFor="time-relative"
              className="flex-1 cursor-pointer space-y-0.5"
            >
              <span className="text-sm font-medium text-foreground">
                Relative
              </span>
              <span className="block text-xs text-foreground-muted" suppressHydrationWarning>
                e.g. &quot;{formatTimestamp(oneHourAgo)}&quot;
              </span>
            </Label>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-raised/50 transition-colors">
            <RadioGroupItem value="absolute" id="time-absolute" />
            <Label
              htmlFor="time-absolute"
              className="flex-1 cursor-pointer space-y-0.5"
            >
              <span className="text-sm font-medium text-foreground">
                Absolute
              </span>
              <span className="block text-xs text-foreground-muted" suppressHydrationWarning>
                e.g. &quot;
                {new Date(oneHourAgo).toLocaleString([], {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                &quot;
              </span>
            </Label>
          </div>
        </RadioGroup>
      </section>

      {/* ─── 5. Import / Export ────────────────────────────── */}
      <section className="bg-panel border border-border rounded-xl p-6 space-y-5">
        <div>
          <h2 className="text-base font-semibold text-foreground">
            Import / Export
          </h2>
          <p className="text-sm text-foreground-muted">
            Back up or restore your data
          </p>
        </div>

        {/* Export */}
        <div className="space-y-3">
          <label className="text-xs font-medium text-foreground-muted block">
            Export
          </label>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm text-foreground">
              <Checkbox
                checked={exportCollections}
                onCheckedChange={(v) => setExportCollections(!!v)}
              />
              Collections & Folders
            </label>
            <label className="flex items-center gap-2 text-sm text-foreground">
              <Checkbox
                checked={exportEnvironments}
                onCheckedChange={(v) => setExportEnvironments(!!v)}
              />
              Environments
            </label>
            <label className="flex items-center gap-2 text-sm text-foreground">
              <Checkbox
                checked={exportAnalytics}
                onCheckedChange={(v) => setExportAnalytics(!!v)}
              />
              Analytics History
            </label>
            <label className="flex items-center gap-2 text-sm text-foreground">
              <Checkbox
                checked={exportTestHistory}
                onCheckedChange={(v) => setExportTestHistory(!!v)}
              />
              API Testing History
            </label>
          </div>
          <Button
            size="sm"
            className="gap-1.5 bg-primary-action text-primary-action-fg hover:bg-primary-action/85"
            onClick={handleExport}
            disabled={!exportCollections && !exportEnvironments && !exportAnalytics && !exportTestHistory}
          >
            <Download size={14} /> Export
          </Button>
        </div>

        {/* Import */}
        <div className="space-y-3 pt-2 border-t border-border">
          <label className="text-xs font-medium text-foreground-muted block">
            Import
          </label>
          <p className="text-xs text-foreground-subtle">
            Import a previously exported backup file. This will replace existing
            data for the imported categories.
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImportFile}
            className="hidden"
          />
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={14} /> Import
          </Button>
        </div>
      </section>

      {/* ─── 6. Danger Zone ───────────────────────────────── */}
      <section className="bg-panel border border-red-500/30 rounded-xl p-6 space-y-4">
        <div>
          <h2 className="text-base font-semibold text-red-400">Danger Zone</h2>
          <p className="text-sm text-foreground-muted">
            Irreversible actions — proceed with caution
          </p>
        </div>

        {/* Clear collections */}
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm font-medium text-foreground">
              Clear Collections
            </p>
            <p className="text-xs text-foreground-muted">
              Remove all saved requests and folders
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-400"
            onClick={() => setDangerDialog("collections")}
          >
            <Trash2 size={13} className="mr-1.5" /> Clear
          </Button>
        </div>

        {/* Clear environments */}
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm font-medium text-foreground">
              Clear Environments
            </p>
            <p className="text-xs text-foreground-muted">
              Remove all environments and variables
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-400"
            onClick={() => setDangerDialog("environments")}
          >
            <Trash2 size={13} className="mr-1.5" /> Clear
          </Button>
        </div>

        {/* Clear analytics */}
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm font-medium text-foreground">
              Clear Analytics History
            </p>
            <p className="text-xs text-foreground-muted">
              Remove all recorded request history
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-400"
            onClick={() => setDangerDialog("analytics")}
          >
            <Trash2 size={13} className="mr-1.5" /> Clear
          </Button>
        </div>

        {/* Clear test history */}
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm font-medium text-foreground">
              Clear Test History
            </p>
            <p className="text-xs text-foreground-muted">
              Remove all API test run results
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-400"
            onClick={() => setDangerDialog("test-history")}
          >
            <Trash2 size={13} className="mr-1.5" /> Clear
          </Button>
        </div>

        {/* Reset everything */}
        <div className="flex items-center justify-between py-2 border-t border-red-500/20 pt-4">
          <div>
            <p className="text-sm font-medium text-foreground">
              Reset Everything
            </p>
            <p className="text-xs text-foreground-muted">
              Delete all data — collections, environments, history, and
              preferences
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-400"
            onClick={() => setDangerDialog("reset")}
          >
            <Trash2 size={13} className="mr-1.5" /> Clear All
          </Button>
        </div>
      </section>

      {/* ─── 7. About ─────────────────────────────────────── */}
      <section className="bg-panel border border-border rounded-xl p-6 space-y-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">About</h2>
        </div>
        <p className="text-sm text-foreground-muted leading-relaxed">
          PostPurush is a browser-based API client for testing and debugging HTTP
          APIs. All data is stored locally in your browser — nothing is sent to
          any server.
        </p>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() => (window.location.href = "/help")}
        >
          <Info size={14} /> Help & Documentation
        </Button>
      </section>

      {/* ─── Dialogs ──────────────────────────────────────── */}

      {/* Import confirmation */}
      <AlertDialog open={importConfirmOpen} onOpenChange={setImportConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Import backup?</AlertDialogTitle>
            <AlertDialogDescription>
              This will replace existing data for the imported categories. The
              page will reload after import.
              {importSummary.length > 0 && (
                <span className="block mt-2 font-medium text-foreground">
                  Importing: {importSummary.join(", ")}
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setImportData(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleImportConfirm}
              className="bg-primary-action text-primary-action-fg hover:bg-primary-action/85"
            >
              Import
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clear collections dialog */}
      <AlertDialog
        open={dangerDialog === "collections"}
        onOpenChange={(v) => !v && setDangerDialog(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear all collections?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all saved requests and folders. Your
              environments and history will not be affected. This cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearCollections}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Delete All Collections
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clear environments dialog */}
      <AlertDialog
        open={dangerDialog === "environments"}
        onOpenChange={(v) => !v && setDangerDialog(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear all environments?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all environments and their variables.
              Your collections and history will not be affected. This cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearEnvironments}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Delete All Environments
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clear analytics dialog */}
      <AlertDialog
        open={dangerDialog === "analytics"}
        onOpenChange={(v) => !v && setDangerDialog(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear analytics history?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all recorded request history. Your
              collections and environments will not be affected. This cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearAnalytics}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Delete All History
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clear test history dialog */}
      <AlertDialog
        open={dangerDialog === "test-history"}
        onOpenChange={(v) => !v && setDangerDialog(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear test history?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all API test run results. Your
              collections and environments will not be affected. This cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearTestHistory}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Delete All Test History
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset everything dialog */}
      <AlertDialog
        open={dangerDialog === "reset"}
        onOpenChange={(v) => !v && setDangerDialog(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset everything?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all collections, folders,
              environments, analytics history, test history, and preferences. The page will
              reload. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleResetEverything}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Reset Everything
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </div>
    </div>
  );
}
