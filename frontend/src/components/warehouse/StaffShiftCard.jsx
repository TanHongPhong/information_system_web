export default function StaffShiftCard() {
  return (
    <div className="rounded-2xl p-5 border border-slate-200 bg-white">
      <div className="flex items-center gap-2 text-sm text-slate-600">👥 Nhân sự ca hôm nay</div>
      <ul className="mt-3 space-y-2 text-sm">
        <li className="flex justify-between"><span>Ca sáng</span><span className="text-slate-700">12 NV (2 QC, 1 Supervisor)</span></li>
        <li className="flex justify-between"><span>Ca chiều</span><span className="text-slate-700">10 NV (1 QC, 1 Supervisor)</span></li>
      </ul>
    </div>
  );
}
