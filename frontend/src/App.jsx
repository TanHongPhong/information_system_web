import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Pages
import HomePage from "./pages/HomePage.jsx";
import NotFound from "./pages/NotFound.jsx";
import WareHouse from "./pages/WareHouse.jsx";
import OrderTracking from "./pages/OrderTracking.jsx";
import PaymentQR from "./pages/PaymentQR.jsx";
import PaymentHistory from "./pages/PaymentHistory.jsx";
import TransportCompanies from "./pages/TransportCompanies.jsx";
import VehicleList from "./pages/VehicleList.jsx";
import OrderTrackingCustomner from "./pages/OrderTrackingCustomer.jsx";
import Supplier from "./pages/Supplier.jsx";
import NhapIn4 from "./pages/NhapIn4.jsx";
import ChiTietDonHang from "./pages/ChiTietDonHang.jsx";
import SignIn from "./pages/SignIn.jsx";


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Canonical routes (dùng gạch-nối) */}
        <Route path="/" element={<HomePage />} />
        <Route path="/transport-companies" element={<TransportCompanies />} />
        <Route path="/vehicle-list" element={<VehicleList />} />
        <Route path="/payment-history" element={<PaymentHistory />} />
        <Route path="/payment-qr" element={<PaymentQR />} />
        <Route path="/order-tracking" element={<OrderTracking />} />
        <Route path="/warehouse" element={<WareHouse />} />
        <Route path="/nhap-in4" element={<NhapIn4 />} />
        <Route path="/chi-tiet-don-hang" element={<ChiTietDonHang />} />
        <Route path="/home-page" element={<HomePage />} />
        <Route path="/sign-in" element={<SignIn />} />

        <Route
          path="/order-tracking-customer"
          element={<OrderTrackingCustomner />}
        />
        <Route path="/supplier" element={<Supplier />} />

        {/* Legacy aliases → redirect về canonical để tránh trùng nội dung */}
        <Route
          path="/transport_companies"
          element={<Navigate to="/transport-companies" replace />}
        />
        <Route
          path="/vehicle_list"
          element={<Navigate to="/vehicle-list" replace />}
        />
        <Route
          path="/payment_history"
          element={<Navigate to="/payment-history" replace />}
        />
        <Route
          path="/payment_qr"
          element={<Navigate to="/payment-qr" replace />}
        />
        <Route
          path="/order_tracking"
          element={<Navigate to="/order-tracking" replace />}
        />
        <Route
          path="/warehouse_in_out"
          element={<Navigate to="/warehouse-in-out" replace />}
        />

        {/* 404 cuối cùng */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
