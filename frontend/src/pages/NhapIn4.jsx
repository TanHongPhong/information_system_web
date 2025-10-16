import { useEffect, useState } from "react";
import feather from "feather-icons";
import Stepper from "../components/nhap_in4/Stepper.jsx";
import CargoForm from "../components/nhap_in4/CargoForm.jsx";
import SummaryCard from "../components/nhap_in4/SummaryCard.jsx";
import TipsCard from "../components/nhap_in4/TipsCard.jsx";
import UseChargeCalc from "../components/nhap_in4/UseChargeCalc.jsx";

export default function App() {
  // --- Form state (chia sẻ giữa Form & Summary) ---
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

  // --- Tính toán phí dùng chung ---
  const calc = UseChargeCalc({ weight, len, wid, hei });

  // Icons cho header/sidebar
  useEffect(() => { feather.replace({ width: 21, height: 21 }); }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* CSS custom giữ y hệt bản gốc cho UI/UX */}
      <style>{`
        .field{ position:relative }
        .field .icon{ position:absolute; left:.75rem; top:50%; transform:translateY(-50%); color:#94a3b8 }
        .field input,.field select,.field textarea{
          width:100%; padding:.625rem .875rem; padding-left:2.25rem;
          border-radius:.75rem; border:1px solid #e2e8f0; background:#fff;
          outline:none; transition: box-shadow .15s, border-color .15s;
        }
        .field textarea{ min-height:110px; padding-left:2.25rem }
        .field input:focus,.field select:focus,.field textarea:focus{
          border-color:#2563eb; box-shadow:0 0 0 3px rgba(37,99,235,.15);
        }
        .label{ font-size:14px; font-weight:600; color:#1d4ed8 }
        .help{ font-size:12px; color:#64748b; margin-top:.25rem }
        .unit{ position:absolute; right:.75rem; top:50%; transform:translateY(-50%); color:#64748b; font-size:13px }
        .required::after{ content:" *"; color:#ef4444 }
        .field-note .icon{ top:1rem; transform:none; }
        .link-brand{ color:#1d4ed8 !important; }
        .link-brand:hover{ color:#1e40af !important; }
        .stepper li{ display:flex; align-items:center; }
        .stepper .done, .stepper .active{ color:#1d4ed8; }
        .stepper .upcoming{ color:#60a5fa; }
        .stepper .badge{ width:1.5rem; height:1.5rem; display:grid; place-items:center; border-radius:9999px; margin-right:.5rem; }
        .stepper .badge-done, .stepper .badge-active{ border:2px solid #1d4ed8; color:#1d4ed8; }
        .stepper .badge-upcoming{ border:2px solid #93c5fd; color:#60a5fa; }
        .section-title{ color:#1d4ed8 !important; }
        .btn-primary{ background:#1d4ed8; color:#fff; border:0 !important; }
        .btn-primary:hover{ background:#1e40af; }
        .btn-reset{ appearance:none; -webkit-appearance:none; border:0; }
      `}</style>

      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-20 bg-white border-r border-slate-200 flex flex-col items-center gap-3 p-3">
        <div className="mt-1 mb-1 text-center">
          <span className="inline-grid place-items-center w-14 h-14 rounded-xl bg-gradient-to-br from-sky-50 to-white text-sky-600 ring-1 ring-sky-200/60 shadow-sm">
            <i data-feather="shield" className="w-6 h-6" />
          </span>
          <div className="mt-1 text-[10px] font-semibold tracking-wide text-sky-700">6A</div>
        </div>
        <div className="flex flex-col items-center gap-4">
          <button className="w-10 h-10 rounded-xl grid place-items-center text-blue-600 bg-blue-50 ring-1 ring-blue-200" title="Trang chủ"><i data-feather="home" /></button>
          <button className="w-10 h-10 rounded-xl grid place-items-center text-slate-400 hover:text-slate-600 hover:bg-slate-50" title="Theo dõi vị trí"><i data-feather="map" /></button>
          <button className="w-10 h-10 rounded-xl grid place-items-center text-slate-400 hover:text-slate-600 hover:bg-slate-50" title="Lịch sử giao dịch"><i data-feather="file-text" /></button>
          <button className="w-10 h-10 rounded-xl grid place-items-center text-slate-400 hover:text-slate-600 hover:bg-slate-50" title="Người dùng"><i data-feather="user" /></button>
          <button className="w-10 h-10 rounded-xl grid place-items-center text-slate-400 hover:text-slate-600 hover:bg-slate-50" title="Cài đặt"><i data-feather="settings" /></button>
        </div>
      </aside>

      <main className="ml-20">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b md:py-1 bg-gradient-to-l from-blue-900 via-sky-200 to-white">
          <div className="flex items-center justify-between px-3 md:px-5 py-2.5">
            <div className="flex-1 max-w-2xl mr-3 md:mr-6">
              <div className="relative">
                <i data-feather="search" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input className="w-full h-10 pl-9 pr-24 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-200" placeholder="Tìm tuyến đường, loại xe, tài xế..." />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 grid place-items-center rounded-lg border border-slate-200 hover:bg-slate-50" title="Filter">
                  <i data-feather="filter" className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              <button className="h-9 w-9 rounded-lg grid place-items-center ring-1 ring-blue-200 text-blue-600 bg-white hover:bg-blue-50" title="New"><i data-feather="plus" className="w-4 h-4" /></button>
              <button className="h-9 w-9 rounded-lg grid bg-blue-50 place-items-center border border-slate-200 hover:bg-slate-50" title="Notifications"><i data-feather="bell" className="w-4 h-4" /></button>
              <button className="h-9 w-9 rounded-lg grid bg-blue-50 place-items-center border border-slate-200 hover:bg-slate-50" title="Archive"><i data-feather="archive" className="w-4 h-4" /></button>
              <button type="button" className="group inline-flex items-center gap-2 pl-1 pr-2 py-1.5 rounded-full bg-white text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50">
                <img src="https://i.pravatar.cc/40?img=8" alt="Avatar" className="w-8 h-8 rounded-full object-cover" />
                <div className="text-left leading-tight hidden sm:block">
                  <div className="text-[13px] font-semibold">Harsh Vani</div>
                  <div className="text-[11px] text-slate-500 -mt-0.5">Deportation Manager</div>
                </div>
                <i data-feather="chevron-down" className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="max-w-7xl px-3 sm:px-4 lg:px-6 py-6">
          <div className="bg-white rounded-2xl shadow-soft border border-slate-200 p-4">
            <Stepper
              steps={[
                { label: "Chọn xe", status: "done" },
                { label: "Nhập thông tin hàng hóa", status: "active" },
                { label: "Xác nhận", status: "upcoming" },
              ]}
            />
          </div>

          <div className="grid lg:grid-cols-3 gap-6 mt-6">
            {/* Form */}
            <CargoForm
              origin={origin} setOrigin={setOrigin}
              destination={destination} setDestination={setDestination}
              recipientName={recipientName} setRecipientName={setRecipientName}
              recipientPhone={recipientPhone} setRecipientPhone={setRecipientPhone}
              category={category} setCategory={setCategory}
              weight={weight} setWeight={setWeight}
              len={len} setLen={setLen}
              wid={wid} setWid={setWid}
              hei={hei} setHei={setHei}
              note={note} setNote={setNote}
            />

            {/* Summary + Tips */}
            <aside className="lg:col-span-1">
              <div className="lg:sticky lg:top-24 space-y-4">
                <SummaryCard calc={calc} />
                <TipsCard />
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
