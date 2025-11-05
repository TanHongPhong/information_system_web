// App.jsx
import React, { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout.jsx";
import PaymentPage from "../components/payment/PaymentPage";

export default function App() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get("orderId");

  // Kiểm tra role và logout nếu không đúng
  useEffect(() => {
    const userData = localStorage.getItem("gd_user");
    const role = localStorage.getItem("role");

    if (!userData || role !== "user") {
      console.warn(`Access denied: Role '${role}' is not allowed for user pages`);
      logout();
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("gd_user");
    localStorage.removeItem("role");
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("remember");
    navigate("/sign-in", { replace: true });
  };

  return (
    <AppLayout>
      <PaymentPage orderId={orderId} />
      <footer className="text-center text-slate-400 text-xs mt-4 mb-6">
        © 2025 Gemadept – Mẫu giao diện demo thanh toán QR.
      </footer>
    </AppLayout>
  );
}
