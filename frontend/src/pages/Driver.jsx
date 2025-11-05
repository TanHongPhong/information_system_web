import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DriverHeader from "../components/driver/DriverHeader";
import VehicleRouteCard from "../components/driver/VehicleRouteCard";
import PreTripChecklist from "../components/driver/PreTripChecklist";
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
        setOrders(response.orders || []);
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
      
      // Thành công - giữ state đã update
      alert("Đã ghi nhận xuất phát thành công!");
    } catch (err) {
      console.error("Error recording departure:", err);
      // Rollback: khôi phục state trước đó
      setOrders(previousOrders);
      alert("Lỗi khi ghi nhận xuất phát: " + err.message);
    }
  };

  const handleWarehouseArrival = async () => {
    if (!vehicleInfo) return;

    try {
      // Hiện loading vì cần cập nhật location từ server
      setLoading(true);
      
      const orderIds = orders.map((o) => o.order_id);
      await driverAPI.recordWarehouseArrival(
        vehicleInfo.vehicle_id,
        orderIds,
        vehicleInfo.routeTo,
        null,
        "Đã tới kho đích"
      );
      
      // Reload để cập nhật location từ server
      await loadVehicleInfo();
      
      alert("Đã ghi nhận vị trí đến kho! Vui lòng nhấn 'Nhập kho' cho từng đơn hàng để hoàn tất.");
    } catch (err) {
      console.error("Error recording warehouse arrival:", err);
      alert("Lỗi khi ghi nhận đến kho: " + err.message);
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
                vehicleId={vehicleInfo.vehicle_id}
              />

              <PreTripChecklist />

              <OrdersOnTruck 
                orders={orders} 
                vehicleId={vehicleInfo.vehicle_id}
                warehouseLocation={vehicleInfo.routeTo}
                updatingOrderId={updatingOrderId}
                onAcceptWarehouseEntry={async (orderId) => {
                  try {
                    // Optimistic update: cập nhật UI ngay lập tức
                    setUpdatingOrderId(orderId);
                    const previousOrders = [...orders];
                    
                    // Cập nhật state local ngay (render ngầm)
                    setOrders(prevOrders => 
                      prevOrders.map(order => 
                        order.order_id === orderId || order.id === orderId
                          ? { ...order, status: 'WAREHOUSE_RECEIVED' }
                          : order
                      )
                    );

                    // Gọi API
                    await driverAPI.acceptWarehouseEntry(
                      orderId,
                      vehicleInfo.vehicle_id,
                      vehicleInfo.routeTo,
                      null,
                      "Đã nhập kho"
                    );
                    
                    // Thành công - giữ state đã update
                    alert("Đã nhập kho thành công!");
                  } catch (err) {
                    console.error("Error accepting warehouse entry:", err);
                    // Rollback: khôi phục state trước đó
                    setOrders(previousOrders);
                    alert("Lỗi khi nhập kho: " + err.message);
                  } finally {
                    setUpdatingOrderId(null);
                  }
                }}
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
