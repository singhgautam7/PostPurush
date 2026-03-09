import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-background text-center px-6">
      <p className="text-8xl font-bold font-mono text-accent">404</p>
      <h1 className="text-xl font-semibold text-foreground">Page not found</h1>
      <p className="text-sm text-foreground-muted max-w-sm">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="mt-2 px-4 py-2 rounded-lg bg-accent text-accent-foreground text-sm font-medium hover:opacity-90 transition-opacity"
      >
        Back to Collections
      </Link>
    </div>
  );
}
