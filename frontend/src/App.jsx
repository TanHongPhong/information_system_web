import { BrowserRouter, Routes, Route } from "react-router-dom"; // Lưu ý dùng 'react-router-dom'
import HomePage from "./pages/HomePage";
import NotFound from "./pages/NotFound";
import VehicleList from "./pages/VehicleList";
import TransportCompanies from "./pages/TransportCompanies";
import PaymentQR from "./pages/PaymentQR";
import PaymentHistory from "./pages/PaymentHistory";
import CommodityForm from "./pages/CommodityForm";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/vehicle_list" element={<VehicleList />} />
          <Route path="/commodity_form" element={<CommodityForm />} /> 
          <Route path="/payment_history" element={<PaymentHistory />} />
          <Route path="/paymentQR" element={<PaymentQR />} /> 
          <Route path="/transport_companies" element={<TransportCompanies />} />  
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
