export default function DelayMapLoading({ label }: { label: string }) {
  return (
    <div role="status">
      <span className="sr-only">{label}</span>
      <div aria-hidden="true" className="animate-pulse motion-reduce:animate-none">
        <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="mb-2 h-3 w-20 rounded bg-overlay/10" />
            <div className="flex flex-wrap gap-2">
              <div className="h-11 w-52 max-w-full rounded-lg bg-overlay/10" />
              <div className="h-11 w-48 max-w-full rounded-lg bg-overlay/10" />
            </div>
          </div>
          <div className="w-full sm:max-w-md lg:w-72">
            <div className="mb-2 h-3 w-28 rounded bg-overlay/10" />
            <div className="h-11 rounded-lg bg-overlay/10" />
          </div>
        </div>
        <div className="relative h-[clamp(360px,55dvh,480px)] rounded-xl border border-overlay/5 bg-control/50 lg:h-[clamp(480px,65dvh,760px)]">
          <div className="absolute top-3 left-3 h-11 w-24 rounded-xl bg-overlay/10" />
        </div>
        <div className="mt-5 space-y-2">
          <div className="h-2.5 w-full rounded bg-overlay/5" />
          <div className="h-2.5 w-4/5 rounded bg-overlay/5" />
        </div>
      </div>
    </div>
  );
}
