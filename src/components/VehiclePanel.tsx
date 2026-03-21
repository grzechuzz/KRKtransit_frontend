import { useState, useEffect } from 'react';
import type { Vehicle } from '../types/api';

interface VehiclePanelProps {
  vehicle: Vehicle;
  onClose: () => void;
}

function formatRelativeTime(iso: string): string {
  const diff = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (diff < 60) return `${diff} sek temu`;
  const min = Math.floor(diff / 60);
  const sec = diff % 60;
  return `${min} min ${sec} sek temu`;
}

function useRelativeTime(iso: string): string {
  const [text, setText] = useState(() => formatRelativeTime(iso));

  useEffect(() => {
    setText(formatRelativeTime(iso));
    const id = setInterval(() => setText(formatRelativeTime(iso)), 5000);
    return () => clearInterval(id);
  }, [iso]);

  return text;
}

export function MobileVehicleBar({ vehicle, onClose }: VehiclePanelProps) {
  const relTime = useRelativeTime(vehicle.timestamp);

  return (
    <div className="shrink-0 border-b border-white/5 bg-gray-900 px-3 py-2 sm:hidden">
      <div className="flex items-center gap-3">
        <span className="shrink-0 rounded-lg bg-blue-600 px-2.5 py-1 text-sm font-bold text-white">
          {vehicle.line_number}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold leading-tight text-white">{vehicle.headsign}</p>
          <p className="truncate text-xs text-gray-400">
            {vehicle.license_plate} &middot; {relTime}
          </p>
        </div>
        <button
          onClick={onClose}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm text-gray-400 transition hover:bg-white/20 hover:text-white"
          aria-label="Zamknij"
        >
          X
        </button>
      </div>
    </div>
  );
}

export default function VehiclePanel({ vehicle, onClose }: VehiclePanelProps) {
  const relTime = useRelativeTime(vehicle.timestamp);

  return (
    <div className="absolute top-4 right-4 z-[1000] hidden w-80 rounded-2xl bg-gray-900/95 p-5 text-white shadow-2xl backdrop-blur-sm sm:block">
      <button
        onClick={onClose}
        className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-sm text-gray-400 transition hover:bg-white/20 hover:text-white"
        aria-label="Zamknij"
      >
        X
      </button>

      <div className="mb-3 flex items-center gap-3">
        <span className="rounded-lg bg-blue-600 px-3 py-1.5 text-lg font-bold">
          {vehicle.line_number}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold leading-tight">{vehicle.headsign}</p>
          <p className="text-sm text-gray-400">{vehicle.license_plate}</p>
        </div>
      </div>

      <div className="space-y-1.5 border-t border-white/10 pt-3 text-sm">
        <Row label="Pozycja" value={`${vehicle.latitude.toFixed(5)}, ${vehicle.longitude.toFixed(5)}`} />
        <Row label="Aktualizacja" value={relTime} />
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-gray-400">{label}</span>
      <span className="truncate text-sm font-medium text-gray-300" title={value}>
        {value}
      </span>
    </div>
  );
}
