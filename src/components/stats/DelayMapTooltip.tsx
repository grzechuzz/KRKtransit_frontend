import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { Tooltip, useMap } from 'react-leaflet';
import type { LatLng, Tooltip as LeafletTooltip } from 'leaflet';

export default function DelayMapTooltip({ position, children, variant = 'segment' }: { position: LatLng; children: ReactNode; variant?: 'segment' | 'stop' }) {
  const map = useMap();
  const ref = useRef<LeafletTooltip>(null);
  useEffect(() => {
    const tooltip = ref.current;
    const element = tooltip?.getElement();
    if (!tooltip || !element) return;
    const place = () => {
      const anchor = map.latLngToContainerPoint(position);
      const size = map.getSize();
      const halfWidth = element.offsetWidth / 2 + 8;
      const height = element.offsetHeight + (variant === 'stop' ? 22 : 12);
      const x = Math.max(halfWidth, Math.min(anchor.x, size.x - halfWidth));
      const y = Math.max(height, Math.min(anchor.y, size.y - 8));
      tooltip.setLatLng(map.containerPointToLatLng([x, y]));
    };
    place();
    const observer = new ResizeObserver(place);
    observer.observe(element);
    return () => observer.disconnect();
  }, [map, position, variant]);
  return <Tooltip ref={ref} pane="tooltipPane" permanent direction="top" opacity={variant === 'stop' ? 0.9 : 1} offset={[0, variant === 'stop' ? -10 : 0]} className={variant === 'stop' ? 'delay-map-stop-tooltip' : 'delay-map-tooltip'}>{children}</Tooltip>;
}
