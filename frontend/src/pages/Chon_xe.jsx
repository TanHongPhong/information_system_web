import React, { useEffect, useRef } from "react";
import feather from "feather-icons";

const VEHICLES = [
  {
    id: 1,
    percent: 50,
    departDate: "17/10/2025",
    gradient: "linear-gradient(90deg,#F04D3F 0%,#F39B18 100%)",
  },
  {
    id: 2,
    percent: 70,
    departDate: "20/10/2025",
    gradient: "linear-gradient(90deg,#F56A1D 0%,#F5B71C 100%)",
  },
  {
    id: 3,
    percent: 20,
    departDate: "19/10/2025",
    gradient: "linear-gradient(90deg,#F0473C 0%,#F39B18 100%)",
  },
];

function VehicleCard({ percent, departDate, gradient, imgSrc }) {
  // set biến CSS --p cho thanh fill
  const wrapStyle = { "--p": percent / 100 };

  return (
    <article className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 flex flex-col items-center text-center">
      <div
        className="relative w-full max-w-[700px] truck-wrap"
        style={wrapStyle}
      >
        <a href="donhang.html">
          <img
            src={imgSrc}
            alt="Xe tải"
            className="w-full h-auto select-none"
            decoding="async"
          />
        </a>

        <div className="trailer-overlay">
          <div className="trailer-frame">
            <div className="trailer-fill" style={{ background: gradient }} />
            <div className="trailer-center">
              <div className="percent-display">{percent} %</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 h-0.5 w-60 bg-[#1E66FF]" />
      <h3 className="mt-5 font-semibold">
        Phần trăm hàng trong xe: <span className="font-bold">{percent}</span>%
      </h3>
      <p className="mt-2 text-sm text-slate-600">
        Ngày khởi hành: {departDate}
      </p>
      <a
        href="donhang.html"
        className="mt-5 rounded-xl bg-[#1E66FF] hover:brightness-95 text-white text-sm font-medium px-5 py-2"
        role="button"
      >
        Chọn xe
      </a>
    </article>
  );
}

export default function VehicleList() {
  const topbarRef = useRef(null);

  // Tính chiều cao topbar để sticky hero nằm ngay dưới
  useEffect(() => {
    const updateTopbarH = () => {
      const h = topbarRef.current?.offsetHeight ?? 56;
      document.documentElement.style.setProperty("--topbar-h", `${h}px`);
    };
    updateTopbarH();
    window.addEventListener("resize", updateTopbarH);
    return () => window.removeEventListener("resize", updateTopbarH);
  }, []);

  // Render feather icons
  useEffect(() => {
    feather.replace({ width: 24, height: 24 });
  }, []);

  const truckImg =
    "https://png.pngtree.com/thumb_back/fh260/background/20231007/pngtree-d-rendering-of-an-isolated-white-truck-seen-from-the-side-image_13518507.png";

  const headerCols =
    "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-8 justify-items-stretch";

  return (
    <div className="bg-slate-50 text-slate-900 antialiased min-h-screen">
      {/* CSS tuỳ chỉnh giữ nguyên từ file gốc */}
      <style>{`
        body { font-family: Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji" }
        .sidebar-dot { box-shadow: 0 0 0 2px rgba(0,0,0,.1) inset }

        /* Force-hide ANY truck icon in sidebar even if some cached HTML injects it */
        aside [data-feather="truck"],
        aside svg.feather.feather-truck,
        aside button[data-icon="truck"] { display: none !important; }

        /* Mapping vùng thùng xe */
        .truck-wrap{
          --trail-left:19%;
          --trail-top:26.2%;
          --trail-width:44%;
          --trail-height:27%;

          --p:.5;
          --radius:14px;
          --frame-inset:clamp(6px,3.5%,14px);
          --frame-shift-x:-2px;
          --frame-shift-y:3px;
        }
        .trailer-overlay{
          position:absolute;left:var(--trail-left);top:var(--trail-top);
          width:var(--trail-width);height:var(--trail-height);
          container-type:inline-size;
          display:grid;place-items:center;
          overflow:hidden;
        }
        .trailer-frame{
          position:absolute; inset:var(--frame-inset);
          border-radius:var(--radius); overflow:hidden;
          border:1px solid rgba(255,255,255,.18);
          background:linear-gradient(0deg,rgba(255,255,255,.06),rgba(255,255,255,.06));
          backdrop-filter:blur(1px);
          box-shadow:0 8px 24px rgba(0,0,0,.24);
          transform:translate(var(--frame-shift-x), var(--frame-shift-y));
        }
        .trailer-fill{
          position:absolute; left:0; top:0; bottom:0;
          width:calc(var(--p)*100%);
          border-top-left-radius:var(--radius);
          border-bottom-left-radius:var(--radius);
          transition:width .45s cubic-bezier(.22,.61,.36,1);
          z-index:0;
        }
        .trailer-center{
          position:absolute; inset:0; z-index:1;
          display:flex; align-items:center; justify-content:center;
          pointer-events:none; padding-inline:2%;
        }
        .percent-display{
          font-size:clamp(16px,9cqw,44px);
          font-weight:800; color:#fff; letter-spacing:.5px;
          text-shadow:0 2px 6px rgba(0,0,0,.35);
        }
      `}</style>

      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-24 bg-white border-r border-slate-200 flex flex-col items-center gap-4 p-4 z-50">
        <div className="flex flex-col items-center gap-4 text-blue-600">
          <button
            className="w-12 h-12 rounded-xl grid place-items-center hover:bg-slate-100"
            title="Trang chủ"
            aria-label="Trang chủ"
            type="button"
          >
            <i data-feather="home" />
          </button>

          {/* Nút 'truck' cố ý không render */}

          <button
            className="w-12 h-12 rounded-xl grid place-items-center hover:bg-slate-100"
            title="Theo dõi vị trí"
            aria-label="Theo dõi vị trí"
            type="button"
          >
            <i data-feather="map" />
          </button>

          <button
            className="w-12 h-12 rounded-xl grid place-items-center hover:bg-slate-100"
            title="Lịch sử giao dịch"
            aria-label="Lịch sử giao dịch"
            type="button"
          >
            <i data-feather="file-text" />
          </button>

          <button
            className="relative w-12 h-12 rounded-xl grid place-items-center hover:bg-slate-100"
            title="Thông báo"
            aria-label="Thông báo"
            type="button"
          >
            <i data-feather="bell" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          <button
            className="w-12 h-12 rounded-xl grid place-items-center hover:bg-slate-100"
            title="Người dùng"
            aria-label="Người dùng"
            type="button"
          >
            <i data-feather="user" />
          </button>

          <button
            className="w-12 h-12 rounded-xl grid place-items-center hover:bg-slate-100"
            title="Cài đặt"
            aria-label="Cài đặt"
            type="button"
          >
            <i data-feather="settings" />
          </button>
        </div>
      </aside>

      <main className="ml-24">
        {/* Topbar (sticky) */}
        <div
          id="topbar"
          ref={topbarRef}
          className="sticky top-0 z-50 flex items-center justify-end p-3 bg-white/90 backdrop-blur-sm border-b border-slate-200"
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

        {/* Hero (sticky ngay dưới header) */}
        <section
          id="hero"
          className="relative h-36 sm:h-40 md:h-44 sticky z-40"
          style={{ top: "var(--topbar-h, 56px)" }}
        >
          <div className="absolute inset-0 bg-[url('https://img.thuthuattinhoc.vn/uploads/2019/08/15/hinh-anh-con-duong-dai_064458636.jpg')] bg-cover bg-center" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/55" />

          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-6">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-[#1E66FF] drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)]">
              List of transportation vehicles
            </h1>
            <p className="mt-2 text-sm sm:text-base text-white/90 max-w-4xl leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)]">
              Đây là danh sách các phương tiện của công ty đã sẵn sàng đáp ứng
              nhu cầu vận chuyển của khách hàng.
            </p>
            <p className="text-sm sm:text-base text-white/90 drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)]">
              Vui lòng chọn phương tiện phù hợp nhất với nhu cầu của bạn!
            </p>
          </div>
        </section>

        {/* CARDS */}
        <section className="flex-1">
          <div className="mx-auto w-full max-w-none px-8 py-10">
            <div className={headerCols}>
              {VEHICLES.map((v) => (
                <VehicleCard
                  key={v.id}
                  percent={v.percent}
                  departDate={v.departDate}
                  gradient={v.gradient}
                  imgSrc={truckImg}
                />
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
