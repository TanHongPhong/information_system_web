"use client";
import { useEffect, useRef } from "react";
import "chart.js/auto";

export default function AreaMiniChart() {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    const ctx = ref.current.getContext("2d");
    const gradient = ctx.createLinearGradient(0, 0, 0, 180);
    gradient.addColorStop(0, "rgba(59,130,246,.4)");
    gradient.addColorStop(1, "rgba(59,130,246,0)");

    const chart = new window.Chart(ctx, {
      type: "line",
      data: {
        labels: ["01", "05", "10", "15", "20", "25", "30"],
        datasets: [
          {
            data: [20, 45, 80, 110, 145, 170, 190],
            borderColor: "#3b82f6",
            backgroundColor: gradient,
            borderWidth: 3,
            pointRadius: 0,
            tension: 0.4,
            fill: true,
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

  return <canvas ref={ref} height="150" aria-label="Biểu đồ đơn hàng" />;
}
