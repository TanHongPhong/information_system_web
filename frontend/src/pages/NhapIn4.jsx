import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter, Plus, Archive } from "lucide-react";

import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

import CargoLocalStyles from "../components/nhap_in4/CargoLocalStyles";
import Stepper from "../components/nhap_in4/Stepper";
import CargoForm from "../components/nhap_in4/CargoForm";
import CostSummary from "../components/nhap_in4/CostSummary";
import PackingTips from "../components/nhap_in4/PackingTips";

export default function CargoInfoPage() {
  const nav = useNavigate();

  // --- form state
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [category, setCategory] = useState("");
  const [weight, setWeight] = useState("");
  const [len, setLen] = useState("");
  const [wid, setWid] = useState("");
  const [hei, setHei] = useState("");
  const [note, setNote] = useState("");

  // --- fees
  const { w, volWeight, chargeWeight, perKg, serviceFee, total } =
    useMemo(() => {
      const wN = parseFloat(weight || "0") || 0;
      const L = parseFloat(len || "0") || 0;
      const W = parseFloat(wid || "0") || 0;
      const H = parseFloat(hei || "0") || 0;
      const vW = L && W && H ? (L * W * H) / 6000 : 0;
      const cW = Math.max(wN, vW);
      const perKgFee = 8000 * cW;
      const srv = 0;
      const totalFee = Math.round(20000 + perKgFee + srv);
      return {
        w: wN,
        volWeight: vW,
        chargeWeight: cW,
        perKg: perKgFee,
        serviceFee: srv,
        total: totalFee,
      };
    }, [weight, len, wid, hei]);

  // back & submit
  const handleBack = () => nav(-1); // quay lại 1 bước history
  const onSubmit = (e) => {
    e.preventDefault();
    nav("/payment-qr");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <CargoLocalStyles />

      {/* SIDEBAR cố định */}
      <aside className="fixed inset-y-0 left-0 w-20 bg-white border-r border-slate-200 z-40">
        <Sidebar />
      </aside>

      {/* KHỐI PHẢI: topbar + content */}
      <div className="ml-20">
        {/* TOPBAR cố định cao 64px */}
        <div className="fixed top-0 left-20 right-0 h-16 bg-white/95 backdrop-blur border-b z-50">
          <Topbar
            centerSearch={
              <div className="relative w-full max-w-2xl">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  className="w-full h-10 pl-9 pr-24 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-200"
                  placeholder="Search by User id, User Name, Date etc"
                />
                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 grid place-items-center rounded-lg border border-slate-200 hover:bg-slate-50"
                  title="Filter"
                >
                  <Filter className="w-4 h-4" />
                </button>
              </div>
            }
            rightItems={
              <div className="flex items-center gap-2 md:gap-3">
                <button
                  className="h-9 w-9 rounded-lg grid place-items-center ring-1 ring-blue-200 text-blue-600 bg-white hover:bg-blue-50"
                  title="New"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  className="h-9 w-9 rounded-lg grid bg-blue-50 place-items-center border border-slate-200 hover:bg-slate-50"
                  title="Archive"
                >
                  <Archive className="w-4 h-4" />
                </button>
              </div>
            }
          />
        </div>

        {/* CONTENT: padding top = chiều cao topbar */}
        <main className="pt-20 px-3 sm:px-4 lg:px-6">
          <div className="max-w-7xl mx-auto">
            {/* header hàng 1 */}
            <div className="flex items-center justify-between gap-3">
              <Stepper current={2} />
              <button
                type="button"
                onClick={handleBack}
                className="h-10 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50"
              >
                ← Trở lại danh sách xe
              </button>
            </div>

            {/* lưới 2 cột lớn + 1 cột nhỏ */}
            <div className="grid lg:grid-cols-3 gap-6 mt-6">
              {/* FORM bên trái: 2 cột (span 2) */}
              <section className="lg:col-span-2">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6">
                  <CargoForm
                    origin={origin}
                    setOrigin={setOrigin}
                    destination={destination}
                    setDestination={setDestination}
                    recipientName={recipientName}
                    setRecipientName={setRecipientName}
                    recipientPhone={recipientPhone}
                    setRecipientPhone={setRecipientPhone}
                    category={category}
                    setCategory={setCategory}
                    weight={weight}
                    setWeight={setWeight}
                    len={len}
                    setLen={setLen}
                    wid={wid}
                    setWid={setWid}
                    hei={hei}
                    setHei={setHei}
                    note={note}
                    setNote={setNote}
                    onSubmit={onSubmit}
                    onBack={handleBack} // nếu CargoForm có hỗ trợ Back
                    submitText="Thanh toán" // đổi label nút submit
                    hideContinue // ẩn nút "Tiếp tục" trong CargoForm
                  />
                </div>
              </section>

              {/* ASIDE phải: sticky */}
              <aside className="lg:col-span-1">
                <div className="space-y-4 lg:sticky lg:top-24">
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5">
                    <CostSummary
                      w={w}
                      volWeight={volWeight}
                      chargeWeight={chargeWeight}
                      base={20000}
                      perKg={perKg}
                      serviceFee={serviceFee}
                      total={total}
                    />
                  </div>
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5">
                    <PackingTips />
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
