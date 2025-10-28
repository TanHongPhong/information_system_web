import { useEffect } from "react";
import feather from "feather-icons";
import Sidebar from "../components/user/Sidebar";
import Topbar from "../components/user/Topbar";
import OrderList from "../components/tracking_customer/OrderList";
import MapPanel from "../components/tracking_customer/MapPanel";
import StatusCard from "../components/tracking_customer/StatusCard";
import SummaryCard from "../components/tracking_customer/SummaryCard";

export default function CustomerTrack() {
  useEffect(() => {
    const setVars = () => {
      const top = document.getElementById("topbar");
      if (top) document.documentElement.style.setProperty("--topbar-h", `${top.offsetHeight}px`);
      const map = document.getElementById("mapPanel");
      if (map) document.documentElement.style.setProperty("--map-h", `${map.offsetHeight}px`);
    };
    setVars();
    feather.replace({ width: 21, height: 21 });
    window.addEventListener("resize", setVars);
    return () => window.removeEventListener("resize", setVars);
  }, []);

  return (
    <>
      <Sidebar />
      <Topbar />
      <style>{`
        .nice-scroll{ scrollbar-width:thin; scrollbar-color:#cbd5e1 #f1f5f9 }
        .nice-scroll::-webkit-scrollbar{ width:10px }
        .nice-scroll::-webkit-scrollbar-track{ background:#f1f5f9; border-radius:9999px }
        .nice-scroll::-webkit-scrollbar-thumb{ background:#c7d2fe; border-radius:9999px; border:3px solid #f8fafc }

        .mini-progress{height:8px;border-radius:9999px;background:#e5edff;position:relative;overflow:hidden}
        .mini-progress > span{position:absolute;inset:0;transform-origin:left center;background:linear-gradient(90deg,#2563eb 0%,#60a5fa 100%)}

        #status ol{ position:relative; padding-left:44px; }
        #status .rail{ position:absolute; left:20px; top:0; bottom:0; width:2px; background:linear-gradient(#93c5fd 0 45%, #e5e7eb 45% 100%); }
        #status li{ position:relative; margin-bottom:12px; }
        #status .dot{ position:absolute; left:14px; top:18px; width:12px; height:12px; border-radius:9999px; background:#fff; border:3px solid #93c5fd; box-shadow:0 0 0 3px #fff }
        #status .dot.done, #status .dot.current{ border-color:#2563eb; background:#2563eb }
        #status .dot.current{ box-shadow:0 0 0 6px rgba(37,99,235,.18) }
        #status .dot.future{ border-color:#cbd5e1; background:#fff }

        /* StatusCard (cột phải) */
        #statusCard .steps-wrap{ overflow:visible !important; }
        #statusCard .steps-outer{ display:flex; justify-content:center; width:100%; }
        #statusCard .steps{ --nudge: 8px; position:relative; width:100%; max-width:380px; margin:0 auto; padding-left:0; transform: translateX(calc(var(--nudge) * -1)); }
        #statusCard .rail{ position:absolute; left:16px; top:0; bottom:0; width:2px; background:linear-gradient(to bottom,#93c5fd 0%,#1e66ff 45%,#e5e7eb 45%); }
        #statusCard .steps li{ position:relative; padding-left:48px; margin-bottom:12px; }
        #statusCard .steps li > .dot{ position:absolute; left:9px; top:18px; width:10px; height:10px; border-radius:9999px; background:#fff; border:2px solid #93c5fd; box-shadow:0 0 0 2px #fff; }
        #statusCard .steps li > .dot.done{ background:#1E66FF; border-color:#1E66FF; }
        #statusCard .steps li > .dot.current{ background:#1E66FF; border-color:#1E66FF; box-shadow:0 0 0 4px rgba(30,102,255,.16); }
        #statusCard .steps li > .dot.future{ border-color:#cbd5e1; }
        #statusCard .step-card{ margin-left:0; }
        #statusCard .step-meta{ font-size:12px; }
      `}</style>

      <main className="ml-22 pt-[72px] bg-slate-50 text-slate-900 lg:overflow-hidden">
        <div className="p-4 grid grid-cols-12 gap-4">
          <section className="col-span-12 lg:col-span-3">
            <OrderList />
          </section>

          <section className="col-span-12 lg:col-span-6">
            <MapPanel />
          </section>

          <section className="col-span-12 lg:col-span-3">
            <div className="sticky top-[calc(var(--topbar-h,64px)+16px)]">
              <div className="nice-scroll max-h-[calc(100dvh-var(--topbar-h,64px)-2rem)] overflow-y-auto pr-1">
                <div className="space-y-4">
                  <StatusCard />
                  <SummaryCard />
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
