export default function TransactionsLoading() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Memuat transaksi">
      <header className="space-y-2">
        <div className="skeleton h-7 w-36" />
        <div className="skeleton h-3.5 w-40" />
      </header>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="skeleton h-11 w-32" />
          <div className="skeleton h-11 w-24" />
        </div>
        <div className="skeleton h-12 w-full" />
        <div className="grid grid-cols-3 gap-2">
          <div className="skeleton h-12" />
          <div className="skeleton h-12" />
          <div className="skeleton h-12" />
        </div>
      </div>

      <div>
        <div className="skeleton mb-1 h-3.5 w-16" />
        <ul className="divide-y divide-border border-y border-border">
          {[0, 1, 2, 3, 4, 5].map((item) => (
            <li key={item} className="flex min-h-[56px] items-center gap-3 py-2">
              <div className="skeleton size-9 shrink-0 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-4 w-32" />
                <div className="skeleton h-3 w-24" />
              </div>
              <div className="skeleton h-4 w-20" />
              <div className="skeleton size-11 shrink-0" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
