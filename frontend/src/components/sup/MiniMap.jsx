import { useEffect, useRef } from "react";
import L from "leaflet";

export default function MiniMap({ latA, lngA, latB, lngB }){
  const ref = useRef(null);

  useEffect(() => {
    if(!ref.current) return;

    // Cleanup nếu đã có map trước đó
    if(ref.current._leaflet_id){
      const container = L.DomUtil.get(ref.current);
      if(container) container._leaflet_id = null;
    }

    const map = L.map(ref.current, {
      attributionControl:false, zoomControl:false,
      scrollWheelZoom:false, dragging:false,
      doubleClickZoom:false, boxZoom:false, keyboard:false, tap:false
    });

    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png", { maxZoom:19 }).addTo(map);

    const pts = [];
    if(isFinite(latA) && isFinite(lngA)){
      pts.push([latA, lngA]);
      L.circleMarker([latA, lngA], { radius:6, weight:2, color:"#2563eb", fillColor:"#60a5fa", fillOpacity:.9 }).addTo(map);
    }
    if(isFinite(latB) && isFinite(lngB)){
      pts.push([latB, lngB]);
      L.circleMarker([latB, lngB], { radius:6, weight:2, color:"#059669", fillColor:"#34d399", fillOpacity:.9 }).addTo(map);
    }

    if(pts.length === 2){
      map.fitBounds(L.latLngBounds(pts), { padding:[12,12], maxZoom:16 });
    }else if(pts.length === 1){
      map.setView(pts[0], 15);
    }else{
      map.setView([10.776,106.700], 12);
    }

    setTimeout(() => map.invalidateSize(), 0);
    return () => map.remove();
  }, [latA, lngA, latB, lngB]);

  return <div ref={ref} className="mini-map w-full h-full rounded-lg border border-slate-200" />;
}
