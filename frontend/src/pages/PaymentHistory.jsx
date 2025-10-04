import React, { useEffect, useMemo } from "react";
import feather from "feather-icons";

export default function PaymentHistory() {
  useEffect(() => {
    feather.replace({ width: 24, height: 24 });
  }, []);

  // Demo data giống file gốc (11 dòng; dòng đầu khác mã)
  const data = useMemo(
    () =>
      Array.from({ length: 11 }, (_, i) => ({
        id: i === 0 ? "#322138483848" : "#2458745233343",
        date: "15/10/2025",
        amount: 10_000_000, // VND
        company: "Gemadept",
      })),
    []
  );

  const fmtVND = (n) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    })
      .format(n)
      .replace(/\s/g, ""); // giữ đúng hiển thị không có khoảng trắng như file gốc

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen">
      {/* (Tuỳ chọn) Giữ lại fallback font như file gốc */}
      <style>{`body{font-family: Inter, ui-sans-serif, system-ui}`}</style>

      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-24 bg-white border-r border-slate-200 flex flex-col items-center gap-4 p-4">
        <div className="flex flex-col items-center gap-4 text-blue-600">
          <button
            className="w-12 h-12 rounded-xl grid place-items-center hover:bg-slate-100"
            title="Trang chủ"
            type="button"
          >
            <i data-feather="home" />
          </button>
          <button
            className="w-12 h-12 rounded-xl grid place-items-center hover:bg-slate-100"
            title="Theo dõi vị trí"
            type="button"
          >
            <i data-feather="map" />
          </button>
          <button
            className="w-12 h-12 rounded-xl grid place-items-center hover:bg-slate-100"
            title="Lịch sử giao dịch"
            type="button"
          >
            <i data-feather="file-text" />
          </button>
          <button
            className="relative w-12 h-12 rounded-xl grid place-items-center hover:bg-slate-100"
            title="Thông báo"
            type="button"
          >
            <i data-feather="bell" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          <button
            className="w-12 h-12 rounded-xl grid place-items-center hover:bg-slate-100"
            title="Người dùng"
            type="button"
          >
            <i data-feather="user" />
          </button>
          <button
            className="w-12 h-12 rounded-xl grid place-items-center hover:bg-slate-100"
            title="Cài đặt"
            type="button"
          >
            <i data-feather="settings" />
          </button>
        </div>
      </aside>

      <main className="ml-24">
        {/* Topbar */}
        <div
          id="topbar"
          className="sticky top-0 z-50 flex items-center justify-end p-3 bg-white border-b border-slate-200"
        >
          <button
            type="button"
            className="group inline-flex items-center gap-2 pl-1 pr-2 py-1.5 rounded-full bg-blue-50 text-slate-900 ring-1 ring-blue-100 shadow-sm hover:bg-blue-100 transition"
          >
            <img
              src="https://i.pravatar.cc/40?img=8"
              alt="Avatar"
              className="w-8 h-8 rounded-full object-cover ring-2 ring-white shadow-sm"
            />
            <span className="font-semibold">Khách hàng A</span>
            <span className="text-slate-300">•</span>
            <i
              data-feather="chevron-down"
              className="w-4 h-4 opacity-80 group-hover:opacity-100"
            />
          </button>
        </div>

        {/* Header */}
        <section className="bg-slate-100/60 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
            <h1 className="text-3xl md:text-[37px] font-extrabold text-blue-800">
              Payment History
            </h1>
          </div>
        </section>

        {/* Table */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-[0_8px_30px_rgba(2,6,23,.08)] overflow-hidden">
            <div className="overflow-x-auto">
              {/* ĐÃ THÊM text-blue-800 vào thead để màu giống tiêu đề */}
              <table className="min-w-full text-sm">
                <thead className="bg-slate-100 text-blue-800">
                  <tr className="text-left">
                    <th className="font-semibold px-5 md:px-6 py-3">
                      Mã đơn hàng
                    </th>
                    <th className="font-semibold px-5 md:px-6 py-3">
                      Ngày thanh toán
                    </th>
                    <th className="font-semibold px-5 md:px-6 py-3">Số tiền</th>
                    <th className="font-semibold px-5 md:px-6 py-3">
                      Cho công ty
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {data.map((r, idx) => (
                    <tr key={`${r.id}-${idx}`} className="hover:bg-slate-50">
                      <td className="px-5 md:px-6 py-3 text-slate-800">
                        {r.id}
                      </td>
                      <td className="px-5 md:px-6 py-3 text-slate-700">
                        {r.date}
                      </td>
                      <td className="px-5 md:px-6 py-3 text-slate-900">
                        {fmtVND(r.amount)}
                      </td>
                      <td className="px-5 md:px-6 py-3 text-slate-700">
                        {r.company}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
