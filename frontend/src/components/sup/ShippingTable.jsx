export default function ShippingTable() {
  return (
    <section className="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col h-[calc(100vh-180px)] overflow-hidden">
      <div className="px-6 py-4 flex items-center justify-between">
        <h3 className="font-semibold text-lg">Shipping</h3>
        <a href="#" className="text-sm font-medium text-blue-600 hover:underline">Xem tất cả</a>
      </div>

      <div className="overflow-x-auto flex-1 min-h-0">
        <div className="h-full overflow-y-auto">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur text-slate-600 shadow-[0_1px_0_rgba(15,23,42,0.06)]">
              <tr>
                <th className="px-6 py-3 text-left uppercase tracking-wider text-xs font-semibold">Mã đơn hàng</th>
                <th className="px-6 py-3 text-left uppercase tracking-wider text-xs font-semibold">Khách hàng</th>
                <th className="px-6 py-3 text-left uppercase tracking-wider text-xs font-semibold">Lộ trình</th>
                <th className="px-6 py-3 text-left uppercase tracking-wider text-xs font-semibold">Giao hàng dự kiến</th>
                <th className="px-6 py-3 text-left uppercase tracking-wider text-xs font-semibold">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ROWS.map((r) => (
                <tr key={r.id} className="odd:bg-white even:bg-slate-50 hover:bg-brand-50/50">
                  <td className="px-6 py-4 font-medium text-slate-800">{r.id}</td>
                  <td className="px-6 py-4">{r.customer}</td>
                  <td className="px-6 py-4">{r.route}</td>
                  <td className="px-6 py-4">{r.date}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-semibold text-xs ${badge(r.status).cls}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${badge(r.status).dot}`} />
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

const ROWS = [
  { id: "#ID12345678", customer: "Lương Quang Trè", route: "Vũng Tàu → Đà Nẵng", date: "20/10/2025", status: "Active" },
  { id: "#ID12345679", customer: "Công Ty ABC", route: "TP.HCM → Hà Nội", date: "15/10/2025", status: "Delivered" },
  { id: "#ID12345680", customer: "Nguyễn Văn An", route: "Hải Phòng → Cần Thơ", date: "22/10/2025", status: "Pending" },
  { id: "#ID12345681", customer: "Trần Thị Bích", route: "Bình Dương → Đồng Nai", date: "18/10/2025", status: "Cancelled" },
  { id: "#ID12345682", customer: "Lê Hữu Phước", route: "Đà Lạt → Nha Trang", date: "25/10/2025", status: "Delivered" },
  { id: "#ID12345683", customer: "Phạm Gia Hân", route: "Biên Hòa → TP.HCM", date: "08/11/2025", status: "Active" },
  { id: "#ID12345684", customer: "Công Ty Rồng Việt", route: "Hà Nội → Đà Nẵng", date: "12/11/2025", status: "Active" },
  { id: "#ID12345685", customer: "Hoàng Anh Tuấn", route: "Cà Mau → Bạc Liêu", date: "30/10/2025", status: "Pending" },
  { id: "#ID12345686", customer: "Ngô Bảo Châu", route: "TP.HCM → Vũng Tàu", date: "02/12/2025", status: "Delivered" },
  { id: "#ID12345687", customer: "Tập đoàn FPT", route: "Hà Nội → TP.HCM", date: "15/12/2025", status: "Active" },
];

function badge(s) {
  switch (s) {
    case "Active": return { cls: "bg-emerald-100 text-emerald-800", dot: "bg-emerald-500" };
    case "Delivered": return { cls: "bg-blue-100 text-blue-800", dot: "bg-blue-500" };
    case "Pending": return { cls: "bg-amber-100 text-amber-800", dot: "bg-amber-500" };
    default: return { cls: "bg-red-100 text-red-800", dot: "bg-red-500" };
  }
}
