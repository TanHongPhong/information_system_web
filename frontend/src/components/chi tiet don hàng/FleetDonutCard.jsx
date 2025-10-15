import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

export default function FleetDonutCard() {
  const donutRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!donutRef.current) return;
    const ctx = donutRef.current.getContext("2d");

    chartRef.current = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Đang VC", "Nhận hàng delay", "Sẵn sàng nhận", "Gửi hàng delay", "Sẵn sàng gửi", "Huỷ"],
        datasets: [{
          data: [40, 23, 12, 12, 3, 3],
          backgroundColor: ["#0b2875", "#ef4444", "#2563eb", "#60a5fa", "#3b82f6", "#d97706"],
          borderColor: "#fff", borderWidth: 6, spacing: 2, borderRadius: 4,
        }],
      },
      options: {
        responsive: true, cutout: "70%",
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => `${c.label}: ${c.raw}` } } },
      },
    });

    return () => { chartRef.current?.destroy(); };
  }, []);

  return (
    <section className="card p-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-slate-800 text-lg">Fleet Status</h3>
          <p className="text-sm text-slate-500">Tình trạng các phương tiện.</p>
        </div>
        <a href="#" className="text-sm font-medium text-blue-600 hover:underline">Xem tất cả</a>
      </div>

      <div className="mt-4 grid grid-cols-12 gap-4 items-center">
        <div className="col-span-12 sm:col-span-5">
          <div className="relative aspect-square max-w-[190px] mx-auto">
            <canvas ref={donutRef} aria-label="Tình trạng xe" />
            <div className="absolute inset-0 grid place-items-center">
              <div className="text-center">
                <div className="text-4xl font-bold text-slate-800">93</div>
                <div className="text-slate-500 text-xs tracking-wide">TỔNG SỐ XE</div>
              </div>
            </div>
          </div>
        </div>

        <ul className="col-span-12 sm:col-span-7 grid grid-cols-1 gap-3 text-sm">
          <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#0b2875]"></span>Đang vận chuyển <span className="ml-auto font-semibold">40</span></li>
          <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#ef4444]"></span>Nhận hàng bị trì hoãn <span className="ml-auto font-semibold">23</span></li>
          <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#2563eb]"></span>Sẵn sàng nhận hàng <span className="ml-auto font-semibold">12</span></li>
          <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#60a5fa]"></span>Gửi hàng bị trì hoãn <span className="ml-auto font-semibold">12</span></li>
          <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#3b82f6]"></span>Sẵn sàng gửi hàng <span className="ml-auto font-semibold">3</span></li>
          <li className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#d97706]"></span>Đơn hàng bị huỷ <span className="ml-auto font-semibold">3</span></li>
        </ul>
      </div>
    </section>
  );
}
