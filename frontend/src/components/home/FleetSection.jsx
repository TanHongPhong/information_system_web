import React from "react";
import { Truck } from "lucide-react";

const FLEET = [
  { tag:"Nhỏ gọn", name:"Van 500kg", lines:["Hàng nhỏ, tài liệu, linh kiện","Kích thước ~ 1.7 × 1.2 × 1.1m","Giao nội thành linh hoạt"]},
  { tag:"Phổ biến", name:"Xe tải 750kg", lines:["Văn phòng phẩm, hàng hộp","Kích thước ~ 2.1 × 1.4 × 1.4m","Tiết kiệm chi phí"]},
  { tag:"Đa dụng", name:"Xe tải 1 tấn", lines:["Thiết bị điện tử, nội thất nhỏ","Kích thước ~ 2.6 × 1.5 × 1.6m","Nội thành & liên tỉnh gần"]},
  { tag:"Cồng kềnh", name:"Xe tải 1.5 tấn", lines:["Nội thất, máy móc vừa","Kích thước ~ 3.2 × 1.6 × 1.7m","Ổn định cho liên tỉnh"]},
  { tag:"Liên tỉnh", name:"Xe tải 2.5 tấn", lines:["Máy móc, hàng cồng kềnh","Kích thước ~ 3.8 × 1.8 × 1.8m","Chạy cao tốc ổn định"]},
];

export default function FleetSection() {
  return (
    <section id="fleet" className="relative scroll-mt-24 pt-14 pb-16 lg:pt-20 lg:pb-20 bg-[rgb(247,250,255)] border-y border-blue-100">
      <div className="absolute inset-x-0 -top-1 h-[2px] w-full bg-ribbon bg-[length:200%_100%] animate-[shine_2.2s_linear_infinite] opacity-70" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-blue-600 font-semibold">Dịch vụ vận tải</p>
            <h2 className="mt-1 text-3xl font-extrabold title-grad leading-tight">Đa dạng loại xe</h2>
            <p className="mt-2 subtitle-soft text-sm">Từ Van 500kg đến 2.5 tấn — nội thành & liên tỉnh.</p>
          </div>
          <a href="#pricing" className="hidden md:inline-flex items-center gap-2 text-sm text-blue-600 underline underline-offset-4">Xem bảng giá</a>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {["Hàng nhẹ","Hàng cồng kềnh","Giao nhanh","Liên tỉnh"].map((t)=>(
            <span key={t} className="text-xs px-3 py-1 rounded-full bg-white border border-blue-100 text-slate-700">{t}</span>
          ))}
        </div>

        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          {FLEET.map((f)=>(
            <div key={f.name} className="card-grad relative overflow-hidden rounded-2xl bg-white border border-slate-200 transition">
              <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-blue-50" />
              <div className="p-5 relative">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">{f.tag}</span>
                  <Truck className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="mt-3 text-lg font-semibold text-slate-900">{f.name}</h3>
                <ul className="mt-2 text-sm subtitle-soft space-y-1.5">
                  {f.lines.map((l)=> <li key={l}>{l}</li>)}
                </ul>
                <div className="mt-4 flex items-center justify-between">
                  <a href="#pricing" className="text-sm text-blue-600 underline">Bảng giá</a>
                  <a href="#booking" className="px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium btn-shine">Đặt nhanh</a>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 md:hidden">
          <a href="#booking" className="w-full inline-flex justify-center px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-[0_12px_40px_rgba(2,6,23,.08)] btn-shine">
            Chọn loại xe & đặt ngay
          </a>
        </div>
      </div>
    </section>
  );
}
