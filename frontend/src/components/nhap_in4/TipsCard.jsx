import { useEffect } from "react";
import feather from "feather-icons";

export default function TipsCard() {
  useEffect(() => { feather.replace({ width: 18, height: 18 }); }, []);
  return (
    <div className="bg-white rounded-2xl shadow-soft border border-slate-200 p-5">
      <h4 className="font-semibold mb-3 section-title">Mẹo đóng gói an toàn</h4>
      <ul className="text-sm text-slate-700 space-y-2">
        <li className="flex gap-2"><i data-feather="check-circle" className="w-4 h-4 text-emerald-600" />Bọc đệm góc và mặt hàng dễ vỡ.</li>
        <li className="flex gap-2"><i data-feather="check-circle" className="w-4 h-4 text-emerald-600" />Dán nhãn “Hàng dễ vỡ” nếu cần.</li>
        <li className="flex gap-2"><i data-feather="check-circle" className="w-4 h-4 text-emerald-600" />Ghi rõ người nhận & số điện thoại.</li>
      </ul>
    </div>
  );
}
