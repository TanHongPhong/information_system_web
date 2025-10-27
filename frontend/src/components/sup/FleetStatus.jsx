import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

export default function FleetStatus() {
  const donutRef = useRef(null);

  useEffect(() => {
    const ctx = donutRef.current.getContext("2d");

    const chart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: [
          "Đang VC",
          "Nhận hàng delay",
          "Sẵn sàng nhận",
          "Gửi hàng delay",
          "Sẵn sàng gửi",
          "Huỷ",
        ],
        datasets: [
          {
            data: [40, 23, 12, 12, 3, 3],
            backgroundColor: [
              "#0b2875",
              "#ef4444",
              "#2563eb",
              "#60a5fa",
              "#3b82f6",
              "#d97706",
            ],
            borderColor: "#fff",
            borderWidth: 6,
            spacing: 2,
            borderRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        cutout: "70%",
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (c) => `${c.label}: ${c.raw}`,
            },
          },
        },
      },
    });

    return () => chart.destroy();
  }, []);

  return (
    <section className="bg-white border border-slate-200 rounded-[1rem] shadow-[0_10px_28px_rgba(2,6,23,.08)] hover:shadow-[0_16px_40px_rgba(2,6,23,.12)] hover:-translate-y-px transition-all p-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-slate-800 text-lg">
            Fleet Status
          </h3>
          <p className="text-sm text-slate-500">
            Tình trạng các phương tiện.
          </p>
        </div>
        <a
          href="#"
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          Xem tất cả
        </a>
      </div>

      <div className="mt-4 grid grid-cols-12 gap-4 items-center">
        {/* Donut */}
        <div className="col-span-12 sm:col-span-5">
          <div className="relative aspect-square max-w-[190px] mx-auto">
            <canvas
              ref={donutRef}
              aria-label="Tình trạng xe"
            ></canvas>

            <div className="absolute inset-0 grid place-items-center">
              <div className="text-center">
                <div className="text-4xl font-bold text-slate-800">
                  93
                </div>
                <div className="text-slate-500 text-xs tracking-wide">
                  TỔNG SỐ XE
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <ul className="col-span-12 sm:col-span-7 grid grid-cols-1 gap-3 text-sm">
          <LegendRow color="#0b2875" label="Đang vận chuyển" value="40" />
          <LegendRow
            color="#ef4444"
            label="Nhận hàng bị trì hoãn"
            value="23"
          />
          <LegendRow
            color="#2563eb"
            label="Sẵn sàng nhận hàng"
            value="12"
          />
          <LegendRow
            color="#60a5fa"
            label="Gửi hàng bị trì hoãn"
            value="12"
          />
          <LegendRow
            color="#3b82f6"
            label="Sẵn sàng gửi hàng"
            value="3"
          />
          <LegendRow
            color="#d97706"
            label="Đơn hàng bị huỷ"
            value="3"
          />
        </ul>
      </div>
    </section>
  );
}

function LegendRow({ color, label, value }) {
  return (
    <li className="flex items-center gap-2">
      <span
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: color }}
      ></span>
      {label}
      <span className="ml-auto font-semibold">{value}</span>
    </li>
  );
}
