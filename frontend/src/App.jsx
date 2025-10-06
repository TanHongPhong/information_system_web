import { BrowserRouter, Routes, Route } from "react-router-dom";

// Pages
import HomePage from "./pages/HomePage";
import NotFound from "./pages/NotFound";

import VehicleList from "./pages/VehicleList";
import TransportCompanies from "./pages/TransportCompanies";
import PaymentQR from "./pages/PaymentQR";
import PaymentHistory from "./pages/PaymentHistory";
import CommodityForm from "./pages/CommodityForm";
// Nếu CommodityForm để trong "components", đổi import trên thành:
// import CommodityForm from "./components/CommodityForm";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Home & 404 */}
        <Route path="/" element={<HomePage />} />
        <Route path="*" element={<NotFound />} />

        {/* Vehicles */}
        <Route path="/vehicle_list" element={<VehicleList />} />

        {/* Transport Companies */}
        <Route path="/transport_companies" element={<TransportCompanies />} />

        {/* Payment History */}
        <Route path="/payment_history" element={<PaymentHistory />} />

        {/* Payment QR (giữ alias để không vỡ link cũ) */}
        <Route path="/payment_qr" element={<PaymentQR />} />
        <Route path="/paymentQR" element={<PaymentQR />} />

        {/* Commodity Form (giữ alias để không vỡ link cũ) */}
        <Route path="/commodity_form" element={<CommodityForm />} />
        <Route path="/commodityform" element={<CommodityForm />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
