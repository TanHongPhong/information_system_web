import { BrowserRouter, Routes, Route } from "react-router-dom";


import HomePage from "./pages/HomePage.jsx";
import NotFound from "./pages/NotFound.jsx";
import WarehouseInOut from "./pages/WarehouseInOut.jsx";
import OrderTracking from "./pages/OrderTracking.jsx";
import PaymentQR from "./pages/PaymentQR.jsx";
import PaymentHistory from "./pages/PaymentHistory.jsx";
import TransportCompanies from "./pages/TransportCompanies.jsx";
import VehicleList from "./pages/VehicleList.jsx";
import OrderTrackingCustomner from "./pages/OrderTrackingCustomer.jsx"
import Supplier from "./pages/Supplier.jsx";
import OrderRequestDetails from "./pages/OrderRequestDetails.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<HomePage />} />
        <Route path="/transport-companies" element={<TransportCompanies />} />
        <Route path="/vehicle-list" element={<VehicleList />} />
        <Route path="/payment-history" element={<PaymentHistory />} />
        <Route path="/payment-qr" element={<PaymentQR />} />
        <Route path="/order-tracking" element={<OrderTracking />} />
        <Route path="/warehouse-in-out" element={<WarehouseInOut />} />
        <Route path="/order-tracking-customer" element={<OrderTrackingCustomner />} />
        <Route path="/supplier" element={<Supplier />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/order-request-details" element={<OrderRequestDetails />} />
  
      </Routes>
    </BrowserRouter>
  );
}

export default App;
