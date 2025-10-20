// App.jsx
import React, { useState } from "react";
import Sidebar from "../components/nhap_in4/Sidebar";
import HeaderBar from "../components/nhap_in4/HeaderBar";
import CargoPage from "../components/nhap_in4/CargoPage";

export default function App() {
  const [keyword, setKeyword] = useState("");
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <Sidebar />
      <main className="ml-20">
        <HeaderBar
          keyword={keyword}
          onKeywordChange={setKeyword}
          placeholder="Tìm tuyến đường, loại xe, tài xế..."
        />
        <CargoPage />
      </main>
    </div>
  );
}
