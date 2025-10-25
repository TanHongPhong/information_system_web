import OrderRequestCard from "./OrderRequestCard";

export default function OrderRequestsPanel() {
  return (
    <section className="bg-white border border-slate-200 rounded-2xl shadow-sm h-[calc(100vh-180px)] flex flex-col min-h-0">
      <div className="p-4 md:p-5 flex items-center justify-between gap-3 border-b border-slate-100">
        <h3 className="font-semibold text-lg">Order Requests</h3>
        <div className="relative flex-1 max-w-xs">
          <input className="w-full pl-3 pr-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-100" placeholder="Tìm kiếm đơn hàng" />
        </div>
      </div>

      <div className="px-4 md:px-5 pt-3 text-sm text-slate-600 font-medium">Yêu cầu đặt hàng gần đây</div>

      <div className="p-4 md:p-5 pt-2 flex-1 min-h-0 overflow-y-auto space-y-4">
        {REQUESTS.map((o) => (
          <OrderRequestCard key={o.id} {...o} />
        ))}
      </div>

      <div className="px-4 md:px-5 py-3 border-t border-slate-100 flex items-center justify-between">
        <div className="text-[11px] text-slate-400">
          Map tiles © <a className="underline" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors.
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700">Chấp nhận tất cả</button>
        </div>
      </div>
    </section>
  );
}

const REQUESTS = [
  {
    id: "ORDERID 0112",
    time: "20/10/2025 9:00",
    from: "279 Nguyễn Tri Phương P8 Q10 TPHCM",
    to: "777 Lê Lai P3 Q1 TP.Hà Nội",
    initials: "QT",
    name: "Quang Trè",
    highlight: true,
    latA: 10.7676, lngA: 106.6667, latB: 21.0285, lngB: 105.8542,
  },
  {
    id: "ORDERID 0255",
    time: "22/10/2025 14:00",
    from: "436 Trường Sa P3 Q7 TPHCM",
    to: "555 Phan Đăng Lưu P7 Q.Phú Nhuận",
    initials: "VA",
    name: "Văn An",
    latA: 10.7880, lngA: 106.6800, latB: 10.8009, lngB: 106.6809,
  },
  {
    id: "ORDERID 8813",
    time: "28/10/2025 11:30",
    from: "KCN Amata, Biên Hòa, Đồng Nai",
    to: "KCN Sóng Thần, Dĩ An, Bình Dương",
    initials: "TB",
    name: "Trần Bích",
    latA: 10.9452, lngA: 106.8553, latB: 10.8876, lngB: 106.7431,
  },
  {
    id: "ORDERID 9021",
    time: "01/11/2025 08:00",
    from: "123 Lê Lợi, P. Bến Thành, Q.1, TPHCM",
    to: "456 Hai Bà Trưng, P. Tân Định, Q.1",
    initials: "HP",
    name: "Hữu Phước",
    latA: 10.7755, lngA: 106.7019, latB: 10.7860, lngB: 106.6903,
  },
  {
    id: "ORDERID 9134",
    time: "05/11/2025 10:00",
    from: "789 Nguyễn Văn Cừ, P.4, Q.5, TPHCM",
    to: "321 Trần Hưng Đạo, P. Cầu Ông Lãnh, Q.1",
    initials: "GH",
    name: "Gia Hân",
    latA: 10.7598, lngA: 106.6750, latB: 10.7690, lngB: 106.6940,
  },
  {
    id: "ORDERID 9278",
    time: "10/11/2025 15:30",
    from: "456 Lý Thường Kiệt, P.7, Q. Tân Bình, TPHCM",
    to: "123 Nguyễn Huệ, P. Bến Nghé, Q.1",
    initials: "AT",
    name: "Anh Tuấn",
    latA: 10.7970, lngA: 106.6600, latB: 10.7765, lngB: 106.7005,
  },
  {
    id: "ORDERID 9356",
    time: "15/11/2025 09:45",
    from: "321 Phạm Văn Đồng, P.3, Q. Gò Vấp, TPHCM",
    to: "654 Lê Văn Sỹ, P.11, Q.3",
    initials: "BC",
    name: "Bảo Châu",
    latA: 10.8210, lngA: 106.6860, latB: 10.7840, lngB: 106.6760,
  },
];
