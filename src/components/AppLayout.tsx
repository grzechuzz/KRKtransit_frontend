import { lazy, Suspense, useState } from 'react';
import type { MobilePanel } from '../types/mobilePanels';
import { usePageNavigation } from '../hooks/usePageNavigation';
import TopNav from './TopNav';
import HomePage from './HomePage';
import LiveMap from './LiveMap';
import StatsPage from './stats/StatsPage';
import InfoPage from './InfoPage';
import { useI18n } from '../i18n-core';

const DelayMapPage = lazy(() => import('./delay-map/DelayMapPage'));

export default function AppLayout() {
  const { page, navigate } = usePageNavigation();
  const { t } = useI18n();
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>(null);

  return (
    <div className="flex h-dvh w-screen flex-col bg-canvas">
      <TopNav currentPage={page} onNavigate={navigate} mobileMenuOpen={mobilePanel === 'menu'} onMobileMenuChange={(open) => setMobilePanel(open ? 'menu' : null)} />

      <main className="flex-1 overflow-hidden">
        {page === 'home' && <HomePage onNavigate={navigate} />}
        {page === 'map' && <LiveMap mobilePanel={mobilePanel} onMobilePanelChange={setMobilePanel} />}
        {page === 'stats' && <StatsPage />}
        {page === 'delayMap' && <Suspense fallback={<p role="status" className="p-8 text-subtle">{t.stats.loading}</p>}><DelayMapPage /></Suspense>}
        {page === 'info' && <InfoPage />}
      </main>
    </div>
  );
}
