import type { Page } from '../types/pages';

const PAGE_INFO: Record<string, { title: string; description: string; emoji: string }> = {
  info: {
    title: 'Informacje',
    description: 'Szczegóły dotyczące systemu KRK Transit i źródeł danych.',
    emoji: '\u2139\uFE0F',
  },
};

export default function StatsPlaceholder({ page }: { page: string }) {
  const { title, description, emoji } = PAGE_INFO[page];

  return (
    <div className="flex h-full items-center justify-center p-8">
      <div className="max-w-md text-center">
        <div className="mb-4 text-5xl">{emoji}</div>
        <h2 className="mb-2 text-xl font-bold text-white">{title}</h2>
        <p className="mb-6 text-sm text-gray-400">{description}</p>
        <span className="inline-block rounded-full bg-white/10 px-4 py-1.5 text-xs font-medium text-gray-500">
          Wkrótce dostępne
        </span>
      </div>
    </div>
  );
}
