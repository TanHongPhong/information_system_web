import { BrowserRouter, Routes, Route } from "react-router-dom";

<<<<<<< HEAD
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
=======
// Pages
import HomePage from "./pages/HomePage";
import NotFound from "./pages/NotFound";
import WarehouseInOut from "./pages/WarehouseInOut";
import OrderTracking from "./pages/OrderTracking";
import TransportCompanies from "./pages/TransportCompanies";
import PaymentHistory from "./pages/PaymentHistory";
import PaymentQR from "./pages/PaymentQR";
import VehicleList from "./pages/VehicleList";
>>>>>>> c5462653cbcb3d3e5708614818d9213e46703078

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main routes (slug-with-hyphen) */}
        <Route path="/" element={<HomePage />} />
        <Route path="/transport-companies" element={<TransportCompanies />} />
        <Route path="/vehicle-list" element={<VehicleList />} />
        <Route path="/payment-history" element={<PaymentHistory />} />
        <Route path="/payment-qr" element={<PaymentQR />} />
        <Route path="/order-tracking" element={<OrderTracking />} />
        <Route path="/warehouse-in-out" element={<WarehouseInOut />} />

        {/* Legacy aliases (giữ link cũ dạng underscore nếu cần) */}
        <Route path="/transport_companies" element={<TransportCompanies />} />
        <Route path="/vehicle_list" element={<VehicleList />} />
        <Route path="/payment_history" element={<PaymentHistory />} />
        <Route path="/payment_qr" element={<PaymentQR />} />
<<<<<<< HEAD
        <Route path="/transport_companies" element={<TransportCompanies />} />
        <Route path="/vehicle_list" element={<VehiclePages />} />
        <Route path="/order_tracking_customer" element={<OrderTrackingCustomner />} />
        <Route path="/supplier" element={<Supplier />} />
=======
        <Route path="/order_tracking" element={<OrderTracking />} />
        <Route path="/warehouse_in_out" element={<WarehouseInOut />} />

        {/* 404 cuối cùng */}
>>>>>>> c5462653cbcb3d3e5708614818d9213e46703078
        <Route path="*" element={<NotFound />} />
        <Route path="/order_request_details" element={<OrderRequestDetails />} />
  
      </Routes>
    </BrowserRouter>
  );
}

export default App;
