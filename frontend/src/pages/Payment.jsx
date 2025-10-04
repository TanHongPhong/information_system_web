import React from "react";

export default function PaymentQR() {
  const KEY_UNLOCK = "orderTrackingUnlocked";

  const handleCloseToHome = () => {
    try {
      localStorage.setItem(KEY_UNLOCK, "1");
    } catch (_) {}
    window.location.href = "demo5.html"; // Giữ nguyên hành vi như file gốc
  };

  return (
    <div className="min-h-screen">
      {/* CSS nội tuyến giữ nguyên biến gradient, line và min-height card */}
      <style>{`
        :root {
          --grad-start: #ff00a8;
          --grad-end: #7b2cff;
        }
        html, body {
          font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji";
          background: #fafafa;
        }
        .card-line {
          height: 1px;
          background: linear-gradient(90deg, #e8e8e8, #f6f6f6 60%, #ffffff);
        }
        .qr-gradient {
          background: linear-gradient(160deg, var(--grad-start), var(--grad-end));
        }
        @media (min-width: 1024px) {
          .match-h { min-height: 560px; }
        }
      `}</style>

      {/* Nút đóng về trang chủ */}
      <button
        id="btn-close-to-home"
        aria-label="Đóng và về trang chủ"
        title="Về trang chủ"
        onClick={handleCloseToHome}
        className="fixed top-4 right-4 z-50 w-11 h-11 rounded-full grid place-items-center bg-white/90 hover:bg-white text-slate-700 ring-1 ring-slate-300 shadow"
        type="button"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M6 6l12 12M18 6L6 18"
            strokeLinecap="round"
            strokeLinejoin="round"
          ></path>
        </svg>
      </button>

      <main className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Thanh toán đơn hàng
          </h1>
          <p className="text-slate-600 mt-1">
            Quét mã QR để hoàn tất giao dịch trong vài giây.
          </p>
        </div>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">
          {/* Thông tin đơn hàng */}
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-6 md:p-8 match-h">
            <h2 className="text-2xl font-semibold">Thông tin đơn hàng</h2>
            <div className="card-line my-6"></div>

            <div className="space-y-6">
              <div>
                <div className="text-slate-500 text-sm">Nhà cung cấp</div>
                <div className="mt-1 text-lg font-medium">Công ty Gemadept</div>
              </div>

              <div className="card-line"></div>

              <div>
                <div className="text-slate-500 text-sm">Mã đơn hàng</div>
                <div className="mt-1 text-lg font-semibold tracking-wide">
                  322138483848
                </div>
              </div>

              <div className="card-line"></div>

              <div>
                <div className="text-slate-500 text-sm">Mô tả</div>
                <p className="mt-1 text-base leading-6 font-medium">
                  Xe container 4000kg, lộ trình từ TP.HCM → Hà Nội, ngày tới
                  lấy hàng: 17/10/2025
                </p>
              </div>

              <div className="card-line"></div>

              <div>
                <div className="text-slate-500 text-sm">Số tiền</div>
                <div className="mt-1 text-2xl font-bold">10.000.000 VNĐ</div>
              </div>
            </div>
          </div>

          {/* QR */}
          <div className="qr-gradient rounded-2xl p-6 md:p-8 flex flex-col justify-between">
            <div>
              <h2 className="text-white text-2xl md:text-3xl font-semibold">
                Quét mã QR để thanh toán
              </h2>
            </div>

            <div className="bg-white/95 rounded-xl shadow-xl mx-auto mt-6 mb-6 p-4 md:p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-3">
                <span className="text-pink-600 font-extrabold tracking-tight text-xl">
                  momo
                </span>
                <span className="text-slate-700 font-semibold">VIETQR</span>
                <span className="text-slate-500 font-semibold">napas 24/7</span>
              </div>

              <div className="rounded-lg overflow-hidden ring-1 ring-slate-200 p-3 bg-white">
                {/* Nếu để ảnh trong public, dùng /qr.jpg; nếu import, đổi thành {qr} */}
                <img
                  src="/qr.jpg"
                  alt="QR Code"
                  className="block w-full h-auto mx-auto"
                  decoding="sync"
                  loading="eager"
                />
              </div>

              <p className="text-center text-slate-600 mt-4 text-sm">
                Sử dụng <span className="font-semibold">App Momo</span> hoặc
                ứng dụng camera hỗ trợ QR để quét mã
              </p>
            </div>
          </div>
        </section>

        <div className="flex justify-center mt-8">
          <div className="inline-flex items-center gap-3 bg-emerald-500 text-white px-5 py-3 rounded-2xl shadow-sm">
            <svg
              className="w-6 h-6"
              fill="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                clipRule="evenodd"
                fillRule="evenodd"
                d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.036-2.036a.75.75 0 1 0-1.06-1.06l-4.72 4.72-1.682-1.682a.75.75 0 0 0-1.06 1.06l2.212 2.213a.75.75 0 0 0 1.06 0l5.25-5.25Z"
              ></path>
            </svg>
            <span className="font-semibold">Giao dịch thành công</span>
          </div>
        </div>
      </main>

      <footer className="text-center text-slate-400 text-xs mt-10 mb-6">
        © 2025 Gemadept – Mẫu giao diện demo thanh toán QR.
      </footer>
    </div>
  );
}
