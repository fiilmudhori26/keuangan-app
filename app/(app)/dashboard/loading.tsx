export default function DashboardLoading() {
  return (
    <div className="space-y-5" aria-busy="true" aria-label="Memuat dashboard">
      <header className="flex items-center justify-between gap-2">
        <div className="space-y-2">
          <div className="skeleton h-3.5 w-24" />
          <div className="skeleton h-5 w-32" />
        </div>
        <div className="flex items-center gap-2">
          <div className="skeleton h-11 w-20" />
          <div className="skeleton size-11" />
        </div>
      </header>

      <div className="rounded-[20px] border border-border bg-card p-5">
        <div className="skeleton h-3.5 w-20" />
        <div className="skeleton mt-2 h-11 w-56" />
        <div className="skeleton mt-3 h-20 w-full" />
        <div className="skeleton mt-2 h-3.5 w-32" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[0, 1].map((item) => (
          <div key={item} className="space-y-2 rounded-[14px] border border-border bg-card p-4">
            <div className="skeleton h-3.5 w-14" />
            <div className="skeleton h-5 w-24" />
          </div>
        ))}
      </div>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <div className="skeleton h-5 w-24" />
          <div className="skeleton h-4 w-10" />
        </div>
        <div className="space-y-4 rounded-[14px] border border-border bg-card p-4">
          {[0, 1, 2].map((item) => (
            <div key={item} className="space-y-2">
              <div className="skeleton h-4 w-full" />
              <div className="skeleton h-2 w-full rounded-full" />
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <div className="skeleton h-5 w-36" />
          <div className="skeleton h-4 w-10" />
        </div>
        <div className="skeleton mb-1 h-3.5 w-16" />
        <ul className="divide-y divide-border border-y border-border">
          {[0, 1, 2, 3, 4].map((item) => (
            <li key={item} className="flex min-h-[56px] items-center gap-3 py-2">
              <div className="skeleton size-9 shrink-0 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-4 w-28" />
                <div className="skeleton h-3 w-20" />
              </div>
              <div className="skeleton h-4 w-16" />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
