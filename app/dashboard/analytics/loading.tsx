export default function LoadingAnalytics() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
          <div className="h-4 w-64 bg-zinc-100 dark:bg-zinc-900 rounded-lg" />
        </div>
        <div className="h-10 w-32 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
      </div>

      <div className="h-12 w-full bg-zinc-100 dark:bg-zinc-900 rounded-xl" />

      {/* KPIs Skeletons */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-100 dark:border-zinc-800" />
        ))}
      </section>

      {/* Funnel Skeleton */}
      <section className="h-64 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-100 dark:border-zinc-800" />

      {/* Table Skeleton */}
      <section className="h-96 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-100 dark:border-zinc-800" />
    </div>
  );
}
