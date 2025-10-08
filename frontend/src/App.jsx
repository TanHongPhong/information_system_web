// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";

import HomePage from "./pages/HomePage.jsx";
import NotFound from "./pages/NotFound.jsx";
import WarehouseInOut from "./pages/WarehouseInOut.jsx";
import OrderTracking from "./pages/OrderTracking.jsx";
import PaymentQR from "./pages/PaymentQR.jsx";
import PaymentHistory from "./pages/PaymentHistory.jsx";
import TransportCompanies from "./pages/TransportCompanies.jsx";
import VehiclePages from "./pages/VehicleList.jsx";
import OrderTrackingCustomner from "./pages/OrderTrackingCustomer.jsx"
import Supplier from "./pages/Supplier.jsx";
import OrderRequestDetails from "./pages/OrderRequestDetails.jsx";

// Chỉ giữ 4 trang như bạn yêu cầu
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/warehouse" element={<WarehouseInOut />} />
        <Route path="/order_tracking" element={<OrderTracking />} />
        <Route path="/payment_history" element={<PaymentHistory />} />
        <Route path="/payment_qr" element={<PaymentQR />} />
        <Route path="/transport_companies" element={<TransportCompanies />} />
        <Route path="/vehicle_list" element={<VehiclePages />} />
        <Route path="/order_tracking_customer" element={<OrderTrackingCustomner />} />
        <Route path="/supplier" element={<Supplier />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/order_request_details" element={<OrderRequestDetails />} />
  
      </Routes>
    </BrowserRouter>
  );
}
