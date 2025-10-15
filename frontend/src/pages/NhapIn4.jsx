import React, { useMemo, useState } from "react";
import {
  Shield, Home, Map as MapIcon, FileText, Bell, User, Settings,
  Search, Filter, Plus, Archive, ChevronDown,
} from "lucide-react";

import CargoLocalStyles from "../components/nhap_in4/CargoLocalStyles";
import Stepper from "../components/nhap_in4/Stepper";
import CargoForm from "../components/nhap_in4/CargoForm";
import CostSummary from "../components/nhap_in4/CostSummary";
import PackingTips from "../components/nhap_in4/PackingTips";

export default function CargoInfoPage() {
  // Form state
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [category, setCategory] = useState("");
  const [weight, setWeight] = useState(""); // kg
  const [len, setLen] = useState("");       // cm
  const [wid, setWid] = useState("");       // cm
  const [hei, setHei] = useState("");       // cm
  const [note, setNote] = useState("");

  // Derived fees
  const { w, volWeight, chargeWeight, base, perKg, serviceFee, total } = useMemo(() => {
    const wN = parseFloat(weight || "0") || 0;
    const L = parseFloat(len || "0") || 0;
    const W = parseFloat(wid || "0") || 0;
    const H = parseFloat(hei || "0") || 0;
    const vW = L && W && H ? (L * W * H) / 6000 : 0;
    const cW = Math.max(wN, vW);
    const baseFee = 20000;
    const perKgFee = 8000 * cW;
    const srv = 0;
    return {
      w: wN,
      volWeight: vW,
      chargeWeight: cW,
      base: baseFee,
      perKg: perKgFee,
      serviceFee: srv,
      total: Math.round(baseFee + perKgFee + srv),
    };
  }, [weight, len, wid, hei]);

  const onSubmit = (e) => {
    e.preventDefault();
    alert("Đã lưu thông tin hàng hóa. Bước tiếp theo: Xác nhận & thanh toán.");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <CargoLocalStyles />

      {/* === SIDEBAR (giữ nguyên) === */}
      <aside className="fixed inset-y-0 left-0 w-20 bg-white border-r border-slate-200 flex flex-col items-center gap-3 p-3">
        <div className="mt-1 mb-1 text-center">
          <span className="inline-grid place-items-center w-14 h-14 rounded-xl bg-gradient-to-br from-sky-50 to-white text-sky-600 ring-1 ring-sky-200/60 shadow-sm">
            <Shield className="w-6 h-6" />
          </span>
          <div className="mt-1 text-[10px] font-semibold tracking-wide text-sky-700">LGBT</div>
        </div>

        <div className="flex flex-col items-center gap-4">
          <button className="w-10 h-10 rounded-xl grid place-items-center text-slate-400 hover:text-slate-600 hover:bg-slate-50" title="Trang chủ"><Home /></button>
          <button className="w-10 h-10 rounded-xl grid place-items-center text-slate-400 hover:text-slate-600 hover:bg-slate-50" title="Theo dõi vị trí"><MapIcon /></button>
          <button className="w-10 h-10 rounded-xl grid place-items-center text-slate-400 hover:text-slate-600 hover:bg-slate-50" title="Lịch sử giao dịch"><FileText /></button>
          <button className="relative w-10 h-10 rounded-xl grid place-items-center text-slate-400 hover:text-slate-600 hover:bg-slate-50" title="Thông báo">
            <Bell />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          <button className="w-10 h-10 rounded-xl grid place-items-center text-slate-400 hover:text-slate-600 hover:bg-slate-50" title="Người dùng"><User /></button>
          <button className="w-10 h-10 rounded-xl grid place-items-center text-slate-400 hover:text-slate-600 hover:bg-slate-50" title="Cài đặt"><Settings /></button>
        </div>
      </aside>

      {/* === TOPBAR/HEADER (giữ nguyên) === */}
      <main className="ml-20">
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b md:py-1 bg-gradient-to-l from-blue-900 via-sky-200 to-white">
          <div className="flex items-center justify-between px-3 md:px-5 py-2.5">
            <div className="flex-1 max-w-2xl mr-3 md:mr-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input className="w-full h-10 pl-9 pr-24 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-200" placeholder="Search by User id, User Name, Date etc" />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 grid place-items-center rounded-lg border border-slate-200 hover:bg-slate-50" title="Filter">
                  <Filter className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              <button className="h-9 w-9 rounded-lg grid place-items-center ring-1 ring-blue-200 text-blue-600 bg-white hover:bg-blue-50" title="New"><Plus className="w-4 h-4" /></button>
              <button className="h-9 w-9 rounded-lg grid bg-blue-50 place-items-center border border-slate-200 hover:bg-slate-50" title="Notifications"><Bell className="w-4 h-4" /></button>
              <button className="h-9 w-9 rounded-lg grid bg-blue-50 place-items-center border border-slate-200 hover:bg-slate-50" title="Archive"><Archive className="w-4 h-4" /></button>
              <button type="button" className="group inline-flex items-center gap-2 pl-1 pr-2 py-1.5 rounded-full bg-white text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50">
                <img src="https://i.pravatar.cc/40?img=8" alt="Avatar" className="w-8 h-8 rounded-full object-cover" />
                <div className="text-left leading-tight hidden sm:block">
                  <div className="text-[13px] font-semibold">Harsh Vani</div>
                  <div className="text-[11px] text-slate-500 -mt-0.5">Deportation Manager</div>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>
        </header>

        {/* === CONTENT === */}
        <div className="max-w-7xl px-3 sm:px-4 lg:px-6 py-6">
          <Stepper current={2} />

          <div className="grid lg:grid-cols-3 gap-6 mt-6">
            {/* Form (trái) */}
            <CargoForm
              origin={origin} setOrigin={setOrigin}
              destination={destination} setDestination={setDestination}
              recipientName={recipientName} setRecipientName={setRecipientName}
              recipientPhone={recipientPhone} setRecipientPhone={setRecipientPhone}
              category={category} setCategory={setCategory}
              weight={weight} setWeight={setWeight}
              len={len} setLen={setLen} wid={wid} setWid={setWid} hei={hei} setHei={setHei}
              note={note} setNote={setNote}
              onSubmit={onSubmit}
            />

            {/* Summary + Tips (phải) */}
            <aside className="lg:col-span-1">
              <div className="lg:sticky lg:top-24 space-y-4">
                <CostSummary
                  w={w}
                  volWeight={volWeight}
                  chargeWeight={chargeWeight}
                  base={20000}
                  perKg={perKg}
                  serviceFee={serviceFee}
                  total={total}
                />
                <PackingTips />
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
