import { usePageNavigation } from '../hooks/usePageNavigation';
import TopNav from './TopNav';
import HomePage from './HomePage';
import LiveMap from './LiveMap';
import StatsPage from './stats/StatsPage';
import InfoPage from './InfoPage';

export default function AppLayout() {
  const { page, navigate } = usePageNavigation();

  return (
    <div className="flex h-dvh w-screen flex-col bg-gray-950">
      <TopNav currentPage={page} onNavigate={navigate} />

      <main className="flex-1 overflow-hidden">
        {page === 'home' && <HomePage onNavigate={navigate} />}
        {page === 'map' && <LiveMap />}
        {page === 'stats' && <StatsPage />}
        {page === 'info' && <InfoPage />}
      </main>
    </div>
  );
}
