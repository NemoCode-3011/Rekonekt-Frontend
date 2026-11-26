import { useEffect, useRef } from "react";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import { parseLocation } from "../api/location";

interface LocationPickerProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  invalid?: boolean;
}

const NIGERIA_CENTER: L.LatLngExpression = [9.08, 8.68];

// Leaflet's default marker image paths are not resolved reliably by Vite.
const locationIcon = L.divIcon({
  className: "",
  html:
    '<span class="flex size-7 items-center justify-center">' +
    '<span class="block size-5 rounded-full border-[3px] border-ivory bg-heritage-green shadow-lg"></span>' +
    '</span>',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

/** Map pin picker with coordinate / Google Maps paste as an accessible fallback. */
export default function LocationPicker({
  id,
  value,
  onChange,
  invalid = false,
}: LocationPickerProps) {
  const mapHost = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    const host = mapHost.current;
    if (!host) return;

    const map = L.map(host, {
      center: NIGERIA_CENTER,
      zoom: 6,
      scrollWheelZoom: false,
    });
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    map.on("click", (event: L.LeafletMouseEvent) => {
      const { lat, lng } = event.latlng;
      onChangeRef.current(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    });

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    let location: ReturnType<typeof parseLocation> = null;
    try {
      location = parseLocation(value);
    } catch {
      // Keep the map usable while the visitor corrects a pasted value.
    }

    if (!location) {
      markerRef.current?.remove();
      markerRef.current = null;
      return;
    }

    const point: L.LatLngExpression = [location.latitude, location.longitude];
    if (markerRef.current) markerRef.current.setLatLng(point);
    else {
      markerRef.current = L.marker(point, {
        icon: locationIcon,
        title: "Selected place location",
        keyboard: true,
      }).addTo(map);
    }
    map.setView(point, Math.max(map.getZoom(), 10));
  }, [value]);

  return (
    <div className="space-y-3">
      <div
        ref={mapHost}
        role="region"
        aria-label="Choose a place on the map"
        className="h-72 w-full border border-line"
      />
      <input
        id={id}
        value={value}
        aria-invalid={invalid}
        placeholder="6.3350, 5.6037 or a Google Maps link"
        className={`w-full border bg-transparent px-3 py-2.5 font-sans text-body-s focus:border-heritage-green ${invalid ? "border-error" : "border-line"}`}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
