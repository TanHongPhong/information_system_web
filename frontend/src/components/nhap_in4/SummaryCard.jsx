const currency = (v) =>
  v.toLocaleString("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 });

export default function SummaryCard({ calc }) {
  const { wReal, wVol, wCharge, base, perKg, srv, total } = calc;

  return (
    <div className="bg-white rounded-2xl shadow-soft border border-slate-200 p-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold section-title">Ước tính chi phí</h3>
        <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">3–5 ngày</span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="text-slate-500">Cân nặng thực</div>
        <div className="text-right"><span>{wReal.toFixed(1)}</span> kg</div>

        <div className="text-slate-500">Khối lượng quy đổi</div>
        <div className="text-right"><span>{wVol ? wVol.toFixed(1) : "0"}</span> kg</div>

        <div className="text-slate-500">Tính phí theo</div>
        <div className="text-right"><span>{wCharge ? wCharge.toFixed(1) : "0"}</span> kg</div>
      </div>

      <div className="h-px bg-slate-200 my-4"></div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between"><span>Phí cơ bản</span><span>{currency(base)}</span></div>
        <div className="flex justify-between"><span>Phí theo kg</span><span>{currency(Math.round(perKg))}</span></div>
        <div className="flex justify-between"><span>Phụ phí dịch vụ</span><span>{currency(srv)}</span></div>
      </div>

      <div className="h-px bg-slate-200 my-4"></div>

      <div className="flex items-baseline justify-between">
        <div className="text-sm text-slate-500">Tổng tạm tính</div>
        <div className="text-2xl font-bold text-slate-900">{currency(total)}</div>
      </div>
      <p className="text-xs text-slate-500 mt-2">Giá tạm tính, có thể thay đổi theo khoảng cách, phụ phí và thuế.</p>
    </div>
  );
}
