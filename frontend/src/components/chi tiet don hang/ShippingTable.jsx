import React from "react";

export default function ShippingTable() {
  const rows = [
    {
      id: "#ID12345678",
      customer: "Lương Quang Trè",
      route: "Vũng Tàu → Đà Nẵng",
      eta: "20/10/2025",
      status: { label: "Active", tone: "emerald" },
    },
    {
      id: "#ID12345679",
      customer: "Công Ty ABC",
      route: "TP.HCM → Hà Nội",
      eta: "15/10/2025",
      status: { label: "Delivered", tone: "blue" },
    },
    {
      id: "#ID12345680",
      customer: "Nguyễn Văn An",
      route: "Hải Phòng → Cần Thơ",
      eta: "22/10/2025",
      status: { label: "Pending", tone: "amber" },
    },
    {
      id: "#ID12345681",
      customer: "Trần Thị Bích",
      route: "Bình Dương → Đồng Nai",
      eta: "18/10/2025",
      status: { label: "Cancelled", tone: "red" },
    },
    {
      id: "#ID12345682",
      customer: "Lê Hữu Phước",
      route: "Đà Lạt → Nha Trang",
      eta: "25/10/2025",
      status: { label: "Delivered", tone: "blue" },
    },
    {
      id: "#ID12345683",
      customer: "Phạm Gia Hân",
      route: "Biên Hòa → TP.HCM",
      eta: "08/11/2025",
      status: { label: "Active", tone: "emerald" },
    },
    {
      id: "#ID12345684",
      customer: "Công Ty Rồng Việt",
      route: "Hà Nội → Đà Nẵng",
      eta: "12/11/2025",
      status: { label: "Active", tone: "emerald" },
    },
    {
      id: "#ID12345685",
      customer: "Hoàng Anh Tuấn",
      route: "Cà Mau → Bạc Liêu",
      eta: "30/10/2025",
      status: { label: "Pending", tone: "amber" },
    },
    {
      id: "#ID12345686",
      customer: "Ngô Bảo Châu",
      route: "TP.HCM → Vũng Tàu",
      eta: "02/12/2025",
      status: { label: "Delivered", tone: "blue" },
    },
    {
      id: "#ID12345687",
      customer: "Tập đoàn FPT",
      route: "Hà Nội → TP.HCM",
      eta: "15/12/2025",
      status: { label: "Active", tone: "emerald" },
    },
  ];

  return (
    <section className="bg-white border border-slate-200 rounded-[1rem] shadow-[0_10px_28px_rgba(2,6,23,.08)] hover:shadow-[0_16px_40px_rgba(2,6,23,.12)] hover:-translate-y-px transition-all h-[calc(100vh-180px)] flex flex-col overflow-hidden">
      {/* header */}
      <div className="px-6 py-4 flex items-center justify-between">
        <h3 className="font-semibold text-lg text-slate-800">Shipping</h3>
        <a
          href="#"
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          Xem tất cả
        </a>
      </div>

      {/* table wrapper */}
      <div className="overflow-x-auto flex-1 min-h-0">
        <div className="h-full overflow-y-auto">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur text-slate-600 shadow-[0_1px_0_rgba(15,23,42,0.06)]">
              <tr>
                <Th>Mã đơn hàng</Th>
                <Th>Khách hàng</Th>
                <Th>Lộ trình</Th>
                <Th>Giao hàng dự kiến</Th>
                <Th>Trạng thái</Th>
              </tr>
            </thead>

            <tbody className="text-slate-700">
              {rows.map((row, i) => (
                <tr
                  key={row.id}
                  className={`${
                    i % 2 === 1 ? "bg-slate-50/50" : "bg-white"
                  } hover:bg-slate-100/60 border-b border-slate-100 last:border-0`}
                >
                  <Td className="font-medium text-slate-800">
                    {row.id}
                  </Td>
                  <Td>{row.customer}</Td>
                  <Td>{row.route}</Td>
                  <Td>{row.eta}</Td>
                  <Td>
                    <Chip tone={row.status.tone}>
                      {row.status.label}
                    </Chip>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function Th({ children }) {
  return (
    <th className="px-6 py-3 text-left uppercase tracking-wider text-xs font-semibold">
      {children}
    </th>
  );
}

function Td({ children, className = "" }) {
  return <td className={`px-6 py-4 ${className}`}>{children}</td>;
}

function Chip({ tone = "blue", children }) {
  const cls = getToneClasses(tone);
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-semibold text-xs ${cls.bg} ${cls.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cls.dot}`}></span>
      {children}
    </span>
  );
}

function getToneClasses(tone) {
  switch (tone) {
    case "emerald":
      return {
        bg: "bg-emerald-100",
        text: "text-emerald-800",
        dot: "bg-emerald-500",
      };
    case "amber":
      return {
        bg: "bg-amber-100",
        text: "text-amber-800",
        dot: "bg-amber-500",
      };
    case "red":
      return {
        bg: "bg-red-100",
        text: "text-red-800",
        dot: "bg-red-500",
      };
    case "blue":
    default:
      return {
        bg: "bg-blue-100",
        text: "text-blue-800",
        dot: "bg-blue-500",
      };
  }
}
