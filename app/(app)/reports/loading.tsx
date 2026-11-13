export default function ReportsLoading() {
  return (
    <div className="space-y-5" aria-busy="true" aria-label="Memuat laporan">
      <header className="flex items-start justify-between gap-2">
        <div className="space-y-2">
          <div className="skeleton h-7 w-32" />
          <div className="skeleton h-3.5 w-48" />
        </div>
        <div className="skeleton h-11 w-32" />
      </header>

      <div className="space-y-3 rounded-[14px] border border-border bg-card p-4">
        <div className="grid grid-cols-3 gap-2">
          {[0, 1, 2].map((item) => (
            <div key={item} className="space-y-2">
              <div className="skeleton mx-auto h-3 w-12" />
              <div className="skeleton mx-auto h-4 w-20" />
            </div>
          ))}
        </div>
        <div className="skeleton h-3.5 w-full" />
        <div className="skeleton h-12 w-full" />
      </div>

      <section>
        <div className="mb-2">
          <div className="skeleton h-5 w-44" />
        </div>
        <div className="rounded-[14px] border border-border bg-card p-4">
          <div className="skeleton mx-auto size-40 rounded-full" />
          <div className="mt-4 space-y-2">
            <div className="skeleton h-3.5 w-full" />
            <div className="skeleton h-3.5 w-2/3" />
          </div>
        </div>
      </section>

      <section>
        <div className="mb-2">
          <div className="skeleton h-5 w-40" />
        </div>
        <div className="space-y-3 rounded-[14px] border border-border bg-card p-4">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="space-y-2">
              <div className="skeleton h-3.5 w-24" />
              <div className="skeleton h-2 w-full rounded-full" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
