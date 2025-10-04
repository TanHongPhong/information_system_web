import React, { useEffect, useMemo, useRef, useState } from "react";
import feather from "feather-icons";

export default function CommodityForm() {
  // ---------- ICONS + LAYOUT OFFSETS ----------
  const asideRef = useRef(null);
  const topbarRef = useRef(null);
  const approvalRef = useRef(null);

  useEffect(() => {
    feather.replace({ width: 24, height: 24 });
  }, []);

  useEffect(() => {
    const setOffsets = () => {
      const asideW = asideRef.current?.offsetWidth ?? 96;
      const topbarH = topbarRef.current?.offsetHeight ?? 56;
      document.documentElement.style.setProperty("--sidebar-w", `${asideW}px`);
      document.documentElement.style.setProperty("--topbar-h", `${topbarH}px`);
    };
    setOffsets();
    window.addEventListener("resize", setOffsets);
    return () => window.removeEventListener("resize", setOffsets);
  }, []);

  // ---------- FORM STATE ----------
  const [form, setForm] = useState({
    productName: "",
    commodityType: "",
    weight: "",
    category: "",
    dimensionUnit: "",
    dimensions: "",
    desc: "",
  });

  const [errors, setErrors] = useState({});
  const [showApproval, setShowApproval] = useState(false);

  // refs cho focus lần đầu field lỗi
  const inputRefs = {
    productName: useRef(null),
    commodityType: useRef(null),
    weight: useRef(null),
    category: useRef(null),
    dimensionUnit: useRef(null),
    dimensions: useRef(null),
    desc: useRef(null),
  };

  const requiredOrder = useMemo(
    () => [
      "productName",
      "commodityType",
      "weight",
      "category",
      "dimensionUnit",
      "dimensions",
      "desc",
    ],
    []
  );

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setForm((f) => ({ ...f, [field]: value }));
    // bỏ lỗi khi người dùng nhập lại
    setErrors((prev) => (prev[field] ? { ...prev, [field]: false } : prev));
  };

  const validate = () => {
    const nextErr = {};
    requiredOrder.forEach((k) => {
      const v = (form[k] ?? "").toString().trim();
      nextErr[k] = v.length === 0;
    });
    setErrors(nextErr);
    const firstInvalid = requiredOrder.find((k) => nextErr[k]);
    if (firstInvalid && inputRefs[firstInvalid]?.current) {
      inputRefs[firstInvalid].current.focus();
    }
    return !firstInvalid;
  };

  const onOk = () => {
    if (!validate()) return;
    setShowApproval(true);
  };

  useEffect(() => {
    if (showApproval && approvalRef.current) {
      approvalRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [showApproval]);

  const goBack = () => {
    // điều hướng như file gốc
    window.location.href = "Chon xe.html";
  };

  // tiện ích className cho input lỗi
  const errCls = (field) => (errors[field] ? "err" : "");

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen">
      {/* Giữ lại style gốc cho .err và font fallback */}
      <style>{`
        .err { outline: 2px solid #ef4444; }
        body{font-family: Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial}
      `}</style>

      {/* ===== Sidebar ===== */}
      <aside
        ref={asideRef}
        className="fixed inset-y-0 left-0 w-24 bg-white border-r border-slate-200 flex flex-col items-center gap-4 p-4 z-50 text-blue-600"
      >
        <button
          className="w-12 h-12 rounded-xl grid place-items-center hover:bg-slate-100"
          title="Trang chủ"
          type="button"
        >
          <i data-feather="home" />
        </button>
        <button
          className="w-12 h-12 rounded-xl grid place-items-center hover:bg-slate-100"
          title="Theo dõi vị trí"
          type="button"
        >
          <i data-feather="map" />
        </button>
        <button
          className="w-12 h-12 rounded-xl grid place-items-center hover:bg-slate-100"
          title="Lịch sử giao dịch"
          type="button"
        >
          <i data-feather="file-text" />
        </button>
        <button
          className="relative w-12 h-12 rounded-xl grid place-items-center hover:bg-slate-100"
          title="Thông báo"
          type="button"
        >
          <i data-feather="bell" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        <button
          className="w-12 h-12 rounded-xl grid place-items-center hover:bg-slate-100"
          title="Người dùng"
          type="button"
        >
          <i data-feather="user" />
        </button>
        <button
          className="w-12 h-12 rounded-xl grid place-items-center hover:bg-slate-100"
          title="Cài đặt"
          type="button"
        >
          <i data-feather="settings" />
        </button>
      </aside>

      {/* ===== Main + Header ===== */}
      <main className="ml-24">
        <div
          id="topbar"
          ref={topbarRef}
          className="sticky top-0 z-50 flex items-center justify-end p-3 bg-white border-b border-slate-200"
        >
          <button
            type="button"
            className="group inline-flex items-center gap-2 pl-1 pr-2 py-1.5 rounded-full
                       bg-blue-50 text-slate-900 ring-1 ring-blue-100 shadow-sm hover:bg-blue-100 transition"
          >
            <img
              src="https://i.pravatar.cc/40?img=8"
              alt="Avatar"
              className="w-8 h-8 rounded-full object-cover ring-2 ring-white shadow-sm"
            />
            <span className="font-semibold">Khách hàng A</span>
            <span className="text-slate-300">•</span>
            <i data-feather="chevron-down" className="w-4 h-4 opacity-80 group-hover:opacity-100" />
          </button>
        </div>
      </main>

      {/* ===== OVERLAY (không che sidebar + header) ===== */}
      <div
        id="sheet"
        className="fixed z-40"
        style={{
          top: "var(--topbar-h,56px)",
          left: "var(--sidebar-w,96px)",
          right: 0,
          bottom: 0,
        }}
      >
        <div className="absolute inset-0 bg-black/40" />

        <div className="absolute inset-0 p-6 overflow-hidden">
          <div className="relative w-full h-full bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-auto">
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-3 bg-slate-100 border-b border-slate-200 rounded-t-2xl">
              <h2 className="text-[22px] font-bold tracking-tight">Commodity Information</h2>
              <button
                onClick={goBack}
                className="size-8 grid place-items-center rounded-full border border-slate-300 text-slate-700"
                aria-label="Đóng"
                type="button"
              >
                ✕
              </button>
            </div>

            <div className="px-6 pt-6 pb-8">
              <form
                className="grid grid-cols-12 gap-x-8 gap-y-6"
                noValidate
                onSubmit={(e) => e.preventDefault()}
              >
                {/* Hàng 1 */}
                <div className="col-span-12 md:col-span-4">
                  <label className="block text-sm font-semibold mb-1" htmlFor="productName">
                    Product Name
                  </label>
                  <input
                    id="productName"
                    ref={inputRefs.productName}
                    type="text"
                    placeholder="VD: Gia vị, Thực phẩm,…"
                    className={`w-full h-11 rounded-md border border-slate-300 px-3 placeholder:text-slate-400 focus:outline-none ${errCls(
                      "productName"
                    )}`}
                    value={form.productName}
                    onChange={handleChange("productName")}
                  />
                </div>

                <div className="col-span-12 md:col-span-4">
                  <label className="block text-sm font-semibold mb-1" htmlFor="commodityType">
                    Commodity Type
                  </label>
                  <input
                    id="commodityType"
                    ref={inputRefs.commodityType}
                    type="text"
                    placeholder="VD: Khô, lạnh, Nguy hiểm,…"
                    className={`w-full h-11 rounded-md border border-slate-300 px-3 placeholder:text-slate-400 focus:outline-none ${errCls(
                      "commodityType"
                    )}`}
                    value={form.commodityType}
                    onChange={handleChange("commodityType")}
                  />
                </div>

                <div className="col-span-12 md:col-span-4">
                  <label className="block text-sm font-semibold mb-1" htmlFor="weight">
                    Weight (in lbs)
                  </label>
                  <input
                    id="weight"
                    ref={inputRefs.weight}
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Nhập cân nặng"
                    className={`w-full h-11 rounded-md border border-slate-300 px-3 placeholder:text-slate-400 focus:outline-none ${errCls(
                      "weight"
                    )}`}
                    value={form.weight}
                    onChange={handleChange("weight")}
                  />
                </div>

                {/* Hàng 2 */}
                <div className="col-span-12 md:col-span-4">
                  <label className="block text-sm font-semibold mb-1" htmlFor="category">
                    Category
                  </label>
                  <input
                    id="category"
                    ref={inputRefs.category}
                    type="text"
                    placeholder="Loại"
                    className={`w-full h-11 rounded-md border border-slate-300 px-3 placeholder:text-slate-400 focus:outline-none ${errCls(
                      "category"
                    )}`}
                    value={form.category}
                    onChange={handleChange("category")}
                  />
                </div>

                <div className="col-span-12 md:col-span-4">
                  <label className="block text-sm font-semibold mb-1" htmlFor="dimensionUnit">
                    Dimension Unit
                  </label>
                  <select
                    id="dimensionUnit"
                    ref={inputRefs.dimensionUnit}
                    className={`w-full h-11 rounded-md border border-slate-300 px-3 bg-white focus:outline-none ${errCls(
                      "dimensionUnit"
                    )}`}
                    value={form.dimensionUnit}
                    onChange={handleChange("dimensionUnit")}
                  >
                    <option value="">Chọn đơn vị</option>
                    <option value="inch">inch</option>
                    <option value="cm">cm</option>
                    <option value="mm">mm</option>
                  </select>
                </div>

                <div className="col-span-12 md:col-span-4">
                  <label className="block text-sm font-semibold mb-1" htmlFor="dimensions">
                    Dimensions (L × B × H)
                  </label>
                  <input
                    id="dimensions"
                    ref={inputRefs.dimensions}
                    type="text"
                    placeholder="20 × 30 × 40"
                    className={`w-full h-11 rounded-md border border-slate-300 px-3 placeholder:text-slate-400 focus:outline-none ${errCls(
                      "dimensions"
                    )}`}
                    value={form.dimensions}
                    onChange={handleChange("dimensions")}
                  />
                </div>

                {/* Hàng 3 */}
                <div className="col-span-12">
                  <label className="block text-sm font-semibold mb-1" htmlFor="desc">
                    Product Description
                  </label>
                  <input
                    id="desc"
                    ref={inputRefs.desc}
                    type="text"
                    placeholder="Nhập mô tả hàng hóa"
                    className={`w-full h-11 rounded-md border border-slate-300 px-3 placeholder:text-slate-400 focus:outline-none ${errCls(
                      "desc"
                    )}`}
                    value={form.desc}
                    onChange={handleChange("desc")}
                  />
                </div>

                {/* Banner phê duyệt */}
                <div className="col-span-12">
                  {showApproval && (
                    <div
                      ref={approvalRef}
                      className="w-[560px] max-w-full mx-auto flex items-center justify-between gap-4 bg-green-200/70 border border-green-300 rounded-md px-4 py-3"
                    >
                      <p className="text-green-800 font-semibold">
                        Đơn hàng của bạn đã được phê duyệt
                      </p>
                      <div className="flex items-center gap-2">
                        <a
                          href="giao_dien_thanh_toan_qr_fixed.html"
                          className="text-xs font-semibold bg-yellow-300 text-yellow-900 px-2 py-1 rounded"
                        >
                          Tới bước thanh toán
                        </a>
                        <span className="inline-grid place-items-center size-8 rounded-full bg-green-500 text-white text-lg">
                          ✓
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Nút OK */}
                <div className="col-span-12">
                  <button
                    type="button"
                    onClick={onOk}
                    className="w-full h-12 rounded-md bg-blue-600 text-white font-semibold"
                  >
                    OK
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
