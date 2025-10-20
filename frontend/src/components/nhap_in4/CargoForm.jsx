// components/CargoForm.jsx
import React, { useMemo, useState } from "react";
import { MapPin, Crosshair, User, Phone, Layers, Scale, Move, Edit3, ArrowRight, CreditCard } from "lucide-react";
import { Input, Select, TextArea, Lbl } from "./Fields";

const cur = (v) => (v || 0).toLocaleString("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 });

export default function CargoForm({ onCalc }) {
  const [form, setForm] = useState({
    origin: "", destination: "", recipient_name: "", recipient_phone: "",
    category: "", weight: "", len: "", wid: "", hei: "", note: "",
  });

  const set = (k) => (e) => setForm((s) => ({ ...s, [k]: e.target.value }));

  const numbers = {
    weight: parseFloat(form.weight) || 0,
    len: parseFloat(form.len) || 0,
    wid: parseFloat(form.wid) || 0,
    hei: parseFloat(form.hei) || 0,
  };

  const { wReal, wVol, wCharge, base, perKg, srv } = useMemo(() => {
    const w = numbers.weight;
    const { len, wid, hei } = numbers;
    const vol = len && wid && hei ? (len * wid * hei) / 6000 : 0;
    const charge = Math.max(w, vol);
    const base = 20000;
    const perKg = 8000 * charge;
    const srv = 0;
    onCalc?.({ wReal: w, wVol: vol, wCharge: charge, base, perKg, srv });
    return { wReal: w, wVol: vol, wCharge: charge, base, perKg, srv };
  }, [numbers.weight, numbers.len, numbers.wid, numbers.hei, onCalc]);

  const submit = (e) => {
    e.preventDefault();
    alert("Đã lưu thông tin hàng hóa. Bước tiếp theo: Xác nhận & thanh toán.");
  };

  return (
    <form onSubmit={submit} className="bg-white rounded-2xl shadow-[0_12px_40px_rgba(2,6,23,.08)] border border-slate-200 p-6 space-y-8">
      {/* Địa điểm */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Lbl required>Nơi gửi hàng</Lbl>
          <Input icon={<MapPin className="w-4 h-4" />} placeholder="VD: Kho Thủ Đức" required value={form.origin} onChange={set("origin")} />
        </div>
        <div>
          <Lbl required>Nơi nhận</Lbl>
          <Input icon={<Crosshair className="w-4 h-4" />} placeholder="VD: Coopmart Q1" required value={form.destination} onChange={set("destination")} />
        </div>
      </div>

      {/* Người nhận */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Lbl required>Người nhận</Lbl>
          <Input icon={<User className="w-4 h-4" />} placeholder="VD: Lương Quang Trè" required value={form.recipient_name} onChange={set("recipient_name")} />
        </div>
        <div>
          <Lbl>Số điện thoại</Lbl>
          <Input icon={<Phone className="w-4 h-4" />} inputMode="tel" placeholder="VD: 09xx xxx xxx" value={form.recipient_phone} onChange={set("recipient_phone")} />
        </div>
      </div>

      {/* Loại hàng + Cân nặng */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Lbl required>Loại hàng</Lbl>
          <Select icon={<Layers className="w-4 h-4" />} required value={form.category} onChange={set("category")}>
            <option value="">Chọn loại hàng</option>
            <option value="general">Hàng tổng hợp</option>
            <option value="fragile">Dễ vỡ</option>
            <option value="food">Thực phẩm</option>
            <option value="electronics">Điện tử</option>
            <option value="oversize">Cồng kềnh</option>
          </Select>
        </div>
        <div>
          <Lbl required>Cân nặng</Lbl>
          <Input icon={<Scale className="w-4 h-4" />} type="number" step="0.1" placeholder="VD: 1.5" unit="kg" required value={form.weight} onChange={set("weight")} />
        </div>
      </div>

      {/* Kích thước */}
      <div>
        <Lbl>Kích thước hàng</Lbl>
        <div className="grid grid-cols-3 gap-2 mt-2">
          <Input icon={<Move className="w-4 h-4" />} type="number" placeholder="Dài" unit="cm" value={form.len} onChange={set("len")} />
          <Input icon={<Move className="w-4 h-4" />} type="number" placeholder="Rộng" unit="cm" value={form.wid} onChange={set("wid")} />
          <Input icon={<Move className="w-4 h-4" />} type="number" placeholder="Cao" unit="cm" value={form.hei} onChange={set("hei")} />
        </div>
        <p className="text-[12px] text-slate-500 mt-1">Dùng để tính <b>khối lượng quy đổi</b> = D×R×C / 6000.</p>
      </div>

      {/* Ghi chú */}
      <div>
        <Lbl>Ghi chú</Lbl>
        <TextArea icon={<Edit3 className="w-4 h-4" />} placeholder="Yêu cầu đóng gói, khung giờ giao, địa chỉ chi tiết..." value={form.note} onChange={set("note")} />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <a href="./chon-xe.html" className="text-blue-700 underline underline-offset-2">Trở lại</a>
        <div className="flex items-center gap-2">
          <button type="button" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl shadow-[0_12px_40px_rgba(2,6,23,.08)]">
            Tiếp tục <ArrowRight className="w-4 h-4" />
          </button>
          <button type="submit" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl shadow-[0_12px_40px_rgba(2,6,23,.08)] focus:outline-none focus:ring-2 focus:ring-blue-200 bg-blue-700 text-white">
            <CreditCard className="w-4 h-4" /> Thanh toán
          </button>
        </div>
      </div>

      {/* (Optional) hiển thị nhỏ để dev check nhanh tính toán */}
      <div className="hidden text-xs text-slate-500">
        wReal:{wReal} • wVol:{wVol} • wCharge:{wCharge} • base:{cur(20000)} • perKg:{cur(perKg)}
      </div>
    </form>
  );
}
