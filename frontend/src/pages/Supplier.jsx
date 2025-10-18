import RecentOrdersCard from "../components/sup/RecentOrdersCard";
import FleetStatusCard from "../components/sup/FleetStatusCard";
import ShippingTable from "../components/sup/ShippingTable";
import OrderRequestsPanel from "../components/sup/OrderRequestsPanel";

export default function VtDashboard() {
  return (
    <main className="max-w-[120rem] mx-auto p-4 md:p-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">Tổng quan quản lý vận tải.</p>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <button className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50">
            <span className="text-sm">30 ngày gần đây</span>
          </button>
          <button className="p-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50">
            ⬇️
          </button>
        </div>
      </header>

      <div className="mt-6 grid grid-cols-1 xl:grid-cols-3 gap-6 items-stretch">
        {/* Cột trái */}
        <div className="xl:col-span-2 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RecentOrdersCard />
            <FleetStatusCard />
          </div>

          <ShippingTable />
        </div>

        {/* Cột phải */}
        <aside className="space-y-8 h-full">
          <OrderRequestsPanel />
        </aside>
      </div>

      <footer className="text-center text-xs text-slate-500 mt-8">
        © 2025 VT Logistics — Demo UI
      </footer>
    </main>
  );
}
