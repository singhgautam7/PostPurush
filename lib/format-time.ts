export function formatTimestamp(ts: number): string {
  const pref =
    typeof window !== "undefined"
      ? localStorage.getItem("postpurush-time-format") ?? "relative"
      : "relative";
  if (pref === "relative") return formatRelative(ts);
  return formatAbsolute(ts);
}

function formatRelative(ts: number): string {
  const diff = Date.now() - ts;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatAbsolute(ts);
}

function formatAbsolute(ts: number): string {
  return new Date(ts).toLocaleString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
