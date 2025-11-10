export default function KpiStrip({ kpis, operations, loading }) {
  // Tính toán 3 trạng thái: Đang chờ nhập, Đang lưu kho, Chuẩn bị xuất kho
  const incoming = operations?.filter(d => 
    d.inventory_status === 'INCOMING' || 
    d.status === 'Đang chờ nhập kho' || 
    d.status === 'Nhập kho'
  ).length || 0;
  
  const stored = operations?.filter(d => 
    d.inventory_status === 'STORED' || 
    d.status === 'Đang lưu kho' || 
    d.status === 'Lưu kho'
  ).length || 0;
  
  const outgoing = operations?.filter(d => 
    d.inventory_status === 'OUTGOING' || 
    d.status === 'Chuẩn bị xuất kho' || 
    d.status === 'Xuất kho'
  ).length || 0;
  
  // Tính tổng khối lượng và pallets cho từng trạng thái
  const incomingWeight = operations?.filter(d => 
    d.inventory_status === 'INCOMING' || d.status === 'Đang chờ nhập kho' || d.status === 'Nhập kho'
  ).reduce((sum, item) => sum + (Number(item.weight) || 0), 0) || 0;
  
  const incomingPallets = operations?.filter(d => 
    d.inventory_status === 'INCOMING' || d.status === 'Đang chờ nhập kho' || d.status === 'Nhập kho'
  ).reduce((sum, item) => sum + (Number(item.pallets) || 0), 0) || 0;
  
  const storedWeight = operations?.filter(d => 
    d.inventory_status === 'STORED' || d.status === 'Đang lưu kho' || d.status === 'Lưu kho'
  ).reduce((sum, item) => sum + (Number(item.weight) || 0), 0) || 0;
  
  const storedPallets = operations?.filter(d => 
    d.inventory_status === 'STORED' || d.status === 'Đang lưu kho' || d.status === 'Lưu kho'
  ).reduce((sum, item) => sum + (Number(item.pallets) || 0), 0) || 0;
  
  const outgoingWeight = operations?.filter(d => 
    d.inventory_status === 'OUTGOING' || d.status === 'Chuẩn bị xuất kho' || d.status === 'Xuất kho'
  ).reduce((sum, item) => sum + (Number(item.weight) || 0), 0) || 0;
  
  const outgoingPallets = operations?.filter(d => 
    d.inventory_status === 'OUTGOING' || d.status === 'Chuẩn bị xuất kho' || d.status === 'Xuất kho'
  ).reduce((sum, item) => sum + (Number(item.pallets) || 0), 0) || 0;
  
  // Đơn hàng cần chú ý (đang lưu kho > 7 ngày)
  const today = new Date();
  const needsAttention = operations?.filter(item => {
    if (item.inventory_status !== 'STORED' && item.status !== 'Đang lưu kho') return false;
    if (!item.entered_at && !item.stored_at) return false;
    try {
      let entryDate;
      if (item.stored_at) {
        if (item.stored_at.includes('/')) {
          const parts = item.stored_at.split('/');
          entryDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        } else {
          entryDate = new Date(item.stored_at);
        }
      } else if (item.entered_at) {
        if (item.entered_at.includes('/')) {
          const parts = item.entered_at.split('/');
          entryDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        } else {
          entryDate = new Date(item.entered_at);
        }
      }
      if (!entryDate || isNaN(entryDate.getTime())) return false;
      const daysDiff = Math.floor((today - entryDate) / (1000 * 60 * 60 * 24));
      return daysDiff > 7;
    } catch {
      return false;
    }
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
      <Stat icon="📥" label="Đang chờ nhập" value={incoming} subtitle={`${incomingPallets} pallets`} tone="info" />
      <Stat icon="📦" label="Đang lưu kho" value={stored} subtitle={`${storedPallets} pallets`} tone="success" />
      <Stat icon="📤" label="Chuẩn bị xuất kho" value={outgoing} subtitle={`${outgoingPallets} pallets`} tone="warning" />
      <Stat icon="⚠️" label="Cần chú ý" value={needsAttention} subtitle="> 7 ngày chưa xuất" tone="warning" />
      <Stat icon="📈" label="Tổng khối lượng" value={`${((incomingWeight + storedWeight + outgoingWeight) / 1000).toFixed(1)}T`} subtitle={`${incomingPallets + storedPallets + outgoingPallets} pallets`} tone="neutral" />
    </div>
  );
}
