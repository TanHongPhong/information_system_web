import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Pages
import HomePage from "./pages/HomePage.jsx";
import NotFound from "./pages/NotFound.jsx";
import WareHouse from "./pages/WareHouse.jsx";

import PaymentQR from "./pages/PaymentQR.jsx";
import PaymentHistory from "./pages/PaymentHistory.jsx";
import TransportCompanies from "./pages/TransportCompanies.jsx";
import VehicleList from "./pages/VehicleList.jsx";
import OrderTrackingCustomner from "./pages/OrderTrackingCustomer.jsx";
import Suplier from "./pages/Suplier.jsx";
import NhapIn4 from "./pages/NhapIn4.jsx";
import ChiTietDonHang from "./pages/ChiTietDonHang.jsx";
import SignIn from "./pages/SignIn.jsx";
import HomePageAdmin from "./pages/HomePageAdmin.jsx";
import QuanLiDoiXe from "./pages/QuanLiDoiXe.jsx";
import OrderTracking from "./pages/OrderTracking.jsx";
import Driver from "./pages/Driver.jsx";



export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Canonical routes (dùng gạch-nối) */}
        <Route path="/" element={<HomePageAdmin />} />
        <Route path="/chi-tiet-don-hang" element={<ChiTietDonHang />} />
        <Route path="/home-page" element={<HomePage />} />
        <Route path="/transport-companies" element={<TransportCompanies />} />
        <Route path="/vehicle-list" element={<VehicleList />} />
        <Route path="/payment-history" element={<PaymentHistory />} />
        <Route path="/payment-qr" element={<PaymentQR />} />
        <Route path="/suplier" element={<Suplier />} />
        <Route path="/warehouse" element={<WareHouse />} />
        <Route path="/nhap-in4" element={<NhapIn4 />} />
        <Route path="/quan-li-doi-xe" element={<QuanLiDoiXe />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/order-tracking" element={<OrderTracking />} />

        <Route path="/driver" element={<Driver />} />
        <Route path="/homepage-admin" element={<HomePageAdmin />} />
    
       

        <Route
          path="/order-tracking-customer"
          element={<OrderTrackingCustomner />}
        />
  

        {/* Legacy aliases → redirect về canonical để tránh trùng nội dung */}
        <Route
          path="/transport_companies"
          element={<Navigate to="/transport-companies" replace />}
        />
        <Route
          path="/vehicle_list"
          element={<Navigate to="/vehicle-list" replace />}
        />
        <Route
          path="/payment_history"
          element={<Navigate to="/payment-history" replace />}
        />
        <Route
          path="/payment_qr"
          element={<Navigate to="/payment-qr" replace />}
        />
        

        {/* 404 cuối cùng */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
