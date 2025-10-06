import { BrowserRouter, Routes, Route } from "react-router-dom";

import HomePage from "./pages/HomePage";
import NotFound from "./pages/NotFound";
import WarehouseInOut from "./pages/WarehouseInOut";
import OrderTracking from "./pages/OrderTracking";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/warehouse" element={<WarehouseInOut />} />
        <Route path="/order-tracking" element={<OrderTracking />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
