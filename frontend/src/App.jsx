import { BrowserRouter, Routes, Route } from "react-router-dom"; // Lưu ý dùng 'react-router-dom'
import HomePage from "./pages/HomePage";
import NotFound from "./pages/NotFound";
import VehicleList from "./pages/VehicleList";
import TransportCompanies from "./pages/TransportCompanies";
import PaymentQR from "./pages/Payment";
import PaymentHistory from "./pages/PaymentHistory";
import CommodityForm from "./components/CommodityForm";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/vehicle_list" element={<VehicleList />} />
          <Route path="/transport_companies" element={<TransportCompanies />} />
          <Route path="/payment_qr" element={<PaymentQR />} />
          <Route path="/payment_history" element={<PaymentHistory />} />
          <Route path="/commodityform" element={<CommodityForm />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
