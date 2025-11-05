// src/components/theo doi don hang/VehicleDetailsPanel.jsx
import React, { useMemo } from "react";

export default function VehicleDetailsPanel({ order }) {
  // Tính toán các giá trị từ order data (đã có license_plate, vehicle_type từ JOIN)
  const vehicleInfo = useMemo(() => {
    if (!order) return null;

    const weightKg = order?.weight_kg || 0;
    const volumeM3 = order?.volume_m3 || 0;
    
    // Tính chiều dài và rộng ước tính từ volume (nếu có)
    // Giả sử container dạng hình chữ nhật: dài x rộng x cao = volume
    const estimatedLength = volumeM3 > 0 ? Math.cbrt(volumeM3 * 2).toFixed(1) : null;
    const estimatedWidth = estimatedLength ? (parseFloat(estimatedLength) * 0.4).toFixed(1) : null;

    return {
      licensePlate: order?.license_plate || "—",
      vehicleType: order?.vehicle_type || "—",
      weightKg: weightKg > 0 ? `${(weightKg / 1000).toFixed(1)} tons` : "—",
      volumeM3: volumeM3 > 0 ? `${(volumeM3 * 1000).toLocaleString()} liters` : "—",
      estimatedLength: estimatedLength ? `${estimatedLength} meters` : "—",
      estimatedWidth: estimatedWidth ? `${estimatedWidth} meters` : "—",
      orderId: order?.order_id || "—",
      companyName: order?.company_name || "—",
    };
  }, [order]);

  if (!order) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-900 text-[14px]">
            Vehicle Details
          </h3>
        </div>
        <div className="mt-4 text-center text-slate-500 text-sm">
          Select an order to view vehicle details
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-900 text-[14px]">
          Vehicle Details
        </h3>
      </div>

      <div className="mt-3 flex items-start gap-3">
        <div className="shrink-0 w-10 h-10 rounded-full ring-1 ring-slate-200 grid place-items-center bg-blue-50">
          <span className="text-[10px] font-semibold text-blue-600">
            {vehicleInfo?.vehicleType?.charAt(0)?.toUpperCase() || "V"}
          </span>
        </div>

        <div className="text-sm leading-snug flex-1 min-w-0">
          <div className="font-semibold text-slate-900 text-[14px]">
            {vehicleInfo?.vehicleType || "Vehicle"}
          </div>
          <div className="text-[12px] text-slate-500 mt-1">
            License Plate:{" "}
            <span className="text-slate-700 font-normal">{vehicleInfo?.licensePlate}</span>
          </div>
          {vehicleInfo?.orderId && vehicleInfo.orderId !== "—" && (
            <div className="text-[12px] text-slate-500">
              Order ID:{" "}
              <span className="text-slate-700 font-normal">#{vehicleInfo.orderId}</span>
            </div>
          )}
          {vehicleInfo?.companyName && vehicleInfo.companyName !== "—" && (
            <div className="text-[12px] text-slate-500">
              Company:{" "}
              <span className="text-slate-700 font-normal">{vehicleInfo.companyName}</span>
            </div>
          )}
        </div>
      </div>

      {/* Ảnh xe */}
      <div className="mt-3 rounded-xl ring-1 ring-slate-200 overflow-hidden bg-white">
        <img
          src="https://png.pngtree.com/background/20250120/original/pngtree-d-rendering-of-an-isolated-white-truck-seen-from-the-side-picture-image_13354856.jpg"
          alt="Truck"
          className="block w-full h-auto object-contain bg-white"
        />
      </div>

      {/* Thông tin chi tiết */}
      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-[12px] leading-snug text-slate-600">
        {vehicleInfo?.weightKg && vehicleInfo.weightKg !== "—" && (
          <div>
            Cargo Weight{" "}
            <span className="font-semibold text-slate-800">{vehicleInfo.weightKg}</span>
          </div>
        )}
        {vehicleInfo?.estimatedWidth && vehicleInfo.estimatedWidth !== "—" && (
          <div className="text-right">
            Cargo Width{" "}
            <span className="font-semibold text-slate-800">{vehicleInfo.estimatedWidth}</span>
          </div>
        )}
        {vehicleInfo?.volumeM3 && vehicleInfo.volumeM3 !== "—" && (
          <div>
            Cargo Volume{" "}
            <span className="font-semibold text-slate-800">{vehicleInfo.volumeM3}</span>
          </div>
        )}
        {vehicleInfo?.estimatedLength && vehicleInfo.estimatedLength !== "—" && (
          <div className="text-right">
            Cargo Length{" "}
            <span className="font-semibold text-slate-800">{vehicleInfo.estimatedLength}</span>
          </div>
        )}
      </div>
    </div>
  );
}
