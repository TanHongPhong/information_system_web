import { BrowserRouter, Routes, Route } from "react-router-dom"; // Lưu ý dùng 'react-router-dom'
import HomePage from "./pages/HomePage";
import NotFound from "./pages/NotFound";
import VehicleList from "./pages/VehicleList";
import TransportCompanies from "./pages/TransportCompanies";
import PaymentQR from "./pages/Payment";
import PaymentHistory from "./pages/PaymentHistory";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/vehicle_list" element={<VehicleList />} />
          <Route path="/transport_companies" element={<TransportCompanies />} />
          <Route path="/payment" element={<PaymentQR />} />
          <Route path="/payment_history" element={<PaymentHistory />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
