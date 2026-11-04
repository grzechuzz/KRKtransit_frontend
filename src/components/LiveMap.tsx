import { useState, useCallback } from 'react';
import { MapContainer, TileLayer, ZoomControl } from 'react-leaflet';
import { useVehicleCache } from '../hooks/useVehicleCache';
import { useUpcomingStops } from '../hooks/useUpcomingStops';
import { useIsMobile } from '../hooks/useIsMobile';
import type { MobilePanel } from '../types/mobilePanels';
import { getErrorMessage } from '../api/client';
import { useI18n } from '../i18n-core';
import VehicleMarker from './VehicleMarker';
import RouteShape from './RouteShape';
import TripStops from './TripStops';
import VehiclePanel, { MobileVehicleBar } from './VehiclePanel';
import LineFilter from './LineFilter';
import type { Vehicle } from '../types/api';
import L from 'leaflet';

const KRAKOW_CENTER = { lat: 50.0647, lng: 19.945 } as const;
const DEFAULT_ZOOM = 13;
const MIN_ZOOM = 8;
const MAX_BOUNDS = L.latLngBounds(
  L.latLng(49.0, 18.5),
  L.latLng(51.0, 21.5),
);

interface LiveMapProps {
  mobilePanel: MobilePanel;
  onMobilePanelChange: (panel: MobilePanel) => void;
}

export default function LiveMap({ mobilePanel, onMobilePanelChange }: LiveMapProps) {
  const { vehicles, isLoading, error } = useVehicleCache();
  const { language, t } = useI18n();
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [activeLines, setActiveLines] = useState<Set<string>>(new Set());
  const isMobile = useIsMobile();
  const [desktopFilterOpen, setDesktopFilterOpen] = useState(false);
  const [desktopLegendOpen, setDesktopLegendOpen] = useState(false);
  const filterOpen = isMobile ? mobilePanel === 'filter' : desktopFilterOpen;
  const legendOpen = isMobile ? mobilePanel === 'legend' : desktopLegendOpen;

  const handleToggleFilter = () => {
    if (isMobile) {
      onMobilePanelChange(filterOpen ? null : 'filter');
    } else {
      setDesktopLegendOpen(false);
      setDesktopFilterOpen(!desktopFilterOpen);
    }
  };

  const handleToggleLegend = () => {
    if (isMobile) {
      onMobilePanelChange(legendOpen ? null : 'legend');
    } else {
      setDesktopFilterOpen(false);
      setDesktopLegendOpen(!desktopLegendOpen);
    }
  };

  const handleSelect = useCallback((vehicle: Vehicle) => {
    if (vehicle.license_plate !== selectedVehicle?.license_plate && mobilePanel === 'stops') {
      onMobilePanelChange(null);
    }
    setSelectedVehicle((prev) =>
      prev?.license_plate === vehicle.license_plate ? prev : vehicle,
    );
  }, [selectedVehicle, mobilePanel, onMobilePanelChange]);

  const handleClose = useCallback(() => {
    setSelectedVehicle(null);
    if (mobilePanel === 'stops') onMobilePanelChange(null);
  }, [mobilePanel, onMobilePanelChange]);

  const handleToggleLine = useCallback((line: string) => {
    setActiveLines((prev) => {
      const next = new Set(prev);
      next.delete('__none__');
      if (next.has(line)) {
        next.delete(line);
      } else {
        next.add(line);
      }
      return next;
    });
    setSelectedVehicle(null);
  }, []);

  const handleShowAll = useCallback(() => {
    setActiveLines(new Set());
    setSelectedVehicle(null);
  }, []);
  const handleHideAll = useCallback(() => {
    setActiveLines(new Set(['__none__']));
    setSelectedVehicle(null);
  }, []);

  // Empty set = show all, otherwise filter by active lines
  const isFiltering = activeLines.size > 0 && !activeLines.has('__none__');
  const showNone = activeLines.has('__none__');
  const visibleVehicles = showNone
    ? []
    : isFiltering
      ? vehicles.filter((v) => activeLines.has(v.line_number))
      : vehicles;
  const emptyErrorMessage = error && !vehicles.length ? getErrorMessage(error, language, t.map.apiConnectionError) : null;

  const currentSelected = selectedVehicle
    ? visibleVehicles.find((v) => v.license_plate === selectedVehicle.license_plate) ?? null
    : null;
  // One polling observer shared by the desktop and mobile panels.
  const upcomingStops = useUpcomingStops(currentSelected?.trip_id ?? null);

  return (
    <div className="flex h-full w-full flex-col">
      {/* Mobile: static vehicle info bar between navbar and map */}
      {currentSelected && (
        <MobileVehicleBar vehicle={currentSelected} onClose={handleClose} upcomingStops={upcomingStops} stopsExpanded={mobilePanel === 'stops'} onStopsExpandedChange={(open) => onMobilePanelChange(open ? 'stops' : null)} />
      )}

      {/* Map fills remaining space */}
      <div className="relative min-h-0 flex-1">
        <MapContainer
          center={KRAKOW_CENTER}
          zoom={DEFAULT_ZOOM}
          minZoom={MIN_ZOOM}
          maxBounds={MAX_BOUNDS}
          maxBoundsViscosity={1.0}
          className="h-full w-full"
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ZoomControl position="topright" />

          {currentSelected?.shape_id && (
            <RouteShape shapeId={currentSelected.shape_id} />
          )}

          {currentSelected && (
            <TripStops tripId={currentSelected.trip_id} />
          )}

          {visibleVehicles.map((vehicle) => (
            <VehicleMarker
              key={vehicle.license_plate}
              vehicle={vehicle}
              isSelected={currentSelected?.license_plate === vehicle.license_plate}
              onSelect={handleSelect}
            />
          ))}
        </MapContainer>

        <div>
          <LineFilter
            vehicles={vehicles}
            activeLines={activeLines}
            onToggle={handleToggleLine}
            onShowAll={handleShowAll}
            onHideAll={handleHideAll}
            isOpen={filterOpen}
            onToggleOpen={handleToggleFilter}
            legendOpen={legendOpen}
            onToggleLegend={handleToggleLegend}
          />
        </div>

        <div className={`absolute bottom-4 left-4 z-[1000] max-w-[calc(100vw-2rem)] rounded-xl bg-surface/90 px-4 py-2 text-sm text-body backdrop-blur-sm transition-opacity ${filterOpen ? 'pointer-events-none opacity-0' : 'opacity-100'}`}>
          {isLoading && !vehicles.length && t.map.loadingVehicles}
          {emptyErrorMessage && <span className="block max-w-sm text-negative">{emptyErrorMessage}</span>}
          {vehicles.length > 0 && (
            <span>
              <span className="font-bold text-ink">{visibleVehicles.length}</span>
              {visibleVehicles.length !== vehicles.length && (
                <span className="text-subtle">/{vehicles.length}</span>
              )}
              {' '}{t.map.vehicles}
            </span>
          )}
        </div>

        {/* Desktop: floating panel overlay */}
        {currentSelected && (
          <VehiclePanel vehicle={currentSelected} onClose={handleClose} upcomingStops={upcomingStops} />
        )}
      </div>
    </div>
  );
}
