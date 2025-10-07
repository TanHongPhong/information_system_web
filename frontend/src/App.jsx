import { BrowserRouter, Routes, Route } from "react-router-dom";

// Pages (giữ cả 2 nhánh)
import HomePage from "./pages/HomePage";
import NotFound from "./pages/NotFound";

import TransportCompanies from "./pages/TransportCompanies";
import VehicleList from "./pages/VehicleList";
import PaymentQR from "./pages/PaymentQR";
import PaymentHistory from "./pages/PaymentHistory";
import OrderTracking from "./pages/OrderTracking";
import WareHouse  from "./pages/WareHouse";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Home & 404 */}
        <Route path="/" element={<HomePage />} />
        <Route path="*" element={<NotFound />} />
        {/* Transport Companies */}
        <Route path="/transport-companies" element={<TransportCompanies />} />
        <Route path="/vehicle-list" element={<VehicleList />} />
        <Route path="/payment-qr" element={<PaymentQR />} />
        <Route path="/payment-history" element={<PaymentHistory />} />
        <Route path="/order-tracking" element={<OrderTracking />} />
        <Route path="/ware-house" element={<WareHouse />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
