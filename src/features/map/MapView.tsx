import { useEffect, useRef } from "react";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { MapViewProps } from "./types";

// Roughly the middle of Nigeria, for before the pins are known.
const NIGERIA_CENTER: L.LatLngExpression = [9.08, 8.68];

// The pin is a small coloured dot drawn with CSS, so no image files are needed.
function pinIcon(selected: boolean) {
  const dot = selected
    ? "block size-7 rounded-full border-[3px] border-ivory bg-heritage-green shadow-lg"
    : "block size-5 rounded-full border-[3px] border-ivory bg-ochre shadow-lg";

  return L.divIcon({
    className: "",
    html: `<span class="flex size-7 items-center justify-center"><span class="${dot}"></span></span>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

// An OpenStreetMap map (no account or key needed). It is loaded on demand, so
// pages without a map never download it.
export default function MapView({
  markers,
  selectedId = null,
  onSelect,
  reduceMotion = false,
  label,
  className = "",
}: MapViewProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const onSelectRef = useRef(onSelect);

  useEffect(() => {
    onSelectRef.current = onSelect;
  });

  // Create the map once.
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const map = L.map(host, {
      center: NIGERIA_CENTER,
      zoom: 6,
      scrollWheelZoom: false, // so scrolling the page never gets stuck on the map
    });

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
  }, []);

  // Show the whole set of pins when it changes.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || markers.length === 0) return;

    const animate = !reduceMotion;
    const [only] = markers;

    if (markers.length === 1 && only) {
      map.setView([only.latitude, only.longitude], 10, { animate });
      return;
    }

    map.fitBounds(
      L.latLngBounds(
        markers.map((m) => [m.latitude, m.longitude] as [number, number]),
      ),
      { padding: [40, 40], maxZoom: 10, animate },
    );
  }, [markers, reduceMotion]);

  // Draw the pins, and highlight the chosen one.
  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();

    for (const marker of markers) {
      const chosen = marker.id === selectedId;

      L.marker([marker.latitude, marker.longitude], {
        icon: pinIcon(chosen),
        title: marker.label,
        keyboard: true,
        zIndexOffset: chosen ? 1000 : 0,
      })
        .on("click", () => onSelectRef.current?.(marker.id))
        .addTo(layer);
    }

    const chosen = markers.find((marker) => marker.id === selectedId);
    if (chosen) {
      const spot: [number, number] = [chosen.latitude, chosen.longitude];
      if (!map.getBounds().contains(spot)) {
        map.panTo(spot, { animate: !reduceMotion });
      }
    }
  }, [markers, selectedId, reduceMotion]);

  return (
    <div
      ref={hostRef}
      role="region"
      aria-label={label}
      className={`isolate ${className}`}
    />
  );
}