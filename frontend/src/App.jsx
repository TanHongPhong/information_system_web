import { BrowserRouter, Routes, Route } from "react-router-dom";

// Pages
import HomePage from "./pages/HomePage";
import NotFound from "./pages/NotFound";
<<<<<<< HEAD
import VehicleList from "./pages/Chon_xe";
import Order from "./pages/Don_hang";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/vehicle_list" element={<VehicleList />} />
          
        </Routes>
      </BrowserRouter>
    </>
=======
import VehicleList from "./pages/VehicleList";
import TransportCompanies from "./pages/TransportCompanies";
import PaymentQR from "./pages/PaymentQR";
import PaymentHistory from "./pages/PaymentHistory";
import CommodityForm from "./pages/CommodityForm"; 
// ⬆️ Nếu dự án của bạn để CommodityForm trong "components",
// đổi dòng trên thành:  import CommodityForm from "./components/CommodityForm";

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
>>>>>>> 84ef693f0d165d2ba8725b7014cb71363c4b6aa5
  );
}

export default App;
