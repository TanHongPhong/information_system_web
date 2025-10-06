import { BrowserRouter, Routes, Route } from "react-router-dom"; // Lưu ý dùng 'react-router-dom'
import HomePage from "./pages/HomePage";
import NotFound from "./pages/NotFound";
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
  );
}

export default App;
