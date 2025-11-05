export default function KpiStrip({ kpis, operations, loading }) {
  // Tính toán từ KPIs API - chỉ hiển thị đơn hàng đã tới kho và đã xuất kho
  const atWarehouse = kpis?.stored || operations?.filter(d => d.inventory_status === 'STORED' || d.status === "Lưu kho").length || 0;
  const shipped = operations?.filter(d => d.inventory_status === 'SHIPPED' || d.status === "Đã xuất kho").length || 0;
  const total = operations?.length || 0;
  
  // Tính tổng khối lượng và pallets
  const totalWeight = operations?.reduce((sum, item) => sum + (Number(item.weight) || 0), 0) || 0;
  const totalPallets = operations?.reduce((sum, item) => sum + (Number(item.pallets) || 0), 0) || 0;
  
  // Đơn hàng cần chú ý (đã tới kho > 7 ngày nhưng chưa xuất)
  const today = new Date();
  const needsAttention = operations?.filter(item => {
    if (item.inventory_status !== 'STORED') return false;
    if (!item.entered_at && !item.stored_at) return false;
    const entryDate = new Date(item.stored_at || item.entered_at);
    const daysDiff = Math.floor((today - entryDate) / (1000 * 60 * 60 * 24));
    return daysDiff > 7;
  }).length || 0;

  const Stat = ({ icon, label, value, subtitle, tone }) => {
    const toneMap = { neutral:"bg-slate-50", success:"bg-emerald-50", info:"bg-blue-50", warning:"bg-orange-50" };
    return (
      <div className={`rounded-2xl p-4 border border-slate-200 ${toneMap[tone]||""}`}>
        <div className="flex items-center gap-2 text-sm text-slate-500">{icon} {label}</div>
        <div className="mt-1 text-2xl font-bold tracking-tight">{loading ? "..." : value}</div>
        {subtitle && <div className="mt-1 text-xs text-slate-500">{subtitle}</div>}
      </div>
    );
  };

  return (
    <div className="grid md:grid-cols-5 gap-3">
      <Stat icon="📦" label="Đã tới kho" value={atWarehouse} subtitle={`${totalPallets} pallets`} tone="info" />
      <Stat icon="🚚" label="Đã xuất kho" value={shipped} tone="success" />
      <Stat icon="📊" label="Tổng đơn hàng" value={total} subtitle={`${totalWeight.toLocaleString()} KG`} tone="neutral" />
      <Stat icon="⚠️" label="Cần chú ý" value={needsAttention} subtitle="> 7 ngày chưa xuất" tone="warning" />
      <Stat icon="📈" label="Tổng khối lượng" value={`${(totalWeight / 1000).toFixed(1)}T`} subtitle={`${totalPallets} pallets`} tone="neutral" />
    </div>
  );
}
