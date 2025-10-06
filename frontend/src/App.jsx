import { BrowserRouter, Routes, Route } from "react-router-dom";

// Pages (giữ cả 2 nhánh)
import HomePage from "./pages/HomePage";
import NotFound from "./pages/NotFound";
import WarehouseInOut from "./pages/WarehouseInOut";
import OrderTracking from "./pages/OrderTracking";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Home & 404 */}
        <Route path="/" element={<HomePage />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/warehouse" element={<WarehouseInOut />} />
        <Route path="/order-tracking" element={<OrderTracking />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
