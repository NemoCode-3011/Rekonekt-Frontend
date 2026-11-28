import {Suspense } from "react";
import type { MapViewProps } from "./types";
import { lazyWithReload as lazy } from "../../lib/lazyWithReload";

// Leaflet is big, so it is only downloaded when a page really shows a map.
const MapView = lazy(() => import("./MapView"));

export default function LazyMap(props: MapViewProps) {
  return (
    <Suspense
      fallback={
        <div
          role="status"
          className={`grid place-items-center bg-sand/30 text-body-s text-muted ${props.className ?? ""}`}
        >
          Loading the map…
        </div>
      }
    >
      <MapView {...props} />
    </Suspense>
  );
}