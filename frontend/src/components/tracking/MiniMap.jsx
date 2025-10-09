import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "80px",
  borderRadius: "0.5rem",
  border: "1px solid #e2e8f0",
  overflow: "hidden",
};

const center = {
  lat: 10.776889, // Hồ Con Rùa, TP.HCM
  lng: 106.700806,
};

export default function MiniMap() {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  if (!isLoaded) return <div className="text-sm text-slate-500">Đang tải bản đồ...</div>;

  return (
    <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={13}>
      <Marker position={center} />
    </GoogleMap>
  );
}
