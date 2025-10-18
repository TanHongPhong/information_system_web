"use client";
import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

export default function MiniMap({ latA, lngA, latB, lngB }) {
  const ref = useRef(null);

  useEffect(() => {
    let map, L;
    let mounted = true;

    (async () => {
      const leaflet = await import("leaflet");
      if (!mounted || !ref.current) return;
      L = leaflet;

      // Fix default icon path warnings (optional)
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      map = L.map(ref.current, {
        attributionControl: false,
        zoomControl: false,
        scrollWheelZoom: false,
        dragging: false,
        doubleClickZoom: false,
        boxZoom: false,
        keyboard: false,
        tap: false,
      });

      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png",
        { maxZoom: 19 }
      ).addTo(map);

      const hasA = isFinite(latA) && isFinite(lngA);
      const hasB = isFinite(latB) && isFinite(lngB);

      if (hasA) L.circleMarker([latA, lngA], { radius: 6, weight: 2, color: "#2563eb", fillColor: "#60a5fa", fillOpacity: 0.9 }).addTo(map);
      if (hasB) L.circleMarker([latB, lngB], { radius: 6, weight: 2, color: "#059669", fillColor: "#34d399", fillOpacity: 0.9 }).addTo(map);

      if (hasA && hasB) {
        map.fitBounds([[latA, lngA], [latB, lngB]], { padding: [12, 12], maxZoom: 16 });
      } else if (hasA) {
        map.setView([latA, lngA], 15);
      } else if (hasB) {
        map.setView([latB, lngB], 15);
      } else {
        map.setView([10.776, 106.700], 12);
      }

      // ensure correct size after mount
      setTimeout(() => map && map.invalidateSize(), 0);
    })();

    return () => {
      mounted = false;
      if (map) map.remove();
    };
  }, [latA, lngA, latB, lngB]);

  return <div ref={ref} className="mini-map pointer-events-none w-full h-28" />;
}
