// src/pages/OrderTrackingPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import UnifiedSidebar from "../components/layout/UnifiedSidebar.jsx";
import UnifiedTopbar from "../components/layout/UnifiedTopbar.jsx";
import OrderSearchPanel from "../components/tracking/OrderSearchPanel";
import OrderInfoPanel from "../components/tracking/OrderInfoPanel";
import StatusPanel from "../components/tracking/StatusPanel";
import VehicleDetailsPanel from "../components/tracking/VehicleDetailsPanel";

export default function OrderTrackingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // Quản lý đơn hàng được chọn
  const [selectedOrder, setSelectedOrder] = useState(null);
  // giữ chiều cao panel để StatusPanel match
  const [panelHeight, setPanelHeight] = useState(null);
  
  // Lấy order_id từ URL params
  const orderIdFromUrl = searchParams.get("order_id");

  // Kiểm tra role và logout nếu không đúng
  useEffect(() => {
    const userData = localStorage.getItem("gd_user");
    const role = localStorage.getItem("role");
    const isAdmin = localStorage.getItem("isAdmin") === "true";

    if (!userData) {
      logout();
      return;
    }

    // Kiểm tra: chỉ admin transport_company mới được vào trang này
    if (role !== "transport_company" || !isAdmin) {
      console.warn(`Access denied: Only admin transport_company can access this page. Role: '${role}', isAdmin: ${isAdmin}`);
      alert("Bạn không có quyền truy cập trang này. Chỉ admin công ty vận tải mới có quyền.");
      logout();
      return;
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("gd_user");
    localStorage.removeItem("role");
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("remember");
    navigate("/sign-in", { replace: true });
  };

  return (
    <div className="h-screen bg-slate-50 text-slate-900 font-['Inter',ui-sans-serif,system-ui] flex overflow-hidden">
      <UnifiedSidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden ml-20">
        <UnifiedTopbar />
        <div className="flex-1 min-h-0 overflow-hidden pt-[72px]">
          <div className="p-4 grid grid-cols-12 gap-4 h-full min-h-0 lg:overflow-hidden">
            {/* LEFT: Order Search */}
            <div className="col-span-12 lg:col-span-3 min-h-0 flex flex-col">
              <div className="flex-1 min-h-0">
                <OrderSearchPanel 
                  onSelectOrder={setSelectedOrder} 
                  selectedOrderId={selectedOrder?.order_id || orderIdFromUrl}
                  initialOrderId={orderIdFromUrl}
                />
              </div>
            </div>

            {/* CENTER: Order Info */}
            <div className="col-span-12 lg:col-span-6 min-h-0 flex flex-col">
              <div className="flex-1 min-h-0 overflow-auto">
                <OrderInfoPanel order={selectedOrder} onHeightChange={setPanelHeight} />
              </div>
            </div>

            {/* RIGHT: Status + Vehicle */}
            <div className="col-span-12 lg:col-span-3 min-h-0 flex flex-col">
              <div className="flex-1 min-h-0 overflow-auto pr-1 space-y-4">
                <StatusPanel order={selectedOrder} mapHeight={panelHeight} />
                <VehicleDetailsPanel order={selectedOrder} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
