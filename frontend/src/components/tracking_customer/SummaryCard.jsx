export default function SummaryCard() {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-3">
      <h3 className="font-semibold">Tóm tắt</h3>
      <div className="mt-2 text-sm">
        <div className="flex items-center justify-between py-1">
          <span>Kiện hàng</span><span className="font-semibold">3</span>
        </div>
        <div className="flex items-center justify-between py-1">
          <span>Khối lượng</span><span className="font-semibold">120 kg</span>
        </div>
        <div className="flex items-center justify-between py-1">
          <span>Phí vận chuyển</span><span className="font-semibold">420.000₫</span>
        </div>
        <div className="border-t mt-2 pt-2 flex items-center justify-between">
          <span className="font-semibold">Tổng thanh toán</span>
          <span className="font-bold text-slate-900">420.000₫</span>
        </div>
      </div>
    </div>
  );
}
