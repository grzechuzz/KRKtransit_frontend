import { useState } from 'react';
import TopNav from './TopNav';
import HomePage from './HomePage';
import LiveMap from './LiveMap';
import StatsPage from './stats/StatsPage';
import InfoPage from './InfoPage';
import type { Page } from '../types/pages';

export default function AppLayout() {
  const [page, setPage] = useState<Page>('home');

  return (
    <div className="flex h-dvh w-screen flex-col bg-gray-950">
      <TopNav currentPage={page} onNavigate={setPage} />

      <main className="flex-1 overflow-hidden">
        {page === 'home' && <HomePage onNavigate={setPage} />}
        {page === 'map' && <LiveMap />}
        {page === 'stats' && <StatsPage />}
        {page === 'info' && <InfoPage />}
      </main>
    </div>
  );
}
