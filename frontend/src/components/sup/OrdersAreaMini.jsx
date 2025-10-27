import { useEffect, useRef } from "react";
import {
  Chart as ChartJS,
  LineController, LineElement, PointElement,
  LinearScale, CategoryScale, Filler, Tooltip
} from "chart.js";

ChartJS.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip);

export default function OrdersAreaMini(){
  const canvasRef = useRef(null);

  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");
    const g = ctx.createLinearGradient(0, 0, 0, 180);
    g.addColorStop(0, "rgba(59,130,246,.4)");
    g.addColorStop(1, "rgba(59,130,246,0)");

    const chart = new ChartJS(ctx, {
      type: "line",
      data: {
        labels: ["01","05","10","15","20","25","30"],
        datasets: [{
          data: [20,45,80,110,145,170,190],
          borderColor: "#3b82f6",
          backgroundColor: g,
          borderWidth: 3,
          pointRadius: 0,
          pointHoverRadius: 6,
          pointHoverBorderColor: "#fff",
          pointHoverBackgroundColor: "#3b82f6",
          fill: true,
          tension: .4
        }]
      },
      options: {
        plugins: { legend: { display:false }, tooltip: { enabled:true } },
        maintainAspectRatio: false,
        scales: {
          x: { grid: { display:false }, border: { display:false } },
          y: {
            min:0, max:250, ticks:{ stepSize:50 },
            grid:{ color:"rgba(15,23,42,0.06)" }, border:{ dash:[5,5] }
          }
        }
      }
    });

    return () => chart.destroy();
  }, []);

  return <canvas ref={canvasRef} height={150} aria-label="Biểu đồ đơn hàng"></canvas>;
}
