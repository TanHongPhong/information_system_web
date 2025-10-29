// App.jsx
import React from "react";
import { useSearchParams } from "react-router-dom";
import Sidebar from "../components/user/Sidebar";
import Topbar from "../components/user/Topbar";
import PaymentPage from "../components/payment/PaymentPage";

export default function App() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen">
      <Sidebar />
      <Topbar />
      <main className="ml-20 pt-[72px]">
        <PaymentPage orderId={orderId} />
        <footer className="text-center text-slate-400 text-xs mt-4 mb-6">
          © 2025 Gemadept – Mẫu giao diện demo thanh toán QR.
        </footer>
      </main>
    </div>
  );
}
