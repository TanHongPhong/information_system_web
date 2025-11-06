import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import feather from "feather-icons";
import api from "../lib/axios";
import { useOrdersData } from "../hooks/useOrdersData";

import AppLayout from "../components/layout/AppLayout.jsx";
import VehiclesPanel from "../components/quan li doi xe/VehiclesPanel";
import TruckPanel from "../components/quan li doi xe/TruckPanel";
import LoadManagement from "../components/quan li doi xe/LoadManagement";

export default function DashboardLogistics() {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const isFirstLoadRef = React.useRef(true);

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

  // Lấy company_id từ localStorage
  const getCompanyId = () => {
    try {
      const userData = localStorage.getItem("gd_user");
      if (userData) {
        const user = JSON.parse(userData);
        if (user.company_id) return user.company_id;
      }
    } catch (error) {
      console.error("Error getting company_id:", error);
    }
    return null;
  };

  // Fetch vehicles từ API
  useEffect(() => {
    const fetchVehicles = async (silent = false) => {
      try {
        // Chỉ hiển thị loading ở lần fetch đầu tiên
        if (isFirstLoadRef.current && !silent) {
          setLoading(true);
        }
        
        const companyId = getCompanyId();
        
        if (!companyId) {
          console.warn("No company_id found");
          setVehicles([]);
          if (isFirstLoadRef.current) setLoading(false);
          return;
        }

        const response = await api.get(`/transport-companies/${companyId}/vehicles`);
        const data = response.data || [];
        setVehicles(data);
        
        // Auto-select first vehicle if none selected (chỉ lần đầu)
        if (isFirstLoadRef.current && data.length > 0 && !selectedId) {
          setSelectedId(data[0].vehicle_id);
        }
        
      } catch (error) {
        console.error("Error fetching vehicles:", error);
        setVehicles([]);
      } finally {
        // Chỉ set loading false ở lần đầu (trước khi set isFirstLoadRef = false)
        if (isFirstLoadRef.current && !silent) {
          setLoading(false);
        }
        // Set isFirstLoadRef = false sau khi đã xử lý loading
        isFirstLoadRef.current = false;
      }
    };

    // Lần đầu: hiển thị loading
    fetchVehicles(false);
    
    // Refresh mỗi 30 giây: fetch ngầm (silent)
    const interval = setInterval(() => fetchVehicles(true), 30000);
    return () => clearInterval(interval);
  }, []);

  // render feather icons sau khi mount
  useEffect(() => {
    feather.replace();
  }, []);


  // xe đang chọn
  const [selectedId, setSelectedId] = useState(null);
  
  // Transform vehicle từ API format sang format cho TruckPanel
  const selectedVehicle = useMemo(() => {
    if (!selectedId || !vehicles.length) return null;
    
    const vehicle = vehicles.find((v) => v.vehicle_id === selectedId);
    if (!vehicle) return null;

    // Transform API vehicle data sang format mà TruckPanel cần
    return {
      id: `VEHICLE-${vehicle.vehicle_id}`,
      plate: vehicle.license_plate,
      driver: vehicle.driver_name || "Chưa phân công",
      status: vehicle.status?.toLowerCase() || "available",
      location: vehicle.current_location || vehicle.vehicle_region || "Chưa có thông tin",
      capacity: vehicle.capacity_ton || 15,
      vehicle_type: vehicle.vehicle_type,
      active: vehicle.status === "IN_USE" ? 1 : vehicle.status === "MAINTENANCE" ? 2 : 0,
    };
  }, [selectedId, vehicles]);
  
  const MAX_TON = selectedVehicle?.capacity || 15;

  // Tính load percent dựa trên tổng weight của orders (chuyển từ kg sang tấn)
  const LOAD_PERCENT = useMemo(() => {
    if (!orders.length || !MAX_TON) return 0;
    const totalWeightKg = orders.reduce((sum, order) => sum + (Number(order.weight) || 0), 0);
    const totalWeightTon = totalWeightKg / 1000; // Chuyển từ kg sang tấn
    const percent = (totalWeightTon / MAX_TON) * 100;
    return Math.min(percent, 100); // Không vượt quá 100%
  }, [orders, MAX_TON]);

  // Sử dụng hook để fetch orders với caching và filter theo vehicle_id
  const { orders: fetchedOrders, loading: ordersLoadingFromHook } = useOrdersData({
    vehicleId: selectedId,
    autoRefresh: true,
    refreshInterval: 30000,
    silentRefresh: true,
  });

  // Filter orders: chỉ hiển thị các đơn hàng đã ACCEPTED và các status sau đó
  // Chỉ hiển thị orders thuộc về xe được chọn (đảm bảo vehicle_id khớp)
  // Transform orders để match với OrdersGrid format
  useEffect(() => {
    if (!selectedId) {
      setOrders([]);
      setOrdersLoading(false);
      return;
    }

    // Filter chỉ các status hợp lệ (từ ACCEPTED trở đi, không bao gồm WAREHOUSE_RECEIVED vì đã nhận kho) và đảm bảo vehicle_id khớp
    const VALID_STATUSES = ['ACCEPTED', 'LOADING', 'IN_TRANSIT', 'COMPLETED'];
    const validOrders = fetchedOrders.filter(order => {
      // Đảm bảo order thuộc về xe được chọn
      const orderVehicleId = order.vehicle_id;
      const matchesVehicle = orderVehicleId === selectedId || orderVehicleId === Number(selectedId);
      // Đảm bảo status hợp lệ
      const matchesStatus = VALID_STATUSES.includes(order.status);
      return matchesVehicle && matchesStatus;
    });
    
    const transformedOrders = validOrders.map(order => ({
      id: order.order_id, // Giữ nguyên order_id để dùng cho navigation
      weight: order.weight_kg || 0,
      route: order.pickup_address && order.dropoff_address 
        ? `${order.pickup_address} – ${order.dropoff_address}`
        : order.pickup_address || order.dropoff_address || "Chưa có thông tin",
      date: order.created_at 
        ? new Date(order.created_at).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })
        : "—",
      status: order.status,
      cargo_name: order.cargo_name,
    }));

    setOrders(transformedOrders);
    setOrdersLoading(ordersLoadingFromHook);
  }, [selectedId, fetchedOrders, ordersLoadingFromHook]);

  return (
    <AppLayout className="bg-[#F8F9FD] text-[#1C2A44]">
      <div className="p-6 h-[calc(100vh-72px)] overflow-hidden">
          {/* lưới 2 cột: trái = danh sách xe, phải = truck panel + load + orders */}
          <div className="grid grid-cols-[390px_1fr] gap-6 h-full">
            {/* LEFT: danh sách xe có scroll riêng */}
            <VehiclesPanel
              selectedId={selectedId}
              onSelectVehicle={setSelectedId}
            />

            {/* RIGHT */}
            <div className="flex flex-col min-h-0 overflow-auto">
              {selectedVehicle ? (
                <>
              <TruckPanel
                vehicle={selectedVehicle}
                loadPercent={LOAD_PERCENT}
                maxTon={MAX_TON}
              />
              <LoadManagement 
                loadPercent={LOAD_PERCENT} 
                maxTon={MAX_TON}
                orders={orders}
                loading={ordersLoading}
              />
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-500">
                  {loading ? "Đang tải..." : "Chọn một xe để xem thông tin"}
                </div>
              )}
            </div>
          </div>
        </div>
    </AppLayout>
  );
}
