import { BrowserRouter, Routes, Route } from "react-router-dom";

// Pages (giữ cả 2 nhánh)
import HomePage from "./pages/HomePage";
import NotFound from "./pages/NotFound";
<<<<<<< HEAD

=======

// Nhánh A (tiếng Việt)
import ChonXe from "./pages/Chon_xe";
import Order from "./pages/Don_hang";

// Nhánh B (tiếng Anh)
>>>>>>> 8351dfd4e77eaf6373ccf9a83af2c11dad49a477
import VehicleList from "./pages/VehicleList";
import TransportCompanies from "./pages/TransportCompanies";
import PaymentQR from "./pages/PaymentQR";
import PaymentHistory from "./pages/PaymentHistory";
<<<<<<< HEAD
import CommodityForm from "./pages/CommodityForm";
// Nếu CommodityForm để trong "components", đổi import trên thành:
=======
import CommodityForm from "./pages/CommodityForm"; 
// Nếu dự án của bạn để CommodityForm trong "components":
>>>>>>> 8351dfd4e77eaf6373ccf9a83af2c11dad49a477
// import CommodityForm from "./components/CommodityForm";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Home & 404 */}
        <Route path="/" element={<HomePage />} />
        <Route path="*" element={<NotFound />} />

        {/* Vehicles (giữ cả alias) */}
        <Route path="/vehicle_list" element={<VehicleList />} />
        <Route path="/chon_xe" element={<ChonXe />} />

        {/* Đơn hàng */}
        <Route path="/don_hang" element={<Order />} />

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
