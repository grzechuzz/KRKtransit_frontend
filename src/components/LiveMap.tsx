import { useState, useCallback } from 'react';
import { MapContainer, TileLayer, ZoomControl } from 'react-leaflet';
import { useVehicleCache } from '../hooks/useVehicleCache';
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

export default function LiveMap() {
  const { vehicles, isLoading, error } = useVehicleCache();
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [activeLines, setActiveLines] = useState<Set<string>>(new Set());
  const [filterOpen, setFilterOpen] = useState(false);

  const handleSelect = useCallback((vehicle: Vehicle) => {
    setSelectedVehicle((prev) =>
      prev?.trip_id === vehicle.trip_id ? prev : vehicle,
    );
  }, []);

  const handleClose = useCallback(() => setSelectedVehicle(null), []);

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

  const currentSelected = selectedVehicle
    ? visibleVehicles.find((v) => v.trip_id === selectedVehicle.trip_id) ?? null
    : null;

  return (
    <div className="flex h-full w-full flex-col">
      {/* Mobile: static vehicle info bar between navbar and map */}
      {currentSelected && (
        <MobileVehicleBar vehicle={currentSelected} onClose={handleClose} />
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
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
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
              key={vehicle.trip_id}
              vehicle={vehicle}
              isSelected={currentSelected?.trip_id === vehicle.trip_id}
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
            onToggleOpen={() => setFilterOpen((p) => !p)}
          />
        </div>

        <div className={`absolute bottom-4 left-4 z-[1000] rounded-xl bg-gray-900/90 px-4 py-2 text-sm text-gray-300 backdrop-blur-sm transition-opacity ${filterOpen ? 'pointer-events-none opacity-0' : 'opacity-100'}`}>
          {isLoading && !vehicles.length && 'Ładowanie pojazdów...'}
          {error && !vehicles.length && <span className="text-red-400">Błąd połączenia z API</span>}
          {vehicles.length > 0 && (
            <span>
              <span className="font-bold text-white">{visibleVehicles.length}</span>
              {visibleVehicles.length !== vehicles.length && (
                <span className="text-gray-500">/{vehicles.length}</span>
              )}
              {' '}pojazdów
            </span>
          )}
        </div>

        {/* Desktop: floating panel overlay */}
        {currentSelected && (
          <VehiclePanel vehicle={currentSelected} onClose={handleClose} />
        )}
      </div>
    </div>
  );
}
