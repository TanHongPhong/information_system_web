import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

export default function RecentOrders() {
  const chartRef = useRef(null);

  useEffect(() => {
    const ctx = chartRef.current.getContext("2d");
    const g2 = ctx.createLinearGradient(0, 0, 0, 180);
    g2.addColorStop(0, "rgba(59,130,246,.4)");
    g2.addColorStop(1, "rgba(59,130,246,0)");

    const chart = new Chart(ctx, {
      type: "line",
      data: {
        labels: ["01", "05", "10", "15", "20", "25", "30"],
        datasets: [
          {
            data: [20, 45, 80, 110, 145, 170, 190],
            borderColor: "#3b82f6",
            backgroundColor: g2,
            borderWidth: 3,
            pointRadius: 0,
            pointHoverRadius: 6,
            pointHoverBorderColor: "#fff",
            pointHoverBackgroundColor: "#3b82f6",
            fill: true,
            tension: 0.4,
          },
        ],
      },
      options: {
        plugins: { legend: { display: false }, tooltip: { enabled: true } },
        maintainAspectRatio: false,
        scales: {
          x: { grid: { display: false }, border: { display: false } },
          y: {
            min: 0,
            max: 250,
            ticks: { stepSize: 50 },
            grid: { color: "rgba(15,23,42,0.06)" },
            border: { dash: [5, 5] },
          },
        },
      },
    });

    return () => chart.destroy();
  }, []);

  return (
    <section className="bg-white border border-slate-200 rounded-[1rem] shadow-[0_10px_28px_rgba(2,6,23,.08)] hover:shadow-[0_16px_40px_rgba(2,6,23,.12)] hover:-translate-y-px transition-all p-5">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-slate-800 text-lg">
            Recent Orders
          </h3>
          <p className="text-sm text-slate-500">
            Thống kê đơn hàng trong tháng.
          </p>
        </div>
        <button className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-all">
          Tháng 10
          <i
            data-feather="chevron-down"
            className="w-4 h-4 text-slate-500"
          ></i>
        </button>
      </div>

      <div className="mt-4 grid grid-cols-12 gap-4 items-end">
        {/* Stats */}
        <ul className="col-span-12 sm:col-span-5 space-y-4">
          <li className="flex items-center gap-3">
            <span className="grid place-items-center w-9 h-9 rounded-lg border border-blue-200 bg-blue-50 text-blue-600">
              <i data-feather="truck" className="w-5 h-5"></i>
            </span>
            <div>
              <div className="text-sm text-slate-500">Đang hoạt động</div>
              <div className="font-bold text-xl text-slate-800">720</div>
            </div>
          </li>

          <li className="flex items-center gap-3">
            <span className="grid place-items-center w-9 h-9 rounded-lg border border-amber-200 bg-amber-50 text-amber-600">
              <i data-feather="clock" className="w-5 h-5"></i>
            </span>
            <div>
              <div className="text-sm text-slate-500">Chờ xác nhận</div>
              <div className="font-bold text-xl text-slate-800">120</div>
            </div>
          </li>

          <li className="flex items-center gap-3">
            <span className="grid place-items-center w-9 h-9 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-600">
              <i
                data-feather="check-circle"
                className="w-5 h-5"
              ></i>
            </span>
            <div>
              <div className="text-sm text-slate-500">Đã xác nhận</div>
              <div className="font-bold text-xl text-slate-800">220</div>
            </div>
          </li>

          <div className="pt-2 text-emerald-600 text-sm font-semibold flex items-center gap-1.5">
            <i
              data-feather="arrow-up-right"
              className="w-4 h-4"
            ></i>
            <span>+40% so với tháng trước</span>
          </div>
        </ul>

        {/* Chart */}
        <div className="col-span-12 sm:col-span-7">
          <div className="h-[150px]">
            <canvas
              ref={chartRef}
              height="150"
              aria-label="Biểu đồ đơn hàng"
            ></canvas>
          </div>
        </div>
      </div>
    </section>
  );
}
