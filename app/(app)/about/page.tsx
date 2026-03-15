import fs from "fs";
import path from "path";
import {
  Zap,
  Shield,
  BookOpen,
  User,
  Info,
  Globe as GlobeIcon,
  Linkedin,
  Github,
  BookMarked,
  Instagram,
} from "lucide-react";
import { HowToAccordion } from "@/components/about/how-to-accordion";

/* ── Auto-discover how-to sections ────────────────── */

function loadHowToSections() {
  const dir = path.join(process.cwd(), "docs", "how-to");

  // Load config
  let config: Record<string, { icon?: string; order?: number; title?: string }> = {};
  try {
    config = JSON.parse(fs.readFileSync(path.join(dir, "config.json"), "utf-8"));
  } catch {}

  let files: string[] = [];
  try {
    files = fs
      .readdirSync(dir)
      .filter((f) => f.endsWith(".md"))
      .sort((a, b) => {
        const orderA = config[a]?.order ?? Infinity;
        const orderB = config[b]?.order ?? Infinity;
        return orderA - orderB;
      });
  } catch {
    return [];
  }

  return files.map((file) => {
    const raw = fs.readFileSync(path.join(dir, file), "utf-8");
    const entry = config[file];
    const stem = file.replace(/\.md$/, "");
    const title = entry?.title
      ?? stem.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

    return {
      file,
      title,
      icon: entry?.icon ?? "FileText",
      markdown: raw.replace(/\.\/(assets\/)/g, "/how-to-assets/"),
    };
  });
}

/* ── Static data ──────────────────────────────────── */

const PRIVACY_ITEMS = [
  {
    title: "Local-First Design",
    desc: "All collections, environments, and analytics are stored in IndexedDB in your browser. No backend required.",
  },
  {
    title: "No Accounts Required",
    desc: "No sign-ups, no login, no email. Open the app and start working immediately.",
  },
  {
    title: "No Tracking or Telemetry",
    desc: "Zero analytics, no crash reporting, no usage data sent anywhere.",
  },
  {
    title: "Sensitive Values Stay Local",
    desc: "Fields marked as sensitive (API keys, tokens) are masked in the UI and never included in exports.",
  },
  {
    title: "Open-Source Friendly",
    desc: "No vendor lock-in. Your data is plain JSON in IndexedDB — export or inspect it anytime via browser DevTools.",
  },
];

const SECTION_ICONS: Record<
  string,
  React.ComponentType<{ size?: number; className?: string }>
> = {
  Zap,
  Shield,
  BookOpen,
  User,
  Info,
};

const DEVELOPER_LINKS = [
  { label: "Website", href: "https://singhgautam.com", icon: GlobeIcon },
  {
    label: "LinkedIn",
    href: "https://linkedin.com/in/singhgautam7",
    icon: Linkedin,
  },
  { label: "GitHub", href: "https://github.com/singhgautam7", icon: Github },
  {
    label: "Medium",
    href: "https://medium.com/@singhgautam7",
    icon: BookMarked,
  },
  {
    label: "Instagram",
    href: "https://instagram.com/singhgautam7",
    icon: Instagram,
  },
];

/* ── Components ───────────────────────────────────── */

function AboutSection({
  icon,
  title,
  children,
}: {
  icon: string;
  title: string;
  children: React.ReactNode;
}) {
  const Icon = SECTION_ICONS[icon] ?? Info;
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-md bg-primary-action/15 flex items-center justify-center shrink-0">
          <Icon size={14} className="text-primary-action" />
        </div>
        <h2 className="text-base font-bold text-foreground">{title}</h2>
      </div>
      {children}
    </section>
  );
}

export default function AboutPage() {
  const howToData = loadHowToSections();

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 md:px-8 py-10 space-y-12">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          About PostPurush
        </h1>
        <p className="text-sm text-foreground-muted mt-1.5">
          A local-first API client. No accounts, no servers, no tracking.
        </p>
      </div>

      {/* What is PostPurush */}
      <AboutSection icon="Zap" title="What is PostPurush?">
        <div className="bg-panel border border-border rounded-lg p-4 text-sm text-foreground-muted leading-relaxed">
          PostPurush is a browser-based API client inspired by Postman. It runs
          entirely in your browser — all data is stored locally. No sign-up
          required, no requests sent to any server.
        </div>
      </AboutSection>

      {/* How to Use */}
      <AboutSection icon="BookOpen" title="How to Use">
        <HowToAccordion sections={howToData} />
      </AboutSection>

      {/* Privacy & Security */}
      <AboutSection icon="Shield" title="Privacy & Security">
        <div className="bg-panel border border-border rounded-lg divide-y divide-border">
          {PRIVACY_ITEMS.map((item, i) => (
            <div key={i} className="flex items-start gap-3 px-4 py-3">
              {/* <div className="w-1.5 h-1.5 rounded-full bg-primary-action mt-2 shrink-0" /> */}
              <div>
                <span className="text-sm font-semibold text-foreground">
                  {item.title}
                </span>
                <span className="text-sm text-foreground-muted">
                  {" "}
                  &ndash; {item.desc}
                </span>
              </div>
            </div>
          ))}
        </div>
      </AboutSection>

      {/* Developer */}
      <AboutSection icon="User" title="Developer">
        <div className="bg-panel border border-border rounded-lg p-4 space-y-3">
          <p className="text-sm font-semibold text-foreground">
            Gautam Rajeev Singh
          </p>
          <div className="flex flex-wrap gap-2">
            {DEVELOPER_LINKS.map((link) => {
              const LinkIcon = link.icon;
              return (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-foreground-muted
                             bg-raised hover:bg-tab-active border border-border-subtle
                             rounded-md px-2.5 py-1.5 transition-colors"
                >
                  <LinkIcon size={12} />
                  {link.label}
                </a>
              );
            })}
          </div>
        </div>
      </AboutSection>
      </div>
    </div>
  );
}
