import React from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

const HomePage = () => {
  return (
    <div className="bg-slate-50 text-slate-900">
      {/* Sidebar chung */}
      <Sidebar />

      {/* Main chừa chỗ sidebar w-20 */}
      <main className="ml-20 min-h-screen flex flex-col">
        {/* Topbar chung */}
        <Topbar title="Home" />

        {/* Nội dung trang */}
        <section className="p-4 md:p-6">
          <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
            <div className="p-4 rounded-2xl bg-white ring-1 ring-slate-200">
              <h3 className="font-semibold mb-2">Chỉ số nhanh</h3>
              <p className="text-sm text-slate-600">
                Đặt nội dung dashboard tại đây (cards, charts, v.v.).
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-white ring-1 ring-slate-200">
              <h3 className="font-semibold mb-2">Đơn vận chuyển gần đây</h3>
              <p className="text-sm text-slate-600">…</p>
            </div>
            <div className="p-4 rounded-2xl bg-white ring-1 ring-slate-200">
              <h3 className="font-semibold mb-2">Thông báo</h3>
              <p className="text-sm text-slate-600">…</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default HomePage;
