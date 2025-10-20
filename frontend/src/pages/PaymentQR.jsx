// App.jsx
import React, { useState } from "react";
import Sidebar from "../components/payment/Sidebar";
import HeaderBar from "../components/payment/HeaderBar";
import PaymentPage from "../components/payment/PaymentPage";

export default function App() {
  const [q, setQ] = useState("");
  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen">
      <Sidebar />
      <main className="ml-20">
        <HeaderBar
          keyword={q}
          onKeywordChange={setQ}
          placeholder="Tìm giao dịch, mã đơn, số tiền…"
        />
        <PaymentPage />
        <footer className="text-center text-slate-400 text-xs mt-4 mb-6">
          © 2025 Gemadept – Mẫu giao diện demo thanh toán QR.
        </footer>
      </main>
    </div>
  );
}
