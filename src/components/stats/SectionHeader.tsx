export default function SectionHeader({ title, subtitle, badge }: { title: string; subtitle: string; badge?: string }) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-3">
        <div aria-hidden="true" className="h-7 w-1.5 shrink-0 -skew-x-12 rounded-full bg-blue-500 shadow-lg shadow-blue-500/30" />
        {badge && (
          <span className="-skew-x-12 shrink-0 whitespace-nowrap rounded bg-blue-600 px-2.5 py-1 text-sm font-black tracking-widest text-white shadow-lg shadow-blue-600/30 sm:px-2.5 sm:py-0.5 sm:text-xs">
            <span className="inline-block skew-x-12">{badge}</span>
          </span>
        )}
        <h2 className="text-lg font-black uppercase tracking-wide text-ink sm:text-xl">
          {title}
        </h2>
      </div>
      <p className="mt-2 text-xs text-subtle sm:text-sm">{subtitle}</p>
      <div aria-hidden="true" className="mt-3 h-px bg-gradient-to-r from-blue-500/40 via-blue-500/10 to-transparent" />
    </div>
  );
}
