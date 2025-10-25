// components/TipsCard.jsx
import React from "react";
import { CheckCircle } from "lucide-react";

export default function TipsCard() {
  return (
    <div className="bg-white rounded-2xl shadow-[0_12px_40px_rgba(2,6,23,.08)] border border-slate-200 p-5">
      <h4 className="font-semibold mb-3 text-blue-700">Mẹo đóng gói an toàn</h4>
      <ul className="text-sm text-slate-700 space-y-2">
        <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-emerald-600" />Bọc đệm góc và mặt hàng dễ vỡ.</li>
        <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-emerald-600" />Dán nhãn “Hàng dễ vỡ” nếu cần.</li>
        <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-emerald-600" />Ghi rõ người nhận & số điện thoại.</li>
      </ul>
    </div>
  );
}
