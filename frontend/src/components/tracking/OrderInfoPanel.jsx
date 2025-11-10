// src/components/tracking/OrderInfoPanel.jsx
import React, { useEffect } from "react";
import { IconPackage, IconMapPin, IconUser, IconTruck, IconDollarSign, IconClock, IconMessageCircle } from "./IconsFeather";

export default function OrderInfoPanel({ order, onHeightChange }) {
  const panelRef = React.useRef(null);

  useEffect(() => {
    if (panelRef.current && onHeightChange) {
      onHeightChange(panelRef.current.offsetHeight);
    }
    const handleResize = () => {
      if (panelRef.current && onHeightChange) {
        onHeightChange(panelRef.current.offsetHeight);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [order, onHeightChange]);

  if (!order) {
    return (
      <section className="h-full flex flex-col min-h-0">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-slate-400 mb-2">
              <IconPackage className="w-12 h-12 mx-auto" />
            </div>
            <p className="text-slate-500 text-sm">Chọn một đơn hàng để xem thông tin</p>
          </div>
        </div>
      </section>
    );
  }

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return "—";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Format date - hiển thị đẹp hơn với múi giờ UTC+7 (TP.HCM)
  const formatDate = (dateString) => {
    if (!dateString) return "—";
    try {
      const date = new Date(dateString);
      // Chuyển đổi sang múi giờ UTC+7 (TP.HCM)
      const utc7Date = new Date(date.getTime() + (7 * 60 * 60 * 1000));
      const now = new Date();
      const nowUtc7 = new Date(now.getTime() + (7 * 60 * 60 * 1000));
      const diffMs = nowUtc7 - utc7Date;
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      // Format ngày tháng năm theo múi giờ UTC+7
      const day = String(utc7Date.getUTCDate()).padStart(2, '0');
      const month = String(utc7Date.getUTCMonth() + 1).padStart(2, '0');
      const year = utc7Date.getUTCFullYear();
      const hours = String(utc7Date.getUTCHours()).padStart(2, '0');
      const minutes = String(utc7Date.getUTCMinutes()).padStart(2, '0');
      
      // Thêm thông tin tương đối nếu là hôm nay hoặc hôm qua
      let relative = "";
      if (diffDays === 0) {
        relative = " (Hôm nay)";
      } else if (diffDays === 1) {
        relative = " (Hôm qua)";
      } else if (diffDays > 1 && diffDays <= 7) {
        relative = ` (${diffDays} ngày trước)`;
      }
      
      return `${day}/${month}/${year} ${hours}:${minutes}${relative}`;
    } catch {
      return dateString;
    }
  };

  // Format date short - chỉ ngày tháng năm (UTC+7)
  const formatDateShort = (dateString) => {
    if (!dateString) return "—";
    try {
      const date = new Date(dateString);
      // Chuyển đổi sang múi giờ UTC+7 (TP.HCM)
      const utc7Date = new Date(date.getTime() + (7 * 60 * 60 * 1000));
      const day = String(utc7Date.getUTCDate()).padStart(2, '0');
      const month = String(utc7Date.getUTCMonth() + 1).padStart(2, '0');
      const year = utc7Date.getUTCFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return dateString;
    }
  };

  // Get status badge color
  const getStatusBadge = (status) => {
    const statusMap = {
      PENDING_PAYMENT: { text: "Chờ thanh toán", color: "bg-yellow-100 text-yellow-800 ring-yellow-200" },
      PAID: { text: "Đã thanh toán", color: "bg-blue-100 text-blue-800 ring-blue-200" },
      ACCEPTED: { text: "Đã tiếp nhận", color: "bg-indigo-100 text-indigo-800 ring-indigo-200" },
      LOADING: { text: "Đang bốc hàng", color: "bg-purple-100 text-purple-800 ring-purple-200" },
      IN_TRANSIT: { text: "Đang vận chuyển", color: "bg-green-100 text-green-800 ring-green-200" },
      WAREHOUSE_RECEIVED: { text: "Đã nhập kho", color: "bg-cyan-100 text-cyan-800 ring-cyan-200" },
      COMPLETED: { text: "Hoàn thành", color: "bg-emerald-100 text-emerald-800 ring-emerald-200" },
    };
    const statusInfo = statusMap[status] || { text: status, color: "bg-slate-100 text-slate-800 ring-slate-200" };
    return (
      <span className={`text-[10px] px-[0.5rem] py-[0.25rem] rounded-full font-semibold tracking-wide ring-1 ${statusInfo.color}`}>
        {statusInfo.text}
      </span>
    );
  };

  return (
    <section ref={panelRef} className="h-full flex flex-col min-h-0">
      <div className="flex-1 min-h-0 overflow-auto">
        <div className="bg-white border border-slate-200 rounded-2xl p-4">
          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-3 mb-4 pb-4 border-b border-slate-200">
            <div className="flex-1">
              <div className="text-xs text-slate-500 mb-1">Mã đơn hàng</div>
              <h2 className="text-xl font-semibold text-slate-900">
                {order.order_code || order.order_id || "—"}
              </h2>
              {order.order_code && order.order_id && order.order_code !== order.order_id && (
                <div className="text-xs text-slate-400 mt-1">ID: {order.order_id}</div>
              )}
            </div>
            <div className="flex flex-col items-end gap-2">
              {order.status && getStatusBadge(order.status)}
              {order.priority && (
                <span className={`text-[10px] px-2 py-1 rounded-full font-semibold ${
                  order.priority === 'URGENT' ? 'bg-red-100 text-red-800' :
                  order.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                  order.priority === 'NORMAL' ? 'bg-blue-100 text-blue-800' :
                  'bg-slate-100 text-slate-800'
                }`}>
                  {order.priority === 'URGENT' ? 'Khẩn cấp' :
                   order.priority === 'HIGH' ? 'Cao' :
                   order.priority === 'NORMAL' ? 'Bình thường' : 'Thấp'}
                </span>
              )}
            </div>
          </div>

          {/* Scrollable content */}
          <div className="space-y-4">
            {/* Thông tin người đặt hàng */}
            <section className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
              <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2 text-sm">
                <IconUser className="w-4 h-4 text-blue-600" />
                Thông tin người đặt hàng
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Tên người đặt</span>
                  <span className="font-medium text-slate-900">{order.contact_name || order.customer_name || "—"}</span>
                </div>
                {(order.contact_phone || order.customer_phone) && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Số điện thoại</span>
                    <span className="font-medium text-slate-900">{order.contact_phone || order.customer_phone}</span>
                  </div>
                )}
                {order.customer_email && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Email</span>
                    <span className="font-medium text-slate-900 text-xs">{order.customer_email}</span>
                  </div>
                )}
              </div>
            </section>

            {/* Thông tin người nhận */}
            {(order.recipient_name || order.recipient_phone) && (
              <section className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2 text-sm">
                  <IconUser className="w-4 h-4 text-green-600" />
                  Thông tin người nhận
                </h3>
                <div className="space-y-2 text-sm">
                  {order.recipient_name && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Tên người nhận</span>
                      <span className="font-medium text-slate-900">{order.recipient_name}</span>
                    </div>
                  )}
                  {order.recipient_phone && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Số điện thoại</span>
                      <span className="font-medium text-slate-900">{order.recipient_phone}</span>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Địa chỉ giao nhận */}
            <section className="bg-white rounded-xl p-4 border border-slate-200">
              <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2 text-sm">
                <IconMapPin className="w-4 h-4 text-slate-600" />
                Địa chỉ giao nhận
              </h3>
              <div className="space-y-3">
                {/* Điểm lấy hàng */}
                <div className="relative pl-6">
                  <div className="absolute left-0 top-1 w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Điểm lấy hàng</div>
                    <div className="font-medium text-slate-900 text-sm leading-relaxed">
                      {order.pickup_address || "—"}
                    </div>
                    {order.pickup_time && (
                      <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                        <IconClock className="w-3 h-3" />
                        {formatDate(order.pickup_time)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Line */}
                <div className="pl-[6px] h-6 border-l-2 border-dashed border-slate-300"></div>

                {/* Điểm giao hàng */}
                <div className="relative pl-6">
                  <div className="absolute left-0 top-1 w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Điểm giao hàng</div>
                    <div className="font-medium text-slate-900 text-sm leading-relaxed">
                      {order.dropoff_address || "—"}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Thông tin hàng hóa */}
            <section className="bg-white rounded-xl p-4 border border-slate-200">
              <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2 text-sm">
                <IconPackage className="w-4 h-4 text-slate-600" />
                Thông tin hàng hóa
              </h3>
              <div className="space-y-2 text-sm">
                {order.cargo_name && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Tên hàng hóa</span>
                    <span className="font-medium text-slate-900 text-right max-w-[60%]">{order.cargo_name}</span>
                  </div>
                )}
                {order.cargo_type && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Phân loại</span>
                    <span className="font-medium text-slate-900">{order.cargo_type}</span>
                  </div>
                )}
                {order.weight_kg && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Khối lượng</span>
                    <span className="font-medium text-slate-900">{Number(order.weight_kg).toLocaleString("vi-VN")} kg</span>
                  </div>
                )}
                {order.volume_m3 && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Thể tích</span>
                    <span className="font-medium text-slate-900">{Number(order.volume_m3).toFixed(3)} m³</span>
                  </div>
                )}
                {/* Parse kích thước từ note nếu có */}
                {order.note && (() => {
                  const dimsMatch = order.note.match(/Kích thước \(cm\):\s*([\d—]+)\s*x\s*([\d—]+)\s*x\s*([\d—]+)/i);
                  if (dimsMatch) {
                    const [len, wid, hei] = dimsMatch.slice(1);
                    if (len !== "—" && wid !== "—" && hei !== "—") {
                      return (
                        <div className="flex justify-between">
                          <span className="text-slate-600">Kích thước (D×R×C)</span>
                          <span className="font-medium text-slate-900">{len} × {wid} × {hei} cm</span>
                        </div>
                      );
                    }
                  }
                  return null;
                })()}
                {order.declared_value_vnd && Number(order.declared_value_vnd) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Giá trị khai báo</span>
                    <span className="font-medium text-slate-900">{formatCurrency(order.declared_value_vnd)}</span>
                  </div>
                )}
                {order.value_vnd && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Tổng phí vận chuyển</span>
                    <span className="font-medium text-blue-700">{formatCurrency(order.value_vnd)}</span>
                  </div>
                )}
              </div>

              {/* Yêu cầu đặc biệt */}
              {(order.require_cold || order.require_danger || order.require_loading || order.require_insurance) && (
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <div className="text-xs text-slate-500 mb-2">Yêu cầu đặc biệt</div>
                  <div className="flex flex-wrap gap-2">
                    {order.require_cold && (
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">Cần làm lạnh</span>
                    )}
                    {order.require_danger && (
                      <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full">Hàng nguy hiểm</span>
                    )}
                    {order.require_loading && (
                      <span className="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded-full">Cần bốc xếp</span>
                    )}
                    {order.require_insurance && (
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">Có bảo hiểm</span>
                    )}
                  </div>
                </div>
              )}
            </section>

            {/* Thông tin xe và công ty */}
            {(order.license_plate || order.vehicle_type || order.company_name || order.driver_name) && (
              <section className="bg-white rounded-xl p-4 border border-slate-200">
                <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2 text-sm">
                  <IconTruck className="w-4 h-4 text-slate-600" />
                  Thông tin vận chuyển
                </h3>
                <div className="space-y-2 text-sm">
                  {order.company_name && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Công ty vận chuyển</span>
                      <span className="font-medium text-slate-900">{order.company_name}</span>
                    </div>
                  )}
                  {order.license_plate && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Biển số xe</span>
                      <span className="font-medium text-slate-900 font-mono">{order.license_plate}</span>
                    </div>
                  )}
                  {order.vehicle_type && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Loại xe</span>
                      <span className="font-medium text-slate-900">{order.vehicle_type}</span>
                    </div>
                  )}
                  {order.capacity_ton && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Tải trọng</span>
                      <span className="font-medium text-slate-900">{order.capacity_ton} tấn</span>
                    </div>
                  )}
                  {order.driver_name && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Tài xế</span>
                      <span className="font-medium text-slate-900">{order.driver_name}</span>
                    </div>
                  )}
                  {order.driver_phone && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">SĐT tài xế</span>
                      <span className="font-medium text-slate-900">{order.driver_phone}</span>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Thông tin thời gian */}
            <section className="bg-white rounded-xl p-4 border border-slate-200">
              <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2 text-sm">
                <IconClock className="w-4 h-4 text-slate-600" />
                Thông tin thời gian
              </h3>
              <div className="space-y-3 text-sm">
                {order.created_at && (
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-slate-500">Ngày tạo đơn</span>
                    <span className="font-medium text-slate-900">{formatDate(order.created_at)}</span>
                  </div>
                )}
                {order.pickup_time && (
                  <div className="flex flex-col gap-1 pt-2 border-t border-slate-100">
                    <span className="text-xs text-slate-500">Thời gian lấy hàng</span>
                    <span className="font-medium text-slate-900">{formatDate(order.pickup_time)}</span>
                  </div>
                )}
                {order.estimated_delivery_time && (
                  <div className="flex flex-col gap-1 pt-2 border-t border-slate-100">
                    <span className="text-xs text-slate-500">Dự kiến giao hàng</span>
                    <span className="font-medium text-green-600">{formatDate(order.estimated_delivery_time)}</span>
                    {(() => {
                      try {
                        const estimated = new Date(order.estimated_delivery_time);
                        const now = new Date();
                        const diffMs = estimated - now;
                        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                        const diffDays = Math.floor(diffHours / 24);
                        
                        if (diffMs < 0) {
                          return <span className="text-xs text-red-600">(Đã quá hạn)</span>;
                        } else if (diffDays > 0) {
                          return <span className="text-xs text-slate-500">(Còn {diffDays} ngày)</span>;
                        } else if (diffHours > 0) {
                          return <span className="text-xs text-slate-500">(Còn {diffHours} giờ)</span>;
                        } else {
                          return <span className="text-xs text-orange-600">(Sắp đến hạn)</span>;
                        }
                      } catch {
                        return null;
                      }
                    })()}
                  </div>
                )}
                {order.updated_at && (
                  <div className="flex flex-col gap-1 pt-2 border-t border-slate-100">
                    <span className="text-xs text-slate-500">Cập nhật lần cuối</span>
                    <span className="font-medium text-slate-700 text-xs">{formatDate(order.updated_at)}</span>
                  </div>
                )}
              </div>
            </section>

            {/* Ghi chú */}
            {order.note && (
              <section className="bg-white rounded-xl p-4 border border-slate-200">
                <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2 text-sm">
                  <IconMessageCircle className="w-4 h-4 text-slate-600" />
                  Ghi chú
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">{order.note}</p>
              </section>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

