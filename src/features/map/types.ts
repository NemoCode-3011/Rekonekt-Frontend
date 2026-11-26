// One pin on the map. `id` is what comes back when the visitor picks it.
export interface MapMarker {
  id: string;
  latitude: number;
  longitude: number;
  label: string;
}

export interface MapViewProps {
  markers: MapMarker[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  /** Visitors who ask for less motion get no gliding between places. */
  reduceMotion?: boolean;
  /** What a screen reader calls the map. */
  label: string;
  /** Gives the map its size, for example "h-[60svh] w-full". */
  className?: string;
}