import { BrowserRouter, Routes, Route } from "react-router-dom";

import HomePage from "./pages/HomePage";
import NotFound from "./pages/NotFound";
<<<<<<< HEAD
import WarehouseInOut from "./pages/WarehouseInOut";
import OrderTracking from "./pages/OrderTracking";

export default function App() {
=======

import TransportCompanies from "./pages/TransportCompanies";
import VehicleList from "./pages/VehicleList";
import PaymentQR from "./pages/PaymentQR";
import PaymentHistory from "./pages/PaymentHistory";
import OrderTracking from "./pages/OrderTracking";
import WareHouse  from "./pages/WareHouse";
function App() {
>>>>>>> 291d94a354c0d03ffa16c5b523657d213efb96e5
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/warehouse" element={<WarehouseInOut />} />
        <Route path="/order-tracking" element={<OrderTracking />} />
        <Route path="*" element={<NotFound />} />
<<<<<<< HEAD
=======
        {/* Transport Companies */}
        <Route path="/transport-companies" element={<TransportCompanies />} />
        <Route path="/vehicle-list" element={<VehicleList />} />
        <Route path="/payment-qr" element={<PaymentQR />} />
        <Route path="/payment-history" element={<PaymentHistory />} />
        <Route path="/order-tracking" element={<OrderTracking />} />
        <Route path="/ware-house" element={<WareHouse />} />
>>>>>>> 291d94a354c0d03ffa16c5b523657d213efb96e5
      </Routes>
    </BrowserRouter>
  );
}
