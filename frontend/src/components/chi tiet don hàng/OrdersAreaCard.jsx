import React, { useEffect, useRef } from "react";
import { ChevronDown, ArrowUpRight } from "lucide-react";
import Chart from "chart.js/auto";
import StatusIcon from "./StatusIcon";

export default function OrdersAreaCard() {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    const grad = ctx.createLinearGradient(0, 0, 0, 180);
    grad.addColorStop(0, "rgba(59,130,246,.4)");
    grad.addColorStop(1, "rgba(59,130,246,0)");

    chartRef.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: ["01", "05", "10", "15", "20", "25", "30"],
        datasets: [{
          data: [20, 45, 80, 110, 145, 170, 190],
          borderColor: "#3b82f6",
          backgroundColor: grad,
          borderWidth: 3,
          pointRadius: 0,
          pointHoverRadius: 6,
          pointHoverBorderColor: "#fff",
          pointHoverBackgroundColor: "#3b82f6",
          fill: true, tension: 0.4,
        }],
      },
      options: {
        plugins: { legend: { display: false }, tooltip: { enabled: true } },
        maintainAspectRatio: false,
        scales: {
          x: { grid: { display: false }, border: { display: false } },
          y: { min: 0, max: 250, ticks: { stepSize: 50 }, grid: { color: "rgba(15,23,42,0.06)" }, border: { dash: [5,5] } },
        },
      },
    });

    return () => { chartRef.current?.destroy(); };
  }, []);

  return (
    <section className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-slate-800 text-lg">Recent Orders</h3>
          <p className="text-sm text-slate-500">Thống kê đơn hàng trong tháng.</p>
        </div>
        <button className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50">
          Tháng 10
          <ChevronDown className="w-4 h-4 text-slate-500" />
        </button>
      </div>

      <div className="mt-4 grid grid-cols-12 gap-4 items-end">
        <ul className="col-span-12 sm:col-span-5 space-y-4">
          <li className="flex items-center gap-3">
            <StatusIcon type="active" />
            <div><div className="text-sm text-slate-500">Đang hoạt động</div><div className="font-bold text-xl text-slate-800">720</div></div>
          </li>
          <li className="flex items-center gap-3">
            <StatusIcon type="pending" />
            <div><div className="text-sm text-slate-500">Chờ xác nhận</div><div className="font-bold text-xl text-slate-800">120</div></div>
          </li>
          <li className="flex items-center gap-3">
            <StatusIcon type="confirmed" />
            <div><div className="text-sm text-slate-500">Đã xác nhận</div><div className="font-bold text-xl text-slate-800">220</div></div>
          </li>
          <div className="pt-2 text-emerald-600 text-sm font-semibold flex items-center gap-1.5">
            <ArrowUpRight className="w-4 h-4" />
            <span>+40% so với tháng trước</span>
          </div>
        </ul>

        <div className="col-span-12 sm:col-span-7">
          <canvas ref={canvasRef} height={150} aria-label="Biểu đồ đơn hàng" />
        </div>
      </div>
    </section>
  );
}
