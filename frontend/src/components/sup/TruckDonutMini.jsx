import { useEffect, useRef } from "react";
import {
  Chart as ChartJS,
  DoughnutController, ArcElement, Tooltip
} from "chart.js";

ChartJS.register(DoughnutController, ArcElement, Tooltip);

export default function TruckDonutMini(){
  const ref = useRef(null);

  useEffect(() => {
    const chart = new ChartJS(ref.current.getContext("2d"), {
      type: "doughnut",
      data: {
        labels: ['Đang VC','Nhận hàng delay','Sẵn sàng nhận','Gửi hàng delay','Sẵn sàng gửi','Huỷ'],
        datasets: [{
          data: [40,23,12,12,3,3],
          backgroundColor: ['#0b2875','#ef4444','#2563eb','#60a5fa','#3b82f6','#d97706'],
          borderColor:'#fff', borderWidth:6, spacing:2, borderRadius:4
        }]
      },
      options: {
        responsive:true, cutout:'70%',
        plugins: { legend:{ display:false }, tooltip:{ callbacks:{ label:(c)=>`${c.label}: ${c.raw}` } } }
      }
    });
    return () => chart.destroy();
  }, []);

  return <canvas ref={ref} aria-label="Tình trạng xe"></canvas>;
}
