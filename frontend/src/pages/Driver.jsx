import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DriverHeader from "../components/driver/DriverHeader";
import VehicleRouteCard from "../components/driver/VehicleRouteCard";
import LoadOrderInput from "../components/driver/LoadOrderInput";
import OrdersOnTruck from "../components/driver/OrdersOnTruck";
import { driverAPI } from "../lib/api";

export default function DriverPage() {
  const navigate = useNavigate();
  const [vehicleInfo, setVehicleInfo] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingOrderId, setUpdatingOrderId] = useState(null); // Track đơn hàng đang được cập nhật

  // Kiểm tra role nghiêm ngặt và logout nếu không đúng
  useEffect(() => {
    const checkRole = () => {
      const userData = localStorage.getItem("gd_user");
      const role = localStorage.getItem("role");

      if (!userData || role !== "driver") {
        console.error(`❌ Access denied: Role '${role}' is not allowed for driver page. Required: driver`);
        alert("Bạn không có quyền truy cập trang này. Vui lòng đăng nhập với tài khoản driver.");
        logout();
        return false;
      }
      return true;
    };

    // Kiểm tra ngay khi mount
    if (!checkRole()) {
      return;
    }

    // Fetch vehicle info khi đã xác nhận role
    loadVehicleInfo();

    // Listen for storage changes (khi user logout ở tab khác hoặc đổi role)
    const handleStorageChange = () => {
      if (!checkRole()) {
        return;
      }
    };

    window.addEventListener("storage", handleStorageChange);
    
    // Kiểm tra lại định kỳ (mỗi 2 giây) để catch các thay đổi role
    const intervalId = setInterval(() => {
      if (!checkRole()) {
        clearInterval(intervalId);
      }
    }, 2000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(intervalId);
    };
  }, []);

  const logout = () => {
    // Xóa tất cả dữ liệu authentication
    localStorage.removeItem("gd_user");
    localStorage.removeItem("role");
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("remember");
    localStorage.removeItem("auth_token");
    
    // Sử dụng window.location.href để đảm bảo redirect hoàn toàn
    window.location.href = "/sign-in";
  };

  const loadVehicleInfo = async () => {
    try {
      setLoading(true);
      setError(null);

      const userData = localStorage.getItem("gd_user");
      if (!userData) {
        throw new Error("User data not found");
      }

      const user = JSON.parse(userData);
      
      try {
        const response = await driverAPI.getVehicleInfo(user.email, user.phone);
        setVehicleInfo(response.vehicle);
        // Filter bỏ các đơn hàng đã nhận kho (WAREHOUSE_RECEIVED) - không hiển thị trong giao diện xe nữa
        const filteredOrders = (response.orders || []).filter(order => order.status !== 'WAREHOUSE_RECEIVED');
        setOrders(filteredOrders);
      } catch (apiErr) {
        // Nếu lỗi 404, hiển thị thông báo hướng dẫn
        if ((apiErr.message && apiErr.message.includes("404")) || (apiErr.message && apiErr.message.includes("Not Found"))) {
          throw new Error(
            "Không tìm thấy xe được gán cho tài khoản này.\n\n" +
            "Vui lòng liên hệ quản trị viên để:\n" +
            "1. Tạo record trong bảng Drivers để liên kết user với vehicle\n" +
            "2. Hoặc cập nhật Vehicles.driver_phone để khớp với số điện thoại của bạn\n\n" +
            "Email: " + (user.email || "N/A") + "\n" +
            "Phone: " + (user.phone || "N/A")
          );
        }
        throw apiErr;
      }
    } catch (err) {
      console.error("Error loading vehicle info:", err);
      setError(err.message || "Không thể tải thông tin xe");
    } finally {
      setLoading(false);
    }
  };

  const handleDeparture = async () => {
    if (!vehicleInfo) return;

    // Kiểm tra tất cả đơn hàng đã được bốc chưa
    const unloadedOrders = orders.filter(order => !order.is_loaded);
    if (unloadedOrders.length > 0) {
      const unloadedCodes = unloadedOrders.map(o => o.order_code || o.order_id).join(", ");
      alert(`Vui lòng bốc hàng cho các đơn hàng sau trước khi xuất phát:\n${unloadedCodes}`);
      return;
    }

    try {
      // Optimistic update: cập nhật UI ngay (render ngầm)
      const previousOrders = [...orders];
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.status === 'LOADING' || order.status === 'ACCEPTED'
            ? { ...order, status: 'IN_TRANSIT' }
            : order
        )
      );

      const orderIds = orders.map((o) => o.order_id);
      await driverAPI.recordDeparture(
        vehicleInfo.vehicle_id,
        orderIds,
        vehicleInfo.routeFrom,
        "Xuất phát từ kho"
      );
      
      // Reload để cập nhật từ server
      await loadVehicleInfo();
      
      // Thành công - giữ state đã update
      alert("Đã ghi nhận xuất phát thành công!");
    } catch (err) {
      console.error("Error recording departure:", err);
      // Rollback: khôi phục state trước đó
      setOrders(previousOrders);
      alert("Lỗi khi ghi nhận xuất phát: " + err.message);
    }
  };

  const handleOrderLoaded = async (loadedOrder) => {
    // Cập nhật order trong state
    setOrders(prevOrders =>
      prevOrders.map(order =>
        (order.order_id === loadedOrder.order_id || order.id === loadedOrder.order_id)
          ? { ...order, is_loaded: true, loaded_at: loadedOrder.loaded_at, status: loadedOrder.status }
          : order
      )
    );
  };

  const handleStartLoading = async () => {
    if (!vehicleInfo) return;

    try {
      const response = await driverAPI.startLoading(vehicleInfo.vehicle_id);
      
      // Reload để cập nhật từ server
      await loadVehicleInfo();
      
      alert(`Đã bắt đầu bốc hàng! ${response.updated_orders} đơn hàng đã chuyển sang trạng thái "Đang bốc hàng".`);
    } catch (err) {
      console.error("Error starting loading:", err);
      alert("Lỗi khi bắt đầu bốc hàng: " + err.message);
    }
  };

  const handleMarkOrderLoaded = async (orderId) => {
    if (!vehicleInfo) return;

    try {
      await driverAPI.markOrderLoaded(orderId, vehicleInfo.vehicle_id);
      
      // Cập nhật state
      setOrders(prevOrders =>
        prevOrders.map(order =>
          (order.order_id === orderId || order.id === orderId)
            ? { ...order, is_loaded: true, loaded_at: new Date().toISOString() }
            : order
        )
      );
      
      alert("Đã đánh dấu đơn hàng đã bốc!");
    } catch (err) {
      console.error("Error marking order loaded:", err);
      alert("Lỗi khi đánh dấu đơn hàng đã bốc: " + err.message);
    }
  };


  const handleWarehouseArrival = async () => {
    if (!vehicleInfo) return;

    // Lấy danh sách đơn hàng có status IN_TRANSIT
    const inTransitOrders = orders.filter(o => o.status === 'IN_TRANSIT');
    
    if (inTransitOrders.length === 0) {
      alert("Không có đơn hàng nào đang vận chuyển để nhập kho.");
      return;
    }

    if (!window.confirm(`Xác nhận đã tới kho cho ${inTransitOrders.length} đơn hàng? Tất cả đơn hàng sẽ được xóa khỏi xe và xe sẽ trở về trạng thái ban đầu.`)) {
      return;
    }

    try {
      setLoading(true);
      setUpdatingOrderId('all');
      const previousOrders = [...orders];
      const previousVehicleInfo = { ...vehicleInfo };
      
      // Xóa tất cả đơn IN_TRANSIT khỏi danh sách
      setOrders(prevOrders => 
        prevOrders.filter(order => order.status !== 'IN_TRANSIT')
      );

      // Gọi API cho từng đơn hàng để cập nhật status và vị trí xe
      const orderIds = inTransitOrders.map((o) => o.order_id);
      for (const orderId of orderIds) {
        try {
          await driverAPI.acceptWarehouseEntry(
            orderId,
            vehicleInfo.vehicle_id,
            vehicleInfo.routeTo,
            null,
            "Đã tới kho"
          );
        } catch (err) {
          console.error(`Error accepting warehouse entry for order ${orderId}:`, err);
        }
      }
      
      // Ghi nhận vị trí đến kho (cập nhật current_location của xe)
      await driverAPI.recordWarehouseArrival(
        vehicleInfo.vehicle_id,
        orderIds,
        vehicleInfo.routeTo,
        null,
        "Đã tới kho đích"
      );
      
      // Reload để cập nhật từ server (vị trí xe, danh sách đơn hàng mới)
      await loadVehicleInfo();
      
      alert(`Đã tới kho thành công! ${orderIds.length} đơn hàng đã được xóa khỏi xe. Xe đã được cập nhật vị trí tại kho.`);
    } catch (err) {
      console.error("Error recording warehouse arrival:", err);
      // Rollback: khôi phục state trước đó
      setOrders(previousOrders);
      setVehicleInfo(previousVehicleInfo);
      alert("Lỗi khi ghi nhận đến kho: " + err.message);
    } finally {
      setUpdatingOrderId(null);
      setLoading(false);
    }
  };

  // style nền radial-gradient y chang <body> gốc
  const pageBgStyle = {
    background:
      "radial-gradient(1200px 600px at -10% -10%, rgba(37,99,235,.08), transparent 60%)," +
      "radial-gradient(900px 500px at 110% -10%, rgba(37,99,235,.06), transparent 60%)," +
      "#ffffff",
  };

  return (
    <div
      className="w-full min-h-[100svh] font-sans text-slate-800 antialiased selection:bg-blue-100 selection:text-slate-900 flex justify-center"
      style={pageBgStyle}
    >
      {/* khung max-w-sm giống mobile */}
      <div className="mx-auto max-w-sm min-h-[100svh] flex flex-col w-full">
        <DriverHeader onLogout={logout} />

        <main className="flex-1 px-4 py-4 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-slate-600">Đang tải thông tin...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 text-sm whitespace-pre-line">{error}</p>
              <button
                onClick={loadVehicleInfo}
                className="mt-3 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg text-white bg-red-600 hover:bg-red-700 active:scale-[.98]"
              >
                Thử lại
              </button>
            </div>
          ) : vehicleInfo ? (
            <>
              <VehicleRouteCard
                plate={vehicleInfo.license_plate || "N/A"}
                statusText={
                  vehicleInfo.status === "IN_USE"
                    ? "Đang hoạt động"
                    : vehicleInfo.status === "AVAILABLE"
                    ? "Sẵn sàng"
                    : vehicleInfo.status === "MAINTENANCE"
                    ? "Bảo trì"
                    : "Không hoạt động"
                }
                fromLabel={vehicleInfo.routeFrom || "Chưa xác định"}
                toLabel={vehicleInfo.routeTo || "Chưa xác định"}
                onDeparture={handleDeparture}
                onWarehouseArrival={handleWarehouseArrival}
                onStartLoading={handleStartLoading}
                vehicleId={vehicleInfo.vehicle_id}
                allOrdersLoaded={orders.length > 0 && orders.every(o => o.is_loaded)}
                hasInTransitOrders={orders.some(o => o.status === 'IN_TRANSIT')}
                hasAcceptedOrders={orders.some(o => o.status === 'ACCEPTED')}
              />

              <LoadOrderInput
                vehicleId={vehicleInfo.vehicle_id}
                onOrderLoaded={handleOrderLoaded}
              />

              <OrdersOnTruck 
                orders={orders} 
                vehicleId={vehicleInfo.vehicle_id}
                warehouseLocation={vehicleInfo.routeTo}
                updatingOrderId={updatingOrderId}
                onMarkOrderLoaded={handleMarkOrderLoaded}
              />
            </>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-700 text-sm">
                Không tìm thấy xe được gán cho tài khoản này. Vui lòng liên hệ quản trị viên.
              </p>
            </div>
          )}
        </main>

        <footer className="px-4 pb-[env(safe-area-inset-bottom)] pt-2">
          <p className="text-center text-[11px] text-slate-400">
            6A Logistics · mobile
          </p>
        </footer>
      </div>
    </div>
  );
}
