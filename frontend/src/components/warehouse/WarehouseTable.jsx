function StatusBadge({ status }) {
  // Trạng thái cho cả 2 trang warehouse - dựa trên cargo order status
  const map = {
    // Trạng thái từ cargo orders
    "Đang chờ nhập kho": "bg-yellow-50 text-yellow-600 ring-yellow-200",
    "Đã tới kho": "bg-blue-50 text-blue-600 ring-blue-200",
    "Đang lưu kho": "bg-emerald-50 text-emerald-600 ring-emerald-200",
    "Chuẩn bị xuất kho": "bg-orange-50 text-orange-600 ring-orange-200",
    "Đã xuất kho": "bg-red-50 text-red-600 ring-red-200",
  };
  const cls = map[status] || "bg-slate-50 text-slate-700 ring-slate-200";
  return (
    <span className={`inline-flex items-center justify-center rounded-lg px-2.5 py-1 text-xs font-medium ring-1 min-w-[112px] ${cls}`}>
      {status}
    </span>
  );
}

export default function WarehouseTable({ 
  rows, 
  onRowClick, 
  sortConfig, 
  onSort, 
  pagination,
  searchValue,
  onSearch,
  orderIdInput,
  onOrderIdInputChange,
  onOrderIdSubmit,
  onOrderIdExport,
  loadingAction,
  tabLabel,
  tabs,
  activeTab,
  onTabChange,
  showTitle = true,
  showSearch = true
}) {
  const head = [
    { label: "MÃ ĐƠN", sortable: true, key: "id" },
    { label: "KHÁCH HÀNG", sortable: true, key: "customer" },
    { label: "TÊN HÀNG", sortable: false },
    { label: "KHỐI LƯỢNG (KG)", sortable: true, key: "weight" },
    { label: "SỐ PALLETS", sortable: true, key: "pallets" },
    { label: "TRẠNG THÁI", sortable: false },
    { label: "NGÀY TỚI KHO", sortable: true, key: "entered_at" },
    { label: "NGÀY XUẤT KHO", sortable: true, key: "shipped_at" }
  ];

  const handleSort = (key) => {
    if (!onSort || !key) return;
    const direction = sortConfig?.key === key && sortConfig?.direction === 'asc' ? 'desc' : 'asc';
    onSort(key, direction);
  };

  const SortIcon = ({ columnKey }) => {
    if (!sortConfig || sortConfig.key !== columnKey) {
      return (
        <svg className="w-3 h-3 ml-1 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    return sortConfig.direction === 'asc' ? (
      <svg className="w-3 h-3 ml-1 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-3 h-3 ml-1 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-soft overflow-hidden">
      {/* Header với Tabs */}
      <div className="px-5 md:px-6 py-4 bg-gradient-to-r from-[#8CC2FF] via-[#6AA8FF] to-[#2A60FF] text-white">
        <div className="flex flex-col gap-4">
          {/* Title và Search - chỉ hiển thị nếu showTitle = true */}
          {showTitle && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-8 h-8 rounded-xl bg-white/20 grid place-items-center">📦</div>
                <div>
                  <div className="opacity-90">{tabLabel ? `Danh sách đơn hàng - ${tabLabel}` : "Danh sách đơn hàng tại kho"}</div>
                  <div className="font-semibold">Gemadept Logistics</div>
                </div>
              </div>
              
              {/* Search box - chỉ hiển thị nếu showSearch = true */}
              {showSearch && onSearch && (
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchValue || ""}
                      onChange={(e) => onSearch(e.target.value)}
                      placeholder="Tìm kiếm mã đơn..."
                      className="h-9 px-3 pr-9 rounded-lg border border-white/30 bg-white/10 text-white text-sm placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50"
                      style={{ width: '200px' }}
                    />
                    <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tabs - Đưa vào trong header */}
          {tabs && (
            <div className={`flex gap-2 ${showTitle ? 'pt-3 border-t border-white/20' : ''}`}>
              {tabs.map((tab, idx) => (
                <button
                  key={idx}
                  onClick={() => onTabChange && onTabChange(tab.key)}
                  className={`flex-1 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                    activeTab === tab.key
                      ? "text-blue-600 bg-white shadow-md"
                      : "text-white/80 hover:text-white hover:bg-white/20"
                  }`}
                >
                  {tab.icon} {tab.label} ({tab.count})
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Order ID input for nhập/xuất kho */}
        {(onOrderIdSubmit || onOrderIdExport) && (
          <div className="mt-3 pt-3 border-t border-white/20 flex items-center gap-2">
            <input
              type="text"
              value={orderIdInput || ""}
              onChange={(e) => onOrderIdInputChange && onOrderIdInputChange(e.target.value)}
              placeholder="Nhập mã đơn hàng"
              className="flex-1 h-9 px-3 rounded-lg border border-white/30 bg-white/10 text-white text-sm placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50"
              disabled={loadingAction}
            />
            {onOrderIdSubmit && (
              <button
                onClick={onOrderIdSubmit}
                disabled={loadingAction || !orderIdInput?.trim()}
                className="h-9 px-4 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loadingAction ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <circle cx="12" cy="12" r="10" opacity="0.25"/>
                      <path d="M12 2 A10 10 0 0 1 22 12" strokeDasharray="8" strokeDashoffset="8"/>
                    </svg>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Nhập kho
                  </>
                )}
              </button>
            )}
            {onOrderIdExport && (
              <button
                onClick={onOrderIdExport}
                disabled={loadingAction || !orderIdInput?.trim()}
                className="h-9 px-4 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loadingAction ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <circle cx="12" cy="12" r="10" opacity="0.25"/>
                      <path d="M12 2 A10 10 0 0 1 22 12" strokeDasharray="8" strokeDashoffset="8"/>
                    </svg>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Xuất kho
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              {head.map((h, idx) => (
                <th 
                  key={idx} 
                  className={`text-left text-[11px] tracking-wider font-semibold uppercase px-5 py-3 ${
                    h.sortable ? 'cursor-pointer hover:bg-slate-100 select-none' : ''
                  }`}
                  onClick={() => h.sortable && handleSort(h.key)}
                >
                  <div className="flex items-center">
                    {h.label}
                    {h.sortable && <SortIcon columnKey={h.key} />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length === 0 && (
              <tr><td colSpan={8} className="px-5 py-6 text-center text-slate-500">Không có đơn hàng nào.</td></tr>
            )}
            {rows.map((o, index) => {
              // Check if order needs attention (> 7 days in warehouse)
              const today = new Date();
              let entryDate = o.stored_at || o.entered_at;
              let daysInWarehouse = 0;
              
              if (entryDate) {
                // Parse date (handle both DD/MM/YYYY and ISO format)
                let date;
                if (entryDate.includes('/')) {
                  const parts = entryDate.split('/');
                  if (parts.length === 3) {
                    date = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
                  }
                } else {
                  date = new Date(entryDate);
                }
                if (date && !isNaN(date.getTime())) {
                  daysInWarehouse = Math.floor((today - date) / (1000 * 60 * 60 * 24));
                }
              }
              
              const needsAttention = o.inventory_status === 'STORED' && daysInWarehouse > 7;
              
              // Tạo unique key: dùng operation_id nếu có, nếu không thì dùng order_id + index
              const uniqueKey = o.operation_id || `${o.id || o.order_id || 'unknown'}-${index}`;
              
              return (
              <tr 
                key={uniqueKey} 
                className={`hover:bg-slate-50/70 cursor-pointer transition-colors ${
                  needsAttention ? 'bg-orange-50/50 border-l-4 border-orange-500' : ''
                }`}
                onClick={() => onRowClick && onRowClick(o)}
              >
                <td className="px-5 py-3 font-medium text-slate-900"><span className="inline-block max-w-[140px] truncate">{o.id}</span></td>
                <td className="px-5 py-3">{o.customer || '—'}</td>
                <td className="px-5 py-3">{o.cargo_name || '—'}</td>
                <td className="px-5 py-3">{o.weight ? o.weight.toLocaleString() : '—'}</td>
                <td className="px-5 py-3">{o.pallets || 0}</td>
                <td className="px-5 py-3"><StatusBadge status={o.status} /></td>
                <td className="px-5 py-3 text-slate-600">
                  {o.entered_at || ''}
                  {needsAttention && o.entered_at && (
                    <span className="ml-2 text-xs text-orange-600 font-medium">
                      ({daysInWarehouse} ngày)
                    </span>
                  )}
                </td>
                <td className="px-5 py-3 text-slate-600">{o.shipped_at || ''}</td>
              </tr>
            );
            })}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {pagination}
    </div>
  );
}
