import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

// Pages
import HomePage from "./pages/HomePage.jsx";
import NotFound from "./pages/NotFound.jsx";
import WareHouse from "./pages/WareHouse.jsx";
import WareHouseInOut from "./pages/WareHouseInOut.jsx";

import PaymentQR from "./pages/PaymentQR.jsx";
import PaymentHistory from "./pages/PaymentHistory.jsx";
import TransportCompanies from "./pages/TransportCompanies.jsx";
import VehicleList from "./pages/VehicleList.jsx";
import OrderTrackingCustomner from "./pages/OrderTrackingCustomer.jsx";
import Suplier from "./pages/Suplier.jsx";
import NhapIn4 from "./pages/NhapIn4.jsx";
import ChiTietDonHang from "./pages/ChiTietDonHang.jsx";
import SignIn from "./pages/SignIn.jsx";
import SignUp from "./pages/SignUp.jsx";
import HomePageAdmin from "./pages/HomePageAdmin.jsx";
import QuanLiDoiXe from "./pages/QuanLiDoiXe.jsx";
import OrderTracking from "./pages/OrderTracking.jsx";
import Driver from "./pages/Driver.jsx";
import RoleDashboard from "./pages/RoleDashboard.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes - không cần đăng nhập */}
        <Route path="/" element={<HomePage />} />
        <Route path="/admin" element={<HomePageAdmin />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/transport-companies" element={<TransportCompanies />} />
        {/* Legacy redirects */}
        <Route path="/home-page" element={<Navigate to="/" replace />} />
        <Route path="/homepage-admin" element={<Navigate to="/admin" replace />} />

        {/* Protected routes - User (khách hàng) */}
        <Route
          path="/vehicle-list"
          element={
            <ProtectedRoute allowedRoles="user">
              <VehicleList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cargo-info"
          element={
            <ProtectedRoute allowedRoles="user">
              <NhapIn4 />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payment-qr"
          element={
            <ProtectedRoute allowedRoles="user">
              <PaymentQR />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payment-history"
          element={
            <ProtectedRoute allowedRoles="user">
              <PaymentHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/order-tracking-customer"
          element={
            <ProtectedRoute allowedRoles="user">
              <OrderTrackingCustomner />
            </ProtectedRoute>
          }
        />

        {/* Protected routes - Transport Company Admin */}
        <Route
          path="/suplier"
          element={
            <ProtectedRoute allowedRoles="transport_company">
              <Suplier />
            </ProtectedRoute>
          }
        />
        <Route
          path="/transports-management"
          element={
            <ProtectedRoute allowedRoles="transport_company">
              <QuanLiDoiXe />
            </ProtectedRoute>
          }
        />
        {/* Legacy redirect */}
        <Route
          path="/quan-li-doi-xe"
          element={<Navigate to="/transports-management" replace />}
        />
        <Route
          path="/order-tracking"
          element={
            <ProtectedRoute allowedRoles="transport_company">
              <OrderTracking />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chi-tiet-don-hang"
          element={
            <ProtectedRoute allowedRoles="transport_company">
              <ChiTietDonHang />
            </ProtectedRoute>
          }
        />

        {/* Protected routes - Driver */}
        <Route
          path="/driver"
          element={
            <ProtectedRoute allowedRoles="driver">
              <Driver />
            </ProtectedRoute>
          }
        />

        {/* Protected routes - Warehouse */}
        <Route
          path="/warehouse"
          element={
            <ProtectedRoute allowedRoles="warehouse">
              <WareHouse />
            </ProtectedRoute>
          }
        />
        <Route
          path="/warehouse-in-out"
          element={
            <ProtectedRoute allowedRoles="warehouse">
              <WareHouseInOut />
            </ProtectedRoute>
          }
        />

        {/* Protected routes - Dashboard (any authenticated user) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute requireAuth={true}>
              <RoleDashboard />
            </ProtectedRoute>
          }
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
        <Route
          path="/nhap-in4"
          element={<Navigate to="/cargo-info" replace />}
        />

        {/* 404 cuối cùng */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
