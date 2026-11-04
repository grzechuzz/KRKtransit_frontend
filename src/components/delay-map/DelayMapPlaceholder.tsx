export default function DelayMapPlaceholder({ message }: { message: string }) {
  return (
    <div className="relative isolate flex h-[clamp(360px,55dvh,480px)] items-center justify-center overflow-hidden rounded-xl border border-overlay/10 bg-surface p-6 lg:h-[clamp(480px,65dvh,760px)]">
      <div aria-hidden="true" className="pointer-events-none absolute -inset-8 -z-10 bg-raised/40 blur-md">
        <svg viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice" className="h-full w-full text-overlay" fill="none">
          <g stroke="currentColor" opacity="0.08" strokeWidth="18">
            <path d="M0 150h1000M0 420h1000M180 0v600M520 0v600M830 0v600M0 550 1000 60" />
          </g>
          <path d="m120 470 220-120 170 30 130-180 240-70" stroke="currentColor" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" opacity="0.15" />
          <g fill="currentColor" opacity="0.12">
            <rect x="230" y="200" width="210" height="140" rx="16" />
            <rect x="600" y="460" width="170" height="110" rx="16" />
            <rect x="580" y="40" width="180" height="90" rx="16" />
          </g>
        </svg>
      </div>
      <p role="status" className="max-w-md rounded-xl border border-overlay/10 bg-surface/80 px-6 py-5 text-center text-sm leading-relaxed text-body shadow-panel backdrop-blur-sm">{message}</p>
    </div>
  );
}
