import { useMemo } from 'react';
import { Marker } from 'react-leaflet';
import L from 'leaflet';
import { getLineColor } from './LineFilter';
import type { Vehicle } from '../types/api';

interface VehicleMarkerProps {
  vehicle: Vehicle;
  isSelected: boolean;
  onSelect: (vehicle: Vehicle) => void;
}

function createVehicleIcon(lineNumber: string, isSelected: boolean, bearing: number | null) {
  const color = getLineColor(lineNumber);
  const circleSize = isSelected ? 36 : 28;
  const r = circleSize / 2;
  const fontSize = lineNumber.length > 2 ? 11 : 13;

  // Extra space for arrow
  const arrowLen = 10;
  const totalSize = circleSize + arrowLen * 2;
  const center = totalSize / 2;

  let arrowSvg = '';
  if (bearing !== null) {
    // Arrow tip position on the edge of the circle
    const arrowDist = r + arrowLen - 1;
    const rad = ((bearing - 90) * Math.PI) / 180;
    const tipX = center + Math.cos(rad) * arrowDist;
    const tipY = center + Math.sin(rad) * arrowDist;

    // Two base points spread perpendicular to the bearing
    const baseDist = r - 2;
    const spread = 0.35;
    const bx1 = center + Math.cos(rad - spread) * baseDist;
    const by1 = center + Math.sin(rad - spread) * baseDist;
    const bx2 = center + Math.cos(rad + spread) * baseDist;
    const by2 = center + Math.sin(rad + spread) * baseDist;

    arrowSvg = `<polygon points="${tipX},${tipY} ${bx1},${by1} ${bx2},${by2}" fill="${color}" opacity="0.9"/>`;
  }

  const svg = `
    <svg width="${totalSize}" height="${totalSize}" viewBox="0 0 ${totalSize} ${totalSize}" xmlns="http://www.w3.org/2000/svg">
      ${arrowSvg}
      <circle cx="${center}" cy="${center}" r="${r - 2}" fill="${color}" stroke="${isSelected ? '#facc15' : '#fff'}" stroke-width="${isSelected ? 3 : 2}"/>
      <text x="${center}" y="${center + fontSize * 0.35}" text-anchor="middle" fill="white" font-size="${fontSize}" font-weight="700" font-family="system-ui, sans-serif">${lineNumber}</text>
    </svg>`;

  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [totalSize, totalSize],
    iconAnchor: [center, center],
  });
}

export default function VehicleMarker({ vehicle, isSelected, onSelect }: VehicleMarkerProps) {
  const icon = useMemo(
    () => createVehicleIcon(vehicle.line_number, isSelected, vehicle.bearing),
    [vehicle.line_number, isSelected, vehicle.bearing],
  );

  return (
    <Marker
      position={[vehicle.latitude, vehicle.longitude]}
      icon={icon}
      eventHandlers={{ click: () => onSelect(vehicle) }}
    />
  );
}
